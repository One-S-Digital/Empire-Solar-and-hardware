#!/usr/bin/env python3
"""Generate the 100 category images (4:3, 1k) with Marketing Studio, 5 jobs at a time.
Usage: HF_ALLOW_PAID=1 python3 art/generate_categories.py [--quality low|medium] [--only KEY ...]
Skips images that already exist. Uses the Linsilk hf_client for the key and the API."""
import argparse, re, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
sys.path.insert(0, "/Users/misterjin/Documents/one S Digital/Linsilk")
import hf_client as h
from category_subjects import SUBJECTS

ROOT = Path(__file__).resolve().parent
plan = (ROOT.parent / "Empire-Design-Overhaul-Plan.md").read_text()
STYLE = re.search(r"### 3\.3.*?\n> (.*?)\n", plan, re.S).group(1)

ap = argparse.ArgumentParser()
ap.add_argument("--quality", default="low")
ap.add_argument("--only", nargs="*")
a = ap.parse_args()
keys = a.only or list(SUBJECTS)

def run(key):
    out = ROOT / "originals" / "cat" / (key.replace("/", "__") + ".png")
    if out.exists():
        return key, "skip"
    prompt = f"{SUBJECTS[key]}, arranged as a neat product still life on a dark steel surface. {STYLE}"
    body = {"prompt": prompt, "quality": a.quality, "resolution": "1k", "aspect_ratio": "4:3", "enhance_prompt": False}
    try:
        h.generate("marketing-studio/image", body, out, tag="hw-cat-" + key)
        return key, "ok"
    except SystemExit as e:
        return key, f"FAILED {e}"

with ThreadPoolExecutor(5) as ex:
    for r in ex.map(run, keys):
        print(*r, flush=True)
