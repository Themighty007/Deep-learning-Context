import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Any, Tuple
import math

from .swinir import SwinIRBackbone
from .temporal_attention import QualityAwareTemporalAttention
from .fusion import CrossAttentionFusion
from .uncertainty import MCDropoutUncertainty

class RAMTSR(nn.Module):
    """Reliability-Aware Multi-Temporal Super Resolution (RAMTSR) Model."""
    def __init__(self, config: Dict[str, Any]):
        super().__init__()
        self.config = config
        
        in_channels = config.get('in_channels', 4)
        embed_dim = config.get('embed_dim', 180)
        scale = config.get('scale', 4)
        
        # Shared Spectral Encoder
        self.spectral_encoder = SwinIRBackbone(
            in_chans=in_channels,
            embed_dim=embed_dim,
            num_heads=config.get('num_heads', 6),
            window_size=config.get('window_size', 8)
        )
        
        # Temporal Branch
        self.temporal_attention = QualityAwareTemporalAttention(
            embed_dim=embed_dim,
            num_heads=config.get('num_heads', 6),
            window_size=config.get('window_size', 8)
        )
        
        # Fusion
        self.fusion = CrossAttentionFusion(
            embed_dim=embed_dim,
            num_heads=config.get('num_heads', 6),
            window_size=config.get('window_size', 8)
        )
        
        # 4x Sub-pixel Upsampling
        self.upsampler = nn.Sequential(
            nn.Conv2d(embed_dim, in_channels * (scale ** 2), 3, 1, 1),
            nn.PixelShuffle(scale)
        )
        
        # Dropout for Uncertainty
        self.dropout = nn.Dropout2d(p=config.get('dropout_rate', 0.2))

    def forward(self, lr_frames: torch.Tensor, quality_masks: torch.Tensor) -> torch.Tensor:
        """
        Args:
            lr_frames: (B, T, C, H, W)
            quality_masks: (B, T, 1, H, W)
        Returns:
            sr_out: (B, C, H*4, W*4)
        """
        B, T, C, H, W = lr_frames.shape
        
        # 1. Encode each frame
        features = []
        for t in range(T):
            features.append(self.spectral_encoder(lr_frames[:, t]))
            
        # 2. Split branches
        center_idx = T // 2
        spatial_feat = features[center_idx]
        
        masks = [quality_masks[:, t] for t in range(T)]
        temporal_feat = self.temporal_attention(features, masks)
        
        # 3. Fuse
        fused_feat = self.fusion(spatial_feat, temporal_feat)
        fused_feat = self.dropout(fused_feat)
        
        # 4. Upsample
        sr_out = self.upsampler(fused_feat)
        
        # Global residual connection from center frame
        lr_center_up = F.interpolate(lr_frames[:, center_idx], scale_factor=4, mode='bilinear', align_corners=False)
        return sr_out + lr_center_up

    def forward_with_uncertainty(self, lr_frames: torch.Tensor, quality_masks: torch.Tensor, num_passes: int = 10) -> Tuple[torch.Tensor, torch.Tensor]:
        """Runs MC-Dropout to get SR output and uncertainty map."""
        mc_wrapper = MCDropoutUncertainty(self)
        return mc_wrapper.estimate_uncertainty(lr_frames, quality_masks, num_passes=num_passes)
        
    def observation_consistency_check(self, sr_out: torch.Tensor, lr_center: torch.Tensor, sigma: float = 1.5) -> torch.Tensor:
        """
        Checks anti-hallucination by forwarding SR through a degradation model.
        Args:
            sr_out: Super-resolved output (B, C, H*4, W*4)
            lr_center: Center low-res frame (B, C, H, W)
            sigma: Gaussian PSF sigma
        Returns:
            consistency_map: Pixel-wise MSE difference (B, 1, H, W)
        """
        # Create Gaussian kernel
        kernel_size = int(2 * math.ceil(2 * sigma) + 1)
        x = torch.arange(kernel_size, dtype=torch.float32, device=sr_out.device) - kernel_size // 2
        gaussian = torch.exp(-(x ** 2) / (2 * sigma ** 2))
        gaussian = gaussian / gaussian.sum()
        kernel = gaussian[:, None] * gaussian[None, :]
        kernel = kernel.expand(sr_out.shape[1], 1, kernel_size, kernel_size)
        
        # Blur
        blurred = F.conv2d(sr_out, kernel, padding=kernel_size//2, groups=sr_out.shape[1])
        # Downsample
        simulated_lr = F.avg_pool2d(blurred, kernel_size=4, stride=4)
        
        # Difference
        consistency_map = torch.mean((simulated_lr - lr_center) ** 2, dim=1, keepdim=True)
        return consistency_map
