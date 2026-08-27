"""
RAMTSR Demo Inference Script

Runs super-resolution on predefined Indian city locations or custom bboxes.
Supports uncertainty estimation via MC-Dropout and observation consistency checks.

Usage:
  python scripts/demo.py --checkpoint checkpoints/phase_4_best.pth --location mumbai --output_dir demo_output/
  python scripts/demo.py --checkpoint checkpoints/phase_4_best.pth --location mumbai --uncertainty --output_dir demo_output/
  python scripts/demo.py --checkpoint checkpoints/phase_4_best.pth --bbox 72.7 18.85 73.1 19.25 --output_dir demo_output/
"""

import argparse
import os
import sys
from pathlib import Path

import numpy as np
import torch
import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ramtsr.models.ramtsr import RAMTSR
from ramtsr.utils.geo_utils import (
    read_geotiff, write_geotiff, tile_image, merge_tiles,
    create_rgb_composite, compute_ndvi,
)

# Predefined Indian demo locations (bbox: [min_lon, min_lat, max_lon, max_lat])
PREDEFINED_LOCATIONS = {
    "mumbai": {"bbox": [72.8, 18.9, 73.0, 19.1], "desc": "Mumbai coastline — urban + water edges"},
    "delhi": {"bbox": [77.1, 28.5, 77.3, 28.7], "desc": "Delhi NCR — dense urban, narrow roads"},
    "punjab": {"bbox": [75.8, 30.8, 76.0, 31.0], "desc": "Punjab agriculture — field boundaries"},
    "chennai": {"bbox": [80.1, 12.9, 80.3, 13.1], "desc": "Chennai — coastal urban + water"},
    "himalayas": {"bbox": [77.5, 32.2, 77.7, 32.4], "desc": "Himalayas — terrain, snow, vegetation"},
    "western_ghats": {"bbox": [75.5, 11.5, 76.0, 12.0], "desc": "Western Ghats — dense vegetation"},
}


def load_model(checkpoint_path: str, device: torch.device) -> RAMTSR:
    """Load trained RAMTSR model from checkpoint."""
    ckpt = torch.load(checkpoint_path, map_location=device, weights_only=False)
    config = ckpt.get("config", {
        "in_channels": 4, "embed_dim": 180, "num_heads": 6,
        "window_size": 8, "scale": 4, "dropout_rate": 0.1,
    })
    model = RAMTSR(config).to(device)
    model.load_state_dict(ckpt["model_state"], strict=False)
    model.eval()
    print(f"Model loaded: {sum(p.numel() for p in model.parameters()) / 1e6:.2f}M params")
    return model


def load_local_data(input_dir: str, num_frames: int = 5) -> dict:
    """Load pre-cached Sentinel-2 data from local GeoTIFF files.

    Expects files named: frame_0.tif, frame_1.tif, ... in input_dir.
    Each file: (C, H, W) where C=4 bands (B02, B03, B04, B08).

    Returns dict with 'lr_frames' (T, C, H, W) and 'quality_masks' (T, 1, H, W).
    """
    frames = []
    for t in range(num_frames):
        path = os.path.join(input_dir, f"frame_{t}.tif")
        if os.path.exists(path):
            data, transform, crs, profile = read_geotiff(path)
            data = np.clip(data.astype(np.float32) / 10000.0, 0, 1)
            frames.append(data)
        else:
            break

    if not frames:
        print("[WARN] No local data found. Using synthetic data for demo.")
        frames = [np.random.rand(4, 256, 256).astype(np.float32) for _ in range(num_frames)]
        transform = None
        crs = None
        profile = None

    lr_frames = np.stack(frames[:num_frames], axis=0)
    quality_masks = np.ones((lr_frames.shape[0], 1, lr_frames.shape[2], lr_frames.shape[3]),
                            dtype=np.float32)

    return {
        "lr_frames": lr_frames,
        "quality_masks": quality_masks,
        "transform": transform,
        "crs": crs,
        "profile": profile,
    }


def run_inference(model: RAMTSR, lr_frames: np.ndarray, quality_masks: np.ndarray,
                  device: torch.device, uncertainty: bool = False,
                  num_mc_passes: int = 10) -> dict:
    """Run RAMTSR inference on input data.

    Args:
        model: Trained RAMTSR model
        lr_frames: (T, C, H, W) input frames
        quality_masks: (T, 1, H, W) quality masks
        device: torch device
        uncertainty: Whether to compute MC-Dropout uncertainty
        num_mc_passes: Number of MC-Dropout forward passes

    Returns:
        dict with 'sr' (C, H*4, W*4), 'uncertainty' (1, H*4, W*4) or None, 'consistency' (1, H, W)
    """
    # Add batch dimension
    lr_tensor = torch.from_numpy(lr_frames).unsqueeze(0).to(device)  # (1, T, C, H, W)
    qm_tensor = torch.from_numpy(quality_masks).unsqueeze(0).to(device)  # (1, T, 1, H, W)

    with torch.no_grad():
        if uncertainty:
            sr_mean, sr_var = model.forward_with_uncertainty(
                lr_tensor, qm_tensor, num_passes=num_mc_passes)
            sr = sr_mean[0].cpu().numpy()
            unc = sr_var[0].cpu().numpy()
        else:
            sr = model(lr_tensor, qm_tensor)[0].cpu().numpy()
            unc = None

        # Observation consistency check
        center_idx = lr_frames.shape[0] // 2
        lr_center = torch.from_numpy(lr_frames[center_idx:center_idx+1]).to(device)
        consistency = model.observation_consistency_check(
            torch.from_numpy(sr).unsqueeze(0).to(device), lr_center
        )[0].cpu().numpy()

    return {"sr": sr, "uncertainty": unc, "consistency": consistency}


def save_outputs(results: dict, lr_frames: np.ndarray, output_dir: str,
                 location_name: str, geo_info: dict = None):
    """Save all demo outputs: GeoTIFFs, comparison PNGs, NDVI comparison."""
    os.makedirs(output_dir, exist_ok=True)
    sr = results["sr"]
    center_idx = lr_frames.shape[0] // 2
    lr_center = lr_frames[center_idx]

    # 1. Save SR GeoTIFF (if we have geo info)
    transform = geo_info.get("transform") if geo_info else None
    crs = geo_info.get("crs") if geo_info else None
    if transform and crs:
        # Scale transform for 4× resolution
        import rasterio
        sr_transform = rasterio.Affine(
            transform.a / 4, transform.b, transform.c,
            transform.d, transform.e / 4, transform.f)
        write_geotiff(
            os.path.join(output_dir, f"{location_name}_sr.tif"),
            (sr * 10000).astype(np.uint16), sr_transform, crs,
            band_names=["B02", "B03", "B04", "B08"])
        print(f"  Saved: {location_name}_sr.tif")

    # 2. RGB comparison
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))

    # LR (upscaled for visual comparison)
    lr_rgb = np.clip(lr_center[:3].transpose(1, 2, 0) * 2.5, 0, 1)  # Stretch for visibility
    axes[0].imshow(lr_rgb)
    axes[0].set_title("Input: Sentinel-2 (10m)", fontsize=14)
    axes[0].axis("off")

    # SR
    sr_rgb = np.clip(sr[:3].transpose(1, 2, 0) * 2.5, 0, 1)
    axes[1].imshow(sr_rgb)
    axes[1].set_title("Output: RAMTSR (2.5m)", fontsize=14)
    axes[1].axis("off")

    # Uncertainty or consistency
    if results["uncertainty"] is not None:
        unc_map = results["uncertainty"].mean(axis=0)
        im = axes[2].imshow(unc_map, cmap="hot", vmin=0)
        axes[2].set_title("Uncertainty Map", fontsize=14)
        plt.colorbar(im, ax=axes[2], fraction=0.046)
    else:
        cons_map = results["consistency"].squeeze()
        im = axes[2].imshow(cons_map, cmap="RdYlGn_r", vmin=0)
        axes[2].set_title("Consistency Check", fontsize=14)
        plt.colorbar(im, ax=axes[2], fraction=0.046)
    axes[2].axis("off")

    plt.suptitle(f"RAMTSR Demo — {location_name.title()}", fontsize=16, fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, f"{location_name}_comparison.png"), dpi=150)
    plt.close()
    print(f"  Saved: {location_name}_comparison.png")

    # 3. NDVI comparison
    if sr.shape[0] >= 4:
        lr_ndvi = compute_ndvi(lr_center[3], lr_center[2])  # NIR=B08, RED=B04
        sr_ndvi = compute_ndvi(sr[3], sr[2])

        fig, axes = plt.subplots(1, 2, figsize=(12, 5))
        im0 = axes[0].imshow(lr_ndvi, cmap="RdYlGn", vmin=-0.2, vmax=0.8)
        axes[0].set_title("NDVI — 10m Input", fontsize=13)
        axes[0].axis("off")
        plt.colorbar(im0, ax=axes[0], fraction=0.046)

        im1 = axes[1].imshow(sr_ndvi, cmap="RdYlGn", vmin=-0.2, vmax=0.8)
        axes[1].set_title("NDVI — 2.5m Super-Resolved", fontsize=13)
        axes[1].axis("off")
        plt.colorbar(im1, ax=axes[1], fraction=0.046)

        plt.suptitle(f"Crop Monitoring Application — {location_name.title()}", fontsize=14)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, f"{location_name}_ndvi.png"), dpi=150)
        plt.close()
        print(f"  Saved: {location_name}_ndvi.png")


def main():
    parser = argparse.ArgumentParser(description="RAMTSR Demo Inference")
    parser.add_argument("--checkpoint", type=str, required=True, help="Path to model checkpoint")
    parser.add_argument("--location", type=str,
                        choices=list(PREDEFINED_LOCATIONS.keys()) + ["custom"],
                        default="mumbai", help="Demo location")
    parser.add_argument("--bbox", type=float, nargs=4,
                        help="Custom bbox: min_lon min_lat max_lon max_lat")
    parser.add_argument("--input_dir", type=str, default=None,
                        help="Path to pre-cached local GeoTIFF frames")
    parser.add_argument("--output_dir", type=str, default="demo_output", help="Output directory")
    parser.add_argument("--uncertainty", action="store_true",
                        help="Generate uncertainty map via MC-Dropout")
    parser.add_argument("--num_mc_passes", type=int, default=10, help="MC-Dropout passes")
    args = parser.parse_args()

    if args.location == "custom" and not args.bbox:
        raise ValueError("--bbox must be provided for custom location")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Load model
    model = load_model(args.checkpoint, device)

    # Determine location
    if args.location == "custom":
        location_name = "custom"
        bbox = args.bbox
    else:
        location_name = args.location
        loc_info = PREDEFINED_LOCATIONS[args.location]
        bbox = loc_info["bbox"]
        print(f"Location: {location_name} — {loc_info['desc']}")
        print(f"  BBox: {bbox}")

    # Load data
    input_dir = args.input_dir or os.path.join("data", "copernicus", location_name)
    data = load_local_data(input_dir, num_frames=5)
    print(f"Loaded {data['lr_frames'].shape[0]} frames, shape: {data['lr_frames'].shape[1:]}")

    # Run inference
    print("Running RAMTSR inference...")
    results = run_inference(
        model, data["lr_frames"], data["quality_masks"],
        device, uncertainty=args.uncertainty, num_mc_passes=args.num_mc_passes)
    print(f"  SR output shape: {results['sr'].shape}")

    # Save outputs
    print("Saving outputs...")
    geo_info = {"transform": data.get("transform"), "crs": data.get("crs")}
    save_outputs(results, data["lr_frames"], args.output_dir, location_name, geo_info)

    print(f"\nDemo complete! Results in: {args.output_dir}/")


if __name__ == "__main__":
    main()
