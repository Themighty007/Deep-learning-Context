"""
SwinIR Backbone — Swin Transformer for Image Restoration

Implements the SwinIR architecture with:
  - Residual Swin Transformer Blocks (RSTB)
  - Window-based multi-head self-attention with SHIFTED windows
  - Relative position bias
  - Gradient checkpointing support

Reference: Liang et al., "SwinIR: Image Restoration Using Swin Transformer", ICCV 2021
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple
import torch.utils.checkpoint as checkpoint


def window_partition(x: torch.Tensor, window_size: int) -> torch.Tensor:
    """Partition feature map into non-overlapping windows.

    Args:
        x: (B, H, W, C)
        window_size: Window size

    Returns:
        windows: (num_windows * B, window_size, window_size, C)
    """
    B, H, W, C = x.shape
    x = x.view(B, H // window_size, window_size, W // window_size, window_size, C)
    windows = x.permute(0, 1, 3, 2, 4, 5).contiguous().view(-1, window_size, window_size, C)
    return windows


def window_reverse(windows: torch.Tensor, window_size: int, H: int, W: int) -> torch.Tensor:
    """Reverse window partition.

    Args:
        windows: (num_windows * B, window_size, window_size, C)
        window_size: Window size
        H: Height of image
        W: Width of image

    Returns:
        x: (B, H, W, C)
    """
    B = int(windows.shape[0] / (H * W / window_size / window_size))
    x = windows.view(B, H // window_size, W // window_size, window_size, window_size, -1)
    x = x.permute(0, 1, 3, 2, 4, 5).contiguous().view(B, H, W, -1)
    return x


class WindowAttention(nn.Module):
    """Window based multi-head self-attention (W-MSA) with relative position bias.

    Supports both regular and shifted window configurations.
    """

    def __init__(self, dim: int, window_size: Tuple[int, int], num_heads: int,
                 qkv_bias: bool = True, attn_drop: float = 0., proj_drop: float = 0.):
        super().__init__()
        self.dim = dim
        self.window_size = window_size  # (Wh, Ww)
        self.num_heads = num_heads
        head_dim = dim // num_heads
        self.scale = head_dim ** -0.5

        # Relative position bias table: (2*Wh-1) * (2*Ww-1), num_heads
        self.relative_position_bias_table = nn.Parameter(
            torch.zeros((2 * window_size[0] - 1) * (2 * window_size[1] - 1), num_heads))
        nn.init.trunc_normal_(self.relative_position_bias_table, std=0.02)

        # Compute relative position index for each token in the window
        coords_h = torch.arange(self.window_size[0])
        coords_w = torch.arange(self.window_size[1])
        coords = torch.stack(torch.meshgrid(coords_h, coords_w, indexing='ij'))  # (2, Wh, Ww)
        coords_flatten = torch.flatten(coords, 1)  # (2, Wh*Ww)

        relative_coords = coords_flatten[:, :, None] - coords_flatten[:, None, :]  # (2, N, N)
        relative_coords = relative_coords.permute(1, 2, 0).contiguous()  # (N, N, 2)
        relative_coords[:, :, 0] += self.window_size[0] - 1
        relative_coords[:, :, 1] += self.window_size[1] - 1
        relative_coords[:, :, 0] *= 2 * self.window_size[1] - 1
        relative_position_index = relative_coords.sum(-1)  # (N, N)
        self.register_buffer("relative_position_index", relative_position_index)

        self.qkv = nn.Linear(dim, dim * 3, bias=qkv_bias)
        self.attn_drop = nn.Dropout(attn_drop)
        self.proj = nn.Linear(dim, dim)
        self.proj_drop = nn.Dropout(proj_drop)
        self.softmax = nn.Softmax(dim=-1)

    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        """Forward pass.

        Args:
            x: Input features (num_windows*B, N, C) where N = window_size^2
            mask: Attention mask for SW-MSA (num_windows, N, N) or None

        Returns:
            Output features (num_windows*B, N, C)
        """
        B_, N, C = x.shape
        qkv = self.qkv(x).reshape(B_, N, 3, self.num_heads, C // self.num_heads).permute(2, 0, 3, 1, 4)
        q, k, v = qkv.unbind(0)

        q = q * self.scale
        attn = (q @ k.transpose(-2, -1))

        # Add relative position bias
        relative_position_bias = self.relative_position_bias_table[
            self.relative_position_index.view(-1)].view(
            self.window_size[0] * self.window_size[1],
            self.window_size[0] * self.window_size[1], -1)
        relative_position_bias = relative_position_bias.permute(2, 0, 1).contiguous()  # (nH, N, N)
        attn = attn + relative_position_bias.unsqueeze(0)

        # Apply attention mask for shifted windows
        if mask is not None:
            nW = mask.shape[0]
            attn = attn.view(B_ // nW, nW, self.num_heads, N, N) + mask.unsqueeze(1).unsqueeze(0)
            attn = attn.view(-1, self.num_heads, N, N)

        attn = self.softmax(attn)
        attn = self.attn_drop(attn)

        x = (attn @ v).transpose(1, 2).reshape(B_, N, C)
        x = self.proj(x)
        x = self.proj_drop(x)
        return x


class SwinTransformerBlock(nn.Module):
    """Swin Transformer Block with regular or shifted window attention."""

    def __init__(self, dim: int, num_heads: int, window_size: int = 8,
                 shift_size: int = 0, mlp_ratio: float = 2.0, drop: float = 0.):
        super().__init__()
        self.dim = dim
        self.num_heads = num_heads
        self.window_size = window_size
        self.shift_size = shift_size
        self.mlp_ratio = mlp_ratio

        self.norm1 = nn.LayerNorm(dim)
        self.attn = WindowAttention(
            dim, window_size=(window_size, window_size), num_heads=num_heads)

        self.norm2 = nn.LayerNorm(dim)
        mlp_hidden_dim = int(dim * mlp_ratio)
        self.mlp = nn.Sequential(
            nn.Linear(dim, mlp_hidden_dim),
            nn.GELU(),
            nn.Dropout(drop),
            nn.Linear(mlp_hidden_dim, dim),
            nn.Dropout(drop),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass.

        Args:
            x: (B, H*W, C) — flattened spatial features with H, W set as attributes

        Returns:
            x: (B, H*W, C)
        """
        H, W = self.H, self.W
        B, L, C = x.shape
        assert L == H * W, f"Input size mismatch: {L} vs {H}*{W}"

        shortcut = x
        x = self.norm1(x)
        x = x.view(B, H, W, C)

        # Pad feature maps to multiples of window_size
        pad_r = (self.window_size - W % self.window_size) % self.window_size
        pad_b = (self.window_size - H % self.window_size) % self.window_size
        x = F.pad(x, (0, 0, 0, pad_r, 0, pad_b))
        _, Hp, Wp, _ = x.shape

        # Cyclic shift for SW-MSA
        if self.shift_size > 0:
            shifted_x = torch.roll(x, shifts=(-self.shift_size, -self.shift_size), dims=(1, 2))
            attn_mask = self._compute_mask(Hp, Wp, x.device)
        else:
            shifted_x = x
            attn_mask = None

        # Partition windows
        x_windows = window_partition(shifted_x, self.window_size)  # (nW*B, ws, ws, C)
        x_windows = x_windows.view(-1, self.window_size * self.window_size, C)

        # W-MSA / SW-MSA
        attn_windows = self.attn(x_windows, mask=attn_mask)

        # Merge windows
        attn_windows = attn_windows.view(-1, self.window_size, self.window_size, C)
        shifted_x = window_reverse(attn_windows, self.window_size, Hp, Wp)

        # Reverse cyclic shift
        if self.shift_size > 0:
            x = torch.roll(shifted_x, shifts=(self.shift_size, self.shift_size), dims=(1, 2))
        else:
            x = shifted_x

        # Remove padding
        if pad_r > 0 or pad_b > 0:
            x = x[:, :H, :W, :].contiguous()

        x = x.view(B, H * W, C)
        x = shortcut + x
        x = x + self.mlp(self.norm2(x))
        return x

    def _compute_mask(self, Hp: int, Wp: int, device: torch.device) -> torch.Tensor:
        """Compute attention mask for shifted window multi-head self-attention."""
        img_mask = torch.zeros((1, Hp, Wp, 1), device=device)

        h_slices = (
            slice(0, -self.window_size),
            slice(-self.window_size, -self.shift_size),
            slice(-self.shift_size, None),
        )
        w_slices = (
            slice(0, -self.window_size),
            slice(-self.window_size, -self.shift_size),
            slice(-self.shift_size, None),
        )

        cnt = 0
        for h in h_slices:
            for w in w_slices:
                img_mask[:, h, w, :] = cnt
                cnt += 1

        mask_windows = window_partition(img_mask, self.window_size)  # (nW, ws, ws, 1)
        mask_windows = mask_windows.view(-1, self.window_size * self.window_size)
        attn_mask = mask_windows.unsqueeze(1) - mask_windows.unsqueeze(2)
        attn_mask = attn_mask.masked_fill(attn_mask != 0, float(-100.0)).masked_fill(attn_mask == 0, float(0.0))
        return attn_mask


class RSTB(nn.Module):
    """Residual Swin Transformer Block (RSTB).

    Several Swin Transformer Blocks + one conv layer + residual connection.
    """

    def __init__(self, dim: int, num_heads: int, window_size: int,
                 depth: int, mlp_ratio: float = 2.0):
        super().__init__()
        self.blocks = nn.ModuleList([
            SwinTransformerBlock(
                dim=dim, num_heads=num_heads, window_size=window_size,
                shift_size=0 if (i % 2 == 0) else window_size // 2,
                mlp_ratio=mlp_ratio)
            for i in range(depth)
        ])
        self.conv = nn.Conv2d(dim, dim, 3, 1, 1)

    def forward(self, x: torch.Tensor, x_size: Tuple[int, int]) -> torch.Tensor:
        """Forward pass.

        Args:
            x: (B, C, H, W) feature maps
            x_size: (H, W) — original spatial dimensions before any padding

        Returns:
            x: (B, C, H, W) with residual connection
        """
        b, c, h, w = x.shape
        x_flat = x.flatten(2).transpose(1, 2)  # (B, H*W, C)

        for blk in self.blocks:
            blk.H, blk.W = h, w
            x_flat = blk(x_flat)

        x_res = x_flat.transpose(1, 2).view(b, c, h, w)
        return x + self.conv(x_res)


class SwinIRBackbone(nn.Module):
    """SwinIR Backbone for spatial feature extraction.

    Extracts deep features from satellite imagery using Swin Transformer blocks.
    Does NOT include the upsampling — that's handled by the full RAMTSR model.

    Args:
        in_chans: Number of input channels (4 for B2, B3, B4, B8)
        embed_dim: Feature embedding dimension
        num_heads: Number of attention heads per block
        window_size: Window size for local attention
        mlp_ratio: MLP hidden dim ratio
        depths: Number of transformer layers in each RSTB block
        use_checkpoint: Enable gradient checkpointing to save memory
    """

    def __init__(self, in_chans: int = 4, embed_dim: int = 180,
                 num_heads: int = 6, window_size: int = 8,
                 mlp_ratio: float = 2.0,
                 depths: Tuple[int, ...] = (6, 6, 6, 6, 6, 6),
                 use_checkpoint: bool = False):
        super().__init__()
        self.use_checkpoint = use_checkpoint
        self.embed_dim = embed_dim
        self.window_size = window_size

        # Shallow feature extraction
        self.conv_first = nn.Conv2d(in_chans, embed_dim, 3, 1, 1)

        # Deep feature extraction: stack of RSTB blocks
        self.layers = nn.ModuleList([
            RSTB(
                dim=embed_dim, num_heads=num_heads,
                window_size=window_size, depth=depths[i],
                mlp_ratio=mlp_ratio)
            for i in range(len(depths))
        ])
        self.norm = nn.LayerNorm(embed_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Extract deep features.

        Args:
            x: (B, C, H, W) input image. H and W must be multiples of window_size.

        Returns:
            features: (B, embed_dim, H, W)
        """
        x = self.conv_first(x)
        x_size = (x.shape[2], x.shape[3])

        res = x
        for layer in self.layers:
            if self.use_checkpoint:
                x = checkpoint.checkpoint(layer, x, x_size, use_reentrant=False)
            else:
                x = layer(x, x_size)

        b, c, h, w = x.shape
        x = self.norm(x.flatten(2).transpose(1, 2)).transpose(1, 2).view(b, c, h, w)
        return x + res
