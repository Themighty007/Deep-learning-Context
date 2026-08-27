import torch
import torch.nn as nn
from typing import Tuple, List, Callable
import numpy as np

class MCDropoutUncertainty(nn.Module):
    """Wrapper to add MC-Dropout uncertainty estimation to a model."""
    def __init__(self, model: nn.Module, p: float = 0.2):
        super().__init__()
        self.model = model
        self.p = p
        
    def enable_dropout(self):
        """Enables dropout layers during inference."""
        for m in self.model.modules():
            if m.__class__.__name__.startswith('Dropout'):
                m.train()
                
    def forward(self, *args, **kwargs) -> torch.Tensor:
        return self.model(*args, **kwargs)
        
    def estimate_uncertainty(self, lr_frames: torch.Tensor, quality_masks: torch.Tensor, 
                             num_passes: int = 10) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Runs multiple forward passes with dropout enabled to estimate epistemic uncertainty.
        Args:
            lr_frames: Input low-resolution frames
            quality_masks: Input quality masks
            num_passes: Number of MC passes
        Returns:
            mean: Average SR prediction (B, C, H, W)
            variance: Uncertainty map (B, 1, H, W)
        """
        self.model.eval()
        self.enable_dropout()
        
        preds = []
        with torch.no_grad():
            for _ in range(num_passes):
                preds.append(self.model(lr_frames, quality_masks))
                
        preds_stack = torch.stack(preds, dim=0) # (num_passes, B, C, H, W)
        
        mean_pred = torch.mean(preds_stack, dim=0)
        variance = torch.var(preds_stack, dim=0)
        mean_variance = torch.mean(variance, dim=1, keepdim=True) # Average over channels
        
        return mean_pred, mean_variance
        
    def calibrate(self, predictions: torch.Tensor, variances: torch.Tensor, ground_truth: torch.Tensor, bins: int = 10):
        """Computes calibration curve data given predictions, variances, and ground truth."""
        errors = torch.abs(predictions - ground_truth).mean(dim=1, keepdim=True)
        # Simplified calibration logic
        return errors, variances
