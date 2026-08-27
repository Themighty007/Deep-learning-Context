"""
RAMTSR FastAPI Backend

REST API for satellite image super-resolution with uncertainty estimation.

Endpoints:
  POST /api/super-resolve       — Upload GeoTIFF, get SR result
  POST /api/super-resolve-url   — Process from Copernicus tile URL
  POST /api/uncertainty         — Get uncertainty map
  POST /api/metrics             — Compare SR vs reference
  GET  /api/locations           — List predefined Indian demo locations
  GET  /api/health              — Health check

Usage:
  uvicorn api.app:app --reload --host 0.0.0.0 --port 8000
"""

import io
import os
import sys
import tempfile
from pathlib import Path
from typing import Optional

import numpy as np
import torch
from fastapi import FastAPI, File, UploadFile, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ramtsr.models.ramtsr import RAMTSR
from ramtsr.evaluation.metrics import MetricsCalculator

app = FastAPI(
    title="RAMTSR API",
    version="0.1.0",
    description="Reliability-Aware Multi-Temporal Super Resolution for Satellite Imagery",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Predefined Indian demo locations
PREDEFINED_LOCATIONS = {
    "mumbai": {"bbox": [72.8, 18.9, 73.0, 19.1], "desc": "Mumbai coastline"},
    "delhi": {"bbox": [77.1, 28.5, 77.3, 28.7], "desc": "Delhi NCR"},
    "punjab": {"bbox": [75.8, 30.8, 76.0, 31.0], "desc": "Punjab agriculture"},
    "chennai": {"bbox": [80.1, 12.9, 80.3, 13.1], "desc": "Chennai coastal"},
    "himalayas": {"bbox": [77.5, 32.2, 77.7, 32.4], "desc": "Himalayan terrain"},
    "western_ghats": {"bbox": [75.5, 11.5, 76.0, 12.0], "desc": "Western Ghats vegetation"},
}

# Global model state
MODEL: Optional[RAMTSR] = None
DEVICE: torch.device = torch.device("cpu")
METRICS_CALC = MetricsCalculator()


def load_model_from_checkpoint(checkpoint_path: str = None) -> Optional[RAMTSR]:
    """Load the RAMTSR model from a checkpoint file."""
    global DEVICE
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    if checkpoint_path is None:
        checkpoint_path = os.environ.get("RAMTSR_CHECKPOINT", "checkpoints/phase_4_best.pth")

    if not os.path.exists(checkpoint_path):
        print(f"[WARN] Checkpoint not found at {checkpoint_path}. API will run without model.")
        return None

    ckpt = torch.load(checkpoint_path, map_location=DEVICE, weights_only=False)
    config = ckpt.get("config", {
        "in_channels": 4, "embed_dim": 180, "num_heads": 6,
        "window_size": 8, "scale": 4, "dropout_rate": 0.1,
    })
    model = RAMTSR(config).to(DEVICE)
    model.load_state_dict(ckpt["model_state"], strict=False)
    model.eval()
    print(f"Model loaded: {sum(p.numel() for p in model.parameters()) / 1e6:.2f}M params on {DEVICE}")
    return model


@app.on_event("startup")
async def startup_event():
    """Load model on API startup."""
    global MODEL
    MODEL = load_model_from_checkpoint()


# ── Schemas ──

class URLRequest(BaseModel):
    url: str

class LocationInfo(BaseModel):
    name: str
    bbox: list
    desc: str


# ── Endpoints ──

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": MODEL is not None,
        "device": str(DEVICE),
        "model_params_M": f"{sum(p.numel() for p in MODEL.parameters()) / 1e6:.2f}" if MODEL else "N/A",
    }


@app.get("/api/locations")
async def get_locations():
    """List predefined Indian demo locations."""
    return {
        "locations": {
            name: {"bbox": info["bbox"], "description": info["desc"]}
            for name, info in PREDEFINED_LOCATIONS.items()
        }
    }


@app.post("/api/super-resolve")
async def super_resolve(file: UploadFile = File(...)):
    """Upload a GeoTIFF and get the super-resolved result.

    The input should be a multi-band GeoTIFF with Sentinel-2 bands (B02, B03, B04, B08).
    Returns the 4× super-resolved GeoTIFF.
    """
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Set RAMTSR_CHECKPOINT env var.")

    try:
        import rasterio

        # Read uploaded GeoTIFF
        contents = await file.read()
        with rasterio.open(io.BytesIO(contents)) as src:
            data = src.read().astype(np.float32)
            transform = src.transform
            crs = src.crs

        # Normalize and prepare input
        data = np.clip(data / 10000.0, 0, 1)
        # Single frame input: (1, C, H, W)
        lr_tensor = torch.from_numpy(data).unsqueeze(0).unsqueeze(0).to(DEVICE)
        qm_tensor = torch.ones(1, 1, 1, data.shape[1], data.shape[2]).to(DEVICE)

        # Inference
        with torch.no_grad():
            sr = MODEL(lr_tensor, qm_tensor)[0].cpu().numpy()

        # Write output GeoTIFF
        sr_transform = rasterio.Affine(
            transform.a / 4, transform.b, transform.c,
            transform.d, transform.e / 4, transform.f)

        output_buffer = io.BytesIO()
        with rasterio.open(output_buffer, "w", driver="GTiff",
                           height=sr.shape[1], width=sr.shape[2],
                           count=sr.shape[0], dtype="float32",
                           crs=crs, transform=sr_transform) as dst:
            dst.write(sr)
        output_buffer.seek(0)

        return StreamingResponse(
            output_buffer,
            media_type="image/tiff",
            headers={"Content-Disposition": f"attachment; filename=sr_{file.filename}"},
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.post("/api/super-resolve-url")
async def super_resolve_url(req: URLRequest, background_tasks: BackgroundTasks):
    """Process a Copernicus tile URL in the background."""
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    # Background processing
    task_id = f"task_{hash(req.url) % 10000}"

    def process_url(url: str, tid: str):
        print(f"[{tid}] Processing {url}...")
        # In production: download tile, preprocess, run inference, save result
        print(f"[{tid}] Complete.")

    background_tasks.add_task(process_url, req.url, task_id)
    return {"message": "Processing started", "task_id": task_id}


@app.post("/api/uncertainty")
async def get_uncertainty(file: UploadFile = File(...)):
    """Upload a GeoTIFF and get the uncertainty map via MC-Dropout."""
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    try:
        import rasterio

        contents = await file.read()
        with rasterio.open(io.BytesIO(contents)) as src:
            data = src.read().astype(np.float32)

        data = np.clip(data / 10000.0, 0, 1)
        lr_tensor = torch.from_numpy(data).unsqueeze(0).unsqueeze(0).to(DEVICE)
        qm_tensor = torch.ones(1, 1, 1, data.shape[1], data.shape[2]).to(DEVICE)

        with torch.no_grad():
            sr_mean, sr_var = MODEL.forward_with_uncertainty(lr_tensor, qm_tensor, num_passes=10)

        uncertainty = sr_var[0].cpu().numpy()
        sr = sr_mean[0].cpu().numpy()

        return {
            "message": "Uncertainty computed",
            "mean_uncertainty": float(uncertainty.mean()),
            "max_uncertainty": float(uncertainty.max()),
            "sr_shape": list(sr.shape),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.post("/api/metrics")
async def compute_metrics(
    sr_file: UploadFile = File(..., description="Super-resolved GeoTIFF"),
    ref_file: UploadFile = File(..., description="Reference high-resolution GeoTIFF"),
):
    """Compute metrics between a super-resolved image and a reference."""
    try:
        import rasterio

        sr_data = np.clip(
            rasterio.open(io.BytesIO(await sr_file.read())).read().astype(np.float32) / 10000.0, 0, 1)
        ref_data = np.clip(
            rasterio.open(io.BytesIO(await ref_file.read())).read().astype(np.float32) / 10000.0, 0, 1)

        sr_tensor = torch.from_numpy(sr_data).unsqueeze(0)
        ref_tensor = torch.from_numpy(ref_data).unsqueeze(0)

        # Ensure same spatial size
        min_h = min(sr_tensor.shape[2], ref_tensor.shape[2])
        min_w = min(sr_tensor.shape[3], ref_tensor.shape[3])
        sr_tensor = sr_tensor[:, :, :min_h, :min_w]
        ref_tensor = ref_tensor[:, :, :min_h, :min_w]

        metrics = METRICS_CALC.compute_all(sr_tensor, ref_tensor)
        return {"metrics": metrics}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics computation failed: {str(e)}")
