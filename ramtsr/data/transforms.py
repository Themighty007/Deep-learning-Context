import numpy as np
import random
from typing import Dict, Any, List

class SatelliteTransform:
    """Base class for satellite data transformations."""
    def __call__(self, sample: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        raise NotImplementedError

class RandomFlip(SatelliteTransform):
    """Randomly flips the LR frames, HR image, and masks horizontally and vertically."""
    def __init__(self, p: float = 0.5):
        self.p = p

    def __call__(self, sample: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        h_flip = random.random() < self.p
        v_flip = random.random() < self.p
        
        if h_flip:
            sample['lr_frames'] = np.flip(sample['lr_frames'], axis=-1)
            sample['hr'] = np.flip(sample['hr'], axis=-1)
            sample['quality_masks'] = np.flip(sample['quality_masks'], axis=-1)
            
        if v_flip:
            sample['lr_frames'] = np.flip(sample['lr_frames'], axis=-2)
            sample['hr'] = np.flip(sample['hr'], axis=-2)
            sample['quality_masks'] = np.flip(sample['quality_masks'], axis=-2)
            
        # Need to return copies if memory layout issues arise in PyTorch, 
        # but returning directly works for simple numpy flips
        sample['lr_frames'] = sample['lr_frames'].copy()
        sample['hr'] = sample['hr'].copy()
        sample['quality_masks'] = sample['quality_masks'].copy()
        
        return sample

class RandomRotation90(SatelliteTransform):
    """Randomly rotates the images by 0, 90, 180, or 270 degrees."""
    def __call__(self, sample: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        k = random.randint(0, 3)
        if k > 0:
            axes_lr = (-2, -1)
            axes_hr = (-2, -1)
            
            sample['lr_frames'] = np.rot90(sample['lr_frames'], k, axes=axes_lr).copy()
            sample['hr'] = np.rot90(sample['hr'], k, axes=axes_hr).copy()
            sample['quality_masks'] = np.rot90(sample['quality_masks'], k, axes=axes_lr).copy()
            
        return sample

class RandomCrop(SatelliteTransform):
    """Crops random patches from the images, maintaining the scale ratio."""
    def __init__(self, lr_crop_size: int, hr_crop_size: int):
        self.lr_crop_size = lr_crop_size
        self.hr_crop_size = hr_crop_size

    def __call__(self, sample: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        lr_h, lr_w = sample['lr_frames'].shape[-2:]
        
        if lr_h <= self.lr_crop_size or lr_w <= self.lr_crop_size:
            return sample
            
        y = random.randint(0, lr_h - self.lr_crop_size)
        x = random.randint(0, lr_w - self.lr_crop_size)
        
        scale_ratio = self.hr_crop_size // self.lr_crop_size
        y_hr = y * scale_ratio
        x_hr = x * scale_ratio
        
        sample['lr_frames'] = sample['lr_frames'][..., y:y+self.lr_crop_size, x:x+self.lr_crop_size].copy()
        sample['quality_masks'] = sample['quality_masks'][..., y:y+self.lr_crop_size, x:x+self.lr_crop_size].copy()
        sample['hr'] = sample['hr'][..., y_hr:y_hr+self.hr_crop_size, x_hr:x_hr+self.hr_crop_size].copy()
        
        return sample

class SpectralJitter(SatelliteTransform):
    """Adds small random noise to the LR reflectance values (e.g. ±2%)."""
    def __init__(self, max_jitter: float = 0.02):
        self.max_jitter = max_jitter

    def __call__(self, sample: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        # Generate jitter factor between 1-max_jitter and 1+max_jitter for each channel
        # Apply only to LR frames
        C = sample['lr_frames'].shape[1]
        
        jitter = np.random.uniform(1.0 - self.max_jitter, 1.0 + self.max_jitter, size=(C, 1, 1))
        # Add temporal dimension to broadcast
        jitter = np.expand_dims(jitter, axis=0)
        
        sample['lr_frames'] = np.clip(sample['lr_frames'] * jitter, 0.0, 1.0).astype(np.float32)
        
        return sample
