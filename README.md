# Empire Solar & Hardware: local build

Plans: `Empire-Website-Plan.md` (design and build), `Empire-SEO-GEO-Plan.md` (URLs, indexing, schema).

## Run the site

```bash
cd site
pnpm install
pnpm dev --port 3100      # http://localhost:3100
pnpm build && pnpm start  # production check
pnpm typecheck
```

## Folders

| Folder | What it is |
|---|---|
| `site/` | Next.js 16 front end (App Router, TypeScript, CSS Modules). Tokens in `src/styles/`, brand components in `src/components/`, pages in `src/app/` |
| `data/` | Catalogue pipeline (phase 2). `sizes.py` (with `test_sizes.py`) takes sizes out of names to group them into families. `taxonomy.csv`, `mapping.csv`, `keyword_rules.csv` and `sku_fixes.csv` are the reviewable sources of truth |
| `data/out/` | `report.md` (checks and review lists), `mapping-summary.csv`, `families-without-photo.csv`, `family-grouping-review.csv` (every group made from several rows) |
| `geo-images/`, logos, workbooks | Source material from the client |

## Rebuild the catalogue

```bash
python3 data/build_catalogue.py
python3 data/test_sizes.py      # size parser tests
```

Reads `supplier-catalogue.xlsx` plus the four CSVs, checks every row lands in exactly one product family with per-supplier counts matching the workbook and that every code is unique, and writes `site/src/data/catalogue.json` and the report. Edit the CSVs, not the JSON. `sku_fixes.csv` holds every change made to a supplier code (typo fixes, new SKUs for clashes, products listed twice) with the reason; the workbook itself is never edited.

## Status

The front end reads `catalogue.json` through `site/src/lib/catalogue.ts`. That is the one module to change when WordPress/WooCommerce is connected. `site/src/lib/store.ts` holds store details; only the address is known (hours, phone, WhatsApp, email and map pin are client items 3, 4 and 7).

`mapping.csv` has a `grouping` column: `sizes` groups names that differ only by size (AirCraft fittings, Ruwag Harden), `name` groups identical names (Ingco), blank leaves rows as separate families unless the name has an explicit `Family – Size` separator.

Search is MiniSearch: the results page runs it on the server, and the instant dropdown loads `/search-index.json` the first time a search box is focused. Local words ("geezer", "trip switch", "globe") are in `site/src/lib/synonyms.ts`. Listing filters, sort and the grid/list view live in the URL (`site/src/lib/filters.ts`).

Always check the production build as well as dev (`pnpm build && pnpm start`): a page that works in dev can fail when pre-rendered. Product pages (`/p/[slug]`) are pre-rendered, so they must never read `searchParams` or cookies on the server.


## Local WordPress / WooCommerce

The products live in a local WooCommerce (Docker) and the site reads them from there.

```bash
cd wordpress && docker compose up -d && ./setup.sh   # once: WordPress + WooCommerce on http://localhost:8088 (admin / admin)
./import.sh                                          # src/data/catalogue.json -> WooCommerce (re-runnable; LIMIT=50 for a trial)
cp ../site/.env.example ../site/.env.local           # WP_URL points the site at WordPress
```

- With `WP_URL` set the site reads `/wp-json/empire/v1/catalogue` (`wordpress/empire-core.php`), keeps it in memory for 5 minutes, and falls back to `src/data/catalogue.json` only in `pnpm dev`. Production never falls back silently.
- WordPress calls `/api/revalidate` (header `x-revalidate-secret`, set `REVALIDATE_SECRET` in the site's env) after every product save, so edits show on the next page load with no rebuild. Pages are also rebuilt at least hourly.
- `data/build_catalogue.py` makes `src/data/catalogue.json` from the workbook. It is the source for the import and is never overwritten by the site, so the order is simply: rebuild, import.
