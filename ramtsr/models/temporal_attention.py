import torch
import torch.nn as nn
from typing import List
from einops import rearrange

class QualityAwareTemporalAttention(nn.Module):
    """Quality-Aware Temporal Attention for Multi-Temporal Super Resolution."""
    def __init__(self, embed_dim: int = 180, num_heads: int = 6, window_size: int = 8):
        super().__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.window_size = window_size
        head_dim = embed_dim // num_heads
        self.scale = head_dim ** -0.5
        
        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, embed_dim)
        self.v_proj = nn.Linear(embed_dim, embed_dim)
        
        self.proj = nn.Linear(embed_dim, embed_dim)
        self.softmax = nn.Softmax(dim=-1)
        self.norm = nn.LayerNorm(embed_dim)

    def forward(self, features: List[torch.Tensor], quality_masks: List[torch.Tensor]) -> torch.Tensor:
        """
        Args:
            features: List of T tensors of shape (B, C, H, W)
            quality_masks: List of T tensors of shape (B, 1, H, W)
        Returns:
            fused_feature: Tensor of shape (B, C, H, W)
        """
        B, C, H, W = features[0].shape
        T = len(features)
        
        # Stack features and masks
        x = torch.stack(features, dim=1) # (B, T, C, H, W)
        masks = torch.stack(quality_masks, dim=1) # (B, T, 1, H, W)
        
        # Rearrange to sequence for self attention per pixel across time
        x = rearrange(x, 'b t c h w -> (b h w) t c')
        masks = rearrange(masks, 'b t 1 h w -> (b h w) t')
        
        x_norm = self.norm(x)
        
        q = self.q_proj(x_norm[:, T//2].unsqueeze(1)).reshape(-1, 1, self.num_heads, C // self.num_heads).transpose(1, 2)
        k = self.k_proj(x_norm).reshape(-1, T, self.num_heads, C // self.num_heads).transpose(1, 2)
        v = self.v_proj(x_norm).reshape(-1, T, self.num_heads, C // self.num_heads).transpose(1, 2)
        
        attn = (q @ k.transpose(-2, -1)) * self.scale # (N, H, 1, T)
        
        # Modulate attention by quality masks
        # Add a large negative value to low quality pixels to ignore them
        mask_penalty = (1.0 - masks.unsqueeze(1).unsqueeze(2)) * -10000.0
        attn = attn + mask_penalty
        
        attn = self.softmax(attn)
        out = (attn @ v).transpose(1, 2).reshape(-1, 1, C)
        out = self.proj(out)
        
        # Residual connection
        out = out + x[:, T//2].unsqueeze(1)
        out = rearrange(out.squeeze(1), '(b h w) c -> b c h w', b=B, h=H, w=W)
        return out
