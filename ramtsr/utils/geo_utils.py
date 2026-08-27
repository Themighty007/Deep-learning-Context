import numpy as np
import rasterio
from rasterio.transform import Affine
from rasterio.crs import CRS
from rasterio.warp import calculate_default_transform, reproject, Resampling
from typing import Tuple, Dict, List, Optional, Any
import scipy.signal


def read_geotiff(path: str) -> Tuple[np.ndarray, Affine, CRS, dict]:
    """
    Read a GeoTIFF file.
    
    Args:
        path (str): Path to the GeoTIFF file.
        
    Returns:
        Tuple[np.ndarray, Affine, CRS, dict]: Array of data (bands, height, width),
        affine transform, CRS, and rasterio profile.
    """
    with rasterio.open(path) as src:
        data = src.read()
        transform = src.transform
        crs = src.crs
        profile = src.profile
        return data, transform, crs, profile


def write_geotiff(
    path: str,
    data: np.ndarray,
    transform: Affine,
    crs: CRS,
    band_names: Optional[List[str]] = None,
    nodata: Optional[float] = None
) -> None:
    """
    Write a numpy array to a GeoTIFF file.
    
    Args:
        path (str): Path to write the output file.
        data (np.ndarray): Data array to write. Should be shape (bands, height, width) or (height, width).
        transform (Affine): Affine transform.
        crs (CRS): Coordinate Reference System.
        band_names (list, optional): List of band names. Defaults to None.
        nodata (float, optional): Nodata value. Defaults to None.
    """
    if data.ndim == 2:
        count = 1
        data = data[np.newaxis, ...]
    else:
        count = data.shape[0]

    height, width = data.shape[1], data.shape[2]

    profile = {
        'driver': 'GTiff',
        'height': height,
        'width': width,
        'count': count,
        'dtype': data.dtype,
        'crs': crs,
        'transform': transform,
        'nodata': nodata,
        'compress': 'lzw'
    }

    with rasterio.open(path, 'w', **profile) as dst:
        dst.write(data)
        if band_names and len(band_names) == count:
            dst.descriptions = tuple(band_names)


def get_sentinel2_band_info() -> Dict[str, Dict[str, Any]]:
    """
    Get information about Sentinel-2 bands.
    
    Returns:
        dict: Mapping of band names to their properties.
    """
    return {
        'B01': {'resolution': 60, 'wavelength': 443, 'description': 'Coastal aerosol'},
        'B02': {'resolution': 10, 'wavelength': 490, 'description': 'Blue'},
        'B03': {'resolution': 10, 'wavelength': 560, 'description': 'Green'},
        'B04': {'resolution': 10, 'wavelength': 665, 'description': 'Red'},
        'B05': {'resolution': 20, 'wavelength': 705, 'description': 'Vegetation Red Edge'},
        'B06': {'resolution': 20, 'wavelength': 740, 'description': 'Vegetation Red Edge'},
        'B07': {'resolution': 20, 'wavelength': 783, 'description': 'Vegetation Red Edge'},
        'B08': {'resolution': 10, 'wavelength': 842, 'description': 'NIR'},
        'B8A': {'resolution': 20, 'wavelength': 865, 'description': 'Vegetation Red Edge'},
        'B09': {'resolution': 60, 'wavelength': 945, 'description': 'Water vapour'},
        'B11': {'resolution': 20, 'wavelength': 1610, 'description': 'SWIR'},
        'B12': {'resolution': 20, 'wavelength': 2190, 'description': 'SWIR'}
    }


def create_rgb_composite(bands_dict: Dict[str, np.ndarray], contrast_stretch: bool = True) -> np.ndarray:
    """
    Create an RGB composite from a dictionary of bands.
    
    Args:
        bands_dict (dict): Dictionary mapping band names ('B04', 'B03', 'B02') to 2D arrays.
        contrast_stretch (bool): Whether to apply 2-98% contrast stretch. Defaults to True.
        
    Returns:
        np.ndarray: RGB image array of shape (3, height, width) with values 0-255.
    """
    red = bands_dict.get('B04', bands_dict.get('red'))
    green = bands_dict.get('B03', bands_dict.get('green'))
    blue = bands_dict.get('B02', bands_dict.get('blue'))
    
    if red is None or green is None or blue is None:
        raise ValueError("Missing required bands for RGB composite (need B04, B03, B02)")
        
    rgb = np.stack([red, green, blue], axis=0).astype(np.float32)
    
    if contrast_stretch:
        for i in range(3):
            p2, p98 = np.percentile(rgb[i], (2, 98))
            rgb[i] = np.clip((rgb[i] - p2) / (p98 - p2), 0, 1)
    else:
        # Assuming typical TOA or SR range 0-10000
        rgb = np.clip(rgb / 10000.0, 0, 1)
        
    return (rgb * 255).astype(np.uint8)


def compute_ndvi(nir_band: np.ndarray, red_band: np.ndarray) -> np.ndarray:
    """
    Compute Normalized Difference Vegetation Index (NDVI).
    
    Args:
        nir_band (np.ndarray): Near-infrared band (e.g., B08).
        red_band (np.ndarray): Red band (e.g., B04).
        
    Returns:
        np.ndarray: NDVI array.
    """
    nir = nir_band.astype(np.float32)
    red = red_band.astype(np.float32)
    
    # Avoid division by zero
    denominator = nir + red
    denominator[denominator == 0] = 1e-10
    
    return (nir - red) / denominator


def compute_ndwi(green_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
    """
    Compute Normalized Difference Water Index (NDWI).
    
    Args:
        green_band (np.ndarray): Green band (e.g., B03).
        nir_band (np.ndarray): Near-infrared band (e.g., B08).
        
    Returns:
        np.ndarray: NDWI array.
    """
    green = green_band.astype(np.float32)
    nir = nir_band.astype(np.float32)
    
    denominator = green + nir
    denominator[denominator == 0] = 1e-10
    
    return (green - nir) / denominator


def tile_image(image: np.ndarray, tile_size: int, overlap: int) -> List[Tuple[np.ndarray, int, int]]:
    """
    Split an image into overlapping tiles.
    
    Args:
        image (np.ndarray): Input image (bands, height, width).
        tile_size (int): Size of each tile (height and width).
        overlap (int): Amount of overlap between tiles.
        
    Returns:
        list: List of tuples containing (tile_array, row_start, col_start).
    """
    bands, height, width = image.shape
    stride = tile_size - overlap
    tiles = []
    
    for y in range(0, height, stride):
        for x in range(0, width, stride):
            # Ensure tile is completely within bounds by adjusting start position if needed
            y_start = min(y, max(0, height - tile_size))
            x_start = min(x, max(0, width - tile_size))
            
            # If the image is smaller than tile_size, pad it
            if height < tile_size or width < tile_size:
                pad_h = max(0, tile_size - height)
                pad_w = max(0, tile_size - width)
                padded_image = np.pad(image, ((0, 0), (0, pad_h), (0, pad_w)), mode='reflect')
                tile = padded_image[:, y_start:y_start+tile_size, x_start:x_start+tile_size]
            else:
                tile = image[:, y_start:y_start+tile_size, x_start:x_start+tile_size]
                
            tiles.append((tile, y_start, x_start))
            
            # Break if we've reached the edge
            if x_start + tile_size >= width:
                break
        if y_start + tile_size >= height:
            break
            
    return tiles


def merge_tiles(tiles: List[np.ndarray], positions: List[Tuple[int, int]], output_shape: Tuple[int, int, int], overlap: int) -> np.ndarray:
    """
    Merge overlapping tiles using a 2D Hann window for smooth blending.
    
    Args:
        tiles (list): List of tile arrays of shape (bands, tile_h, tile_w).
        positions (list): List of (row_start, col_start) tuples.
        output_shape (tuple): Shape of the output array (bands, height, width).
        overlap (int): Overlap size.
        
    Returns:
        np.ndarray: Blended output array.
    """
    if not tiles:
        raise ValueError("Tiles list is empty")
        
    bands = output_shape[0]
    tile_h, tile_w = tiles[0].shape[1:]
    
    # Create 2D Hann window for blending
    window_1d = scipy.signal.windows.hann(tile_h)
    window_2d = np.outer(window_1d, window_1d)
    
    # Reshape window for broadcasting
    window = np.repeat(window_2d[np.newaxis, :, :], bands, axis=0)
    
    output = np.zeros(output_shape, dtype=np.float32)
    weights = np.zeros(output_shape, dtype=np.float32)
    
    for tile, (y, x) in zip(tiles, positions):
        # Handle cases where tiles might be padded
        h = min(tile_h, output_shape[1] - y)
        w = min(tile_w, output_shape[2] - x)
        
        output[:, y:y+h, x:x+w] += tile[:, :h, :w] * window[:, :h, :w]
        weights[:, y:y+h, x:x+w] += window[:, :h, :w]
        
    # Avoid division by zero
    weights[weights == 0] = 1.0
    output /= weights
    
    return output


def reproject_to_crs(
    data: np.ndarray, 
    src_transform: Affine, 
    src_crs: CRS, 
    dst_crs: CRS, 
    dst_resolution: Optional[Tuple[float, float]] = None
) -> Tuple[np.ndarray, Affine]:
    """
    Reproject raster data to a new CRS.
    
    Args:
        data (np.ndarray): Data array (bands, height, width).
        src_transform (Affine): Source affine transform.
        src_crs (CRS): Source CRS.
        dst_crs (CRS): Destination CRS.
        dst_resolution (tuple, optional): Destination resolution (x_res, y_res).
        
    Returns:
        Tuple[np.ndarray, Affine]: Reprojected data and new transform.
    """
    from rasterio.transform import array_bounds

    bands, height, width = data.shape
    
    # Compute bounds from transform and image dimensions
    left, bottom, right, top = array_bounds(height, width, src_transform)
    
    dst_transform, dst_width, dst_height = calculate_default_transform(
        src_crs, dst_crs, width, height, left=left, bottom=bottom,
        right=right, top=top, resolution=dst_resolution
    )
    
    dst_data = np.zeros((bands, dst_height, dst_width), dtype=data.dtype)
    
    for i in range(bands):
        reproject(
            source=data[i],
            destination=dst_data[i],
            src_transform=src_transform,
            src_crs=src_crs,
            dst_transform=dst_transform,
            dst_crs=dst_crs,
            resampling=Resampling.bilinear
        )
        
    return dst_data, dst_transform
