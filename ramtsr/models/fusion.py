import torch
import torch.nn as nn
from einops import rearrange

class CrossAttentionFusion(nn.Module):
    """Cross-Attention Fusion for fusing spatial and temporal branches."""
    def __init__(self, embed_dim: int = 180, num_heads: int = 6, window_size: int = 8, mlp_ratio: float = 2.0):
        super().__init__()
        self.window_size = window_size
        self.num_heads = num_heads
        head_dim = embed_dim // num_heads
        self.scale = head_dim ** -0.5
        
        self.norm1_s = nn.LayerNorm(embed_dim)
        self.norm1_t = nn.LayerNorm(embed_dim)
        
        self.q_s = nn.Linear(embed_dim, embed_dim)
        self.k_t = nn.Linear(embed_dim, embed_dim)
        self.v_t = nn.Linear(embed_dim, embed_dim)
        
        self.proj = nn.Linear(embed_dim, embed_dim)
        
        self.norm2 = nn.LayerNorm(embed_dim)
        mlp_hidden_dim = int(embed_dim * mlp_ratio)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, mlp_hidden_dim),
            nn.GELU(),
            nn.Linear(mlp_hidden_dim, embed_dim)
        )
        
        self.conv_out = nn.Conv2d(embed_dim, embed_dim, 3, 1, 1)
        
    def forward(self, spatial_feat: torch.Tensor, temporal_feat: torch.Tensor) -> torch.Tensor:
        """
        Args:
            spatial_feat: (B, C, H, W)
            temporal_feat: (B, C, H, W)
        Returns:
            fused_feat: (B, C, H, W)
        """
        B, C, H, W = spatial_feat.shape
        
        s = rearrange(spatial_feat, 'b c h w -> b (h w) c')
        t = rearrange(temporal_feat, 'b c h w -> b (h w) c')
        
        s_norm = self.norm1_s(s)
        t_norm = self.norm1_t(t)
        
        # Spatial queries temporal
        q = self.q_s(s_norm).reshape(B, -1, self.num_heads, C // self.num_heads).transpose(1, 2)
        k = self.k_t(t_norm).reshape(B, -1, self.num_heads, C // self.num_heads).transpose(1, 2)
        v = self.v_t(t_norm).reshape(B, -1, self.num_heads, C // self.num_heads).transpose(1, 2)
        
        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = attn.softmax(dim=-1)
        
        x = (attn @ v).transpose(1, 2).reshape(B, -1, C)
        x = self.proj(x)
        
        # Residual and MLP
        x = x + s
        x = x + self.mlp(self.norm2(x))
        
        x = rearrange(x, 'b (h w) c -> b c h w', h=H, w=W)
        x = self.conv_out(x)
        return x
