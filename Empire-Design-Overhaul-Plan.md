# Empire Solar & Hardware: Design Overhaul Plan

**Date:** 1 Oct 2026
**Status:** In progress, 2 Oct 2026. Steps 1 to 4 of section 6 are done, step 5 is partly done. See `HANDOVER.md` section 11.
**Asked for by the client team:** "The design looks terrible. Use Higgsfield to make a stunning banner and matching category cover images and images for the 4 hero blocks. Overhaul the site so it looks award-winning."
**Companion files:** `Empire-Website-Plan.md` (original design plan), `HANDOVER.md` (project state).

---

## 1. What is wrong with the current look

An honest review of the build as it stands:

| Problem | Where | Effect |
|---|---|---|
| Almost no imagery. Only Geo's 537 catalogue photos are local; all other supplier photos are still to be imported into WordPress | Every page | Pages read as text plus empty white tiles with small icons |
| Flat beige (`#F4F2EE`) on every section, little contrast between bands | Every page | No rhythm, nothing pulls the eye down the page |
| Hero is a headline and a form, with no visual anchor | Home | First screen says nothing about solar or hardware |
| "On the counter" tiles: 3 of 4 show a fallback icon | Home | The most visible tiles look unfinished |
| Department tiles use icons instead of pictures | Home, Catalogue, Department | Feels like a wireframe |
| Product card fallback (icon on white) dominates listings | Listings, search | Long grids of identical grey boxes |
| Light, generic header | Every page | The brand (red, black, the gear) barely shows |
| Almost no motion | Every page | Static and flat |

The structure, data, search and filters are sound. The problem is the visual layer.

---

## 2. Direction: "Night-shift trade counter"

Dark, cinematic and image-led, but still clearly Empire's brand: ink black, signage red and condensed type.

**Principles**
1. **Lead with images.** A full-bleed hero banner, image-led department covers, and an image behind every section that carries meaning.
2. **Two-tone rhythm.** Dark image bands alternate with light reading sections (catalogue grids, product details, forms stay light for legibility).
3. **Type as signage.** Oversized Big Shoulders headings with tight leading, plus the red bar from the logo as an underline device.
4. **Fewer, stronger elements.** Keep the chamfer, the aisle sign and the counter docket. Drop small boxes that add nothing.
5. **Motion with a reason.** A hero entrance, images that reveal on scroll, hover zoom on covers, and the gear notch on "Add to list".

**Keep from the original plan:** brand colours and the three fonts, the chamfer, the docket and aisle sign, AA contrast, reduced-motion support, the 250 KB JavaScript budget, real supplier photos for products, no stock photos of people, no fake product photos.

---

## 3. Imagery (Higgsfield)

### 3.1 Decision and its limits

- **This overrides Website Plan section 2.4** ("Never: ... AI-generated images"), at the client team's request, for the banner, the 9 category covers and the 4 hero blocks. Update section 2.4 and the change list in `Empire-Website-Plan.md` when this is built.
- **Product photos stay real** (supplier photos, later the store's own). An AI image is never shown as a specific product.
- **Hero blocks change meaning.** They currently show 4 real products (Sunsynk inverter, Ingco angle grinder, Geo mixer range, Promac paint). An AI picture labelled "Sunsynk 16kW Hybrid Inverter" would be a fake product photo, so the 4 blocks become **department features** linking to categories: Solar & backup, Power tools, Taps & mixers, Paint & waterproofing.

### 3.2 Images to generate (14)

| # | File | Used for | Aspect | Size needed |
|---|---|---|---|---|
| 1 | `hero-banner` | Home hero (full bleed), Catalogue header crop | 21:9 | 2560 px wide |
| 2 | `feature-solar` | Hero block: Solar & backup | 4:5 | 1200 px tall |
| 3 | `feature-power-tools` | Hero block: Power tools | 4:5 | 1200 px tall |
| 4 | `feature-taps` | Hero block: Taps & mixers | 4:5 | 1200 px tall |
| 5 | `feature-paint` | Hero block: Paint & waterproofing | 4:5 | 1200 px tall |
| 6–14 | `cover-{department-slug}` | Department cover cards, department page headers, product-card fallback art | 4:3 (crops to 4:5 and 16:9) | 2048 px wide |

Department slugs: `plumbing`, `electrical`, `lighting`, `solar-backup-power`, `power-tools`, `hand-tools`, `fixings-adhesives`, `air-tools-compressors`, `paint-waterproofing`.

### 3.3 Shared style (append to every prompt)

> Photorealistic commercial product photography, cinematic low-key lighting, deep charcoal-black background, warm amber key light, a subtle crimson red rim light, brushed steel and raw concrete textures, shallow depth of field, crisp detail, premium editorial hardware campaign aesthetic, consistent colour grade. No text, no letters, no numbers, no logos, no brand names, no people, no hands, no watermark.

### 3.4 Prompts

**1. Hero banner (21:9)**
> Wide cinematic hero banner for a hardware and solar store. On the right two-thirds, a dramatic still life on a dark brushed-steel workbench: a sleek wall-mounted hybrid solar inverter and lithium battery in plain unbranded matte white casing, a cordless angle grinder, polished copper pipes and brass ball valves with red lever handles, a coil of red and black electrical cable, an open paint tin, a spirit level and a few spanners, with the edge of a monocrystalline solar panel catching warm light. The left third falls away into deep charcoal shadow, empty, leaving clean space for headline text. Fine dust drifting in the light beam.

**2. Feature: Solar & backup (4:5)**
> Close-up of a sleek wall-mounted hybrid solar inverter with a small glowing green status light and a lithium battery stack below, plain unbranded matte white casing, mounted on a dark charcoal wall, warm side light.

**3. Feature: Power tools (4:5)**
> Close-up of a cordless angle grinder cutting a steel bar, a fan of bright orange sparks, dark workshop, rugged unbranded tool with red accents.

**4. Feature: Taps & mixers (4:5)**
> Close-up of a polished chrome kitchen mixer tap with a single drop of water falling from the spout, dark charcoal background, soft studio light with long highlights on the chrome.

**5. Feature: Paint & waterproofing (4:5)**
> Close-up of an open paint tin with a thick glossy swirl of deep red paint, a brush resting across the rim, a few drips running down the tin, dark charcoal background.

**6. Cover: Plumbing (4:3)**
> Polished copper pipes, brass ball valves with red lever handles, compression fittings and a chrome mixer tap arranged on dark steel.

**7. Cover: Electrical (4:3)**
> A neat row of white miniature circuit breakers on a DIN rail, coils of red and black electrical cable, a wall socket and switch.

**8. Cover: Lighting (4:3)**
> Modern LED downlights and a filament globe glowing warm, an LED floodlight, soft light falloff across the dark surface.

**9. Cover: Solar & backup power (4:3)**
> A monocrystalline solar panel angled towards a warm low sun glow, beside a sleek wall-mounted hybrid inverter and lithium battery stack in plain unbranded casing.

**10. Cover: Power tools (4:3)**
> A cordless drill, an angle grinder and a circular saw, rugged and modern, unbranded, red accents, a few sparks in the background.

**11. Cover: Hand tools (4:3)**
> An ordered arrangement of spanners, pliers, screwdrivers, a claw hammer and a tape measure on dark steel.

**12. Cover: Fixings & adhesives (4:3)**
> Macro shot of assorted screws, bolts, nuts, washers and wall anchors scattered on steel, with a roll of tape and a sealant tube.

**13. Cover: Air tools & compressors (4:3)**
> A compact air compressor with a coiled blue air hose, quick couplers and push-in fittings, and a spray gun.

**14. Cover: Paint & waterproofing (4:3)**
> Paint tins with lids off, a roller and brush, thick drips in charcoal and red, and a roll of waterproofing membrane.

### 3.5 Access and cost (checked 1 Oct 2026)

- **Higgsfield connector (MCP):** connected, free plan, **9.85 credits**.
- **`gpt_image_2_5` is blocked on the free plan:** "Requires basic plan or higher". Preflight costs per image: low quality 1k 0.25 credits; medium 2k 1.0; high 2k 2.75. Other preflights: `z_image` 0.15, `recraft_v4_1` 1.25.
- **Budget for the set:** banner at high 2k (2.75) plus 13 images at medium 2k (13.0) is about **15.75 credits**.
- **Routes, pick one:**
  - **A. Upgrade the Higgsfield plan** (basic or higher) and add credits, then generate through the connector. Simplest.
  - **B. Higgsfield API with an API key.** Base URL `https://api.higgsfield.ai`, header `Authorization: Key KEY_ID:KEY_SECRET` (from Higgsfield's docs, via search). Check the docs for which image models the API offers and the job and status endpoints before writing the script, because the docs page could not be fetched on 1 Oct. A key exists in the Linsilk project, but reading another project's credentials was blocked by Claude Code's permission check. The team either adds a permission rule, or copies the key into this project themselves (see 3.6).
  - **C. A model that runs on the free plan.** Untested; try one cheap image first.

### 3.6 Image pipeline (to build)

1. `data/images.json`: id, prompt, aspect ratio, model, resolution, quality, alt text.
2. `data/generate_images.py`: reads credentials from the environment only (never printed, never committed), submits each image, polls until done, downloads originals to `art/originals/`, then writes WebP at 640, 1280 and 1920 px (2560 for the banner) to `site/public/images/` with PIL, and writes `site/src/data/images.json` (dimensions, alt text, model and prompt for repeatability).
3. Credentials in `Hardware site/.env.local`, git-ignored. Confirm the variable names against the Higgsfield SDK before writing the script.
4. Review a contact sheet before using anything. Regenerate any image that has text or fake logos, warped tools (extra handles, melted parts), people or hands, or a colour grade that doesn't match the set.
5. Weight targets: banner at 1920 px under 250 KB WebP; covers at 1280 px under 150 KB; preload the banner as the LCP image.

---

## 4. Design system changes

**Tokens (add):** `--ink-950 #0E0D0C` (deepest band), `--ink-800 #1E1D1B` (raised dark surface), `--steel-900 #26292D` (dark cards), `--scrim` (ink at 0 to 85% for text over images). Keep `--red`, `--red-deep`, `--red-logo` (large fills only), `--concrete`, `--paper`.

**Type scale:** display `clamp(3.5rem, 2rem + 6vw, 8rem)` with leading 0.9 for hero and section openers. An eyebrow label (Archivo 600, small, letter-spaced, red) above section headings. Body unchanged.

**Spacing:** section padding 96 to 160 px on desktop, 64 px on mobile. Grids get more air; listings stay dense.

**Components (new or reworked):**
- `SiteHeader`: ink background, logo on dark, light search field, red focus states, compact on scroll.
- `HeroBanner`: full-bleed image, scrim on the text side, H1, sub-line, large search, example chips, two actions.
- `FeatureTile`: portrait image, label, arrow, hover zoom (the 4 hero blocks).
- `DepartmentCover`: image card in a bento grid, aisle-sign label, product count, top category links.
- `SectionHeading`: eyebrow, display heading, one line.
- `ProductCard` v2: real photo on paper when there is one; otherwise department cover art at low opacity on ink with the brand name set large (replaces the grey icon box).
- `OrderInBand`: red band carrying the counter docket and "Not on the shelf? We'll order it in."
- `SiteFooter` v2: ink, larger logo, address and directions, department links, brands.
- `Reveal`: a tiny client component (IntersectionObserver, under 2 KB) for once-only section entrances.

**Motion (CSS):** hero entrance stagger (450 ms), image reveal on scroll (350 ms, once), cover hover zoom (scale 1.04, 400 ms), button press, gear notch. Everything becomes an instant change under `prefers-reduced-motion`.

---

## 5. Page by page

**Home**
1. Dark header.
2. Hero: full-bleed banner. Left text column: eyebrow "Kremetart Centre, Brits", H1 "Solar, tools and plumbing. One counter in Brits.", sub-line, big search, chips, "Browse the catalogue" and "Visit the store". On mobile the image sits on top with a scrim and the text follows on ink.
3. Feature row: the 4 hero blocks overlapping the bottom edge of the hero; 4 across on desktop, 2 by 2 on mobile.
4. Shop by department: 9 covers in a bento grid (2 large, 3 medium, 4 small, no empty cells), with counts and links.
5. Order-in band (red) with the docket, merged with "How ordering works" so the message is said once.
6. Solar band: full-bleed solar cover with "Backup power, sorted." and the button.
7. Visit us: address, directions, and the location tile once the client supplies it.
8. Footer.

**Catalogue:** banner crop header with the search field, the stock-notice docket, department covers, the brand wall.
**Department:** full-bleed cover header with the aisle sign over a scrim, then category tiles (Geo photos where they exist, otherwise department art).
**Listing:** slim header band using the department cover, filters restyled, product cards v2.
**Product:** two columns; image area uses the department art fallback; sticky details panel; variants table restyled; related products.
**Search dropdown:** restyled to match the dark header.

---

## 6. Build steps and checks

| Step | Work | Done when |
|---|---|---|
| 1 | Get image access (3.5), generate the 14 images, review, convert | 14 approved WebP sets in `site/public/images/` with a manifest |
| 2 | Tokens, base styles, `SectionHeading`, `Reveal` | Styleguide page shows the new tokens; contrast passes AA |
| 3 | Header, footer, `HeroBanner`, `FeatureTile` | Home first screen matches the plan at 1366×768 and 390×844 |
| 4 | `DepartmentCover`, order-in band, solar band, visit | Home complete; no empty frames if an image is missing |
| 5 | Catalogue, department, listing, product, search dropdown | All page types restyled |
| 6 | Motion | Every animation under 600 ms; nothing moves with reduced motion on |
| 7 | QA | Production build passes; every page type returns 200 from `next start`; no sideways scroll at 320 and 390 px; JS under 250 KB per page; banner LCP under 2.5 s on a mid-range Android; alt text on every image; no em dashes in copy |
| 8 | Docs | Website Plan sections 2.4 and 7.1 and its change list updated for the AI imagery decision |

**Estimate:** 1 to 2 days of build once the images exist.
