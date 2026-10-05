# Empire Solar & Hardware website: handover

**Date:** 2 Oct 2026 (updated; first written 1 Oct)
**Build started:** 30 Sep 2026
**Plans:** `Empire-Website-Plan.md` (design and build, 14 phases), `Empire-SEO-GEO-Plan.md` (URLs, indexing, schema), `Empire-Design-Overhaul-Plan.md` (all 8 steps done 2 Oct, see section 11)

---

## 1. Where everything is

| Path | What it is |
|---|---|
| `site/` | Next.js 16.3.7 front end (App Router, TypeScript, CSS Modules, React 19.3) |
| `site/src/app/` | Pages: `/`, `/catalogue`, `/catalogue/[department]`, `/[category]`, `/[sub]`, `/p/[slug]`, `/search`, `/search-index.json`, `/styleguide`, `/contact`, `/about`, `/enquiry` |
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
| 6. Enquiry list and forms | **Front end done 2 Oct; WordPress side not started.** Add to list, drawer, custom items, 3-step `/enquiry`, WhatsApp fallback, stamp. See section 12 |
| 7. Home, About, Contact, standard page | **Home reworked by the overhaul (steps 3 and 4).** **Done 2 Oct (front end):** About, Contact (adaptive form with photo upload), Privacy (draft), `StandardPage` template. WordPress side of the forms and the editor blocks wait for phase 1 |
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

1. **Phase 6 remainder:** connect sending to WordPress (set `ENQUIRY_ENDPOINT`, section 12), Turnstile, customer email copy, delivery question.
2. **Phase 7:** About, Contact (adaptive form, photo upload), privacy (POPIA), and the standard page template.
3. **SEO, done 4 Oct 2026:** `robots.txt` (`app/robots.ts`), split sitemaps (`/sitemap.xml` index, `/sitemaps/pages|categories|products-N.xml`, Tier B only, with images, no `lastmod`), JSON-LD in `lib/jsonld.tsx` (`HardwareStore` on every page, `WebSite` on home, `BreadcrumbList` via the Breadcrumb component, `ProductGroup`/`Product` with no offers). Set `SITE_URL` (also `metadataBase`) once the domain is known. Brand pages done 4 Oct 2026 (`/brands/{brand}`, 17 pages, copy from the keyword map in `lib/brands.ts`, range and products from the catalogue, FAQPage schema, in `brands.xml`; Hanchu is `/brands/hanchu-ess` as in the plan). `/faq` built 4 Oct 2026 (`app/faq/page.tsx`) with only what is known: location, hours, what we sell, ordering in, how to ask for a price, contact, photos. Add these questions once the client answers (SEO plan 7.3): directions and parking from Brits, Harties, Mooinooi, Letlhabile and the N4; public holiday hours; delivery; solar installation; trade accounts; payment methods; languages at the counter; prices over WhatsApp or phone; returns and warranty. Still to do: `/advice`, keyword-map copy for category pages, IndexNow, sameAs links beyond the map listing, a `Person`/`AboutPage` on About. IndexNow built 4 Oct 2026 (`lib/indexnow.ts`): set `INDEXNOW_KEY` and a real `SITE_URL`; the key file is served at `/{key}.txt`; every `/api/revalidate` call sends the pages whose products changed; `POST /api/indexnow {"all":true}` (header `x-revalidate-secret`) sends all indexable pages once at launch; it never sends from a local `SITE_URL`; `INDEXNOW_DRY_RUN=1` shows what would be sent.
4. **Phase 1 and the import:** local WordPress in Docker, WooCommerce import from `catalogue.json` via WP-CLI, then swap `site/src/lib/catalogue.ts` to the REST API with tagged caching and revalidation.
5. **Phases 8 to 10:** motion, staff guide, QA on real phones, launch.

---

## 11. Design overhaul status (Empire-Design-Overhaul-Plan.md)

| Step | Status |
|---|---|
| 1. Generate and convert the images | **Done.** 14 main images and 100 category images, all reviewed and approved by the client team |
| 2. Tokens, base styles, `SectionHeading`, `Reveal` | **Done.** Shown on `/styleguide` with live contrast |
| 3. Header, footer, `HeroBanner`, `FeatureTile` | **Done.** Dark header and footer; the hero fades into a dark band that carries the 4 feature tiles (they no longer overlap the hero) |
| 4. `DepartmentCover`, order-in band, solar band, visit | **Done.** Home is complete |
| 5. Catalogue, department, listing, product, search dropdown | **Done.** Department cover header, `ListingHeader` band, `ProductTile` art fallback (cards and product page), product details panel, dark search dropdown, dark brand wall. The catalogue page header was left as is (no banner crop) |
| 6. Motion | **Done.** `Reveal` now wraps the home sections; reduced motion is handled globally in `globals.css`; all animations are 450 ms or less |
| 7. QA | **Done on a production build** (built in a scratch copy because another chat's dev server shares `.next`): all page types return 200; JS 180 to 183 KB gzip; no sideways scroll at 320 and 390 px on 8 page types; every image has an alt attribute; no em dashes on checked pages. **Not done:** Lighthouse/LCP and real phones, keyboard focus on covers |
| 8. Docs | **Done.** Website Plan change list and section 2.4 updated. Section 7.1 table still describes the old hero; the change list overrides it |

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

## 12. Enquiry list (Phase 6, front end done 2 Oct 2026)

- **State:** `site/src/lib/enquiry.ts` keeps the list in `localStorage` (`empire_list_v1`) with `useSyncExternalStore`; it also holds the drawer open state. `lib/enquiry-validate.ts` (phone, email, details) is shared by the form and the server.
- **UI:** `components/enquiry/` has `AddToList` (minus, typed quantity, plus and an Add to list button, like any shop; adding again adds to the line already on the list) and `QtyInput` (the shared quantity box; the typed number is committed on leaving the box or Enter, 1 to 999), `ListButton` (header), `ListDrawer` (a `<dialog>` mounted in `layout.tsx`), `ListLines` (qty, note, remove with 5 second Undo) and `CustomItemForm` ("not listed" lines). The mobile tab bar has a List tab. Product pages have the control on every variant row, listing cards and list-view rows have it on single-code products, and families with several sizes show "Choose a size" and open the product page. The drawer lines use the same typed quantity box.
- **`/enquiry`** (`app/enquiry/`): three steps (list, details, review and send), details saved in `empire_enquiry_details_v1` and cleared on success, honeypot field, "Received" stamp, "Send a copy on WhatsApp", and on failure a message plus a WhatsApp fallback with nothing lost.
- **Sending:** `app/api/enquiry/route.ts` validates, then (1) forwards to `ENQUIRY_ENDPOINT` if set (the future WordPress endpoint, which must return `{ docket }`), (2) in development writes `data/out/dev-enquiries.jsonl` (git-ignored, contains personal data) and returns a sequential `ESH-000n`, (3) in production without the env var returns 503 so the form shows the failure state. It never pretends to have sent.
- **Not done:** Cloudflare Turnstile (needs keys), the customer email copy and the store email (WordPress), the delivery question (client does not say whether it delivers), the Enquiry inbox and statuses in WordPress, an "Ask about a solar setup" shortcut. 
- **Checked:** typecheck; production build; `/enquiry` 200; API returns 503 in production and 400 for an empty list; dev flow end to end; no sideways scroll at 320 px for drawer, `/enquiry` and the product table; JS 184 to 187 KB gzip.

---

## 13. About page (Phase 7, 2 Oct 2026)

`site/src/app/about/`. Written after reading the About pages of three independent South African hardware groups (Jabula Hardware, Essential Hardware Stores, EST Building & Hardware). What they share, and what we copied: a place-rooted opening, plain facts and scale, a clear promise, a real supplier list, and a short closing line. What we left out because we have no facts for it: a founding story, years in business, awards, staff numbers, a team section, the logo story (Website Plan 7.7 needs the owner's own words).

Sections: hero ("Built in Brits."), nine departments with live counts, how we work (order-in promise and docket), suppliers (every brand with its main department(s), worked out from the catalogue), visit (directions, WhatsApp, link to Contact). Linked from the header and footer. Totals and counts come from the catalogue, never typed by hand.

**To add when the client supplies it:** a founding line and owner quote, the logo story, store interior and team photos (a team section only with real photos), supplier logos instead of names.

---

## 14. Contact form, privacy page, standard page (Phase 7, 2 Oct 2026)

- **Contact** (`app/contact/`, `components/contact/ContactForm.tsx`, `lib/contact.ts`): two columns on desktop (form 7, store card 5); on phones the store card comes first. Topic chips (product question, solar quote, order in, match a part, something else) open topic fields. Match a part takes up to 3 photos, shrunk in the browser to 1600 px JPEG. Same detail rules and honeypot as the enquiry form.
- **Sending:** `app/api/contact/route.ts`, same pattern as `/api/enquiry`: forwards to `CONTACT_ENDPOINT` when set (photos as JPEG data URLs; WordPress must store them privately, not in the public media library), writes `data/out/dev-contact.jsonl` in development (git-ignored, photos logged as a count only), and returns 503 in production until an endpoint exists. The success text promises a reply "during shop hours" and does not state a reply time (unknown, client item).
- **Privacy** (`app/privacy/`): a DRAFT built from what the site actually does (enquiry data, contact data, localStorage, one cookie `empire_view`, no tracking). **Needs the client and a POPIA check before launch.** Open points: retention period (text says "only as long as we need it"), the Information Officer's name, the email and hosting providers once chosen, whether Turnstile or analytics get added (the page must then say so). Linked from the footer and from both consent lines.
- **`StandardPage`** (`components/StandardPage.tsx`): the Website Plan 7.9 layout (breadcrumb, aisle-sign title, optional intro and photo, 720 px body, help band, visit card). Privacy uses it. When WordPress is connected its editor content renders into the body; the custom blocks (product grid, notice, enquiry prompt) are not built.
- **Checked on a production build:** all new pages 200; both forms return 503 without an endpoint and 400 for bad input; JS 183 to 187 KB gzip; no sideways scroll at 320 px for Contact (including the solar and photo topics), Privacy and About. Not checked: real phone camera upload.
 API notes:** [Higgsfield API Docs](https://docs.higgsfield.ai/docs), [Higgsfield API FAQ](https://docs.higgsfield.ai/docs/help/faq), [higgsfield-js SDK](https://github.com/higgsfield-ai/higgsfield-js), [higgsfield-client Python SDK](https://github.com/higgsfield-ai/higgsfield-client)

### Titles and descriptions for pages outside the keyword map

The keyword map covers 100 category pages. The other 83 use drafted copy from `data/build_unmapped_seo.py`, written to `site/src/data/category-seo-extra.json` and merged in `categorySeo()` in `site/src/lib/seo.ts` (the map always wins). Counts come from the catalogue. They are drafts: the SEO lead should review them and move any they approve into the keyword map.
