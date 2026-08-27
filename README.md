# 🛰️ RAMTSR — Reliability-Aware Multi-Temporal Super Resolution

> **SIH26142** — Deep Learning Based Super Resolution Mapping (SRM) from Medium Resolution Satellite Imageries  
> **Organization:** National Technical Research Organisation (NTRO)  
> **Category:** Software | **Theme:** Space Technology

---

## 📋 Problem Statement

### Background
Medium-resolution satellite imagery (10–30 meters), such as that from ESA's Sentinel-2 constellation, is widely used in agriculture monitoring, land-cover mapping, urban planning, disaster assessment, and environmental observation. However, the spatial resolution is **insufficient to identify fine details** like narrow roads, small buildings, field boundaries, water edges, or localized damage.

### The Challenge
Current AI super-resolution models can sharpen images, but they often **hallucinate** — generating plausible-looking details that do not actually exist on the ground. A building that appears in the enhanced image may never have existed. This makes standard SR models **unreliable for decision-making** in defense, disaster response, or agricultural advisory.

### What NTRO Wants
A robust framework that:
1. Takes **10m Sentinel-2 L2A** imagery as input
2. Produces **<4m** enhanced spatial resolution output (we target **2.5m**)
3. **Preserves geospatial and spectral consistency**
4. **Clearly manages uncertainty** — distinguishing inferred details from observed ones
5. Validates against **high-resolution reference data**
6. Supports **crop monitoring, urban analysis, and disaster assessment**

> **Dataset Source (PS-specified):** [Copernicus Data Space Browser](https://browser.dataspace.copernicus.eu/)

---

## 🎯 Our Solution: RAMTSR

**RAMTSR** (Reliability-Aware Multi-Temporal Super Resolution) doesn't just make satellite images sharper — it makes them **trustworthy**.

### Core Innovation

Instead of hallucinating fine detail from a single 10m image, RAMTSR uses **multiple observations over time** combined with **physics-based consistency checking** and **calibrated uncertainty maps** to produce a reliable <4m product.

Three mechanisms prevent hallucination:

| Mechanism | How It Works |
|---|---|
| **Multi-Temporal Fusion** | Uses 5 Sentinel-2 observations of the same location. Real features appear consistently; transient noise does not. |
| **Observation Consistency** | After producing the SR image, we *simulate* what Sentinel-2 should have seen. If the simulation doesn't match the actual observation, the reconstruction is suspect. |
| **Calibrated Uncertainty** | Every pixel gets a confidence score. When the model says "uncertain," it's actually more likely to be wrong — proven by calibration curves. |

### Why This Wins

- **PS Compliance:** Addresses all 21 requirements in the official problem statement, including the explicitly requested uncertainty and error components
- **Three-Paradigm Comparison:** We benchmark CNN, Transformer, GAN, and Diffusion approaches — then show why our hybrid approach is superior
- **Real Indian Geography:** Demo tiles over Mumbai, Delhi, Punjab, Chennai, and Himalayas — not generic US/European imagery
- **Scientific Rigor:** Validated on the OpenSR-Test benchmark with hallucination-specific metrics

---

## 🏗️ Architecture

```
                    ╔══════════════════════════════════════╗
                    ║   RAMTSR — Full System Architecture  ║
                    ╚══════════════════════════════════════╝

    ┌──────────────────────────────────────────────────────────┐
    │                 DATA INGESTION LAYER                      │
    │                                                          │
    │   Copernicus Data Space API ──→ Sentinel-2 L2A           │
    │                                   │                      │
    │                    ┌──────────────┼──────────────┐       │
    │                    │              │              │       │
    │              10m bands       20m bands      60m bands    │
    │              (B2,B3,B4,B8)  (B5-B7,B8A,   (dropped)    │
    │                    │        B11,B12)                     │
    │                    └──────────────┘                      │
    │                          │                               │
    │              s2cloudless cloud masking                    │
    │              AROSICS co-registration                     │
    │              5 temporal frames extraction                 │
    │              Patch extraction (128×128)                   │
    └──────────────────────┼───────────────────────────────────┘
                           │
    ┌──────────────────────┼───────────────────────────────────┐
    │              MODEL CORE (SwinIR + GAN)                    │
    │                                                          │
    │   t-2  t-1  t0  t+1  t+2   (5 temporal frames)          │
    │    │    │    │    │    │                                  │
    │    └────┴────┴────┴────┘                                 │
    │              │                                           │
    │    Shared Spectral Encoder (SwinIR backbone)             │
    │              │                                           │
    │    ┌─────────┴─────────┐                                 │
    │    │                   │                                 │
    │  Spatial Branch      Temporal Branch                     │
    │  (SwinIR 6 RSTB)    (Quality-Aware Attention)            │
    │    │                   │                                 │
    │    └─────────┬─────────┘                                 │
    │              │                                           │
    │    Cross-Attention Fusion                                │
    │              │                                           │
    │    PixelShuffle 4× Upsampling ──→ 2.5m SR Output         │
    │              │                                           │
    │    ┌─────────┴─────────┐                                 │
    │    │                   │                                 │
    │  PatchGAN             Uncertainty Head                   │
    │  Discriminator        (MC-Dropout per-pixel σ)           │
    └──────────────────────┼───────────────────────────────────┘
                           │
    ┌──────────────────────┼───────────────────────────────────┐
    │         OBSERVATION CONSISTENCY CHECK                     │
    │                                                          │
    │    SR Output (2.5m)                                      │
    │         │                                                │
    │    Gaussian PSF blur (σ=1.5) → Downsample 4× → Spectral │
    │    Response Function → Predicted Sentinel-2 (10m)        │
    │         │                                                │
    │    L1(Predicted S2, Actual S2) = Consistency Score       │
    │         │                                                │
    │    High score → HALLUCINATION DETECTED                   │
    └──────────────────────┼───────────────────────────────────┘
                           │
    ┌──────────────────────┼───────────────────────────────────┐
    │           DOWNSTREAM APPLICATIONS                        │
    │                                                          │
    │  🌾 NDVI Crop Monitor  🏙️ Building Extraction            │
    │  🌊 Flood Mapping      🔄 Change Detection               │
    └──────────────────────────────────────────────────────────┘
```

### Model Components

| Component | Implementation | Purpose |
|---|---|---|
| **SwinIR Backbone** | 6 RSTB blocks, embed_dim=180, window=8 | Extract deep spatial features from each frame |
| **Temporal Attention** | Quality-aware windowed attention | Fuse 5 temporal frames; cloud-masked frames get lower weight |
| **Cross-Attention Fusion** | Windowed cross-attention with residual | Merge spatial and temporal information |
| **PatchGAN Discriminator** | 3-layer with spectral normalization | Improve texture realism during adversarial training |
| **Uncertainty Head** | MC-Dropout (p=0.1, 10 forward passes) | Per-pixel confidence estimation |
| **Observation Consistency** | Forward degradation model | Verify SR output is physically plausible |

### Loss Function (Progressive Training)

Training proceeds in 4 phases, each adding more loss components:

```
Phase 1: L = L_reconstruction + 0.5 × L_spectral
Phase 2: L += 0.3 × L_observation_consistency
Phase 3: L += 0.1 × L_perceptual + 0.01 × L_GAN
Phase 4: L += 0.1 × L_uncertainty
```

| Loss | Formula | Purpose |
|---|---|---|
| **Reconstruction** | L1(SR, HR) | Pixel-level accuracy |
| **Spectral Angle** | arccos(SR · HR / \|\|SR\|\| \|\|HR\|\|) | Preserve reflectance relationships |
| **Observation Consistency** | L1(degrade(SR), actual_LR) | Anti-hallucination |
| **Perceptual** | L1(VGG(SR), VGG(HR)) | Feature-level quality |
| **Adversarial** | BCE(D(SR), 1) | Texture realism |
| **Uncertainty** | NLL(SR, HR, σ²) | Calibrated confidence |

---

## 📊 Datasets

| Dataset | Role | Resolution | Source |
|---|---|---|---|
| **Copernicus Sentinel-2** | Demo/inference (PS-specified) | 10m/20m/60m | [browser.dataspace.copernicus.eu](https://browser.dataspace.copernicus.eu/) |
| **WorldStrat** | Primary training | SPOT 1.5m ↔ S2 10m (temporal pairs) | [Zenodo](https://zenodo.org/record/6810792) |
| **SEN2NAIP** | Cross-sensor training | NAIP 1m ↔ S2 10m | [HuggingFace](https://huggingface.co/datasets) |
| **SEN2VENµS** | Cross-sensor validation | VENµS 5m ↔ S2 10m | [Zenodo](https://zenodo.org/record/6514159) |
| **OpenSR-Test** | Benchmark (hallucination metrics) | Multiple | [GitHub](https://github.com/ESAOpenSR/opensr-test) |
| **DiffFuSR** | Pretrained diffusion baseline | 2.5m | [HuggingFace](https://huggingface.co/NorskRegnesentralSTI/DiffFuSR) |

---

## 🔬 Evaluation Metrics

| Metric | What It Measures | Target |
|---|---|---|
| **PSNR** (dB) ↑ | Pixel-level reconstruction quality | ≥ 28.5 |
| **SSIM** ↑ | Structural similarity | ≥ 0.83 |
| **SAM** (rad) ↓ | Spectral fidelity | ≤ 0.07 |
| **Hallucination Rate** ↓ | % pixels with invented features | ≤ 5% |
| **Uncertainty Calibration** ↑ | Uncertainty correlates with actual errors | ≥ 0.90 |

We use the **OpenSR-Test** benchmark which evaluates: consistency, synthesis, correctness, spectral distance, and hallucination rate.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| ML Framework | PyTorch 2.x + CUDA |
| SR Architecture | SwinIR-Medium + PatchGAN + MC-Dropout |
| Geospatial I/O | GDAL, Rasterio, sentinelhub-py |
| Cloud Masking | s2cloudless |
| Evaluation | OpenSR-Test, torchmetrics |
| Backend API | FastAPI + Uvicorn |
| Frontend | React + Leaflet/MapLibreGL |
| Experiment Tracking | Weights & Biases |

---

## 📁 Project Structure

```
RAMTSR/
├── config/
│   └── default.yaml                  # Training & model configuration
├── ramtsr/                            # Core Python package
│   ├── models/
│   │   ├── swinir.py                 # SwinIR backbone (6 RSTB blocks)
│   │   ├── temporal_attention.py     # Quality-aware temporal attention
│   │   ├── fusion.py                 # Cross-attention fusion
│   │   ├── discriminator.py          # PatchGAN discriminator
│   │   ├── uncertainty.py            # MC-Dropout uncertainty estimation
│   │   └── ramtsr.py                 # Full RAMTSR model
│   ├── data/
│   │   ├── datasets.py               # WorldStrat, SEN2NAIP, SEN2VENµS loaders
│   │   ├── preprocessing.py          # Cloud masking, co-registration, patching
│   │   ├── transforms.py             # Satellite-aware data augmentation
│   │   └── copernicus.py             # Copernicus Data Space API client
│   ├── losses/
│   │   └── losses.py                 # All 6 loss functions + combined manager
│   ├── evaluation/
│   │   └── metrics.py                # PSNR, SSIM, SAM, hallucination, calibration
│   └── utils/
│       └── geo_utils.py              # GeoTIFF I/O, NDVI, tiling, reprojection
├── scripts/
│   ├── train.py                      # Multi-phase training loop (AMP, WandB)
│   ├── evaluate.py                   # Benchmarking + comparison plots
│   ├── demo.py                       # End-to-end demo on Indian cities
│   └── download_data.py              # Dataset downloader
├── api/
│   └── app.py                        # FastAPI REST backend
├── requirements.txt
├── setup.py
└── .gitignore
```

---

## 🚀 Quick Start

### 1. Setup Environment

```bash
git clone https://github.com/Themighty007/Deep-Learning-Image-Resolution.git
cd Deep-Learning-Image-Resolution
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

### 2. Download Datasets

```bash
# Download all datasets (selective = smaller subsets)
python scripts/download_data.py --dataset all --subset selective --output_dir data/

# Or download individually
python scripts/download_data.py --dataset opensr_test --output_dir data/
python scripts/download_data.py --dataset worldstrat --subset selective --output_dir data/
```

### 3. Train (Multi-Phase)

```bash
# Phase 1: Core training (reconstruction + spectral loss)
python scripts/train.py --config config/default.yaml --phase phase_1

# Phase 2: Add observation consistency (anti-hallucination)
python scripts/train.py --config config/default.yaml --phase phase_2 --resume checkpoints/phase_1_best.pth

# Phase 3: Add GAN + perceptual loss
python scripts/train.py --config config/default.yaml --phase phase_3 --resume checkpoints/phase_2_best.pth

# Phase 4: Add uncertainty training
python scripts/train.py --config config/default.yaml --phase phase_4 --resume checkpoints/phase_3_best.pth
```

### 4. Evaluate

```bash
# Run on OpenSR-Test benchmark
python scripts/evaluate.py --checkpoint checkpoints/best.pth --dataset opensr --output_dir results/

# With uncertainty estimation
python scripts/evaluate.py --checkpoint checkpoints/best.pth --dataset opensr --uncertainty --output_dir results/
```

### 5. Demo on Indian Cities

```bash
# Super-resolve Mumbai coastline
python scripts/demo.py --checkpoint checkpoints/best.pth --location mumbai --uncertainty --output_dir demo_output/

# Custom location
python scripts/demo.py --checkpoint checkpoints/best.pth --bbox 72.7,18.85,73.1,19.25 --output_dir demo_output/
```

### 6. Run API Server

```bash
uvicorn api.app:app --reload --host 0.0.0.0 --port 8000
# API docs at http://localhost:8000/docs
```

---

## 👤 Team

| Role | Name |
|---|---|
| Project Lead | **Gowthum Vijaay D** |

**Smart India Hackathon 2026** | Problem Statement ID: SIH26142  
**Organization:** National Technical Research Organisation (NTRO)  
**Theme:** Space Technology

---

## 📄 License

This project is developed for the Smart India Hackathon 2026 competition. All satellite imagery is subject to respective data provider licenses (Copernicus: CC BY 4.0, WorldStrat: CC BY-NC 4.0).
