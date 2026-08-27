"""
RAMTSR Training Script — Multi-Phase Training Pipeline

Supports 4 progressive training phases:
  Phase 1: Reconstruction + Spectral loss
  Phase 2: + Observation Consistency (anti-hallucination)
  Phase 3: + Perceptual + GAN adversarial loss
  Phase 4: + Uncertainty (NLL) loss

Usage:
  python scripts/train.py --config config/default.yaml --phase phase_1
  python scripts/train.py --config config/default.yaml --phase phase_2 --resume checkpoints/phase_1_best.pth
"""

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast
from torch.utils.data import DataLoader, ConcatDataset
import yaml
from tqdm import tqdm

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ramtsr.models.ramtsr import RAMTSR
from ramtsr.models.discriminator import PatchGANDiscriminator
from ramtsr.losses.losses import RAMTSRLoss
from ramtsr.data.datasets import WorldStratDataset, SEN2NAIPDataset, SEN2VenusDataset
from ramtsr.evaluation.metrics import MetricsCalculator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def build_dataloaders(config: dict, phase: str):
    """Build training and validation dataloaders from config."""
    data_cfg = config.get("data", {})
    batch_size = config.get("training", {}).get("batch_size", 8)
    num_workers = config.get("training", {}).get("num_workers", 4)

    train_datasets = []

    # WorldStrat (primary training)
    worldstrat_root = data_cfg.get("worldstrat_root", "data/worldstrat")
    if os.path.exists(worldstrat_root):
        lr_ps = config.get("training", {}).get("patch_size", 128)
        train_datasets.append(WorldStratDataset(
            root_dir=worldstrat_root,
            split="train",
            num_frames=config.get("model", {}).get("temporal", {}).get("num_frames", 5),
            lr_patch_size=lr_ps,
            hr_patch_size=lr_ps * 4,
        ))
        logger.info(f"WorldStrat loaded: {len(train_datasets[-1])} samples")

    # SEN2NAIP (cross-sensor training)
    sen2naip_root = data_cfg.get("sen2naip_root", "data/sen2naip")
    if os.path.exists(sen2naip_root):
        lr_ps2 = config.get("training", {}).get("patch_size", 128)
        train_datasets.append(SEN2NAIPDataset(
            root_dir=sen2naip_root,
            split="train",
            lr_patch_size=lr_ps2,
            hr_patch_size=lr_ps2 * 4,
        ))
        logger.info(f"SEN2NAIP loaded: {len(train_datasets[-1])} samples")

    if not train_datasets:
        logger.warning("No training datasets found! Using synthetic data for testing.")
        train_datasets.append(SyntheticDataset(
            num_samples=200,
            num_frames=config.get("model", {}).get("temporal", {}).get("num_frames", 5),
            in_channels=config.get("model", {}).get("swinir", {}).get("in_chans", 4),
            patch_size=config.get("training", {}).get("patch_size", 128),
        ))

    train_dataset = ConcatDataset(train_datasets) if len(train_datasets) > 1 else train_datasets[0]
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
        drop_last=True,
    )

    # Validation: SEN2VENuS
    val_loader = None
    sen2venus_root = data_cfg.get("sen2venus_root", "data/sen2venus")
    if os.path.exists(sen2venus_root):
        val_dataset = SEN2VenusDataset(root_dir=sen2venus_root, split="val")
        val_loader = DataLoader(val_dataset, batch_size=1, shuffle=False, num_workers=2)
        logger.info(f"SEN2VENuS validation loaded: {len(val_dataset)} samples")

    return train_loader, val_loader


class SyntheticDataset(torch.utils.data.Dataset):
    """Synthetic dataset for testing the training pipeline when real data is unavailable."""

    def __init__(self, num_samples: int = 200, num_frames: int = 5,
                 in_channels: int = 4, patch_size: int = 128):
        self.num_samples = num_samples
        self.num_frames = num_frames
        self.in_channels = in_channels
        self.patch_size = patch_size

    def __len__(self) -> int:
        return self.num_samples

    def __getitem__(self, idx: int) -> dict:
        lr_frames = torch.rand(self.num_frames, self.in_channels, self.patch_size, self.patch_size)
        hr = torch.rand(self.in_channels, self.patch_size * 4, self.patch_size * 4)
        quality_masks = torch.ones(self.num_frames, 1, self.patch_size, self.patch_size)
        return {
            "lr_frames": lr_frames,
            "hr": hr,
            "quality_masks": quality_masks,
        }


def validate(model: nn.Module, val_loader: DataLoader, metrics_calc: MetricsCalculator,
             device: torch.device) -> dict:
    """Run validation and return metrics dict."""
    model.eval()
    all_metrics = {"psnr": [], "ssim": [], "sam": []}

    with torch.no_grad():
        for batch in val_loader:
            lr = batch["lr_frames"].to(device)
            hr = batch["hr"].to(device)
            qm = batch["quality_masks"].to(device)

            sr = model(lr, qm)
            m = metrics_calc.compute_all(sr, hr)
            for k in all_metrics:
                if k in m:
                    all_metrics[k].append(m[k])

    avg = {k: sum(v) / max(len(v), 1) for k, v in all_metrics.items()}
    model.train()
    return avg


def train():
    parser = argparse.ArgumentParser(description="Train RAMTSR model")
    parser.add_argument("--config", type=str, required=True, help="Path to config YAML")
    parser.add_argument("--phase", type=str, required=True,
                        choices=["phase_1", "phase_2", "phase_3", "phase_4"])
    parser.add_argument("--resume", type=str, default=None, help="Resume from checkpoint")
    parser.add_argument("--gpu", type=int, default=0, help="GPU device ID")
    parser.add_argument("--output_dir", type=str, default="checkpoints", help="Output directory")
    args = parser.parse_args()

    # Load config
    with open(args.config, "r") as f:
        config = yaml.safe_load(f)

    os.makedirs(args.output_dir, exist_ok=True)
    device = torch.device(f"cuda:{args.gpu}" if torch.cuda.is_available() else "cpu")
    logger.info(f"Device: {device} | Phase: {args.phase}")

    # ── Build model ──
    model_cfg = config.get("model", {}).get("swinir", {})
    model_config = {
        "in_channels": model_cfg.get("in_chans", 4),
        "embed_dim": model_cfg.get("embed_dim", 180),
        "num_heads": model_cfg.get("num_heads", 6),
        "window_size": model_cfg.get("window_size", 8),
        "scale": model_cfg.get("upscale", 4),
        "dropout_rate": config.get("model", {}).get("temporal", {}).get("dropout", 0.1),
    }
    model = RAMTSR(model_config).to(device)
    total_params = sum(p.numel() for p in model.parameters()) / 1e6
    logger.info(f"RAMTSR model: {total_params:.2f}M parameters")

    # ── Build discriminator (phase 3+) ──
    discriminator = None
    d_optimizer = None
    if args.phase in ["phase_3", "phase_4"]:
        discriminator = PatchGANDiscriminator(
            in_channels=model_cfg.get("in_chans", 4),
            ndf=config.get("model", {}).get("discriminator", {}).get("ndf", 64),
            n_layers=config.get("model", {}).get("discriminator", {}).get("n_layers", 3),
        ).to(device)
        d_optimizer = optim.AdamW(discriminator.parameters(), lr=1e-4, weight_decay=0.01)
        logger.info("PatchGAN discriminator enabled")

    # ── Loss, optimizer, scheduler ──
    loss_config = {"channels": model_cfg.get("in_chans", 4)}
    criterion = RAMTSRLoss(args.phase, loss_config).to(device)

    train_cfg = config.get("training", {})
    optimizer = optim.AdamW(
        model.parameters(),
        lr=train_cfg.get("optimizer", {}).get("lr", 2e-4),
        betas=tuple(train_cfg.get("optimizer", {}).get("betas", [0.9, 0.999])),
        weight_decay=train_cfg.get("optimizer", {}).get("weight_decay", 0.01),
    )

    total_iters = train_cfg.get(args.phase, {}).get("iterations", 100000)
    epochs = max(total_iters // 200, 50)  # Approximate epochs from iterations
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)

    # ── Resume ──
    start_epoch = 0
    best_psnr = 0.0
    if args.resume and os.path.exists(args.resume):
        ckpt = torch.load(args.resume, map_location=device, weights_only=False)
        model.load_state_dict(ckpt["model_state"], strict=False)
        if "optimizer_state" in ckpt:
            try:
                optimizer.load_state_dict(ckpt["optimizer_state"])
            except ValueError:
                logger.warning("Optimizer state mismatch, starting fresh optimizer")
        start_epoch = ckpt.get("epoch", 0) + 1
        best_psnr = ckpt.get("best_psnr", 0.0)
        logger.info(f"Resumed from epoch {start_epoch}, best PSNR: {best_psnr:.2f}")

    # ── Data ──
    train_loader, val_loader = build_dataloaders(config, args.phase)
    metrics_calc = MetricsCalculator()

    # ── Training loop ──
    scaler = GradScaler()
    accum_steps = train_cfg.get("grad_accum_steps", 1)
    save_interval = train_cfg.get("save_interval", 10)
    val_interval = train_cfg.get("val_interval", 10)
    gan_loss_fn = nn.BCEWithLogitsLoss() if discriminator else None

    logger.info(f"Training: {epochs} epochs, batch={train_cfg.get('batch_size', 8)}, "
                f"accum={accum_steps}, save every {save_interval} epochs")
    logger.info(f"Losses active: {list(criterion.weights.keys())}")

    training_log = []

    for epoch in range(start_epoch, epochs):
        model.train()
        epoch_losses = {}
        epoch_total = 0.0

        pbar = tqdm(train_loader, desc=f"[{args.phase}] Epoch {epoch}/{epochs}")
        for step, batch in enumerate(pbar):
            lr_frames = batch["lr_frames"].to(device)
            hr = batch["hr"].to(device)
            quality_masks = batch["quality_masks"].to(device)

            with autocast():
                sr = model(lr_frames, quality_masks)
                loss, loss_dict = criterion(sr, hr, lr_frames)
                loss = loss / accum_steps

            # GAN training (phase 3+)
            if discriminator is not None and gan_loss_fn is not None:
                # Train discriminator
                d_optimizer.zero_grad()
                with autocast():
                    real_pred = discriminator(hr)
                    fake_pred = discriminator(sr.detach())
                    d_loss = (gan_loss_fn(real_pred, torch.ones_like(real_pred)) +
                              gan_loss_fn(fake_pred, torch.zeros_like(fake_pred))) * 0.5
                scaler.scale(d_loss).backward()
                scaler.step(d_optimizer)

                # Generator adversarial loss
                with autocast():
                    fake_pred_g = discriminator(sr)
                    g_adv_loss = gan_loss_fn(fake_pred_g, torch.ones_like(fake_pred_g)) * 0.01
                    loss = loss + g_adv_loss / accum_steps
                loss_dict["gan_g"] = g_adv_loss.item()
                loss_dict["gan_d"] = d_loss.item()

            scaler.scale(loss).backward()

            if (step + 1) % accum_steps == 0:
                scaler.step(optimizer)
                scaler.update()
                optimizer.zero_grad()

            epoch_total += loss.item() * accum_steps
            for k, v in loss_dict.items():
                epoch_losses[k] = epoch_losses.get(k, 0.0) + v

            pbar.set_postfix({"loss": f"{loss.item() * accum_steps:.4f}", "lr": f"{scheduler.get_last_lr()[0]:.2e}"})

        scheduler.step()
        n_steps = len(train_loader)
        avg_losses = {k: v / max(n_steps, 1) for k, v in epoch_losses.items()}
        avg_losses["total"] = epoch_total / max(n_steps, 1)

        log_entry = {"epoch": epoch, "losses": avg_losses, "lr": scheduler.get_last_lr()[0]}

        # ── Validation ──
        if val_loader and (epoch + 1) % val_interval == 0:
            val_metrics = validate(model, val_loader, metrics_calc, device)
            log_entry["val_metrics"] = val_metrics
            logger.info(f"Epoch {epoch} val: PSNR={val_metrics.get('psnr', 0):.2f}, "
                        f"SSIM={val_metrics.get('ssim', 0):.4f}, SAM={val_metrics.get('sam', 0):.4f}")

            if val_metrics.get("psnr", 0) > best_psnr:
                best_psnr = val_metrics["psnr"]
                torch.save({
                    "epoch": epoch,
                    "model_state": model.state_dict(),
                    "optimizer_state": optimizer.state_dict(),
                    "best_psnr": best_psnr,
                    "config": model_config,
                    "phase": args.phase,
                }, os.path.join(args.output_dir, f"{args.phase}_best.pth"))
                logger.info(f"New best PSNR: {best_psnr:.2f} — saved {args.phase}_best.pth")

        # ── Periodic save ──
        if (epoch + 1) % save_interval == 0:
            torch.save({
                "epoch": epoch,
                "model_state": model.state_dict(),
                "optimizer_state": optimizer.state_dict(),
                "best_psnr": best_psnr,
                "config": model_config,
                "phase": args.phase,
            }, os.path.join(args.output_dir, f"{args.phase}_ep{epoch}.pth"))

        training_log.append(log_entry)
        logger.info(f"Epoch {epoch}: total_loss={avg_losses['total']:.4f} | "
                    + " | ".join(f"{k}={v:.4f}" for k, v in avg_losses.items() if k != "total"))

    # Save training log
    log_path = os.path.join(args.output_dir, f"{args.phase}_training_log.json")
    with open(log_path, "w") as f:
        json.dump(training_log, f, indent=2)
    logger.info(f"Training complete. Log saved to {log_path}")
    logger.info(f"Best validation PSNR: {best_psnr:.2f}")


if __name__ == "__main__":
    train()
