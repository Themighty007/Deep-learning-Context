import numpy as np
import torch
import torch.nn.functional as F

class MetricsCalculator:
    """Calculates various metrics for super-resolution evaluation."""
    def __init__(self):
        pass

    def psnr(self, pred: torch.Tensor, target: torch.Tensor, data_range: float = 1.0) -> torch.Tensor:
        """Peak Signal-to-Noise Ratio."""
        mse = F.mse_loss(pred, target, reduction='none')
        mse = mse.view(mse.size(0), -1).mean(dim=1)
        psnr_val = 10 * torch.log10((data_range ** 2) / (mse + 1e-8))
        return psnr_val

    def ssim(self, pred: torch.Tensor, target: torch.Tensor, window_size: int = 11, data_range: float = 1.0) -> torch.Tensor:
        """Structural Similarity Index (simplified approximation for batch)."""
        # For a full robust SSIM, a library like torchmetrics is recommended.
        # This is a simplified block-based implementation.
        C = pred.shape[1]
        
        # Create 1D Gaussian kernel
        coords = torch.arange(window_size, dtype=torch.float32) - (window_size - 1) / 2.0
        g = torch.exp(-(coords**2) / (2 * 1.5**2))
        g = g / g.sum()
        kernel_2d = torch.outer(g, g)
        kernel = kernel_2d.unsqueeze(0).unsqueeze(0).expand(C, 1, window_size, window_size).to(pred.device)
        
        mu1 = F.conv2d(pred, kernel, padding=window_size//2, groups=C)
        mu2 = F.conv2d(target, kernel, padding=window_size//2, groups=C)
        
        mu1_sq = mu1 ** 2
        mu2_sq = mu2 ** 2
        mu1_mu2 = mu1 * mu2
        
        sigma1_sq = F.conv2d(pred * pred, kernel, padding=window_size//2, groups=C) - mu1_sq
        sigma2_sq = F.conv2d(target * target, kernel, padding=window_size//2, groups=C) - mu2_sq
        sigma12 = F.conv2d(pred * target, kernel, padding=window_size//2, groups=C) - mu1_mu2
        
        C1 = (0.01 * data_range) ** 2
        C2 = (0.03 * data_range) ** 2
        
        ssim_map = ((2 * mu1_mu2 + C1) * (2 * sigma12 + C2)) / ((mu1_sq + mu2_sq + C1) * (sigma1_sq + sigma2_sq + C2))
        return ssim_map.view(ssim_map.size(0), -1).mean(dim=1)

    def sam(self, pred: torch.Tensor, target: torch.Tensor, eps: float = 1e-8) -> torch.Tensor:
        """Spectral Angle Mapper in radians."""
        dot_product = torch.sum(pred * target, dim=1)
        norm_pred = torch.norm(pred, p=2, dim=1).clamp(min=eps)
        norm_target = torch.norm(target, p=2, dim=1).clamp(min=eps)
        cos_theta = dot_product / (norm_pred * norm_target)
        cos_theta = cos_theta.clamp(-1.0 + eps, 1.0 - eps)
        sam_map = torch.acos(cos_theta)
        return sam_map.view(sam_map.size(0), -1).mean(dim=1)

    def lpips(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        """Placeholder for LPIPS (requires external package)."""
        # In a real scenario: import lpips; self.lpips_fn = lpips.LPIPS(net='vgg')
        # Here we just return dummy values for demonstration.
        return torch.zeros(pred.size(0), device=pred.device)

    def hallucination_rate(self, pred: torch.Tensor, target: torch.Tensor, threshold: float = 0.15) -> torch.Tensor:
        """
        Calculates % of pixels with high-frequency hallucinated content.
        Uses a Laplacian filter to extract high frequencies.
        """
        laplacian_kernel = torch.tensor([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=torch.float32).to(pred.device)
        laplacian_kernel = laplacian_kernel.expand(pred.shape[1], 1, 3, 3)
        
        hf_pred = F.conv2d(pred, laplacian_kernel, padding=1, groups=pred.shape[1])
        hf_target = F.conv2d(target, laplacian_kernel, padding=1, groups=target.shape[1])
        
        diff = torch.abs(hf_pred - hf_target)
        diff_mean = diff.mean(dim=1) # Average over channels
        
        hallucinated = (diff_mean > threshold).float()
        return hallucinated.view(hallucinated.size(0), -1).mean(dim=1)

    def compute_all(self, pred: torch.Tensor, target: torch.Tensor) -> dict:
        """Compute all metrics and return average over batch."""
        res = {
            'psnr': self.psnr(pred, target).mean().item(),
            'ssim': self.ssim(pred, target).mean().item(),
            'sam': self.sam(pred, target).mean().item(),
            'hallucination_rate': self.hallucination_rate(pred, target).mean().item(),
            'lpips': self.lpips(pred, target).mean().item()
        }
        return res

    def compute_uncertainty_calibration(self, predictions: torch.Tensor, targets: torch.Tensor, uncertainties: torch.Tensor, num_bins: int = 10) -> dict:
        """
        Compute uncertainty calibration metrics.
        uncertainties should be standard deviations (exp(0.5 * log_var)).
        """
        errors = torch.abs(predictions - targets).view(-1).cpu().numpy()
        unc = uncertainties.view(-1).cpu().numpy()
        
        # Sort by uncertainty
        sort_idx = np.argsort(unc)
        errors = errors[sort_idx]
        unc = unc[sort_idx]
        
        bin_size = len(errors) // num_bins
        
        bin_edges = []
        mean_errors = []
        mean_uncs = []
        
        for i in range(num_bins):
            start = i * bin_size
            end = (i + 1) * bin_size if i < num_bins - 1 else len(errors)
            
            mean_errors.append(float(np.mean(errors[start:end])))
            mean_uncs.append(float(np.mean(unc[start:end])))
            bin_edges.append(float(unc[end-1]) if i < num_bins - 1 else float(unc[-1]))
            
        calib_error = np.mean(np.abs(np.array(mean_errors) - np.array(mean_uncs)))
        
        return {
            'bin_edges': bin_edges,
            'mean_errors': mean_errors,
            'mean_uncertainties': mean_uncs,
            'calibration_error': float(calib_error)
        }
