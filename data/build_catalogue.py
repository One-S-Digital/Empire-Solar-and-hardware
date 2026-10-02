#!/usr/bin/env python3
"""Phase 2: supplier workbook -> store-wide catalogue.

Reads  supplier-catalogue.xlsx, data/taxonomy.csv, data/mapping.csv, data/keyword_rules.csv
Writes site/src/data/catalogue.json   (what the front end reads until WordPress is connected)
       data/out/report.md             (checks and review lists)
       data/out/mapping-summary.csv   (every supplier path and where its products landed)
       data/out/families-without-photo.csv
Copies the Geo photos that are referenced into site/public/products/.

Website Plan 6.4 (mapping) and SEO plan 3.2 (one page per product family, not per code).
Run:  python3 data/build_catalogue.py
"""
import csv
import json
import re
import shutil
import sys
import unicodedata
from collections import Counter, OrderedDict, defaultdict
from datetime import date
from pathlib import Path

import openpyxl
from PIL import Image

from sizes import split_sized

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = DATA / "out"
SITE_DATA = ROOT / "site" / "src" / "data"
SITE_PRODUCTS = ROOT / "site" / "public" / "products"

# A row is only grouped into a family when its name has an explicit family/variant separator.
SEP = re.compile(r"\s+[–|]\s+")
TRIVIAL_DETAILS = re.compile(r"^(Pack qty \d+.*|\d+ variants?|Same SKU as another Solar Shop listing)$", re.I)
SIZE = re.compile(r"\b\d+(?:[.,]\d+)?\s?mm\b", re.I)


def slugify(text: str) -> str:
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def clean(v) -> str:
    return re.sub(r"\s+", " ", str(v)).strip() if v is not None else ""


def compact(d: dict) -> dict:
    return {k: v for k, v in d.items() if v not in (None, "", [], False)}


# ---------------------------------------------------------------- taxonomy
def load_taxonomy():
    depts: "OrderedDict[str, dict]" = OrderedDict()
    for r in csv.DictReader(open(DATA / "taxonomy.csv", newline="")):
        d = depts.setdefault(r["department"], dict(slug=r["dept_slug"], name=r["department"], cats=OrderedDict()))
        c = d["cats"].setdefault(r["category"], dict(slug=slugify(r["category"]), name=r["category"], subs=OrderedDict()))
        if r["subcategory"]:
            s = slugify(r["subcategory"])
            if s in {x["slug"] for x in c["subs"].values()}:
                sys.exit(f"Duplicate sub-category slug {s} in {r['category']}")
            c["subs"][r["subcategory"]] = dict(slug=s, name=r["subcategory"])
    for d in depts.values():
        slugs = [c["slug"] for c in d["cats"].values()]
        if len(slugs) != len(set(slugs)):
            sys.exit(f"Duplicate category slug in {d['name']}")
    return depts


def check_node(depts, dept, cat, sub, where):
    if dept not in depts or cat not in depts[dept]["cats"]:
        sys.exit(f"{where}: {dept} > {cat} is not in taxonomy.csv")
    if sub and sub not in depts[dept]["cats"][cat]["subs"]:
        sys.exit(f"{where}: {dept} > {cat} > {sub} is not in taxonomy.csv")


# ---------------------------------------------------------------- main
def main():
    depts = load_taxonomy()

    mapping = {}
    for r in csv.DictReader(open(DATA / "mapping.csv", newline="")):
        check_node(depts, r["department"], r["category"], r["subcategory"], f"mapping.csv {r['supplier']}/{r['supplier_category']}")
        mapping[(r["supplier"], r["supplier_category"], r["supplier_subcategory"])] = r

    rules = defaultdict(list)
    for i, r in enumerate(csv.DictReader(open(DATA / "keyword_rules.csv", newline=""))):
        check_node(depts, r["department"], r["category"], r["subcategory"], f"keyword_rules.csv rule {i + 2}")
        rules[r["ruleset"]].append(dict(rx=re.compile(r["pattern"], re.I), **r))
    for m in mapping.values():
        if m["rules"] and m["rules"] not in rules:
            sys.exit(f"mapping.csv refers to unknown ruleset {m['rules']}")

    wb = openpyxl.load_workbook(ROOT / "supplier-catalogue.xlsx", read_only=True)
    source = list(wb["Products"].iter_rows(min_row=2, values_only=True))
    source_counts = Counter(r[0] for r in source)

    # ---- classify every row
    rows = []
    unmapped = []
    rule_hits = Counter()
    fallbacks = defaultdict(list)
    for n, r in enumerate(source, start=2):  # n = Excel row number
        supplier, _dept, scat, ssub, name, sku, also, details, src_url, image, _x = r
        scat, ssub, name = clean(scat), clean(ssub), clean(name)
        mp = mapping.get((supplier, scat, ssub))
        if not mp:
            unmapped.append((n, supplier, scat, ssub))
            continue
        dept, cat, sub, power = mp["department"], mp["category"], mp["subcategory"], mp["power_source"]
        if mp["rules"]:
            for rule in rules[mp["rules"]]:
                if rule["rx"].search(name):
                    dept, cat, sub = rule["department"], rule["category"], rule["subcategory"]
                    power = rule["power_source"] or power
                    rule_hits[(mp["rules"], rule["pattern"])] += 1
                    break
            else:
                fallbacks[mp["rules"]].append(name)
        base_name, label = split_name(name)
        grouping = mp["grouping"]  # "sizes" or "name" turn on grouping for names with no explicit separator
        if not label and grouping == "sizes":
            base_name, label = split_sized(name)
        codes = [c.strip() for c in clean(sku).split(",") if c.strip()] if sku else []
        img = clean(image)
        local_img = Path(img).name if img and not img.startswith("http") else ""
        rows.append(dict(
            n=n, supplier=supplier, brand=mp["brand"], dept=dept, cat=cat, sub=sub, range=mp["range"], power=power,
            name=name, base=base_name, label=label, group=bool(label) or grouping in ("sizes", "name"),
            grouping=grouping, codes=codes,
            details=clean(details), image_local=local_img, image_url=img if img.startswith("http") else "",
            also=clean(also), src_path=(scat, ssub), supplier_codes={},
        ))
    if unmapped:
        sys.exit("UNMAPPED ROWS: " + repr(unmapped[:10]))

    # ---- SKU fixes (data/sku_fixes.csv): typos, new SKUs for clashes, and products listed twice
    rows_by_n = {r["n"]: r for r in rows}
    fixes = list(csv.DictReader(open(DATA / "sku_fixes.csv", newline="")))
    merge_into = {}
    for fx in fixes:
        row = rows_by_n.get(int(fx["row"]))
        if row is None or row["supplier"] != fx["supplier"] or row["name"] != clean(fx["expected_name"]):
            sys.exit(f"sku_fixes.csv row {fx['row']}: the workbook no longer has '{fx['expected_name']}' there")
        if fx["action"] in ("fix-typo", "new-sku"):
            if row["codes"].count(fx["old_code"]) != 1:
                sys.exit(f"sku_fixes.csv row {fx['row']}: code {fx['old_code']} not found")
            row["codes"] = [fx["new_code"] if c == fx["old_code"] else c for c in row["codes"]]
            if fx["action"] == "new-sku":
                row["supplier_codes"][fx["new_code"]] = fx["old_code"]
        elif fx["action"] == "merge":
            keep = rows_by_n[int(fx["into_row"])]
            if keep["supplier"] != row["supplier"]:
                sys.exit(f"sku_fixes.csv row {fx['row']}: can only merge rows from the same supplier")
            merge_into[row["n"]] = keep["n"]
        else:
            sys.exit(f"sku_fixes.csv: unknown action {fx['action']}")
    keep_rows = set(merge_into.values())

    # ---- group into families
    def family_key(row):
        if row["group"]:
            return (row["supplier"], row["brand"], row["dept"], row["cat"], row["base"].lower())
        if row["codes"]:
            return (row["supplier"], row["brand"], row["dept"], row["cat"], row["base"].lower(), tuple(row["codes"]))
        return (row["supplier"], row["brand"], row["dept"], row["cat"], row["base"].lower(), row["n"])

    families: "OrderedDict[tuple, dict]" = OrderedDict()
    merged_duplicates = []
    unresolved_also = Counter()
    for row in rows:
        key = family_key(rows_by_n[merge_into.get(row["n"], row["n"])])
        fam = families.get(key)
        if fam is None:
            fam = families[key] = dict(row=row, rows=[], variants=OrderedDict(), merged=[])
        if row["n"] in keep_rows:
            fam["row"] = row  # the kept row names and files the family, even if a merged row came first
        if row["n"] in merge_into:
            fam["merged"].append(row)
        fam["rows"].append(row["n"])
        codes = row["codes"] or [None]
        stated = None
        m = re.match(r"^(\d+) variants?$", row["details"])
        if m:
            stated = int(m.group(1))
        for code in codes:
            vkey = code if code else f"_row{row['n']}"
            if vkey in fam["variants"]:
                merged_duplicates.append((row["supplier"], row["name"], code, row["n"]))
                continue
            size = SIZE.search(row["label"] or row["base"])
            fam["variants"][vkey] = compact(dict(
                code=code,
                label=row["label"],
                size=re.sub(r"\s", "", size.group(0)).lower() if size else "",
                packQty=int(pm.group(1)) if (pm := re.search(r"Pack qty (\d+)", row["details"])) else None,
                prePacked=bool(code and code.endswith("_PP")) or "branded barcoded bag" in row["details"],
                details=row["details"] if row["details"] and not re.match(r"^Pack qty \d+; Packed in branded barcoded bag$|^Pack qty \d+$", row["details"]) else "",
                statedVariants=stated,
                supplierCode=row["supplier_codes"].get(code),
            ))

    # ---- slugs and tier
    dept_order = {d: i for i, d in enumerate(depts)}
    ordered = sorted(families.values(), key=lambda f: (
        dept_order[f["row"]["dept"]], f["row"]["cat"], f["row"]["sub"], f["row"]["base"].lower(), f["rows"][0]))
    used_slugs: set = set()
    out_families = []
    dup_codes = defaultdict(list)
    for i, fam in enumerate(ordered, start=1):
        row = fam["row"]
        brand_slug = slugify(row["brand"])
        name_slug = slugify(row["base"])
        slug = name_slug if name_slug.startswith(brand_slug) else f"{brand_slug}-{name_slug}"
        slug = slug[:80].rstrip("-") or f"product-{i}"
        if slug in used_slugs:
            first_code = next((v.get("code") for v in fam["variants"].values() if v.get("code")), None)
            slug = f"{slug[:70].rstrip('-')}-{slugify(first_code)}" if first_code else f"{slug[:70].rstrip('-')}-{i}"
            base_slug, k = slug, 2
            while slug in used_slugs:
                slug, k = f"{base_slug}-{k}", k + 1
        used_slugs.add(slug)

        variants = list(fam["variants"].values())
        for v in variants:
            if v.get("code"):
                dup_codes[v["code"]].append((row["supplier"], row["base"]))
        has_image = bool(row["image_local"] or row["image_url"])
        has_specs = any(v.get("details") and not TRIVIAL_DETAILS.match(v["details"]) for v in variants)
        also = resolve_also(row, mapping, depts, unresolved_also)
        aka = []
        for other in fam["merged"]:
            if other["name"].lower() != row["name"].lower() and other["name"] not in aka:
                aka.append(other["name"])
            for place in [place_of(other, depts)] + resolve_also(other, mapping, depts, unresolved_also):
                if place[:2] != [depts[row["dept"]]["slug"], depts[row["dept"]]["cats"][row["cat"]]["slug"]] and place not in also:
                    also.append(place)
        out_families.append(compact(dict(
            id=f"f{i:05d}", slug=slug, name=row["base"], brand=row["brand"], brandSlug=brand_slug,
            supplier=row["supplier"],
            dept=depts[row["dept"]]["slug"], cat=depts[row["dept"]]["cats"][row["cat"]]["slug"],
            sub=depts[row["dept"]]["cats"][row["cat"]]["subs"][row["sub"]]["slug"] if row["sub"] else "",
            also=also, aka=aka,
            tier="B" if (has_image or has_specs) else "C",
            image=f"/products/{row['image_local']}" if row["image_local"] else "",
            imageSize=image_size(row["image_local"]) if row["image_local"] else None,
            imageUrl=row["image_url"],
            range=row["range"], powerSource=row["power"],
            variants=variants, rows=fam["rows"],
        )))

    # Rows that were grouped by the size parser or by exact name, for the review sheet
    review = []
    for f in out_families:
        src = [rows_by_n[n] for n in f["rows"]]
        modes = {r["grouping"] for r in src if r["grouping"]}
        if modes and len(f["rows"]) > 1:
            review.append(dict(
                supplier=f["supplier"], path=" > ".join(x for x in place_names(f, depts) if x), family=f["name"],
                mode="/".join(sorted(modes)), rows=len(f["rows"]), variants=len(f["variants"]),
                examples=" | ".join((v.get("label") or v.get("code") or "") for v in f["variants"][:4])))

    # ---- checks
    seen_codes = defaultdict(list)
    for f in out_families:
        for v in f["variants"]:
            if v.get("code"):
                seen_codes[v["code"].lower()].append(f["name"])
    clashes = {c: n for c, n in seen_codes.items() if len(n) > 1}
    if clashes:
        sys.exit("Codes still used more than once (add a row to data/sku_fixes.csv): " + repr(clashes))
    all_rows = sorted(n for f in out_families for n in f["rows"])
    assert all_rows == list(range(2, len(source) + 2)), "every source row must land in exactly one family"
    per_supplier = Counter()
    sup_by_row = {n: r[0] for n, r in enumerate(source, start=2)}
    for f in out_families:
        for n in f["rows"]:
            per_supplier[sup_by_row[n]] += 1
    assert per_supplier == source_counts, "per-supplier row counts must match the workbook"

    # ---- counts for the tree
    tree_rows, tree_fams = Counter(), Counter()
    slug_to_names = {}
    for d in depts.values():
        for c in d["cats"].values():
            slug_to_names[(d["slug"], c["slug"], "")] = (d["name"], c["name"], "")
            for s in c["subs"].values():
                slug_to_names[(d["slug"], c["slug"], s["slug"])] = (d["name"], c["name"], s["name"])
    for f in out_families:
        # A family counts once at each level it appears at, home place and cross-listings alike,
        # so a tile's number is the number its listing page shows.
        levels = set()
        for d_slug, c_slug, s_slug in [[f["dept"], f["cat"], f.get("sub", "")]] + f.get("also", []):
            levels.add((d_slug,))
            levels.add((d_slug, c_slug))
            if s_slug:
                levels.add((d_slug, c_slug, s_slug))
        for level in levels:
            tree_rows[level] += len(f["rows"])
            tree_fams[level] += 1
    departments = []
    for d in depts.values():
        cats = []
        for c in d["cats"].values():
            subs = [dict(slug=s["slug"], name=s["name"], rows=tree_rows[(d["slug"], c["slug"], s["slug"])],
                         families=tree_fams[(d["slug"], c["slug"], s["slug"])]) for s in c["subs"].values()]
            cats.append(compact(dict(slug=c["slug"], name=c["name"], rows=tree_rows[(d["slug"], c["slug"])],
                                     families=tree_fams[(d["slug"], c["slug"])], subs=subs)))
        departments.append(dict(slug=d["slug"], name=d["name"], rows=tree_rows[(d["slug"],)],
                                families=tree_fams[(d["slug"],)], categories=cats))
    brand_rows, brand_fams, brand_names = Counter(), Counter(), {}
    for f in out_families:
        brand_rows[f["brandSlug"]] += len(f["rows"])
        brand_fams[f["brandSlug"]] += 1
        brand_names[f["brandSlug"]] = f["brand"]
    brands = sorted(
        (dict(slug=s, name=brand_names[s], rows=brand_rows[s], families=brand_fams[s]) for s in brand_names),
        key=lambda b: -b["rows"])

    catalogue = dict(
        generated=date.today().isoformat(),
        totals=dict(rows=len(source), families=len(out_families), suppliers=len(source_counts), brands=len(brands)),
        departments=departments, brands=brands, families=out_families,
    )
    SITE_DATA.mkdir(parents=True, exist_ok=True)
    (SITE_DATA / "catalogue.json").write_text(json.dumps(catalogue, ensure_ascii=False, separators=(",", ":")))

    # ---- photos
    SITE_PRODUCTS.mkdir(parents=True, exist_ok=True)
    copied = 0
    for name in {r["image_local"] for r in rows if r["image_local"]}:
        src = ROOT / "geo-images" / name
        dst = SITE_PRODUCTS / name
        if not dst.exists() or dst.stat().st_size != src.stat().st_size:
            shutil.copy2(src, dst)
            copied += 1

    write_outputs(depts, rows, out_families, catalogue, source_counts, merged_duplicates, fixes,
                  rule_hits, fallbacks, rules, slug_to_names, copied, mapping, rows_by_n, unresolved_also, review)
    print(f"{len(source)} rows -> {len(out_families)} families, {len(brands)} brands. Report: data/out/report.md")


_SIZES: dict = {}


def image_size(name: str):
    """Natural pixel size, so the front end can reserve space and never enlarge a small photo."""
    if name not in _SIZES:
        with Image.open(ROOT / "geo-images" / name) as im:
            _SIZES[name] = list(im.size)
    return _SIZES[name]


def split_name(name: str):
    parts = SEP.split(name, maxsplit=1)
    base = parts[0].strip()
    label = SEP.sub(", ", parts[1]).strip() if len(parts) > 1 else ""
    return base, label


def place_names(fam, depts):
    """Department, category and sub-category names for a family built by main() (slugs back to names)."""
    for d in depts.values():
        if d["slug"] == fam["dept"]:
            for c in d["cats"].values():
                if c["slug"] == fam["cat"]:
                    sub = next((s["name"] for s in c["subs"].values() if s["slug"] == fam.get("sub")), "")
                    return d["name"], c["name"], sub
    return "", "", ""


def place_of(row, depts):
    d = depts[row["dept"]]
    c = d["cats"][row["cat"]]
    return [d["slug"], c["slug"], c["subs"][row["sub"]]["slug"] if row["sub"] else ""]


def resolve_also(row, mapping, depts, unresolved=None):
    """'Also listed in' is written in the supplier's own category words. Only an exact supplier path
    (category, or category > sub-category) that exists in mapping.csv counts: a near match would file
    the product somewhere it does not belong. Rows the workbook marks 'Category corrected' are skipped,
    because the listing it points at is the one that was wrong."""
    text = row["also"]
    if not text or "category corrected" in row["details"].lower():
        return []
    found = []
    for part in (p.strip() for p in text.split(";")):
        scat, _, ssub = (x.strip() for x in part.partition(">"))
        mp = mapping.get((row["supplier"], scat, ssub))
        if not mp:
            if unresolved is not None:
                unresolved[(row["supplier"], part)] += 1
            continue
        d = depts[mp["department"]]
        c = d["cats"][mp["category"]]
        triple = [d["slug"], c["slug"], c["subs"][mp["subcategory"]]["slug"] if mp["subcategory"] else ""]
        home = depts[row["dept"]]
        primary = [home["slug"], home["cats"][row["cat"]]["slug"]]
        if triple[:2] != primary and triple not in found:
            found.append(triple)
    return found


def write_outputs(depts, rows, fams, cat, source_counts, merged, fixes, rule_hits, fallbacks, rules,
                  slug_to_names, copied, mapping, rows_by_n, unresolved_also, review):
    OUT.mkdir(exist_ok=True)
    fam_by_supplier = Counter(f["supplier"] for f in fams)
    tier = Counter(f["tier"] for f in fams)
    no_photo = [f for f in fams if not f.get("image") and not f.get("imageUrl")]
    multi_fam = sum(1 for f in fams if len(f["variants"]) > 1)
    stated_gap = [(f["name"], f["supplier"], len(f["variants"]), max(v.get("statedVariants", 0) for v in f["variants"]))
                  for f in fams if any(v.get("statedVariants") for v in f["variants"])
                  and max(v.get("statedVariants", 0) for v in f["variants"]) > len(f["variants"])]
    names_by_brand = defaultdict(Counter)
    for f in fams:
        names_by_brand[f["brand"]][f["name"].lower()] += 1
    repeated_names = sum(1 for b in names_by_brand.values() for n, k in b.items() if k > 1)

    sup_order = [s for s, _ in source_counts.most_common()]
    L = []
    w = L.append
    w("# Catalogue build report")
    w(f"\nGenerated {cat['generated']} by `data/build_catalogue.py`. Source: `supplier-catalogue.xlsx`.\n")
    w("## Checks (Website Plan, phase 2 'done when')\n")
    w(f"- Source rows: **{cat['totals']['rows']:,}**. Rows placed in exactly one family: **{cat['totals']['rows']:,}**. Unmapped rows: **0**.")
    w("- Per-supplier row counts match the workbook (asserted by the script; it stops if they don't).")
    w(f"- Product families: **{len(fams):,}** (SEO plan estimated about 2,800). Families with more than one code: {multi_fam:,}.")
    w(f"- Duplicate source rows merged into one variant (same family, same code): **{len(merged)}**.")
    w(f"- Every code is unique, ignoring upper and lower case (asserted by the script). {len(fixes)} fixes from `sku_fixes.csv` were applied (see below).")
    w(f"- Geo photos copied to `site/public/products/`: {copied} new files.\n")
    w("| Supplier | Workbook rows | Families |\n|---|---:|---:|")
    for s in sup_order:
        w(f"| {s} | {source_counts[s]:,} | {fam_by_supplier[s]:,} |")
    w(f"| **Total** | **{sum(source_counts.values()):,}** | **{len(fams):,}** |\n")

    w("## Departments\n")
    w("| Department | Rows | Families | Categories |\n|---|---:|---:|---:|")
    for d in cat["departments"]:
        w(f"| {d['name']} | {d['rows']:,} | {d['families']:,} | {len(d['categories'])} |")
    w("")
    empty = [(d["name"], c["name"]) for d in cat["departments"] for c in d["categories"] if not c["rows"]]
    w(f"Empty categories (defined in the plan but no products yet): {len(empty)}" + (": " + "; ".join(f"{a} > {b}" for a, b in empty) if empty else "") + "\n")

    w("## Indexing tiers (SEO plan 3.3, applied to product families)\n")
    w(f"- Tier B (has a photo or real specs, indexed): **{tier['B']:,}**")
    w(f"- Tier C (no photo and no specs, `noindex, follow` until enriched): **{tier['C']:,}**")
    w(f"- Families with no photo at all: **{len(no_photo):,}** (full list in `families-without-photo.csv`)")
    w(f"- Brand names shared by more than one family with the same product name (need a spec added to the name before they can be indexed): **{repeated_names}**\n")

    w("## Changes to the plan's category list\n")
    w("The plan's section 6.3 list was followed. These were added because real products had no home:\n")
    for r in csv.DictReader(open(DATA / "taxonomy.csv", newline="")):
        if r["note"]:
            w(f"- **{r['department']} > {r['category']}**: {r['note'].replace('Added in build: ', '')}")
    w("- Sub-categories added under Valves (Ball, Gate, Angle, Float, Check, Stopcocks, Washing Machine) so the SEO plan's `/valves/ball-valves` page exists.\n")

    w("## Keyword rules (Ingco, Wadfow, AirCraft 'other', Geo valves, some paints)\n")
    w("Rows that matched no rule fall to the catch-all set in `mapping.csv`. Review these lists and sort any you disagree with by editing `keyword_rules.csv`.\n")
    for rs, names in sorted(fallbacks.items()):
        w(f"### `{rs}`: {len(names)} fell to the default ({len(set(names))} distinct names)\n")
        w(", ".join(sorted(set(names), key=str.lower)[:60]) + (" ..." if len(set(names)) > 60 else "") + "\n")

    w("## SKU fixes (`sku_fixes.csv`)\n")
    w("Change a row's action there and rebuild to overrule it. The script stops if the workbook no longer matches a row.\n")
    w("| Action | Supplier | Row | Product | Change | Why |\n|---|---|---:|---|---|---|")
    for fx in fixes:
        change = f"`{fx['old_code']}` to `{fx['new_code']}`" if fx["action"] != "merge" else f"folded into row {fx['into_row']} ({rows_by_n[int(fx['into_row'])]['name']})"
        w(f"| {fx['action']} | {fx['supplier']} | {fx['row']} | {fx['expected_name']} | {change} | {fx['reason']} |")
    w("")
    grouped = [x for x in review]
    w("## Families made by grouping size variants and identical names\n")
    w(f"`data/sizes.py` takes sizes, threads and pack words out of names (mapping.csv `grouping` = `sizes`: AirCraft fittings, Ruwag Harden), "
      f"and Ingco rows with an identical name become one family (`name`). {len(grouped)} families now hold more than one row; "
      "the full list is in `family-grouping-review.csv`. Check the biggest and any you doubt.\n")
    w("| Family | Supplier | Rows | Examples |\n|---|---|---:|---|")
    for x in sorted(grouped, key=lambda x: -x["rows"])[:12]:
        w(f"| {x['family']} | {x['supplier']} | {x['rows']} | {x['examples'][:80]} |")
    w("")
    w("## Variants the workbook says exist but does not list\n")
    w("Ruwag rows say '5 variants' but list only the first 3 codes. The family page can show only the codes we have.\n")
    w(f"- Families affected: **{len(stated_gap)}**")
    for n, s, have, stated in stated_gap[:12]:
        w(f"  - {s}: {n} (has {have} codes, says {stated})")
    w("")
    if merged:
        w("## Duplicate rows merged\n")
        for s, n, c, rn in merged:
            w(f"- {s}: {n} (`{c}`, row {rn})")
        w("")
    w("## Other data notes\n")
    upper = sum(1 for f in fams if f["name"].isupper())
    w(f"- {upper} family names are ALL CAPS (WACO). The front end needs a display pass that title-cases them and keeps acronyms.")
    w(f"- 'Also listed in' cross-listings resolved into a second category for {sum(1 for f in fams if f.get('also')):,} families. {sum(unresolved_also.values()):,} entries were not used because the supplier's words are not one of its own category paths (mostly Ruwag's second Harden set: {', '.join(f'{p} x{n}' for (_, p), n in unresolved_also.most_common(4))}).")
    w("- **No electric fence energizers exist in the workbook.** The 'ENERGIZER' rows under WACO Security are Energizer-brand batteries, chargers and torches (now in Electrical > Batteries & Torches). The SEO plan lists fence energizers as a priority category.\n")
    (OUT / "report.md").write_text("\n".join(L))

    with open(OUT / "family-grouping-review.csv", "w", newline="") as fh:
        wr = csv.writer(fh)
        wr.writerow(["supplier", "category", "family", "grouped_by", "rows", "variants", "first_variants"])
        for x in sorted(review, key=lambda x: (x["supplier"], x["path"], x["family"].lower())):
            wr.writerow([x["supplier"], x["path"], x["family"], x["mode"], x["rows"], x["variants"], x["examples"]])

    with open(OUT / "families-without-photo.csv", "w", newline="") as fh:
        wr = csv.writer(fh)
        wr.writerow(["supplier", "brand", "department", "category", "family", "codes"])
        for f in no_photo:
            wr.writerow([f["supplier"], f["brand"], slug_to_names[(f["dept"], f["cat"], "")][0],
                         slug_to_names[(f["dept"], f["cat"], "")][1], f["name"],
                         " ".join(v["code"] for v in f["variants"] if v.get("code"))])

    # where each supplier path landed, for the client to review as a spreadsheet
    landed = Counter()
    for r in rows:
        landed[(r["supplier"], r["src_path"][0], r["src_path"][1], r["dept"], r["cat"], r["sub"])] += 1
    with open(OUT / "mapping-summary.csv", "w", newline="") as fh:
        wr = csv.writer(fh)
        wr.writerow(["supplier", "supplier_category", "supplier_subcategory", "department", "category", "subcategory", "products"])
        for k, v in sorted(landed.items()):
            wr.writerow([*k, v])


if __name__ == "__main__":
    main()
