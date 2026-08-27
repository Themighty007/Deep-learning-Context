import torch
import torch.nn as nn

class PatchGANDiscriminator(nn.Module):
    """PatchGAN Discriminator for adversarial training."""
    def __init__(self, in_channels: int = 4, ndf: int = 64, n_layers: int = 3):
        super().__init__()
        
        kw = 4
        padw = 1
        sequence = [nn.utils.spectral_norm(
            nn.Conv2d(in_channels, ndf, kernel_size=kw, stride=2, padding=padw)), 
            nn.LeakyReLU(0.2, True)]
            
        nf_mult = 1
        nf_mult_prev = 1
        
        for n in range(1, n_layers):
            nf_mult_prev = nf_mult
            nf_mult = min(2 ** n, 8)
            sequence += [
                nn.utils.spectral_norm(
                    nn.Conv2d(ndf * nf_mult_prev, ndf * nf_mult, kernel_size=kw, stride=2, padding=padw)),
                nn.InstanceNorm2d(ndf * nf_mult),
                nn.LeakyReLU(0.2, True)
            ]
            
        nf_mult_prev = nf_mult
        nf_mult = min(2 ** n_layers, 8)
        sequence += [
            nn.utils.spectral_norm(
                nn.Conv2d(ndf * nf_mult_prev, ndf * nf_mult, kernel_size=kw, stride=1, padding=padw)),
            nn.InstanceNorm2d(ndf * nf_mult),
            nn.LeakyReLU(0.2, True)
        ]
        
        sequence += [nn.utils.spectral_norm(
            nn.Conv2d(ndf * nf_mult, 1, kernel_size=kw, stride=1, padding=padw))]
            
        self.model = nn.Sequential(*sequence)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input image (B, C, H, W)
        Returns:
            Patch-level real/fake scores
        """
        return self.model(x)
