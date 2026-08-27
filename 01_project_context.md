# Project Context: Smart India Hackathon 2026

## 1. Problem Statement Details
*   **Problem Statement ID:** SIH26142
*   **Problem Statement Title:** Deep Learning Based Super Resolution Mapping (SRM) from Medium Resolution Satellite Imageries
*   **Organization:** National Technical Research Organisation (NTRO)
*   **Category:** Software
*   **Theme:** Space Technology

## 2. Core Description & Challenge
Medium-resolution satellite imagery (Sentinel-2, 10 to 30 meters) provides broad coverage and frequent revisit times but lacks fine spatial detail required for identifying small buildings, narrow roads, field boundaries, and localized disaster damage. 

**The Goal:** Develop an advanced deep learning-based generative enhancement technique to achieve sub-4 meter (ideally 2.5m) spatial resolution from 10m Sentinel-2 data, preserving both geospatial and spectral fidelity while preventing AI hallucinations.

## 3. Mandatory Requirements (21/21 Mapped)
1.  **Input:** 10-30m multispectral satellite imagery (primarily Sentinel-2).
2.  **Output:** Enhanced imagery at < 4m spatial resolution.
3.  **Applications:** Must support crop monitoring, urban analysis, and disaster assessment.
4.  **Data Source:** Must utilize the Copernicus Data Space Ecosystem API.
5.  **Critical Constraint (Uncertainty):** The problem statement explicitly demands "uncertainty quantification" and "error components" measurement. AI hallucinations must be minimized and flagged.
6.  **Architecture Choice:** Transformers, Generative Models (GANs/Diffusion), or advanced CNNs.
7.  **Evaluation:** Must be validated against actual high-resolution reference data with standard metrics (PSNR, SSIM, SAM, etc.).

## 4. Hackathon Timeline & Phases
1.  **Phase 1 - Internal Hackathon:** >1 week from the project start. The initial prototype and architecture validation take place here.
2.  **Phase 2 - National Finalist Selection:** ~3 months out. Requires a highly polished, working prototype to pass the jury.
3.  **Phase 3 - Grand Finale:** November/December 2026 (~4 months out).
    *   *Note:* The user will complete 99% of the project at home prior to the finale. The actual hackathon event will only require minor edits, feature additions, and real-time deployment presentation.

## 5. Judging Criteria (100 Marks Total)
*   **Problem Understanding (15pts):** Clarity on the NTRO's exact needs.
*   **Novelty (20pts):** Our unique approach (Multi-temporal + Uncertainty).
*   **Technical Execution (25pts):** Code quality, model architecture, training pipeline.
*   **Prototype (25pts):** Working demo, Copernicus API integration.
*   **Impact & Pitch (15pts):** Real-world applicability in India.

*Note: Judging rounds heavily favor teams that actively implement mentor feedback between Round 1 and Round 2.*
