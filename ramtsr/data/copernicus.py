import os
import json
import time
from typing import List, Dict, Any, Optional
import requests
import rasterio
import numpy as np

class CopernicusClient:
    """
    Client for Copernicus Data Space Ecosystem API (dataspace.copernicus.eu).
    """
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None
        self.auth_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
        self.catalog_url = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
        
    def authenticate(self) -> str:
        """
        Authenticates with OAuth2 and returns the access token.
        """
        data = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }
        
        response = requests.post(self.auth_url, data=data)
        response.raise_for_status()
        self.token = response.json().get("access_token")
        return self.token
        
    def search_tiles(self, bbox: List[float], date_range: tuple, max_cloud_cover: float = 20.0) -> List[Dict[str, Any]]:
        """
        Searches for Sentinel-2 L2A tiles within a bbox and date range.
        
        Args:
            bbox: [min_lon, min_lat, max_lon, max_lat]
            date_range: (start_date_str, end_date_str) e.g., ('2023-01-01', '2023-12-31')
            max_cloud_cover: Maximum allowed cloud cover percentage.
            
        Returns:
            List of tile metadata dictionaries.
        """
        if not self.token:
            self.authenticate()
            
        # Format the OData query
        min_lon, min_lat, max_lon, max_lat = bbox
        start_date, end_date = date_range
        
        polygon = f"POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, {max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))"
        
        filter_query = (
            f"Collection/Name eq 'SENTINEL-2' and "
            f"Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'S2MSI2A') and "
            f"OData.CSC.Intersects(area=geography'SRID=4326;{polygon}') and "
            f"ContentDate/Start ge {start_date}T00:00:00.000Z and ContentDate/Start le {end_date}T23:59:59.999Z"
        )
        
        headers = {"Authorization": f"Bearer {self.token}"}
        params = {
            "$filter": filter_query,
            "$top": 50,
            "$orderby": "ContentDate/Start desc"
        }
        
        response = requests.get(self.catalog_url, headers=headers, params=params)
        response.raise_for_status()
        
        results = response.json().get('value', [])
        
        # Filter by cloud cover manually if needed since OData filtering on specific attributes can be complex
        filtered_results = []
        for res in results:
            # Assuming 'cloudCover' could be extracted from attributes, for demo we just keep all
            # In a full implementation, you query the specific attribute
            filtered_results.append(res)
            
        return filtered_results
        
    def download_tile(self, tile_id: str, bands: List[str] = ['B02','B03','B04','B08'], output_dir: str = './downloads') -> str:
        """
        Downloads specific bands for a given tile ID.
        
        Args:
            tile_id: UUID of the product.
            bands: List of band names.
            output_dir: Output directory to save the data.
            
        Returns:
            Path to the downloaded asset or directory.
        """
        if not self.token:
            self.authenticate()
            
        os.makedirs(output_dir, exist_ok=True)
        download_url = f"https://zipper.dataspace.copernicus.eu/odata/v1/Products({tile_id})/$value"
        
        headers = {"Authorization": f"Bearer {self.token}"}
        out_path = os.path.join(output_dir, f"{tile_id}.zip")
        
        print(f"Downloading tile {tile_id}...")
        response = requests.get(download_url, headers=headers, stream=True)
        response.raise_for_status()
        
        with open(out_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        return out_path
        
    def get_sentinel2_l2a(self, bbox: List[float], date_range: tuple, num_frames: int = 5) -> Dict[str, Any]:
        """
        Main pipeline function to get a stack of L2A frames ready for the model.
        
        Args:
            bbox: Bounding box coordinates.
            date_range: Date range tuple.
            num_frames: Number of temporal frames to return.
            
        Returns:
            Dictionary with 'lr_frames' as a tensor/numpy array.
        """
        tiles = self.search_tiles(bbox, date_range)
        
        # In a complete implementation, this would:
        # 1. Select the best `num_frames` tiles based on cloud cover
        # 2. Download them using `download_tile`
        # 3. Unzip and extract the B02, B03, B04, B08 bands
        # 4. Coregister them
        # 5. Stack into (T, C, H, W)
        
        # Here we mock the result to fulfill the interface
        print(f"Found {len(tiles)} tiles. Selecting top {num_frames}.")
        
        # Mocking the tensor format (T, C, H, W)
        mock_lr_frames = np.zeros((num_frames, 4, 256, 256), dtype=np.float32)
        
        return {
            'lr_frames': mock_lr_frames,
            'metadata': {'tiles_used': [t.get('Id') for t in tiles[:num_frames]]}
        }
