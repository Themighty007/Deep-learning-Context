# Architecture & Project Plan

## 1. The Model: RAMTSR
**RAMTSR** (Reliability-Aware Multi-Temporal Super Resolution) is our custom architecture designed specifically to win SIH26142 by solving the "AI Hallucination" problem in satellite imagery.

### Key Components
1.  **Multi-Temporal Input:** Instead of super-resolving a single image (which forces the AI to guess/hallucinate details), RAMTSR takes a time-series stack of 5 Sentinel-2 frames ($T=5, C=4$). Cloud movement and satellite sub-pixel shifts provide sub-pixel information, allowing true resolution enhancement rather than just "painting" fake details.
2.  **SwinIR Backbone:** Uses a Swin Transformer (6 Residual Swin Transformer Blocks) to extract deep spatial features.
3.  **Quality-Aware Temporal Attention:** A temporal transformer that fuses the 5 frames. It ingests a Sentinel-2 Scene Classification (SCL) cloud mask to dynamically ignore clouded pixels in specific frames.
4.  **Observation Consistency Check:** A hard mathematical constraint. The model downsamples its own 2.5m output back to 10m using a Point Spread Function (PSF) and compares it to the original input. This penalizes the model heavily if it hallucinates buildings that weren't there.
5.  **Uncertainty Quantification (MC-Dropout):** Fulfills the strict NTRO requirement. Generates a heatmap showing where the AI is uncertain (e.g., heavily clouded areas), ensuring trust in critical use cases like defense or disaster management.

## 2. Progressive Training Plan (4 Phases)
Training a complex GAN/Transformer from scratch is unstable. We use a 4-phase curriculum:
*   **Phase 1 (Reconstruction):** Train with L1/L2 loss + Spectral Angle Mapper (SAM) loss. Goal: Basic blurry upsampling, color accuracy.
*   **Phase 2 (Anti-Hallucination):** Add Observation Consistency Loss. Goal: Force the model to respect the input geometry.
*   **Phase 3 (Perceptual & Adversarial):** Add VGG Perceptual loss and PatchGAN Discriminator. Goal: Sharpen the image and generate high-frequency textures (buildings, roads).
*   **Phase 4 (Uncertainty Calibration):** Enable MC-Dropout and train with Negative Log-Likelihood. Goal: Calibrate the uncertainty maps.

## 3. Datasets Plan
*   **WorldStrat (Primary):** SPOT (1.5m) paired with Sentinel-2 (10m) temporal stacks.
*   **SEN2NAIP (Cross-Sensor):** NAIP (1m) paired with Sentinel-2. Used for robust urban texture learning.
*   **SEN2VENuS (Validation):** Used for strict benchmark evaluation.
*   **OpenSR-Test (Testing):** Final metric validation before the pitch.

## 4. End-to-End Pipeline
1. `download_data.py`: Fetches subsets to respect the 50GB limit.
2. `train.py`: Executes the 4 phases on RTX 4090/Colab.
3. `evaluate.py`: Generates PSNR/SSIM tables and uncertainty overlays.
4. `app.py` & `demo.py`: FastAPI backend that pulls real-time data from the Copernicus API for Indian cities (Mumbai, Delhi, Chennai) to show live inference during the hackathon pitch.
