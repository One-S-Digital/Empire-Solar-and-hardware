"""Reads the SEO keyword map (Empire-SEO-Keyword-Map.xlsx, sheet "Departments & categories") and writes
site/src/data/category-seo.json: title tag and meta description for every category and sub-category page.

The map was drafted before the catalogue taxonomy was built, so 32 of its URLs are shortened versions of the real
ones (for example /catalogue/hand-tools/pliers is really /catalogue/hand-tools/pliers-gripping). Rows are matched to
real pages by exact URL first, then by page name inside the same parent. Counts quoted in a description are
replaced with the catalogue's own. Run: python3 data/build_seo_copy.py
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
catalogue = json.loads((ROOT / "site/src/data/catalogue.json").read_text())

pages = {}  # url -> (name, rows)
for d in catalogue["departments"]:
    base = f"/catalogue/{d['slug']}"
    pages[base] = (d["name"], d["rows"])
    for c in d["categories"]:
        pages[f"{base}/{c['slug']}"] = (c["name"], c["rows"])
        for s in c.get("subs", []):
            pages[f"{base}/{c['slug']}/{s['slug']}"] = (s["name"], s["rows"])

# Map rows whose page name differs from the catalogue's, matched by hand
OVERRIDES = {
    "/catalogue/plumbing/pipe-fittings/underground-110mm": "/catalogue/plumbing/pipe-fittings/underground-fittings-110mm",
    "/catalogue/plumbing/pipe-fittings/soil-vent": "/catalogue/plumbing/pipe-fittings/soil-vent-fittings",
    "/catalogue/solar-backup-power/kits-packages": "/catalogue/solar-backup-power/kits-backup-power-packages",
}
# Map rows for pages the catalogue does not have (no surge protection sub-category exists): skipped on purpose
NO_PAGE = {"/catalogue/electrical/circuit-protection/surge-protection"}

norm = lambda s: re.sub(r"[^a-z0-9]+", " ", s.lower().replace("&", "and")).strip()
sheet = openpyxl.load_workbook(ROOT / "Empire-SEO-Keyword-Map.xlsx")["Departments & categories"]
rows = list(sheet.iter_rows(values_only=True))[1:]

out, notes, unmatched = {}, [], []
for r in rows:
    level, url, name, _kw, _sec, _local, title, _tl, h1, desc, _dl, question, priority = r[:13]
    if level == "Department" or not url:
        continue  # department copy is hand-written in site/src/lib/seo.ts
    if url in NO_PAGE:
        notes.append(f"no such page in the catalogue, skipped: {url}")
        continue
    real = url if url in pages else OVERRIDES.get(url)
    if not real:
        parent = url.rsplit("/", 1)[0]
        real = next((u for u, (n, _) in pages.items() if u.rsplit("/", 1)[0] == parent and norm(n) == norm(name)), None)
        # the map shortened category slugs, so a sub-category's parent may differ too: match on the last two names
        if not real and url.count("/") == 4:
            real = next((u for u, (n, _) in pages.items() if u.count("/") == 4 and u.split("/")[2] == url.split("/")[2] and norm(n) == norm(name)), None)
    if not real:
        unmatched.append(url)
        continue
    if real != url:
        notes.append(f"{url} -> {real}")
    if len(title) > 60:
        notes.append(f"title over 60 characters ({len(title)}): {real}")
    if h1 and norm(h1) != norm(pages[real][0]):
        notes.append(f"H1 differs from page name: {real}: {h1!r} vs {pages[real][0]!r}")
    # a count quoted in the description ("283 Geo HDPE ...") must match the catalogue
    m = re.match(r"(\d[\d,]*) ", desc)
    if m and int(m.group(1).replace(",", "")) != pages[real][1]:
        notes.append(f"count in description changed {m.group(1)} -> {pages[real][1]}: {real}")
        desc = f"{pages[real][1]} " + desc[m.end():]
    out[real] = {"title": title, "description": desc, "question": question, "priority": priority}

(ROOT / "site/src/data/category-seo.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
print(f"{len(out)} pages written; {len(notes)} notes; {len(unmatched)} unmatched")
for n in notes:
    print("  ", n)
for u in unmatched:
    print("   UNMATCHED", u)
sys.exit(1 if unmatched else 0)
