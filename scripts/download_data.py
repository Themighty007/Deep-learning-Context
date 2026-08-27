"""
Dataset Download Script for RAMTSR

Downloads training, validation, and benchmark datasets.

Usage:
  python scripts/download_data.py --dataset worldstrat --subset selective --output_dir data/
  python scripts/download_data.py --dataset all --subset selective --output_dir data/
"""

import argparse
import hashlib
import os
import subprocess
import sys
from typing import Optional

import requests
from tqdm import tqdm


def download_file(url: str, dest: str, expected_hash: Optional[str] = None):
    """Download a file with progress bar and optional checksum verification."""
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)

    if os.path.exists(dest):
        print(f"  Already exists: {dest}")
        return

    print(f"  Downloading: {url}")
    response = requests.get(url, stream=True, timeout=60)
    response.raise_for_status()
    total = int(response.headers.get("content-length", 0))

    with open(dest, "wb") as f, tqdm(total=total, unit="B", unit_scale=True) as pbar:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            f.write(chunk)
            pbar.update(len(chunk))

    if expected_hash:
        h = hashlib.sha256()
        with open(dest, "rb") as f:
            for block in iter(lambda: f.read(8192), b""):
                h.update(block)
        if h.hexdigest() != expected_hash:
            print(f"  WARNING: checksum mismatch for {dest}")
        else:
            print(f"  Checksum OK")


def download_worldstrat(out_dir: str, subset: str):
    """Download WorldStrat dataset from Zenodo."""
    print("\n=== WorldStrat Dataset ===")
    print("Source: https://zenodo.org/records/6810792")
    print("Contains paired SPOT 1.5m (HR) and Sentinel-2 10m (LR) temporal stacks.")

    ws_dir = os.path.join(out_dir, "worldstrat")
    os.makedirs(ws_dir, exist_ok=True)

    if subset == "selective":
        print("NOTE: WorldStrat is ~25GB total. For selective download, use the Zenodo web UI")
        print("      to pick specific .tar files, or use zenodo_get:")
        print(f"      pip install zenodo_get && zenodo_get 6810792 -o {ws_dir}")
        print(f"      Or download manually from: https://zenodo.org/records/6810792")
    else:
        print(f"Full download: pip install zenodo_get && zenodo_get 6810792 -o {ws_dir}")

    # Create a helper script for the user
    script = os.path.join(ws_dir, "DOWNLOAD_INSTRUCTIONS.txt")
    with open(script, "w") as f:
        f.write("WorldStrat Dataset Download Instructions\n")
        f.write("=" * 50 + "\n\n")
        f.write("Option 1 (Recommended): zenodo_get\n")
        f.write(f"  pip install zenodo_get\n")
        f.write(f"  zenodo_get 6810792 -o {ws_dir}\n\n")
        f.write("Option 2: Manual download from https://zenodo.org/records/6810792\n\n")
        f.write("After download, organize into train/val/test splits.\n")
    print(f"  Instructions saved to: {script}")


def download_sen2naip(out_dir: str):
    """Download SEN2NAIP dataset from HuggingFace."""
    print("\n=== SEN2NAIP Dataset ===")
    print("Source: https://huggingface.co/datasets/jonathan-roberts1/SEN2NAIP")
    print("Contains paired NAIP 1m (HR) and Sentinel-2 10m (LR) cross-sensor data.")

    sn_dir = os.path.join(out_dir, "sen2naip")
    os.makedirs(sn_dir, exist_ok=True)

    print("Download via huggingface-cli:")
    print(f"  pip install huggingface_hub")
    print(f"  huggingface-cli download jonathan-roberts1/SEN2NAIP --repo-type dataset --local-dir {sn_dir}")

    script = os.path.join(sn_dir, "DOWNLOAD_INSTRUCTIONS.txt")
    with open(script, "w") as f:
        f.write("SEN2NAIP Dataset Download\n")
        f.write("=" * 50 + "\n\n")
        f.write("pip install huggingface_hub\n")
        f.write(f"huggingface-cli download jonathan-roberts1/SEN2NAIP --repo-type dataset --local-dir {sn_dir}\n")
    print(f"  Instructions saved to: {script}")


def download_sen2venus(out_dir: str):
    """Download SEN2VENuS dataset."""
    print("\n=== SEN2VENuS Dataset ===")
    print("Source: https://zenodo.org/records/6514159")

    sv_dir = os.path.join(out_dir, "sen2venus")
    os.makedirs(sv_dir, exist_ok=True)

    print("Install via pip:")
    print("  pip install sen2venus-pytorch-dataset")
    print(f"Or download from: https://zenodo.org/records/6514159")

    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "sen2venus-pytorch-dataset", "-q"])
        print("  sen2venus-pytorch-dataset installed successfully.")
    except subprocess.CalledProcessError:
        print("  Could not auto-install. Install manually: pip install sen2venus-pytorch-dataset")


def download_opensr_test(out_dir: str):
    """Install OpenSR-Test benchmark."""
    print("\n=== OpenSR-Test Benchmark ===")
    print("Source: https://github.com/ESAOpenSR/opensr-test")

    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "opensr-test", "-q"])
        print("  opensr-test installed successfully.")
    except subprocess.CalledProcessError:
        print("  Could not auto-install. Install manually: pip install opensr-test")


def download_diffusr(out_dir: str):
    """Download DiffFuSR pretrained checkpoints from HuggingFace."""
    print("\n=== DiffFuSR Pretrained Checkpoints ===")
    print("Source: https://huggingface.co/NorskRegnesentralSTI/DiffFuSR")

    ckpt_dir = os.path.join(out_dir, "checkpoints", "diffusr")
    os.makedirs(ckpt_dir, exist_ok=True)

    print("Download via huggingface-cli:")
    print(f"  huggingface-cli download NorskRegnesentralSTI/DiffFuSR --local-dir {ckpt_dir}")

    script = os.path.join(ckpt_dir, "DOWNLOAD_INSTRUCTIONS.txt")
    with open(script, "w") as f:
        f.write("DiffFuSR Checkpoints Download\n")
        f.write("=" * 50 + "\n\n")
        f.write("pip install huggingface_hub\n")
        f.write(f"huggingface-cli download NorskRegnesentralSTI/DiffFuSR --local-dir {ckpt_dir}\n")
    print(f"  Instructions saved to: {script}")


def print_storage(out_dir: str):
    """Print total storage used."""
    total = 0
    for dirpath, _, filenames in os.walk(out_dir):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if not os.path.islink(fp):
                total += os.path.getsize(fp)
    print(f"\nTotal storage used in {out_dir}: {total / (1024**3):.2f} GB")


def main():
    parser = argparse.ArgumentParser(description="Download datasets for RAMTSR")
    parser.add_argument("--dataset", type=str, required=True,
                        choices=["worldstrat", "sen2naip", "sen2venus",
                                 "opensr_test", "diffusr_checkpoints", "all"])
    parser.add_argument("--output_dir", type=str, required=True, help="Output directory")
    parser.add_argument("--subset", type=str, choices=["full", "selective"],
                        default="selective", help="Download subset or full")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    print("RAMTSR Dataset Downloader")
    print("=" * 50)

    if args.dataset in ["worldstrat", "all"]:
        download_worldstrat(args.output_dir, args.subset)
    if args.dataset in ["sen2naip", "all"]:
        download_sen2naip(args.output_dir)
    if args.dataset in ["sen2venus", "all"]:
        download_sen2venus(args.output_dir)
    if args.dataset in ["opensr_test", "all"]:
        download_opensr_test(args.output_dir)
    if args.dataset in ["diffusr_checkpoints", "all"]:
        download_diffusr(args.output_dir)

    print_storage(args.output_dir)
    print("\nDone! Check DOWNLOAD_INSTRUCTIONS.txt files for manual steps.")


if __name__ == "__main__":
    main()
