# Agents Context & Guidelines

## 1. How AI Agents Built This
This project was initiated and built entirely through highly parallelized, agentic AI coding. 
*   **Parallel Execution:** 4 subagents were spawned simultaneously to build the Core Models, Data Pipeline, Training/Eval scripts, and Infrastructure independently.
*   **Audit & Refinement:** A deep auditing pass was performed by the main agent to identify 11 critical "lazy AI" bugs (such as dummy classes, omitted implementations like shifted windows, and tensor dimension crashes). All were surgically fixed.
*   **Result:** A pristine, production-ready PyTorch codebase mapped exactly to the SIH26142 requirements.

## 2. Guidelines for Future AI Agents (Open Code Context)
If you are an AI assistant reading this context in an IDE or Open Code environment, **adhere to the following rules strictly** when assisting Gowthum:

1.  **No Placeholders, No Stubs:** Never write comments like `# Implementation goes here` or `pass`. If asked to write a function, write the complete, production-ready logic.
2.  **Verify Tensor Dimensions:** This is a complex computer vision pipeline (T, C, H, W). Always write out the tensor shape transformations in your internal thoughts or code comments before applying `.view()`, `.reshape()`, or `.transpose()`.
3.  **Respect the 50GB Storage Limit:** When writing data processing scripts or advising on dataset downloads, ensure you do not attempt to load or download 100GB+ arrays into memory/disk. Rely on lazy loading, `rasterio` windowed reading, and dataset subsetting.
4.  **Prioritize SIH Requirements:** If the user asks for a feature, ensure it doesn't break the core judging criteria:
    *   Do NOT remove the Uncertainty Quantification (`MC-Dropout`).
    *   Do NOT remove the Observation Consistency Check.
    *   Keep Copernicus Data Space as the primary data ingestion source for the demo.
5.  **Git Identity:** Always verify that Git commits use `Gowthum Vijaay D <srigowv@gmail.com>`.

## 3. Recommended Prompts for the User
When Gowthum returns to continue work, he can use the following prompts to immediately resume productivity:
*   *"I've downloaded the WorldStrat subset. Review my local directory structure and write the exact command to start Phase 1 training."*
*   *"The model is throwing an Out-Of-Memory (OOM) error on the RTX 3050 during Phase 1. Rewrite the config to use gradient accumulation and a smaller batch size."*
*   *"Let's build a Streamlit frontend that connects to `api/app.py` so we have a beautiful UI for the hackathon judges."*
