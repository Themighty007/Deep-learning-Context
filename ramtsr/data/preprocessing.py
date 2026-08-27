import numpy as np
import cv2
from typing import List, Tuple, Optional

def cloud_mask_s2(image: np.ndarray, scl_band: np.ndarray) -> np.ndarray:
    """
    Creates a binary cloud mask using the Scene Classification Layer (SCL) from Sentinel-2.
    
    Args:
        image: S2 image data (not used directly here, but kept for signature consistency)
        scl_band: SCL array of shape (H, W).
            SCL classes: 3 (Cloud shadows), 8 (Cloud medium prob), 9 (Cloud high prob), 10 (Thin cirrus)
            
    Returns:
        Binary mask (H, W) where 1 is clear, 0 is clouded/shadowed.
    """
    # 3: Cloud shadows, 8: Cloud medium prob, 9: Cloud high prob, 10: Thin cirrus, 11: Snow
    cloud_classes = [3, 8, 9, 10, 11]
    mask = np.isin(scl_band, cloud_classes)
    return (~mask).astype(np.uint8)

def coregister_frames(frames: List[np.ndarray], reference_idx: int = 0) -> List[np.ndarray]:
    """
    Aligns frames to a reference frame using phase correlation (ECC).
    
    Args:
        frames: List of images of shape (C, H, W)
        reference_idx: Index of the reference frame
        
    Returns:
        List of aligned frames.
    """
    if not frames:
        return []
    
    ref_frame = frames[reference_idx]
    aligned_frames = []
    
    # Use the first channel (e.g. Blue or NIR) for alignment
    ref_gray = ref_frame[0].astype(np.float32)
    
    for i, frame in enumerate(frames):
        if i == reference_idx:
            aligned_frames.append(frame)
            continue
            
        src_gray = frame[0].astype(np.float32)
        
        # Estimate translation using phase correlation
        shift, _ = cv2.phaseCorrelate(src_gray, ref_gray)
        
        # Create warp matrix for translation
        M = np.float32([[1, 0, shift[0]], [0, 1, shift[1]]])
        
        aligned_frame = np.zeros_like(frame)
        for c in range(frame.shape[0]):
            aligned_frame[c] = cv2.warpAffine(frame[c], M, (frame.shape[2], frame.shape[1]),
                                             flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        aligned_frames.append(aligned_frame)
        
    return aligned_frames

def extract_patches(image: np.ndarray, patch_size: int, stride: int) -> Tuple[List[np.ndarray], List[Tuple[int, int]]]:
    """
    Extracts overlapping patches from an image.
    
    Args:
        image: Array of shape (C, H, W)
        patch_size: Size of square patch
        stride: Stride for extraction
        
    Returns:
        List of patches and list of (y, x) positions.
    """
    C, H, W = image.shape
    patches = []
    positions = []
    
    for y in range(0, H - patch_size + 1, stride):
        for x in range(0, W - patch_size + 1, stride):
            patch = image[:, y:y+patch_size, x:x+patch_size]
            patches.append(patch)
            positions.append((y, x))
            
    # Handle edges if needed (omitted for brevity)
    return patches, positions

def merge_patches(patches: List[np.ndarray], positions: List[Tuple[int, int]], output_shape: Tuple[int, int, int], overlap: int) -> np.ndarray:
    """
    Reconstructs an image from patches with blending.
    
    Args:
        patches: List of patch arrays (C, P, P)
        positions: List of (y, x) top-left coordinates
        output_shape: Target shape (C, H, W)
        overlap: Overlap in pixels
        
    Returns:
        Merged image array.
    """
    C, H, W = output_shape
    P = patches[0].shape[1]
    
    merged = np.zeros(output_shape, dtype=np.float32)
    weight_map = np.zeros(output_shape, dtype=np.float32)
    
    # Simple linear blending weights
    window = np.ones((P, P), dtype=np.float32) # In a real scenario, use Bartlett or Hann window
    
    for patch, (y, x) in zip(patches, positions):
        merged[:, y:y+P, x:x+P] += patch * window
        weight_map[:, y:y+P, x:x+P] += window
        
    weight_map[weight_map == 0] = 1
    return merged / weight_map

def normalize_reflectance(image: np.ndarray, method: str = 'minmax') -> np.ndarray:
    """
    Normalizes reflectance values to [0, 1].
    
    Args:
        image: Array of shape (C, H, W) or (T, C, H, W)
        method: Normalization method (only minmax implemented here)
        
    Returns:
        Normalized array
    """
    if method == 'minmax':
        # Sentinel-2 L2A reflectance is usually given scaled by 10000
        # Values can exceed 10000, so we clip
        return np.clip(image / 10000.0, 0, 1)
    else:
        raise ValueError(f"Unknown normalization method {method}")

def quality_score(cloud_mask: np.ndarray) -> float:
    """
    Calculates a quality score based on a cloud mask.
    
    Args:
        cloud_mask: Binary mask where 1 is clear, 0 is clouded.
        
    Returns:
        Float 0-1 indicating fraction of clear pixels.
    """
    return float(np.mean(cloud_mask))

def select_best_frames(frames: np.ndarray, quality_scores: List[float], num_frames: int = 5) -> np.ndarray:
    """
    Selects the top num_frames frames based on quality_scores.
    
    Args:
        frames: Array of shape (T, C, H, W)
        quality_scores: List of scores for each frame
        num_frames: Target number of frames
        
    Returns:
        Indices of the best T frames.
    """
    if len(quality_scores) <= num_frames:
        return np.arange(len(quality_scores))
        
    sorted_indices = np.argsort(quality_scores)[::-1]
    return sorted_indices[:num_frames]
