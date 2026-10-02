#!/usr/bin/env python3
"""Originals -> WebP sets in site/public/images/ + site/src/data/images.json (plan 3.6)."""
import io, json, re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "site" / "public" / "images"
MANIFEST = ROOT.parent / "site" / "src" / "data" / "images.json"
plan = (ROOT.parent / "Empire-Design-Overhaul-Plan.md").read_text()

ALT = {
    "hero-banner": "Solar inverter, battery, solar panel, power tools, copper pipes and brass valves on a dark workbench",
    "feature-solar": "Wall-mounted hybrid solar inverter above a stacked lithium battery",
    "feature-power-tools": "Cordless angle grinder cutting a steel bar with a fan of sparks",
    "feature-taps": "Chrome kitchen mixer tap with a single drop of water falling",
    "feature-paint": "Open paint tin with a swirl of glossy red paint and a brush on the rim",
    "cover-plumbing": "Copper pipes, brass ball valves, fittings and a chrome mixer tap on dark steel",
    "cover-electrical": "Miniature circuit breakers on a DIN rail, red and black cable coils, a switch and socket",
    "cover-lighting": "LED downlights, a filament globe and an LED floodlight glowing on a dark surface",
    "cover-solar-backup-power": "Solar panel facing a low sun beside a wall-mounted inverter and battery stack",
    "cover-power-tools": "Cordless drill, angle grinder and circular saw with sparks in the background",
    "cover-hand-tools": "Spanners, pliers, screwdrivers, a claw hammer and a tape measure on dark steel",
    "cover-fixings-adhesives": "Screws, bolts, nuts, washers and wall anchors with a roll of tape and a sealant tube",
    "cover-air-tools-compressors": "Compact air compressor with a coiled blue hose, quick couplers and a spray gun",
    "cover-paint-waterproofing": "Open paint tins with drips, a roller, a brush and a roll of waterproofing membrane",
}
STYLE = re.search(r"### 3\.3.*?\n> (.*?)\n", plan, re.S).group(1)
PROMPTS = {"hero-banner": (ROOT / "tests" / "banner_prompt.txt").read_text().strip()}
names = {2: "feature-solar", 3: "feature-power-tools", 4: "feature-taps", 5: "feature-paint",
         6: "cover-plumbing", 7: "cover-electrical", 8: "cover-lighting", 9: "cover-solar-backup-power",
         10: "cover-power-tools", 11: "cover-hand-tools", 12: "cover-fixings-adhesives",
         13: "cover-air-tools-compressors", 14: "cover-paint-waterproofing"}
for n, p in re.findall(r"\*\*(\d+)\. .*? \(\d:\d\)\*\*\n> (.*?)\n", plan):
    if int(n) in names:
        PROMPTS[names[int(n)]] = p + " " + STYLE

def widths(name):
    if name == "hero-banner": return [1280, 1920, 2560], 250
    if name.startswith("feature"): return [480, 960], 150
    return [640, 1280, 1920], 150

def encode(im, kb):
    for q in (82, 76, 70, 64, 58):
        b = io.BytesIO(); im.save(b, "WEBP", quality=q, method=6)
        if b.tell() <= kb * 1024: break
    return b.getvalue(), q

OUT.mkdir(parents=True, exist_ok=True)
manifest = {}
for src in sorted((ROOT / "originals").glob("*.png")):
    name = src.stem
    im = Image.open(src).convert("RGB")
    if name.startswith("feature"):  # generated 3:4, shown 4:5
        h = round(im.width * 5 / 4); top = (im.height - h) // 2
        im = im.crop((0, top, im.width, top + h))
    ws, budget = widths(name)
    files = {}
    for w in ws:
        r = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS)
        # budget applies to the 1920 banner / 1280 cover / 960 feature size only
        limit = budget if w == ws[-2 if name == "hero-banner" else (-1 if name.startswith("feature") else 1)] else 10**6
        data, q = encode(r, limit)
        (OUT / f"{name}-{w}.webp").write_bytes(data)
        files[w] = {"path": f"/images/{name}-{w}.webp", "height": r.height, "kb": round(len(data) / 1024), "q": q}
    manifest[name] = {"alt": ALT[name], "aspect": f"{im.width}:{im.height}", "model": "marketing-studio/image",
                      "quality": "medium", "files": files, "prompt": PROMPTS[name]}
    print(name, {w: f["kb"] for w, f in files.items()})
MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
