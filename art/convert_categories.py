#!/usr/bin/env python3
"""Category originals -> WebP (400 and 800 px wide) in site/public/images/categories/
and site/src/data/category-images.json, keyed "department/category"."""
import io, json
from pathlib import Path
from PIL import Image
from category_subjects import SUBJECTS

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "site" / "public" / "images" / "categories"
MANIFEST = ROOT.parent / "site" / "src" / "data" / "category-images.json"
WIDTHS = [400, 800]
OUT.mkdir(parents=True, exist_ok=True)
manifest = {}
for key, subject in SUBJECTS.items():
    src = ROOT / "originals" / "cat" / (key.replace("/", "__") + ".png")
    if not src.exists():
        print("MISSING", key)
        continue
    im = Image.open(src).convert("RGB")
    files = {}
    for w in WIDTHS:
        r = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS)
        b = io.BytesIO(); r.save(b, "WEBP", quality=78, method=6)
        name = key.replace("/", "__") + f"-{w}.webp"
        (OUT / name).write_bytes(b.getvalue())
        files[str(w)] = {"path": f"/images/categories/{name}", "height": r.height, "kb": round(b.tell() / 1024)}
    manifest[key] = {"alt": subject, "files": files}
MANIFEST.write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
kb = [m["files"]["800"]["kb"] for m in manifest.values()]
print(len(manifest), "images; 800px max", max(kb), "KB, avg", round(sum(kb) / len(kb)), "KB")
