import math
from typing import Dict, Optional, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models

class ReconstructionLoss(nn.Module):
    """L1 loss between SR output and HR ground truth."""
    def __init__(self):
        super().__init__()
        self.l1 = nn.L1Loss()

    def forward(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        return self.l1(pred, target)

class SpectralAngleLoss(nn.Module):
    """
    Spectral Angle Mapper.
    Measures the angular distance between spectral vectors.
    """
    def __init__(self, eps: float = 1e-8):
        super().__init__()
        self.eps = eps

    def forward(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        dot_product = torch.sum(pred * target, dim=1)
        norm_pred = torch.norm(pred, p=2, dim=1).clamp(min=self.eps)
        norm_target = torch.norm(target, p=2, dim=1).clamp(min=self.eps)
        cos_theta = dot_product / (norm_pred * norm_target)
        cos_theta = cos_theta.clamp(-1.0 + self.eps, 1.0 - self.eps)
        sam = torch.acos(cos_theta)
        return torch.mean(sam)

class ObservationConsistencyLoss(nn.Module):
    """
    The key anti-hallucination loss.
    Takes SR output (2.5m), applies Gaussian PSF blur (sigma=1.5),
    downsamples 4x to simulate what Sentinel-2 would observe,
    and computes L1 between degraded-SR and actual Sentinel-2 input.
    """
    def __init__(self, channels: int = 4, scale_factor: int = 4, sigma: float = 1.5, kernel_size: int = 5):
        super().__init__()
        self.scale_factor = scale_factor
        
        # Create 2D Gaussian kernel
        coords = torch.arange(kernel_size, dtype=torch.float32) - (kernel_size - 1) / 2.0
        g = torch.exp(-(coords**2) / (2 * sigma**2))
        g = g / g.sum()
        kernel2d = torch.outer(g, g)
        kernel2d = kernel2d.unsqueeze(0).unsqueeze(0)
        kernel2d = kernel2d.repeat(channels, 1, 1, 1)
        
        self.register_buffer('kernel', kernel2d)
        self.channels = channels
        self.pad = kernel_size // 2

    def forward(self, pred_sr: torch.Tensor, lr_input: torch.Tensor) -> torch.Tensor:
        # Pad and convolve to blur
        blurred = F.conv2d(
            F.pad(pred_sr, (self.pad, self.pad, self.pad, self.pad), mode='reflect'),
            self.kernel, 
            groups=self.channels
        )
        # Downsample using avg pool
        degraded = F.avg_pool2d(blurred, kernel_size=self.scale_factor, stride=self.scale_factor)
        
        # We assume lr_input has the same number of channels and spatial dims matching degraded
        return F.l1_loss(degraded, lr_input)

class PerceptualLoss(nn.Module):
    """
    VGG-based perceptual loss using relu1_2, relu2_2, relu3_4 features.
    Only works on RGB channels.
    """
    def __init__(self):
        super().__init__()
        try:
            vgg = models.vgg16(weights=models.VGG16_Weights.DEFAULT).features
        except AttributeError:
            # Fallback for older torchvision
            vgg = models.vgg16(pretrained=True).features
        
        self.slice1 = torch.nn.Sequential()
        self.slice2 = torch.nn.Sequential()
        self.slice3 = torch.nn.Sequential()
        
        for x in range(4):
            self.slice1.add_module(str(x), vgg[x])
        for x in range(4, 9):
            self.slice2.add_module(str(x), vgg[x])
        for x in range(9, 16):
            self.slice3.add_module(str(x), vgg[x])
            
        for param in self.parameters():
            param.requires_grad = False

    def forward(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        # Assuming input is [B, C, H, W] and RGB is in the first 3 channels
        pred_rgb = pred[:, :3, :, :]
        target_rgb = target[:, :3, :, :]
        
        # Normalize to ImageNet stats if required, here assuming inputs are roughly [0, 1]
        mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(pred.device)
        std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(pred.device)
        
        pred_norm = (pred_rgb - mean) / std
        target_norm = (target_rgb - mean) / std

        pred_f1 = self.slice1(pred_norm)
        pred_f2 = self.slice2(pred_f1)
        pred_f3 = self.slice3(pred_f2)

        target_f1 = self.slice1(target_norm)
        target_f2 = self.slice2(target_f1)
        target_f3 = self.slice3(target_f2)

        loss = F.l1_loss(pred_f1, target_f1) + \
               F.l1_loss(pred_f2, target_f2) + \
               F.l1_loss(pred_f3, target_f3)
        return loss

class UncertaintyLoss(nn.Module):
    """
    Negative log-likelihood loss for uncertainty estimation.
    NLL = 0.5 * (log_var + (target - mean)^2 / exp(log_var))
    """
    def __init__(self):
        super().__init__()

    def forward(self, mean: torch.Tensor, log_var: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        nll = 0.5 * (log_var + ((target - mean) ** 2) / torch.exp(log_var))
        return torch.mean(nll)

class RAMTSRLoss(nn.Module):
    """Combined loss manager for different phases."""
    def __init__(self, phase: str, config: dict):
        super().__init__()
        self.phase = phase
        self.config = config
        
        self.recon_loss = ReconstructionLoss()
        self.spectral_loss = SpectralAngleLoss()
        
        channels = config.get('channels', 4)
        self.obs_loss = ObservationConsistencyLoss(channels=channels)
        self.perceptual_loss = PerceptualLoss()
        self.uncertainty_loss = UncertaintyLoss()
        
        # Base weights
        self.weights = {
            'recon': 1.0,
            'spectral': 0.5,
            'obs': 0.3,
            'perceptual': 0.1,
            'uncertainty': 0.1
        }
        
    def forward(self, sr: torch.Tensor, hr: torch.Tensor, lr: torch.Tensor, log_var: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, Dict[str, float]]:
        loss_dict = {}
        total_loss = 0.0
        
        # Always Phase 1
        l_recon = self.recon_loss(sr, hr)
        l_spec = self.spectral_loss(sr, hr)
        
        total_loss += self.weights['recon'] * l_recon
        total_loss += self.weights['spectral'] * l_spec
        
        loss_dict['reconstruction'] = l_recon.item()
        loss_dict['spectral'] = l_spec.item()
        
        # Phase 2+
        if self.phase in ['phase_2', 'phase_3', 'phase_4']:
            # We assume lr temporal dim is reduced or we use central frame
            lr_frame = lr[:, 2] if lr.dim() == 5 else lr # rough assumption for central frame
            l_obs = self.obs_loss(sr, lr_frame)
            total_loss += self.weights['obs'] * l_obs
            loss_dict['observation'] = l_obs.item()
            
        # Phase 3+
        if self.phase in ['phase_3', 'phase_4']:
            l_perc = self.perceptual_loss(sr, hr)
            total_loss += self.weights['perceptual'] * l_perc
            loss_dict['perceptual'] = l_perc.item()
            
        # Phase 4
        if self.phase == 'phase_4' and log_var is not None:
            l_unc = self.uncertainty_loss(sr, log_var, hr)
            total_loss += self.weights['uncertainty'] * l_unc
            loss_dict['uncertainty'] = l_unc.item()
            
        return total_loss, loss_dict
