#!/usr/bin/env python3
"""Generate the Empire overhaul images (plan section 3.4) with Marketing Studio, 5 jobs at a time.
Reuses the Linsilk hf_client for credentials and the API. Paid: needs HF_ALLOW_PAID=1."""
import re, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
sys.path.insert(0, "/Users/misterjin/Documents/one S Digital/Linsilk")
import hf_client as h

ROOT = Path(__file__).resolve().parent
plan = (ROOT.parent / "Empire-Design-Overhaul-Plan.md").read_text()
style = re.search(r"### 3\.3.*?\n> (.*?)\n", plan, re.S).group(1)
names = {2: "feature-solar", 3: "feature-power-tools", 4: "feature-taps", 5: "feature-paint",
         6: "cover-plumbing", 7: "cover-electrical", 8: "cover-lighting", 9: "cover-solar-backup-power",
         10: "cover-power-tools", 11: "cover-hand-tools", 12: "cover-fixings-adhesives",
         13: "cover-air-tools-compressors", 14: "cover-paint-waterproofing"}
jobs = []
for n, title, ar, prompt in re.findall(r"\*\*(\d+)\. (.*?) \((\d:\d)\)\*\*\n> (.*?)\n", plan):
    n = int(n)
    if n in names:
        # Marketing Studio has no 4:5; generate 3:4 and crop to 4:5 later
        jobs.append((names[n], {"2:3": "2:3", "4:5": "3:4"}.get(ar, ar), prompt + " " + style))

def run(j):
    name, ar, prompt = j
    out = ROOT / "originals" / f"{name}.png"
    if out.exists():
        return name, "skip"
    body = {"prompt": prompt, "quality": "medium", "resolution": "2k", "aspect_ratio": ar, "enhance_prompt": False}
    try:
        h.generate("marketing-studio/image", body, out, tag="hw-" + name)
        return name, "ok"
    except SystemExit as e:
        return name, f"FAILED {e}"

if __name__ == "__main__":
    for name, ar, _ in jobs: print(name, ar)
    with ThreadPoolExecutor(5) as ex:
        for r in ex.map(run, jobs): print(*r, flush=True)
