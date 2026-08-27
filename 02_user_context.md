# User Context & Constraints

## 1. User Profile
*   **Name:** Gowthum Vijaay D
*   **Email:** srigowv@gmail.com (Must be used for all Git commits)
*   **GitHub Repository:** `https://github.com/Themighty007/Deep-Learning-Image-Resolution`
*   **Skills:** AI, ML, software development. 
*   **Development Style:** AI-driven development. The user utilizes AI APIs to generate high-quality code and acts as the lead integrator and architect. Needs brutal honesty, perfectly clean code, and zero hallucinations from AI assistants.

## 2. Team & Environment
*   **Team Size:** 6 members with solid ML skills, ready to execute and run pipelines.
*   **Primary Development Location:** 99% at home prior to the grand finale.

## 3. Hardware & Storage Constraints
*   **Primary GPU:** RTX 3050 (Local).
*   **Secondary Compute (Scalable):** Access to RTX 4090 (higher VRAM), Google Colab, and other online free/paid GPU providers. Compute is *not* a hard bottleneck for training.
*   **Storage Limit:** 50 - 70 GB of downloadable space locally.
    *   *Implication:* Massive datasets (like the full 250GB WorldStrat or 500GB SEN2VENuS) cannot be downloaded locally in full. Data must be subsetted ("selective download") or streamed to fit within this constraint.

## 4. User's Pros & Cons (Brutally Honest Assessment)

### Pros (Strengths to Leverage)
1.  **AI-Augmented Velocity:** By using AI to write code and focusing on integration, the development speed is 10x faster than traditional coding.
2.  **Scalable Compute Access:** Having access to a 4090 and cloud GPUs means we can train modern Transformer models (SwinIR) without being permanently crippled by the local RTX 3050's VRAM.
3.  **Strong Team:** A 6-member team with ML knowledge allows for parallel tasks (e.g., one person downloading data, another running the API, another tuning hyperparams).
4.  **Massive Time Advantage:** With 3-4 months until the finale, there is ample time to train progressively and heavily refine the model to avoid common hackathon rush-bugs.

### Cons (Risks to Mitigate)
1.  **Storage Bottleneck:** 50-70GB is very tight for remote sensing datasets.
    *   *Mitigation:* The `download_data.py` script is set up for selective subsetting. We must strictly monitor disk space.
2.  **AI Integration Blindspots:** Generating entire architectures via AI can lead to subtle tensor mismatch bugs or "dummy code" placeholders that slip through.
    *   *Mitigation:* The AI must be prompted to *always* write production code, verify tensor dimensions explicitly, and never use placeholders like "omitted for brevity". (A full audit already resolved 11 such bugs).
3.  **Deployment Reality:** The solution must be viable for "current India with the same infrastructure." A model that requires 8x A100s for inference will lose marks.
    *   *Mitigation:* The architecture uses a SwinIR backbone which is efficient, and inference is tiled. The FastAPI backend can run on standard consumer hardware.
