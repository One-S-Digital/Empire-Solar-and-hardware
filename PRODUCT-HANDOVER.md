# Empire Solar & Hardware: product data handover

Written 2 Oct 2026. This covers the **supplier product and category data** (the first job on this project). For the website build see `HANDOVER.md`; for the plan see `Empire-Website-Plan.md`.

## 1. The task and where it stands

**Brief (Dj, WhatsApp, 29 Sep 2026):** the client has many suppliers. Identify all the products and categories from each, so they can be listed on the new website. Suppliers named: Ruwag, Geo Plumbing, WACO, Five-star Solar, Hanchu ESS, Sun Sunk, Deye, Luxpower, Wadfow, Ingco; paints Promac, Africa Paints, Duram, Flash Harry. URLs given: ruwag.co.za, wacoelec.co.za, geosales.co.za, aircraftair.com, ingco.co.za, wadfow.com/tn-en.

**Result:** `supplier-catalogue.xlsx`, **6,319 products from 15 suppliers**, plus `geo-images/` (537 photos). The website pipeline (`data/build_catalogue.py`) reads this workbook, so it is the source of truth for all product data.

**Not finished:** 97 products (1.5%) still have no image link. See section 6.

## 2. What is in the folder

| Item | What it is |
|---|---|
| `supplier-catalogue.xlsx` | The catalogue. Sheets: **Summary** (one row per supplier: source, coverage, notes), **Products** (one row per product), **Category Tree** (supplier categories with counts), **Notes & Gaps** |
| `geo-images/` | 537 JPG photos cut from Geo's PDF catalogue, named after the first SKU on each product card. The Products sheet points to them as `geo-images/<file>` |
| `data/` | The website's catalogue pipeline (not part of this task, but it consumes the workbook). Its `data/out/` reports show how the workbook rows became product families |

Products sheet columns: Supplier, Department, Category, Sub-category, Product / Model, SKU / Code, Also listed in, Details, Source URL, Image (URL or local file), and a hidden helper column `xkey` that the Category Tree's cross-listing counts use.

Category counts on the Category Tree and Summary sheets are live `COUNTIFS` formulas on the Products sheet. They were never recalculated by a spreadsheet engine (LibreOffice was not installed); the file is set to recalculate when opened. I checked the formula logic separately in Python: every supplier's top-level counts add up to its product total, and every product's category exists in the tree.

## 3. Supplier by supplier

Products are as of 29 Sep 2026. "Department" is the workbook's own grouping and is not the website's 9-department tree.

| Supplier | Products | Department | Source and method | Coverage |
|---|---:|---|---|---|
| Geo Plumbing | 1,850 | Plumbing | 2026 PDF catalogue (136 pages), text and photos extracted | Complete |
| WACO | 1,502 | Electrical & Lighting | Shop's public WooCommerce feed | Complete (6 hidden by the shop) |
| AirCraft (Vermont Sales) | 1,056 | Pneumatics & Air Tools | Category pages on aircraftair.com | Complete |
| Ruwag | 903 | Tools & Accessories | Shop's public Shopify feed | Complete |
| Ingco | 510 | Tools & Accessories | Shop's public WooCommerce feed | Complete |
| Wadfow | 105 | Tools & Accessories | Northern Bolt & Tool's Wadfow collection (a South African retailer) | One retailer's range |
| Promac | 96 | Paints & Waterproofing | Range pages on promacpaints.co.za | Names only |
| Five-star Solar (Fivestar LED) | 84 | Solar & Energy Storage | Fivestar LED category pages | Partial, agreed |
| Duram | 68 | Paints & Waterproofing | WooCommerce feed plus its category taxonomy | Complete |
| Sunsynk | 43 | Solar & Energy Storage | Solar Shop (a South African retailer) | One retailer's range |
| Flash Harry | 37 | Paints & Waterproofing | Product data embedded in flashharry.co.za/products | Complete |
| Africa Paints | 29 | Paints & Waterproofing | Range pages on africapaints.co.za | Names, type, finish, pack sizes |
| Hanchu ESS | 20 | Solar & Energy Storage | Manufacturer site hanchuess.com, model lines typed in by hand | Global range, not individual SKUs |
| Deye | 10 | Solar & Energy Storage | Solar Shop | One retailer's range |
| Luxpower | 6 | Solar & Energy Storage | Solar Shop | One retailer's range |

### Quirks that matter per supplier

- **Ruwag** (Shopify). 27 collections silently returned nothing on the first pass (errors or rate limiting), so retry with back-off. The `tesa®` collection URL returned nothing, so tesa products are found by product type. 14 products sit in no collection and were placed by product type, tags or vendor (flagged in Details). The site keeps two overlapping Harden sub-category sets: the first is used, the second shows under "Also listed in". Blue Tack Nail is listed twice by Ruwag. Rows marked "N variants" list only the first 3 codes.
- **WACO** (WooCommerce). The category list hides empty categories unless you pass `hide_empty=false`; 11 menu categories are empty. Category counts total 1,508 but only 1,502 products are public; the other 6 are hidden by the shop.
- **Ingco** (WooCommerce). The 52 Power Tools came back with no categories in the product feed, so category membership was rebuilt by querying `?category=<id>` per category. The SKU field is empty; the code comes from "Code: ..." in the short description. 12 products sit in two categories. Names are generic ("Screwdriver Set"), so specs would have to come from each row's Source URL.
- **Wadfow.** The first attempt used the Tunisian regional site (660 products); the client replaced it with Northern Bolt's collection (105 products). Northern Bolt has no categories, so each product's category comes from Wadfow's own regional catalogues, matched by model code: 101 of 105 matched (97 Hand tools and 8 Power tools accessories in total once the other 4 were placed by name and flagged). Wadfow's API needs the headers `domain: www.wadfow.com/<region>`, `siteorigin: https://www.wadfow.com` and `lang: en_US`. The union of the 13 regional catalogues that returned products holds 4,727 SKUs. Image URLs are Northern Bolt's, not Wadfow's.
- **Geo.** Section starts were found from the PDF's own divider pages because the site menu's page numbers are out of date by up to 8 pages. The site menu lists "Small Spares" and "Pre Packed Ranges", which are not in the 2026 PDF; the PDF has an extra "Eternity Premium Range". `*` or a `_PP` suffix on a size means "packed in a branded barcoded bag". 1,882 catalogue rows are 1,850 distinct SKUs; 32 SKUs appear twice and are cross-listed. Sub-category is the catalogue's own heading (for example Brass Valves) or, for Taps & Mixer Ranges, the range name (Arctic, Cosmos, Lindi, Trinity, Nova, Shadow, Jabulani, Thulani). One photo serves every size on a product card.
- **AirCraft** (OpenCart). 15 category pages, including an "Air Tools" parent that repeats its sub-category items, so rows are de-duplicated by SKU (1,154 listings became 1,056 products).
- **Sunsynk, Deye, Luxpower** (Solar Shop, PrestaShop). Products come from three sources combined: the brand pages, the brand's own categories, and a name search across all 439 products in the shop. Product pages give the SKU and brand. 12 rows are filed by Solar Shop under another brand (kits, a Freedom Won cable, Eenovance "ex-Sunsynk" batteries) and are flagged "Filed under brand". Two Deye hybrid inverters were filed under batteries and portables; they are placed under Hybrid Inverters and flagged. Two Deye listings share one SKU. Categories are Solar Shop's product types, not its brand sub-categories.
- **Hanchu ESS.** Not sold by Solar Shop (its whole catalogue was checked), so this stays the manufacturer's global list.
- **Fivestar LED.** The site's friendly category pages return 404, so the category tree came from its VirtueMart category pages (ids 1 to 28). The 84 products are the ones that show in "selected for you" blocks. Obvious typos in category names were corrected (Pandents to Pendants, invertors to inverters, contollers to controllers, ferry to fairy).
- **Duram.** The feed lists 68 products but all as "Uncategorised"; categories come from its custom `product-explorer` taxonomy (Type for prep products, Application for paints). Flexemesh has no category on the site and was placed under Waterproofing (inferred).
- **Flash Harry.** Product data is JSON inside `<fh-product :product="...">` on `/products`. The site spells "Cementitous"; the workbook uses "Cementitious".
- **Promac and Africa Paints.** Read through a summarised page fetch, so Africa Paints in particular is worth a spot-check. Promac's brushware range is only a catalogue e-book, not itemised. Promac products sold in more than one range are listed once and cross-listed.

## 4. Decisions taken

| Decision | When |
|---|---|
| Geo's PDF may be downloaded; products and photos extracted | 29 Sep |
| Five-star Solar means Fivestar LED; use only the 84 products found | 29 Sep |
| "Sun Sunk" is Sunsynk | 29 Sep |
| Keep AirCraft (aircraftair.com) | 29 Sep |
| Wadfow comes from Northern Bolt & Tool's Wadfow collection | 29 Sep |
| Sunsynk, Deye and Luxpower rebuilt from Solar Shop, replacing the manufacturers' global lists | 29 Sep |
| Image and text reuse approved for all suppliers: the client buys direct from every one of them | 30 Sep (recorded in the project notes) |
| Prices and stock left out on purpose; the client sets their own | From the start |

## 5. Other known gaps

- **Ingco (9) and Wadfow (5)** have only flat top-level categories. `Empire-Website-Plan.md` section 6.3 proposes a tree; keyword sorting is in build phase 2 (`data/keyword_rules.csv`).
- **334 products have no code** (Promac, Fivestar, Duram, Flash Harry, Africa Paints, Hanchu). Codes were not invented, on purpose.
- **Fivestar LED** is incomplete because its listing pages are down. A price list or export from the supplier would fill the gap.
- **WACO's 6 hidden products** were not captured. Ask WACO whether they should be listed.
- **Geo's two missing sections** ("Small Spares", "Pre Packed Ranges"). Ask Geo which edition is current.
- **The solar brands** are one retailer's range, not necessarily everything the distributor could supply.

## 6. Missing product images

**Fixed on 2 Oct 2026 (mostly).** 1,398 products had no image; now **97 of 6,319** (1.5%) do. Image links were added to the workbook (a deliberate edit to the source; `README.md` says the pipeline itself never edits it) and `python3 data/build_catalogue.py` was re-run. Site families without a photo went from 716 to 92 (`data/out/families-without-photo.csv`). A backup of the workbook from before the edit was kept only in the session scratchpad.

| Supplier | Was | Added | Still none | How |
|---|---:|---:|---:|---|
| AirCraft | 1,056 | 1,048 | 8 | Category pages list each product with its photo (lazy `data-src`); matched on product URL. 7 were site placeholders, 1 had no match. Saved at 500 px |
| Duram | 68 | 68 | 0 | WooCommerce feed, matched on product URL |
| Flash Harry | 37 | 37 | 0 | `/products/<id>.png`, id taken from the embedded product JSON |
| Africa Paints | 29 | 29 | 0 | One photo per product on each range page, matched on name |
| Fivestar LED | 84 | 79 | 5 | Category pages' "selected for you" blocks, matched on product path |
| Promac | 96 | 40 | 56 | Range pages' galleries, matched on name. The Core range hub page shows range tiles, not products, so those 55 (plus a mine-marking spray) were left empty rather than given a wrong picture |
| Hanchu ESS | 20 | 0 | 20 | Not recovered: the CDN blocks hotlinking (needs a Referer header) and the product pages show feature icons, not product shots. Needs the manufacturer or distributor to supply photos |

Other products with no image: Ruwag 2, WACO 5, Wadfow 1 (unchanged).

**Images are now downloaded and shown on the site (2 Oct 2026).** `data/source/download_images.py` fetched 4,348 of the 4,350 distinct image links into `site/public/products/r/` as WebP, longest side 640 px, named by a hash of the URL (69 MB in total; AirCraft's image server was slow in bursts, so a run takes 15 to 25 minutes). It is resumable and writes `data/out/remote-images.json`, which `data/build_catalogue.py` reads to point each family at its local file (`/products/r/<hash>.webp`) with its real size. Result: 2,716 of 2,810 families have a photo. Two WACO links (`A0012562-2.png`, `A0012564-2.png`) were not valid images and keep their remote link. Checked on a production build in a scratch copy: category pages show the photos. To refresh after changing the workbook, run the downloader and then `build_catalogue.py`. These files are kept out of git (`.gitignore`, like `art/originals/`); `python3 data/source/download_images.py` rebuilds them, so run it on any fresh checkout or deploy before building the site.

The scripts used are in `data/source/` (`images_aircraft.py`, `images_duram_flashharry_africa.py`, `images_promac.py`); they read the workbook but expect their JSON outputs in the working folder, so treat them as record of method rather than a one-command refresh.

## 6b. Where the products live now

The 2,810 families are loaded into a local WooCommerce (`wordpress/`, Docker, http://localhost:8088) as variable products with their images in the media library, and the site reads them from there (see `README.md`, "Local WordPress / WooCommerce"). The workbook and `data/build_catalogue.py` stay the source: refresh a supplier, rebuild `catalogue.json`, run `wordpress/import.sh` (it updates in place, matched on the family id). The images in WordPress are the 640 px files from `site/public/products/r/`; for production, import full-size originals from the workbook links instead.

## 7. How to refresh a source

The scripts used are **not in this project**. They are in a temporary folder that may be cleared:

`/private/tmp/claude-501/-Users-misterjin-Hardware-site/734d7a19-81ac-4213-b5e5-c20ee7b3f1ad/scratchpad/`

| Script | Does |
|---|---|
| `scrape.py` | Ruwag (Shopify), Ingco and WACO (WooCommerce Store API) product pulls |
| `aircraft.py` | AirCraft category crawl |
| `fivestar.py` | Fivestar LED crawl |
| `geo_extract3.py` | Geo PDF extraction (add `--images` to export photos) |
| `wadfow.py`, `wadfow_union2.py` | Wadfow regional catalogue API and the SKU union |
| `solarshop.py`, `ss_cats.py`, `fetch_products.py` | Solar Shop brand pages, category crawl, product pages |
| `curated.py` | Hand-typed data (Promac, Africa Paints, Hanchu, Geo category list, Fivestar tree) |
| `build.py`, `patch_solar.py`, `verify.py` | Builds the workbook, switches the solar brands to Solar Shop, checks formula logic |

If the scripts are gone, the methods in section 3 are enough to redo the work. Worth copying the scripts into the project (for example `data/source/`) if the data will be refreshed.

**Lessons that save time:**
- The system Python has no certificate bundle; use `curl` for requests.
- Solar Shop throttles bursts: keep 1.5 to 3 seconds between requests and resume rather than retry in a hurry. PrestaShop resolves `index.php?controller=product&id_product=<id>` to the real product page.
- Before trusting a scrape, compare per-category counts with what the site publishes (this caught Ingco's 52 uncategorised products and WACO's 6 hidden ones). For the Geo PDF, the check was that the count of pack-quantity cells equals the count of SKU rows on every page.
- Do not spend effort on summarised page fetches for lists; prefer a feed, an API, or the raw HTML.
