"""Download every remote image link in supplier-catalogue.xlsx into site/public/products/r/ as WebP (max 640 px).
Resumable: skips files that exist. Writes data/out/remote-images.json (url -> [file, w, h]) read by build_catalogue.py.
Uses curl because the system Python has no certificate bundle."""
import hashlib, io, json, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import openpyxl
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "site/public/products/r"
MANIFEST = ROOT / "data/out/remote-images.json"
MAX = 640
OUT.mkdir(parents=True, exist_ok=True)

ws = openpyxl.load_workbook(ROOT / "supplier-catalogue.xlsx", read_only=True)["Products"]
urls = sorted({r[9] for r in ws.iter_rows(min_row=2, values_only=True) if r[9] and str(r[9]).startswith("http")})
manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}

def fetch(u):
    name = hashlib.sha1(u.encode()).hexdigest()[:12] + ".webp"
    dst = OUT / name
    if u in manifest and dst.exists():
        return u, manifest[u], None
    for attempt in range(3):
        p = subprocess.run(["curl", "-sL", "-m", "40", "-e", "", u.replace(" ", "%20")], capture_output=True)
        try:
            im = Image.open(io.BytesIO(p.stdout)); im.load()
            break
        except Exception as e:
            err = f"{type(e).__name__}"
    else:
        return u, None, err
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA" if "transparency" in im.info or im.mode in ("LA", "P") else "RGB")
    im.thumbnail((MAX, MAX))
    im.save(dst, "WEBP", quality=80, method=4)
    return u, [name, im.width, im.height], None

failed = []
with ThreadPoolExecutor(8) as ex:
    for n, (u, rec, err) in enumerate(ex.map(fetch, urls), 1):
        if rec: manifest[u] = rec
        else: failed.append((u, err))
        if n % 250 == 0:
            print(n, "of", len(urls), "failed", len(failed), flush=True)
            MANIFEST.write_text(json.dumps(manifest))
MANIFEST.write_text(json.dumps(manifest))
print("done", len(manifest), "ok", len(failed), "failed")
for f in failed[:40]: print(f)
