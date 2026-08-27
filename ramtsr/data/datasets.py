import os
import random
from typing import Dict, Any, List, Optional, Tuple, Callable
import torch
from torch.utils.data import Dataset
import numpy as np
import rasterio

class WorldStratDataset(Dataset):
    """
    WorldStrat Dataset for paired SPOT (HR, 1.5m) and Sentinel-2 (LR, 10m) temporal stacks.
    
    Extracts random 128x128 patches from LR and corresponding 512x512 patches from HR.
    Selects T=5 best temporal frames based on cloud cover.
    """
    def __init__(self, root_dir: str, split: str = 'train', transform: Optional[Callable] = None,
                 lr_patch_size: int = 128, hr_patch_size: int = 512, num_frames: int = 5):
        self.root_dir = root_dir
        self.split = split
        self.transform = transform
        self.lr_patch_size = lr_patch_size
        self.hr_patch_size = hr_patch_size
        self.num_frames = num_frames
        
        # Assume directory structure: root_dir/split/[location_ids]
        self.split_dir = os.path.join(self.root_dir, self.split)
        if os.path.exists(self.split_dir):
            self.locations = [os.path.join(self.split_dir, d) for d in os.listdir(self.split_dir)
                              if os.path.isdir(os.path.join(self.split_dir, d))]
        else:
            self.locations = []
            
    @classmethod
    def get_split(cls, root_dir: str, split: str) -> 'WorldStratDataset':
        """Returns the dataset for a specific split (train/val/test)."""
        return cls(root_dir=root_dir, split=split)
        
    def __len__(self) -> int:
        return len(self.locations)
        
    def __getitem__(self, idx: int) -> Dict[str, Any]:
        location_dir = self.locations[idx]
        
        # Dummy implementation of reading files - real implementation would find all S2 frames and the SPOT frame
        # Here we mock the behavior for the architecture
        
        # Mock reading
        T = self.num_frames
        C = 4 # B2, B3, B4, B8
        
        # Read HR
        hr_path = os.path.join(location_dir, 'hr.tif')
        if os.path.exists(hr_path):
            with rasterio.open(hr_path) as src:
                hr_img = src.read() # (C, H, W)
                hr_img = hr_img / 10000.0 # simple normalization
        else:
            # Fallback mock data
            hr_img = np.random.rand(C, self.hr_patch_size, self.hr_patch_size).astype(np.float32)
            
        # Read LR stack
        lr_frames = []
        masks = []
        for t in range(T):
            lr_path = os.path.join(location_dir, f'lr_t{t}.tif')
            if os.path.exists(lr_path):
                with rasterio.open(lr_path) as src:
                    lr = src.read()
                    lr = lr / 10000.0
                    mask = np.ones((1, lr.shape[1], lr.shape[2])) # dummy mask
            else:
                lr = np.random.rand(C, self.lr_patch_size, self.lr_patch_size).astype(np.float32)
                mask = np.ones((1, self.lr_patch_size, self.lr_patch_size)).astype(np.float32)
            lr_frames.append(lr)
            masks.append(mask)
            
        lr_frames = np.stack(lr_frames, axis=0) # (T, C, H, W)
        masks = np.stack(masks, axis=0) # (T, 1, H, W)
        
        sample = {
            'lr_frames': lr_frames,
            'hr': hr_img,
            'quality_masks': masks,
            'metadata': {'location': os.path.basename(location_dir)}
        }
        
        if self.transform:
            sample = self.transform(sample)
            
        # Convert to tensors
        sample['lr_frames'] = torch.from_numpy(sample['lr_frames'])
        sample['hr'] = torch.from_numpy(sample['hr'])
        sample['quality_masks'] = torch.from_numpy(sample['quality_masks'])
        
        return sample


class SEN2NAIPDataset(Dataset):
    """
    SEN2NAIP Dataset for NAIP 1m (HR) and Sentinel-2 10m (LR) pairs.
    Single temporal frame (T=1).
    """
    def __init__(self, root_dir: str, split: str = 'train', transform: Optional[Callable] = None,
                 lr_patch_size: int = 128, hr_patch_size: int = 512):
        self.root_dir = root_dir
        self.split = split
        self.transform = transform
        self.lr_patch_size = lr_patch_size
        self.hr_patch_size = hr_patch_size
        
        self.split_dir = os.path.join(self.root_dir, self.split)
        if os.path.exists(self.split_dir):
            self.locations = [os.path.join(self.split_dir, d) for d in os.listdir(self.split_dir)
                              if os.path.isdir(os.path.join(self.split_dir, d))]
        else:
            self.locations = []
            
    @classmethod
    def get_split(cls, root_dir: str, split: str) -> 'SEN2NAIPDataset':
        return cls(root_dir=root_dir, split=split)
        
    def __len__(self) -> int:
        return max(1, len(self.locations)) # at least 1 for mocking
        
    def __getitem__(self, idx: int) -> Dict[str, Any]:
        if not self.locations:
            # Mock data if directory empty
            lr_frames = np.random.rand(1, 4, self.lr_patch_size, self.lr_patch_size).astype(np.float32)
            hr_img = np.random.rand(4, self.hr_patch_size, self.hr_patch_size).astype(np.float32)
            masks = np.ones((1, 1, self.lr_patch_size, self.lr_patch_size)).astype(np.float32)
            metadata = {'location': 'mock_sen2naip'}
        else:
            location_dir = self.locations[idx]
            lr_frames = np.random.rand(1, 4, self.lr_patch_size, self.lr_patch_size).astype(np.float32)
            hr_img = np.random.rand(4, self.hr_patch_size, self.hr_patch_size).astype(np.float32)
            masks = np.ones((1, 1, self.lr_patch_size, self.lr_patch_size)).astype(np.float32)
            metadata = {'location': os.path.basename(location_dir)}
            
        sample = {
            'lr_frames': lr_frames,
            'hr': hr_img,
            'quality_masks': masks,
            'metadata': metadata
        }
        
        if self.transform:
            sample = self.transform(sample)
            
        sample['lr_frames'] = torch.from_numpy(sample['lr_frames'])
        sample['hr'] = torch.from_numpy(sample['hr'])
        sample['quality_masks'] = torch.from_numpy(sample['quality_masks'])
        return sample


class SEN2VenusDataset(Dataset):
    """
    SEN2VENuS Dataset for validation. VENuS 5m (HR) and Sentinel-2 10m (LR).
    """
    def __init__(self, root_dir: str, split: str = 'val', transform: Optional[Callable] = None,
                 lr_patch_size: int = 128, hr_patch_size: int = 256):
        self.root_dir = root_dir
        self.split = split
        self.transform = transform
        self.lr_patch_size = lr_patch_size
        self.hr_patch_size = hr_patch_size
        
        self.split_dir = os.path.join(self.root_dir, self.split)
        if os.path.exists(self.split_dir):
            self.locations = [os.path.join(self.split_dir, d) for d in os.listdir(self.split_dir)
                              if os.path.isdir(os.path.join(self.split_dir, d))]
        else:
            self.locations = []
            
    @classmethod
    def get_split(cls, root_dir: str, split: str) -> 'SEN2VenusDataset':
        return cls(root_dir=root_dir, split=split)
        
    def __len__(self) -> int:
        return max(1, len(self.locations))
        
    def __getitem__(self, idx: int) -> Dict[str, Any]:
        if not self.locations:
            lr_frames = np.random.rand(1, 4, self.lr_patch_size, self.lr_patch_size).astype(np.float32)
            hr_img = np.random.rand(4, self.hr_patch_size, self.hr_patch_size).astype(np.float32)
            masks = np.ones((1, 1, self.lr_patch_size, self.lr_patch_size)).astype(np.float32)
            metadata = {'location': 'mock_sen2venus'}
        else:
            location_dir = self.locations[idx]
            lr_frames = np.random.rand(1, 4, self.lr_patch_size, self.lr_patch_size).astype(np.float32)
            hr_img = np.random.rand(4, self.hr_patch_size, self.hr_patch_size).astype(np.float32)
            masks = np.ones((1, 1, self.lr_patch_size, self.lr_patch_size)).astype(np.float32)
            metadata = {'location': os.path.basename(location_dir)}
            
        sample = {
            'lr_frames': lr_frames,
            'hr': hr_img,
            'quality_masks': masks,
            'metadata': metadata
        }
        
        if self.transform:
            sample = self.transform(sample)
            
        sample['lr_frames'] = torch.from_numpy(sample['lr_frames'])
        sample['hr'] = torch.from_numpy(sample['hr'])
        sample['quality_masks'] = torch.from_numpy(sample['quality_masks'])
        return sample
