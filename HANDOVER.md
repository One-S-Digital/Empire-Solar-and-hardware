# Empire Solar & Hardware website: handover

**Date:** 2 Oct 2026 (updated; first written 1 Oct)
**Build started:** 30 Sep 2026
**Plans:** `Empire-Website-Plan.md` (design and build, 14 phases), `Empire-SEO-GEO-Plan.md` (URLs, indexing, schema), `Empire-Design-Overhaul-Plan.md` (in progress: steps 1 to 4 of 8 done, see section 11)

---

## 1. Where everything is

| Path | What it is |
|---|---|
| `site/` | Next.js 16.3.7 front end (App Router, TypeScript, CSS Modules, React 19.3) |
| `site/src/app/` | Pages: `/`, `/catalogue`, `/catalogue/[department]`, `/[category]`, `/[sub]`, `/p/[slug]`, `/search`, `/search-index.json`, `/styleguide` |
| `site/src/components/` | Brand components (`AisleSign`, `Button`, `Docket`, `Gear`), `site/` (header, footer, tab bar, search box), `catalogue/` (tiles, cards, listing, filters) |
| `site/src/lib/` | `catalogue.ts` (data access: the one file to swap for WooCommerce), `search.ts` + `search-config.ts` + `synonyms.ts` (search), `filters.ts` + `list-page.ts` (listing filters), `store.ts` (store details), `seo.ts` (department titles and intros) |
| `site/src/data/catalogue.json` | Built catalogue (do not edit by hand) |
| `site/public/products/` | The 537 Geo photos, copied by the build script |
| `data/` | Catalogue pipeline: `build_catalogue.py`, `sizes.py` + `test_sizes.py`, and the four reviewable CSVs: `taxonomy.csv`, `mapping.csv`, `keyword_rules.csv`, `sku_fixes.csv` |
| `data/out/` | `report.md` (all checks), `mapping-summary.csv`, `family-grouping-review.csv`, `families-without-photo.csv` |
| `.claude/launch.json` | Dev server config for the Claude browser preview (port 3100) |
| `README.md` | Short run guide |
| `art/` | Image pipeline: prompts, generation and conversion scripts, the 114 originals (200 MB, not for git). See section 11 |
| `site/public/images/` | Generated WebP sets (banner, 4 feature tiles, 9 department covers) and `categories/` (100 category images) |
| `site/src/data/images.json`, `category-images.json` | Image manifests: alt text, sizes, file paths, model and prompt |
| `hf_client.py` | Copy of the Higgsfield API client. The scripts in `art/` use the one in `../Linsilk/` instead |

---

## 2. How to run

```bash
cd site && pnpm install
pnpm dev --port 3100          # http://localhost:3100
pnpm typecheck
pnpm build && pnpm start      # always check production too (section 7)
python3 data/build_catalogue.py   # rebuild the catalogue from the workbook and CSVs
python3 data/test_sizes.py        # size parser tests (10)
```

Tools on this machine: Node 24, pnpm 10, Python 3.12 with openpyxl and Pillow, Docker (running; the `ayla-*` containers belong to another project, leave them alone).

---

## 3. Status by build phase (Website Plan section 14)

| Phase | Status |
|---|---|
| 1. WordPress and hosting | **Not started.** Local build reads `catalogue.json` instead of WooCommerce. Render, Cloudflare and managed WordPress need the client's accounts |
| 2. Data import | **Mapping done and verified.** The WooCommerce import itself (WP-CLI, images) is not started |
| 3. Design system and logo | Done (`/styleguide`). Overhaul tokens, `SectionHeading` and `Reveal` added (section 11) |
| 4. Layout and navigation | Done: header, mega menu, mobile tab bar, footer. About, Contact and List links wait for their pages |
| 5. Catalogue | **Done and verified in production:** department, listing, filters, sort, grid/list, product family pages, search with synonyms and typo tolerance |
| 6. Enquiry list and forms | Not started |
| 7. Home, About, Contact, standard page | **Home reworked by the overhaul (steps 3 and 4).** About, Contact, privacy and the standard page are not started |
| 8. Motion and polish | Partly: hero entrance, `Reveal`, cover hover zoom exist. Overhaul step 6 covers the rest |
| 9. Staff handover | Not started |
| 10. QA and launch | Not started |

---

## 4. What the build does today

**Data (Phase 2):**
- 6,319 workbook rows become **2,810 product families**, matching the SEO plan's estimate of about 2,800.
- The tree has 9 departments, 100 categories and 17 brands.
- The build checks that every row lands in exactly one family, that per-supplier counts match the workbook, and that every code is unique ignoring case. It stops if any check fails.
- **Grouping** is set by the `grouping` column in `mapping.csv`:
  - `sizes` uses `sizes.py` for AirCraft fittings and Ruwag Harden ("10mm Combination Spanner" ×24 becomes one product).
  - `name` groups identical names (Ingco).
  - Blank means separate rows unless the name has an explicit `Family – Size` separator (Geo, part of WACO).
- **SKU fixes** (`sku_fixes.csv`, 10 rows) correct the codes without editing the workbook:
  - One new SKU: AirCraft `PTFE19` became `PTFE19-10M`, with the original kept as `supplierCode`.
  - Three typo fixes: `FBC45OFF`, `FBC 15/15/450MF_PP`, `SUN-20K-SG05LP3 -EU-SM2`.
  - Six merges where the supplier listed the same product twice (Ruwag ×5, Deye ×1).
- **Cross-listings:** 108 families also appear in a second category, from exact supplier paths only.

**Front end:**
- Pages are server components. Client code is limited to the header, mega menu, search box, filter panel, list controls, tab bar and variant table.
- **Search:**
  - MiniSearch, with categories shown first and products in a named category ranked above other matches.
  - Local-word synonyms ("geezer", "trip switch", "globe", "DB board", "load shedding", Afrikaans terms) and typo tolerance on words of five letters or more.
  - The instant dropdown loads `/search-index.json` (205 KB gzip) on first focus. The plan's test searches all pass: `RCSB18540`, "trip switch", "geezer", "sunsink", "15mm ball valve".
- **Filters:**
  - Filters are brand, size, power source and range, with counts; empty options are disabled rather than hidden.
  - State lives in the URL (`?brand=geo,ingco&size=15mm&sort=brand&view=list&page=2`), and grid or list is remembered in the cookie `empire_view`.
  - Filtered or sorted URLs get a canonical to the plain category and `noindex, follow`. On phones the filters are a bottom sheet.
- **Product pages:**
  - One page per family, with a variants table that has a "find a size or code" box for long tables.
  - `?code=X` highlights the row; the canonical always points at the family page.
  - Tier C families (no photo, no specs) get `noindex, follow`.
- **Counts:** "products" means orderable sizes and codes (rows, cross-listings included); cards are "listings" (families).

**Measured on 1 Oct 2026 (production build):**
- JavaScript is 180 to 183 KB gzip per page against the 250 KB budget.
- There is no sideways scroll at 320 or 390 px.
- The hero fits the first screen at 1366×768 and 390×844 (before the overhaul).

---

## 5. Decisions and who made them

| Decision | By |
|---|---|
| JavaScript budget raised from 150 KB to 250 KB (plan updated) | Client team, 1 Oct |
| Size parser and grouping; no extra products added | Client team, 1 Oct |
| Create new SKUs where needed | Client team, 30 Sep. Applied as 1 new SKU, 3 typo fixes, 6 merges (merging avoids phantom SKUs; flip a row in `sku_fixes.csv` to change it) |
| Order of work: size parser, then phase 5, then phase 6; local WordPress waits for hosting | Client team, 1 Oct |
| Design overhaul with Higgsfield imagery, overriding Website Plan 2.4 ("no AI images") | Client team, 1 Oct. In progress (section 11) |
| Image model: Marketing Studio via the Higgsfield API. Banner, features and covers at medium 2k; 100 category images at low 1k (about $1.50) | Client team asked for the lowest cost that still looks right, 1 and 2 Oct |
| Category tiles use generated art for every category, not Geo photos | Default, 2 Oct: photos on paper next to cinematic art looked inconsistent |
| Front end built on `catalogue.json` first, WooCommerce later | Default, 30 Sep |
| "Big Shoulders Display" is now "Big Shoulders" on Google Fonts (same face, optical-size axis) | Forced by Google Fonts |
| Added categories the data needed: Batteries & Torches, Garden & Cleaning, Other Power Tools, Tool Sets & Kits, Other Hand Tools, Valves sub-categories | Default, listed in `data/out/report.md` |
| WACO not size-grouped (its unsplit names are models and finishes, not sizes) | Default |
| Hero blocks to become department features, not specific products, once AI images are used (an AI image must never pose as a real product photo) | Proposed in the overhaul plan |

---

## 6. Data findings to raise with the client

- **No electric fence energizers exist in the workbook.** The "ENERGIZER" rows are Energizer-brand batteries and torches. The SEO plan treats fence energizers as a priority category.
- **Ruwag "N variants" rows list only the first 3 codes** (190 families affected before grouping). Product pages say so and ask the customer to check at the counter.
- **Ingco names are generic.** "Screwdriver Set" now holds 15 codes with nothing to tell them apart. Specs from Ingco's product pages (each row has its own URL) would fix this.
- **334 products have no code** (Promac, Fivestar, Duram, Flash Harry, Africa Paints, Hanchu). They were left without invented SKUs on purpose.
- **Only the 537 Geo photos are local.** The other supplier photos come with the WooCommerce import.

---

## 7. Gotchas (read before changing code)

1. **Test production, not only dev.** A product page that read `searchParams` worked in dev but returned HTTP 500 (`DYNAMIC_SERVER_USAGE`) in production, because `/p/[slug]` is pre-rendered. Never read `searchParams` or cookies on the server in `/p/[slug]`; use a client component inside `Suspense` (see `VariantTable.tsx`).
2. **New route folder not found in dev:** Turbopack's dev server may 404 a newly added route. Restart the dev server.
3. **Catalogue changes not showing in dev:** `catalogue.ts` caches the JSON in memory. After `build_catalogue.py`, touch `site/src/lib/catalogue.ts` or restart the dev server.
4. **`next build` and `next dev` share `.next`.** Stop the dev server before a production build, and clear `.next` afterwards.
5. **Font warning** "Failed to find font override values for Big Shoulders" is expected. Tune a size-adjusted fallback in QA to protect CLS.
6. **Listing routes are dynamic** (`?page`, filters, view cookie). Plan the Cloudflare cache rules accordingly.
7. **`metadataBase` is not set** (needs the domain, client item 14), so canonical URLs are relative.
8. **The mapping generator script was a one-off and is gone.** The CSVs in `data/` are the source of truth and have been hand-edited since (grouping column, Ruwag "Fix > Fixings").
9. **Claude browser pane:** screenshots time out when the pane is hidden. Use DOM checks instead.

---

## 8. Still needed from the client

Opening hours (including public holidays), phone, WhatsApp number, enquiry email, exact map pin, the black location tile image, supplier logo files, domain and Google Business Profile owner, delivery yes or no and where, usual reply time, high-resolution Geo photos, staff names for WordPress logins, enquiry retention period (POPIA), the fence energizer question (section 6), and the remaining questions in Website Plan section 13 and SEO plan section 11.

---

## 9. Higgsfield status

- **Route used:** the Higgsfield API (`https://api.higgsfield.ai`, header `Authorization: Key KEY_ID:KEY_SECRET`), model `marketing-studio/image`, direct mode, no `preset_id`, `enhance_prompt=false`. The connector's free plan cannot run `gpt_image_2_5` or `recraft_v4_1`, and `z_image` was too slow to use.
- **Key:** it lives in `../Linsilk/.env`. The scripts in `art/` import `../Linsilk/hf_client.py` and so use that key. Nothing is copied into this project. Paid calls need `HF_ALLOW_PAID=1`.
- **Spend:** roughly $1.30 for the 14 main images and $1.50 for the 100 category images. Jobs are logged in `../Linsilk/jobs.jsonl` with `hw-` tags.
- **Limits found:** Marketing Studio has no 4:5 (features are made 3:4 and cropped to 4:5). Grok Imagine has no 21:9. Concurrency of 5 worked.
- **Prices (USD per image, 4:3):** low 1k 0.015, low 2k 0.020, medium 1k 0.050, medium 2k 0.089, high 2k about 0.33. Check with `python3 ../Linsilk/hf_client.py estimate` (free) before any new run.

---

## 10. Next steps, in order

1. **Design overhaul steps 5 to 8** (section 11): restyle the catalogue, department, listing and product pages and the search dropdown; motion; QA; update the Website Plan.
2. **Phase 6:** Add to list, the enquiry list drawer (saved in the browser), custom "not listed" items, the 3-step send, the WhatsApp fallback, success and error states. The WordPress endpoints come with phase 1.
3. **Phase 7:** About, Contact (adaptive form, photo upload), privacy (POPIA), and the standard page template.
4. **SEO:** `robots.txt`, split sitemaps, JSON-LD (`HardwareStore`, `BreadcrumbList`, `Product`), and `metadataBase` once the domain is known.
5. **Phase 1 and the import:** local WordPress in Docker, WooCommerce import from `catalogue.json` via WP-CLI, then swap `site/src/lib/catalogue.ts` to the REST API with tagged caching and revalidation.
6. **Phases 8 to 10:** motion, staff guide, QA on real phones, launch.

---

## 11. Design overhaul status (Empire-Design-Overhaul-Plan.md)

| Step | Status |
|---|---|
| 1. Generate and convert the images | **Done.** 14 main images and 100 category images, all reviewed and approved by the client team |
| 2. Tokens, base styles, `SectionHeading`, `Reveal` | **Done.** Shown on `/styleguide` with live contrast |
| 3. Header, footer, `HeroBanner`, `FeatureTile` | **Done.** Dark header and footer; the hero fades into a dark band that carries the 4 feature tiles (they no longer overlap the hero) |
| 4. `DepartmentCover`, order-in band, solar band, visit | **Done.** Home is complete |
| 5. Catalogue, department, listing, product, search dropdown | **Partly.** Category tiles on department pages use the new art; `/catalogue` uses `DepartmentCover`. Done 2 Oct (later session): department page header (full-bleed cover, scrim) and `ListingHeader` band for category and sub-category pages. Still to do: `ProductCard` v2 (department art fallback), product page, search dropdown, brand wall |
| 6. Motion | Not started beyond what exists (hero entrance, `Reveal` is built but not yet used on pages, hover zoom) |
| 7. QA | Not started. Needs a production build (stop the dev server first, gotcha 4) |
| 8. Docs | Not started. Update Website Plan sections 2.4 and 7.1 and its change list |

**What was added or changed**
- Tokens (`site/src/styles/tokens.css`): `--ink-950`, `--ink-800`, `--steel-900`, `--scrim`, `--fs-display`, `--fs-eyebrow`, `--section-pad`, and `--red-on-ink` (`#FF5A5F`). `--red` fails AA as small text on the dark surfaces, so eyebrows on dark use `--red-on-ink`.
- New components: `SectionHeading`, `Reveal`, `HeroBanner`, `FeatureTile`, `catalogue/DepartmentCover`. `lib/images.ts` builds `srcSet` from the manifests.
- Removed because they became unused: `DepartmentTile`, its CSS, `departmentPhoto()`, `categoryPhoto()`, the "On the counter" product tiles and their CSS.
- Home (`site/src/app/page.tsx`): hero, feature tiles (links: `/catalogue/solar-backup-power`, `/catalogue/power-tools`, `/catalogue/plumbing/taps-mixers`, `/catalogue/paint-waterproofing`), department covers, red order-in band, solar band, visit us. The 4 feature tiles are department features, not products.
- All generated pictures are decorative (`alt=""`): the headings and link text carry the meaning.

**Image pipeline (`art/`)**
- `generate.py`: banner-set images (reads prompts from the plan, section 3.4). `generate_categories.py` plus `category_subjects.py`: the 100 category images (one subject line each). Both run 5 jobs at a time and skip files that exist, so a re-run only fills gaps. To redo one image, delete its PNG in `art/originals/` (or `art/originals/cat/`) and run the script again.
- `convert.py` writes the main WebP sets (banner 1280/1920/2560, covers 640/1280/1920, features 480/960 cropped to 4:5) and `images.json`. `convert_categories.py` writes 400 and 800 px WebP and `category-images.json`.
- The banner comes from `art/tests/banner_marketing-studio_medium.png` (medium, 2k); `convert.py` expects it copied to `art/originals/hero-banner.png`.
- Sizes: `art/originals/` is 200 MB. Keep it out of git and keep a copy elsewhere; everything in `site/public/images/` (8 MB) can be rebuilt from it.

**Checked so far:** typecheck passes; home at 1366 and 390 px wide has no sideways scroll; the hero buttons sit above the mobile tab bar at 390×844; the department page loads all 9 category images. **Not checked:** a production build, Lighthouse and LCP, real phones, the mega menu and search dropdown on the dark header, and keyboard focus on the new covers.

**Known rough edges**
- The hero banner is the medium test render with a slightly crowded right edge and cut-off spanners at the bottom right.
- `feature-taps` is a gooseneck tap where the plan asked for a kitchen mixer.
- Dev console may show stale "Module not found `category-images.json`" entries from before the file existed. Restart the dev server to clear them.
- `Reveal` and the display type scale are built but barely used yet.

---

**Sources for the Higgsfield API notes:** [Higgsfield API Docs](https://docs.higgsfield.ai/docs), [Higgsfield API FAQ](https://docs.higgsfield.ai/docs/help/faq), [higgsfield-js SDK](https://github.com/higgsfield-ai/higgsfield-js), [higgsfield-client Python SDK](https://github.com/higgsfield-ai/higgsfield-client)
