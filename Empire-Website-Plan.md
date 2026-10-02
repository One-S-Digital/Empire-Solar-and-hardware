# Empire Solar & Hardware: Website Design Plan

**Client:** Empire Solar & Hardware, Kremetart Centre, Van Velden St, Brits, 0250
**Prepared by:** One S Digital
**Date:** 29 Sep 2026 (updated 30 Sep 2026)
**Status:** Plan for review. Local build in progress (started 30 Sep 2026).

**Changes on 1 Oct 2026**
- **JavaScript budget raised from 150 KB to 250 KB** of compressed JavaScript per content page (sections 12.1 and 12.9). Measured on the local build: Next.js 16 with React ships about 160 KB compressed before any site code, so 150 KB could not be met. The site is at about 175 KB today, which leaves room for search, filters and the enquiry list. The MiniSearch index (section 6.5) is loaded only when someone uses search and is not counted.

**Changes on 30 Sep 2026**
- Build is now **headless WordPress**: WordPress + WooCommerce hold the products and content, and a separate fast front end shows them (section 12, rewritten).
- **Launch photos** come from what we already have: supplier product photos, the logo and the location tile. Pages are designed to work with those now and swap in the client's own photos later (sections 2.4, 7.1, 7.7 and the shot list in 13.1).
- **Supplier image permission is confirmed.** The client buys directly from every supplier, so all supplier photos and descriptions can be used, including Wadfow and the solar brands.
- **Logo:** the site uses the client's PNG logos. A compact header version (tagline removed) and a square icon were cut from the supplied horizontal PNG (section 2.6). No vector redraw.
- **New pages** that staff create in WordPress all get one standard page design automatically (sections 7.9 and 12.3).
- **Front end is now Next.js on Render** (was Astro on Netlify): changes go live in seconds, staff get a true preview, and Cloudflare in front keeps it fast in South Africa (sections 12.1, 12.4, 12.4.1).
- **Free WordPress plugins only.** ACF Pro is replaced by the free **Secure Custom Fields** plugin (section 12.2).

---

## 0. The brief in one paragraph

A website for a **physical** hardware and solar store in Brits. It is not an online shop: there are no prices, no cart and no checkout. People browse a catalogue of about 6,300 products from 15 suppliers, add what they need to an **enquiry list**, and send that list to the store. The store replies with stock, price and lead time. The site has four pages: **Home, Catalogue, About, Contact**. The catalogue must say clearly that not everything is always on the shelf, but the store will order it in.

**Design read:** a trade-counter website. Fast to search, honest about stock, built from the store's own materials (steel, paper dockets, pegboard, red signage), with motion only where it gives feedback.

### What this plan is built from

| Source | What it gave |
|---|---|
| `supplier-catalogue.xlsx` (root folder) | 6,319 products, 15 suppliers, 6 supplier departments, full category tree, notes and gaps |
| `geo-images/` (root folder) | 537 Geo product photos |
| `Empire solar & hardware logo.png` | Brand colours, type character, shape language |
| Location image (black tile) | Address, and proof the brand works on black |
| `empire hardware horizontal logo.png` (30 Sep) | Header logo (section 2.6) |
| `Empire-SEO-GEO-Plan.md` | Product families, URL rules, indexing, schema. This plan follows it |
| Second Brain: `02-Projects/Hardware Site/Hardware Site.md` | Supplier list, sourcing decisions, open items |
| Taste Skill rules (Leonxlnx/taste-skill, fetched) | Anti-slop bans, dials, pre-flight checklist |
| UI UX Pro Max approach (nextlevelbuilder) | Industry-matched design system: style, palette, type, UX rules |
| AI-slop research (see section 3) | The list of patterns to avoid |

> **Note on skills:** "Taste Skill" and "UI UX Pro Max" are not installed in this Claude setup. I read their published rules and applied them by hand. If you want them active for the build, install them before phase 2.

### Assumptions (check these)

1. The store name on the site is **Empire Solar & Hardware**, tagline **"Innovation & Hardware. All in one place."**
2. No prices are shown anywhere. Stock is never shown as a live number.
3. Enquiries go to the store by **email** and optionally **WhatsApp**. There is no customer login.
4. The site is in English (South African spelling: colour, geyser, load-shedding).
5. The supplier workbook is imported **once** into WooCommerce. After that, **WordPress is the single source**: staff add and edit products, page text, hours and contact details in the WordPress admin (section 12).
6. WooCommerce is used only to store and manage products. Its cart, checkout, prices and payments are never shown, because the public site is a separate front end.

---

## 1. Design dials

Taste Skill uses three dials. These are set for a trade-counter site, not a marketing landing page.

| Dial | Value | Why |
|---|---|---|
| Design variance | **5 / 10** | Distinctive, but the catalogue must stay predictable. Asymmetry on Home and About; strict grids in the Catalogue. |
| Motion intensity | **4 / 10** | Moderate. Motion is for feedback (added to list, filter applied, step changed) and one entrance moment per page. No scroll-jacking, no parallax. |
| Visual density | **6 / 10** | A hardware customer scans lots of items and codes. Catalogue listings run denser than the marketing pages. |

---

## 2. Brand system

### 2.1 Colour

Sampled from the logo. The logo red is `#FB040A`, which is only about 4:1 on white, so it fails AA for small text. The logo keeps its true red; the UI uses a slightly deeper red that passes.

| Token | Hex | Use | Contrast check |
|---|---|---|---|
| `--red-logo` | `#FB040A` | Logo and large decorative fills only | Not for text |
| `--red` | `#D0101B` | **The one accent.** Primary buttons, active states, links, aisle signs | 5.57:1 white text on red; 4.98:1 on concrete |
| `--red-deep` | `#B30E18` | Hover/pressed state for red | 7.02:1 with white |
| `--ink` | `#161514` | Text, dark bands, footer (off-black, not pure black) | 16.3:1 on concrete |
| `--steel-700` | `#3B3E42` | Secondary text, icons | passes AA |
| `--steel-500` | `#5A5E63` | Muted text, helper text | 5.84:1 on concrete |
| `--steel-200` | `#D5D7D9` | Borders, dividers (galvanised grey) | decorative |
| `--concrete` | `#F4F2EE` | Page background (off-white, warm like a shop floor) | |
| `--paper` | `#FBFAF7` | Dockets, cards, the enquiry list | |
| `--ok` | `#1E7A46` | "Added to list" confirmation only | functional, not decorative |

Rules:
- **One accent.** Red is the only brand accent, used the same way on every page.
- No gradients, no glows, no coloured shadows.
- Dark bands (footer, the solar feature, the location card) use `--ink` with the logo's black-background version, like the location image.
- Form errors use `--red` **plus an icon and text**, so an error never relies on colour alone.

### 2.2 Typography

The logo lettering is tall, condensed and square-shouldered, like shop signage. The type system follows it.

| Role | Font | Why |
|---|---|---|
| Display (H1, H2, aisle signs) | **Big Shoulders Display** (Google Fonts, variable) | Condensed industrial signage face; close to the logo without copying it |
| Body and UI | **Archivo** (Google Fonts, variable weight and width) | Sturdy grotesque with a trade feel; readable at small sizes; not Inter |
| SKUs and codes | **IBM Plex Mono** | Product codes line up and read like a counter docket. It has a job, it is not decoration |

- Uppercase is used **only** for display headings, because that is the brand's signage voice. Body, buttons, labels and navigation use sentence case.
- Scale (fluid `clamp()`): H1 44 to 72px, H2 32 to 48px, H3 22 to 28px, body 16 to 17px, small 14px. Body lines max 65 characters.
- No serif fonts. No italic accent words inside headlines.

### 2.3 Shape

- **The plate chamfer.** The logo sits on a steel plate with cut corners. The site uses one clipped corner (10px, top-right) on primary buttons, department tiles and aisle signs. That is the only decorative shape.
- Radius system: `2px` on inputs and chips, `4px` on cards. Nothing pill-shaped or bubbly.
- Borders: 1px `--steel-200`. Shadows only on things that float (drawer, menus), and they are neutral and tight.

### 2.4 Iconography and imagery

- Icons: **Lucide** (one library only). No emoji, no hand-drawn SVG illustrations.
- The **gear from the logo** is the one custom mark. It is used as the enquiry-list icon and the loading indicator.
- **Photos at launch:** only images we already have and are allowed to use:
  - supplier product photos (permission confirmed; about 4,900 of the 6,319 products have one),
  - the 537 Geo catalogue photos in `geo-images/`,
  - the logo, and the black location tile (address image).
- **Photos later:** the client takes real store photos (shot list in 13.1). Every place that will hold a store photo is an image field in WordPress, so staff can swap it in without a developer.
- Never: stock photos of smiling builders, AI-generated images or people, or empty grey "image coming soon" boxes.
- Product images: supplier photos, placed on a uniform `--paper` tile with padding. `mix-blend-mode: multiply` removes white backgrounds so mixed supplier photos look like one set.
- **Small photos are never enlarged.** Most Geo photos are only 120 to 440px wide. They show at their real size, centred on the tile, never stretched to fill it. Because permission is confirmed, ask Geo for their original high-resolution files and replace these in WordPress when they arrive.
- Products with no photo (about 1,400) get a designed fallback: the brand name in Archivo, the category's Lucide icon and a faint pegboard pattern. Never a broken image, never a grey box.

### 2.5 Copy voice

Plain, local, direct, like a helpful person behind the counter.

| Do | Don't |
|---|---|
| "Not on the shelf? We'll order it in." | "Elevate your building experience" |
| "Add it to your list. We'll confirm stock and price." | "Seamless procurement solutions" |
| "Kremetart Centre, Van Velden St, Brits" | "Serving customers worldwide" |
| Real numbers from the data ("15 suppliers") | Invented stats ("10,000+ happy customers", "99% satisfaction") |

**No em-dashes anywhere in the site copy** (headlines, buttons, alt text). Use full stops, commas or colons.

---

### 2.6 Logo use

The site uses the client's **PNG logos**. No vector redraw. All files are in the project folder with transparent backgrounds:

| File | What it is | Used for |
|---|---|---|
| `empire hardware horizontal logo.png` (2146 × 733) | Horizontal logo with tagline, as supplied | Print, the email signature on enquiry emails, anywhere shown 400px wide or larger |
| `empire-logo-compact.png` (2128 × 520) | **Horizontal logo with the tagline band removed.** The red underline bar moves up under "Solar & Hardware". Made from the supplied PNG | Website header and footer |
| `empire-logo-compact-120h.webp` (about 17 KB) | Compact logo at 120px high | Desktop header (shown 60px high, sharp on high-resolution screens) |
| `empire-logo-compact-80h.webp` (about 11 KB) | Compact logo at 80px high | Mobile header (shown 40px high) |
| `empire-icon-512.png` | Gear and hands only, square, cut from the same PNG | Favicon, phone home-screen icon, WordPress site icon |
| `Empire solar & hardware logo.png` (1440 × 1092) | Stacked logo | Social profile pictures, square placements |
| Location tile (black) | Address image | Default share image (1200 × 630 crop) |

- The tagline "Innovation & Hardware. All in one place." would be about 5px tall in the header and couldn't be read, so the compact logo drops it. The tagline appears as real text in the footer and in page titles instead.
- **Dark backgrounds:** the compact logo was checked on the ink colour. The white hands and gear and the red lettering stay clear, so the same file works in the footer. No separate white version is needed.
- The icon is exported at 512px; the build makes the smaller favicon sizes (32, 180, 192px) from it.
- The logo sits only in the header and footer. The hero leads with the headline and search, not a big logo.
- **Limit of PNGs:** they go soft if enlarged beyond their size. Every use on the site is well under the file sizes above, so this only matters for large print (signage, vehicle wraps). For those, ask the client's designer for the original file.

## 3. What "AI slop" looks like, and the rules to avoid it

Research sources: [TeneX Studio: 8 signs](https://tenex.studio/en/blog/ai-slop-ui-8-signes/), [Developers Digest: 16 patterns](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it), [925 Studios guide](https://www.925studios.co/blog/ai-slop-web-design-guide), [DEV: why AI pages look the same](https://dev.to/_46ea277e677b888e0cd13/why-every-ai-generated-landing-page-looks-the-same-and-how-to-fix-it-1kmo), [Taste Skill SKILL.md](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md), [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).

AI pages look alike because models produce the average of every template: a centred hero, a blue or purple gradient, three icon cards. The fix is to make every choice for this client, on purpose.

| Slop pattern | This site does instead |
|---|---|
| Inter or system font everywhere | Big Shoulders Display + Archivo + Plex Mono, each with a job |
| Purple/blue gradients, glow orbs, mesh backgrounds | Flat concrete, ink and one red. Texture comes from real materials (pegboard, paper) |
| Centred hero with a pill badge above the H1 | Left-aligned hero with the **search bar as the main action** and a real store photo |
| Three equal feature cards with icons on top | A 9-tile department grid with real product photos and real counts, laid out as a varied grid |
| Numbered "1, 2, 3" step rows | "How it works" is shown as the **real enquiry docket component**, filled with sample items |
| Stat banner ("500+ products, 24/7 support") | Real facts written into sentences, or not at all |
| Glassmorphism, frosted cards on everything | Solid surfaces. Only the mobile bottom bar gets a light backdrop blur, where it helps readability |
| Coloured left or top borders on cards | Cards are separated by a tile background and spacing |
| Fake product screenshots made of divs | Real components and real photos only |
| Filler verbs ("elevate", "unleash", "seamless") | Counter language (section 2.5) |
| Em-dashes everywhere in copy | None |
| "Scroll down" cues, decorative text strips, version labels | None |
| Placeholder text used as the label | Labels always sit above fields |
| Stock photos, AI people, generic "Acme" names | Real product photos now, real store photos once taken; real supplier names |
| Everything fades up on scroll | Only section entrances animate, once, and short (section 9) |
| Same padding everywhere, huge empty sections | Density follows the task: roomy on Home, tight in listings |
| Split header (big headline left, tiny paragraph right) | Headings stack: heading, then one line under it |
| More than two image-and-text rows in a row | At most two in a row on any page |

---

## 4. Signature hardware elements

Each element comes from the store itself and appears **only in its own place**, so none of them becomes wallpaper.

| # | Element | Where | What it does |
|---|---|---|---|
| 1 | **Plate chamfer** | Buttons, department tiles, aisle signs | Brand shape taken from the logo plate |
| 2 | **Counter docket** | Enquiry list, "order it in" notice, success receipt | Paper background, perforated top edge (CSS mask), Plex Mono codes, docket number `ESH-0001`. The enquiry list feels like the slip you get at a trade counter |
| 3 | **Aisle signs** | Department page headers, Catalogue mega menu | Red plate, white condensed text, two small hanger rods. On first load the sign settles with a small swing (see section 9). It is wayfinding for a store, online |
| 4 | **Pegboard** | Behind the department grid on Home and Catalogue; product image fallbacks | Very faint dot grid (CSS `radial-gradient`), fixed to its section, not the scrolling page |
| 5 | **Gear notch** | "Add to list" button and the list icon | When an item is added, the gear turns one tooth (30°) and the count ticks up. Feedback taken from the logo |
| 6 | **Tape-measure steps** | Multi-step enquiry and contact forms | Step indicator drawn as tape-measure ticks with a sliding marker at the current step. Tick marks and a marker, not a filled progress bar |

---

## 5. Site map and navigation

```
/                              Home
/catalogue                     Catalogue home (search, 9 departments, order-in notice)
/catalogue/[department]        Department (aisle) page
/catalogue/[department]/[category]   Product listing with filters
/p/[product-slug]              Product page (shareable, indexable)
/search?q=                     Full search results
/enquiry                       Review list and send enquiry (the "checkout" without payment)
/about                         About
/contact                       Contact, hours, map
/privacy                       POPIA privacy notice (needed because forms collect personal info)
/{page-name}                   Any new page staff create in WordPress, in the standard design (section 7.9)
```

### 5.1 Desktop header (one line, 72px high)

`[Horizontal logo]   Catalogue ▾   About   Contact        [ Search products, brands or codes...  / ]   [⚙ List (3)]`

- A thin utility strip above it: **open or closed right now** plus closing time, address, phone and WhatsApp. For a physical store, "are they open?" is a real question, so this strip earns its place.
- **Catalogue ▾** opens a mega menu: the 9 departments as a 3 × 3 grid of small aisle signs. Each shows its top 4 categories and "All [department]".
- The search field is always visible. `/` or `Ctrl/Cmd + K` focuses it.
- The header shrinks to 56px after scrolling and stays fixed, so search and the list are always one tap away.

### 5.2 Mobile

- Top: logo, search icon.
- **Bottom tab bar** (thumb reach): Home · Catalogue · Search · List (count) · Contact.
- Mega menu becomes a full-screen department list with category drill-down and a back button.
- Minimum tap targets are 44 × 44px.

### 5.3 Footer (ink background)

Black-background logo, address, hours, phone, WhatsApp, email, "Get directions", department links, supplier brands, privacy link. No newsletter sign-up (not asked for).

---

## 6. Catalogue structure (the most important part)

### 6.1 The problem

The supplier data uses each supplier's own categories: Ruwag files by task ("Cut", "Drill", "Fix", "Sand"), Ingco has 9 flat categories, WACO puts 932 items under "General Products", and some "categories" are really brands ("Harden", "tesa"). Customers do not shop by supplier. They shop by **what they are fixing**.

### 6.2 The solution: one store-wide tree, with brand as a filter

**9 departments → categories → sub-categories.** Supplier and brand become **filters**, not the structure. Nine departments fill a clean 3 × 3 grid in the mega menu and on the Catalogue home.

| # | Department | ~Products | Main sources |
|---|---|---|---|
| 1 | **Plumbing** | 1,850 | Geo Plumbing |
| 2 | **Electrical** | 1,170 | WACO, Fivestar (fans) |
| 3 | **Lighting** | 350 | WACO lighting, Fivestar LED |
| 4 | **Solar & Backup Power** | 140 | Sunsynk, Deye, Luxpower, Hanchu ESS, Fivestar solar |
| 5 | **Power Tools & Accessories** | 470 | Ingco, Wadfow, Ruwag (Cut, Drill, Sand, power bits) |
| 6 | **Hand Tools** | 780 | Ingco, Wadfow, Harden (Ruwag) |
| 7 | **Fixings & Adhesives** | 270 | Ruwag Fix, tesa |
| 8 | **Air Tools & Compressors** | 1,060 | AirCraft, Ingco air tools |
| 9 | **Paint & Waterproofing** | 230 | Promac, Africa Paints, Duram, Flash Harry |

Counts are from the workbook (6,319 rows in total) and will shift a little once mapping is final.

### 6.3 Proposed categories per department

**1. Plumbing**
- Pipe & Fittings: Pipe · HDPE Fittings · Galvanised Fittings & Stand Pipe · Compression Fittings (BDP, SABS DZR) · Capillary Fittings (copper, brass) · Batts & Couplings · Underground 110mm · Soil & Vent (40/50mm, 110mm)
- Valves
- Taps & Mixers: Mixer Ranges · Eternity Premium Range · Taps & Tap Spares · Packed Taps
- Bathroom & Toilet: Shower & Bath · Toilet & Cistern · Wastes & Waste Spares · Traps
- Geysers
- Drainage & Rainwater: Drainage System · PVC Rainwater · Econo Rainwater
- Tanks & Hose: Tank Fittings & Accessories · Hose
- Sheeting & Membranes: Builders Sheeting · Shadecloth, Foil & Membrane
- Plumbing Consumables & Tools

**2. Electrical**
- Wire & Wiring Accessories
- Switches, Plugs & Sockets: Switches · Plugs & Multiplugs · Industrial Plugs & Sockets
- Circuit Protection & Control: Circuit Breakers (MCBs) · Isolators · Contactors & Relays · Automation & Pilot Devices · Sounders · Meters
- Enclosures & DB Boards
- Security
- Fans & Air Movement (WACO + Fivestar fans and air coolers)
- Contracting Items & Electrical Tools
- Maintenance Chemicals
- Sound Equipment & Miscellaneous

**3. Lighting**
- Indoor LED & Downlights (aluminium, steel, LED indoor, glass fittings)
- Outdoor & Security Lighting (bulkheads, brick lights, LED outdoor, garden spikes)
- Floodlights
- Fluorescent Fittings (indoor, outdoor)
- Industrial Lighting
- Lamps & Bulbs
- Lamp Holders & Spotlights
- General Lighting

**4. Solar & Backup Power**
- Inverters (hybrid, all-in-one)
- Batteries & Energy Storage (residential single-phase and three-phase, commercial)
- Solar Panels
- Kits & Backup Power Packages
- Charge Controllers
- Protection: Isolators, Breakers & Fuses
- Installation Accessories & Cables
- Monitoring, Meters & CTs
- Solar Lights & DC Appliances
- EV Chargers

**5. Power Tools & Accessories**
- Drills & Drivers · Grinders · Saws · Sanders & Polishers · Rotary Hammers · Planers & Routers · Welding · Water Pumps · Generators & Petrol Tools · Batteries & Chargers
- Drill Bits (masonry, metal, wood, ceramic, sets, chucks) · Saw & Cutting Blades (circular, diamond, jigsaw, hacksaw, hole saws) · Abrasives & Sanding · Power Bits · Other Accessories
- **"Cordless" and "Petrol" become a Power source filter**, not categories, so a cordless drill appears under Drills.

**6. Hand Tools**
- Screwdrivers & Sets · Pliers & Gripping · Spanners & Sockets · Hammers & Striking · Chisels & Punches · Measuring & Marking (tapes, levels, squares) · Saws & Cutting · Tin Snips · Clamps & Vices · Finishing & Plastering · Garden Tools · Tool Storage · Safety Gear

**7. Fixings & Adhesives**
- Screws · Nails · Anchors & Wall Plugs · Nuts, Bolts & Washers · Rivets · Threaded Rod · Fastener Kits & Pre-packs · Ironmongery & Door Hardware
- Tapes (masking, packaging, insulation, repair) · Mounting & Hanging · Weather Sealing · Bath & Household

**8. Air Tools & Compressors**
- Compressors · Air Tools (nail guns & staplers, sanders, tyre inflators, other) · Spray Guns & Airbrushes · Air Treatment · Hoses & Hose Reels · Tubing · Hose Fittings · Push-in Fittings · Gauges · Vacuum Pumps

**9. Paint & Waterproofing**
- Interior Paint (walls, ceilings, kitchen and bathroom) · Exterior Paint (walls, fascias and gutters) · Roof Paint · Enamel & Metal Paint · Wood Care · Primers, Undercoats & Prep · Cleaners & Strippers · Waterproofing (acrylic, bitumen, torch-on, cementitious, damp proofing, self-adhesive) · Floor, Automotive & Industrial
- Promac ranges (Core, Easycoat, ECoat, Rubber Duck, Yes! Wood) and Africa Paints tiers (Economy, Luxury, Industrial) become a **Range** filter.

### 6.4 Mapping work

- One mapping table in the repo: `supplier, supplier category, supplier sub-category → department, category, sub-category`. The client can review it as a spreadsheet.
- **Ingco (236 hand tools, 52 power tools) and Wadfow** have no sub-categories. They get sorted by keyword rules (for example "plier" → Pliers & Gripping, "grinder" → Grinders), then a short list of leftovers is sorted by hand. This closes the open item in the Second Brain note.
- **AirCraft's 43 "other air tools"** get proper sub-categories using the same keyword method.
- Products listed in two places (Geo cross-lists, Ingco's 12 double-listed items) keep one main home and appear in the second category too.

### 6.5 Search (how most people will find things)

A hardware customer often knows exactly what they want, or has a code on a broken part. Search is the main way in.

- **Instant results** as you type (after 2 characters), grouped as: Categories first, then Products (with thumbnail, brand, SKU in mono).
- Searches **names, SKUs, brands, categories and variant codes**. Typing `RCSB18540` finds the one saw blade.
- **Tolerates typos** ("sunsink" finds Sunsynk).
- **Local synonyms list** so people can use the words they actually say:
  - "globe" → lamps and bulbs · "trip switch" / "breaker" → MCBs · "DB board" → enclosures · "load shedding" / "backup" → inverters, batteries, kits · "geyser" and "geezer" → geysers · "cordless" → power source filter · "silicone" / "sealant" → weather sealing
- **No results:** never a dead end. Show "We might still have it, or we can order it" and a button **Add "[search term]" to your list as a special request**.
- Technical choice: a client-side index (MiniSearch), about 150 KB gzipped, loaded the first time someone focuses the search box.

### 6.6 The stock notice

Required: not every product is always in stock, but the store will get it.

- **Main notice (Catalogue home, near the top):** a counter docket, the only large one on the page.
  - Heading: **Not on the shelf? We'll order it in.**
  - Body: "This catalogue lists over 6,000 products from our 15 suppliers. Not everything is in store every day, but if it's here, we can get it for you. Add it to your list and we'll confirm stock, price and how long it takes."
  - Link: "How ordering in works" (opens a short explainer).
- **Listing pages:** one quiet line under the results count: "Stock varies. Anything listed can be ordered in."
- **Product page:** next to the Add button: "Availability confirmed when you send your enquiry. If it's not in store, we'll order it."
- **Enquiry form:** a checkbox that is ticked by default: **"If something isn't in stock, please order it in for me."**

---

## 7. Page designs

### 7.1 Home

Goal: in 5 seconds, a visitor knows what the store sells, where it is, whether it is open, and how to find a product.

| # | Section | Content and layout |
|---|---|---|
| 1 | **Utility strip + header** | Open-now status, address, WhatsApp; main header |
| 2 | **Hero** (fits in the first screen) | Left, 7 of 12 columns: H1 **"Solar, tools and plumbing. One counter in Brits."** (7 words); one line: "Browse over 6,000 products, build a list, and we'll have it ready."; **big search field** with 3 example chips under it (`Sunsynk inverter`, `15mm ball valve`, `angle grinder`); buttons **Browse the catalogue** (red) and **Visit the store** (text link). Right, 5 columns: **"On the counter"**, a 2 × 2 set of real product tiles on the pegboard (for example a Sunsynk inverter, an Ingco angle grinder, a Geo mixer tap, a Promac paint tin). Each tile links to its product, and staff choose the four in WordPress. When the storefront photo is taken, staff switch this slot to the photo in a chamfered frame. No badge above the heading, no gradient blob |
| 3 | **Supplier brands** | One slow marquee of real supplier logos (the only marquee on the site). Stops on hover and for reduced-motion users |
| 4 | **Shop by department** | The 9 departments on the pegboard background. A varied grid: Plumbing and Electrical (biggest ranges) get large tiles; the rest are smaller. Each tile: cut-out product photo, name as an aisle sign, real product count, 3 category links. Exactly 9 tiles, no empty cells |
| 5 | **How ordering works** | The **real enquiry docket component** shown half filled (3 sample items, qty steppers, "Send enquiry"), next to three short lines: *Add what you need. Send the list. We confirm stock, price and timing.* Link to Catalogue |
| 6 | **Solar & backup power** (ink band) | Image and text: at launch, the Sunsynk inverter and battery product photos on a paper tile (white-background photos need a light tile, even on the dark band); later, a photo of a real install. Heading "Backup power, sorted.", 2 lines about Sunsynk, Deye, Luxpower and Hanchu, button **See solar & backup** plus a quick **Ask about a solar setup** link that opens the Contact form with "Solar" already chosen |
| 7 | **Visit us** | Location card using the **black location tile image** as its picture: address, hours table (today highlighted), static map image that opens Google Maps, **Get directions** and **WhatsApp us** buttons |
| 8 | **Footer** | As in 5.3 |

Only one image-and-text row (section 6), so the page never zigzags.

### 7.2 Catalogue home (`/catalogue`)

1. **Heading and search:** aisle-sign H1 "Catalogue", and a wide search field.
2. **Stock notice docket** (section 6.6).
3. **Departments:** the 9 tiles, a tighter version of the Home grid.
4. **Popular categories:** a row of scrollable chips (Geysers, Circuit Breakers, Inverters, Angle Grinders, Compression Fittings, Waterproofing...). Chosen by the client, or later from enquiry data.
5. **Shop by brand:** the 15 supplier logos as a grid. Clicking one opens search filtered to that brand.

### 7.3 Department page (`/catalogue/plumbing`)

- **Aisle-sign header** with the department name and product count.
- Breadcrumb: Catalogue › Plumbing.
- **Category tiles** in a dense grid (4 across on desktop, 2 on mobile): photo, name, count, sub-categories listed underneath as links.
- Desktop: a left rail with the full category tree for the department, so people can jump across without going back.

### 7.4 Product listing (`/catalogue/plumbing/valves`)

**Layout (desktop):** filter rail on the left (260px), results on the right.
**Layout (mobile):** a sticky "Filters (2)" button opens a bottom sheet; applied filters show as removable chips.

- **Top of results:** heading, count ("135 products"), the stock line (6.6), sort (A to Z, Brand), and a **Grid / List** view toggle.
  - **Grid view:** for browsing (tools, lighting, paint).
  - **List view:** compact rows with thumbnail, name, SKU in mono, brand, qty stepper and Add. For trade customers buying many fittings by code. The toggle is remembered.
- **Filters** depend on the category: Sub-category · Brand · Power source (tools) · Range (paint) · Size, where sizes can be read from product names (15mm, 22mm, 110mm). Counts shown next to each option; options with 0 results are disabled, not hidden.
- Filters update results immediately (no Apply button on desktop) and are **saved in the URL**, so a filtered list can be shared on WhatsApp.
- **Loading more:** 36 per page with a "Show 36 more (99 left)" button. It keeps the footer reachable and the position stable.
- **Product card:** image tile, brand (small, steel), name (2 lines max), SKU or "5 sizes" in mono, and **Add to list**. Once added, the button changes to a qty stepper with a green tick, so the customer can see what is already on the list while browsing.

### 7.5 Product page (`/p/geo-brass-ball-valve`)

One page per **product family** (for example every size of a ball valve), not one per code, as set out in the SEO plan (`Empire-SEO-GEO-Plan.md`, section 3.2). In WooCommerce each family is a variable product, and each size or pack is a variation with its own code.

- Breadcrumb.
- Left: image (zoom on click; fallback tile if none).
- Right: brand, name (H1), codes in mono, **size/variant chips** where the product has several codes (for example Ruwag blades 160, 185, 210mm), details from the data, **qty stepper + Add to list** (red), an optional note field ("need it by Friday"), and the stock line.
- A second action: **Ask about this on WhatsApp**, which opens WhatsApp with the product name and code filled in.
- Below: "More in Valves" (8 related products) and "Often needed with" (hand-picked later; hidden until there is data).
- One indexable page per product helps local search ("Geo 15mm ball valve Brits").

### 7.6 Enquiry list and sending it (the "cart" without a cart)

**The list (drawer):**
- Opens from the header list button (desktop: right-side drawer, 420px; mobile: full-height sheet).
- Styled as a counter docket: paper, perforated top edge, docket number, date.
- Each line: thumbnail, name, SKU (mono), qty stepper, "Add a note" link, remove (with a 5-second **Undo** toast).
- **Add an item that isn't listed:** a free-text line ("What do you need?" + qty). Important because the catalogue will never be complete.
- Footer: item count, **Send enquiry** (red), "Keep browsing".
- The list is saved in the browser, so it survives a page refresh or coming back the next day.
- Empty state: a line drawing of the empty docket is **not** used (no hand-drawn SVGs). Instead: "Your list is empty. Search or browse, then tap Add to list." with a search field and the department chips.

**Sending (`/enquiry`, 3 steps with the tape-measure indicator):**
1. **Your list:** final check of items, quantities and notes.
2. **Your details:** name, phone (required, SA format), email (optional), preferred reply (chips: WhatsApp · Call · Email), collect in store or ask about delivery (only if the store delivers; confirm), the "order it in for me" checkbox (ticked), and an optional message.
3. **Review & send:** a summary docket, the POPIA consent line, and **Send enquiry**.

**After sending:** the docket gets a red **"Received"** stamp animation (once, 400ms), shows docket number `ESH-0142`, "We'll get back to you within [store's reply time]", a **Send a copy on WhatsApp** button, and **Start a new list**. The list is cleared only after a successful send.

**Delivery of the enquiry:**
- The front end sends the enquiry to WordPress (a small custom endpoint, section 12.5). WordPress:
  - saves it as an **Enquiry** in the admin, with a status (New, Replied, Ordered in, Collected, Closed), so staff have one inbox and nothing gets lost in someone's email,
  - emails the store with the items as a clean table (name, code, qty, note), customer details, the docket number and a link to the enquiry in the admin,
  - optionally emails the customer a copy, if they gave an email address.
- Optional WhatsApp button: opens `wa.me/<store number>` with the whole list as text. Works even if WordPress is down.
- Spam protection: a hidden honeypot field plus Cloudflare Turnstile (invisible for most people).
- If sending fails: keep everything filled in, say what went wrong in plain words, and offer WhatsApp as the backup.

### 7.7 About (`/about`)

| # | Section | Content |
|---|---|---|
| 1 | Intro | H1 "Built in Brits." and 2 to 3 sentences on who Empire is. Store interior photo, wide |
| 2 | The logo's story | The hands holding the gear: why the name and mark. Short, from the owner's own words |
| 3 | What we stock | The 9 departments as a simple two-column list of links with counts (not cards) |
| 4 | How we work | The order-in promise, and the fact that the team knows the trade. One image and text row |
| 5 | The team | Real photos of the people behind the counter, names and what each knows best. Only if the client provides photos; otherwise this section is left out, not faked |
| 6 | Our suppliers | Logo grid with a line each on what the brand is for |
| 7 | Visit | The location card from Home, reused |

No invented timeline, awards or statistics. Copy comes from a short client interview (section 13).

**Photos at launch:** section 1 uses the black location tile, full width on an ink band, until a store interior photo is taken. Section 4 uses the order-in docket component instead of a photo. Section 5 (team) stays hidden until real team photos exist. So the About page launches with no gaps and no stand-in images, and each photo slot is a WordPress image field that staff fill later.

### 7.8 Contact (`/contact`)

Two columns on desktop: the **interactive form** (7 columns) and a **store card** (5 columns) with address, today's hours and open-now status, phone (tap to call), WhatsApp, email, a map and **Get directions**. On mobile the store card comes first, because most mobile visitors want the address or phone number.

**The form changes to fit the question:**
1. **"What can we help with?"** as large chips with icons: Product question · Solar & backup quote · Order something in · Match a part · Something else.
2. Fields that appear for each choice (slide open, 200ms):
   - **Solar & backup quote:** property type (house, business, farm), what needs to stay on (chips: lights, fridge, TV and Wi-Fi, geyser, pool pump, whole house), roughly how long (hours), existing setup (none, have inverter, have panels). Helps the store quote without a long call.
   - **Order something in:** product name or code, quantity, when it's needed.
   - **Match a part:** **"Upload a photo of the part"** (drag and drop or camera on mobile, up to 3 images, preview thumbnails). Customers often come in with a broken fitting; a photo saves a trip. Photos are resized in the browser before upload (max 1600px), then saved privately with the message in WordPress, not in the public media library.
   - **Product question / Something else:** a message field.
3. **Your details:** name, phone, email (optional), preferred reply (WhatsApp, call, email).
4. **Send.** Success state: short "Thanks, [name]. We'll reply on WhatsApp during shop hours." with the time reply is expected.

---

### 7.9 Standard page (the design for every new page)

Staff can add pages in WordPress at any time, for example "Load-shedding specials", "Trade accounts" or "Holiday trading hours". **Every new page gets this one standard design automatically.** Staff write the content; they never choose a layout, colour or font, so a new page always looks like the rest of the site.

**Layout, top to bottom**

| # | Part | Content | Always there? |
|---|---|---|---|
| 1 | Header and utility strip | Same as every page | Yes |
| 2 | Breadcrumb | Home › Page title | Yes |
| 3 | **Page header** | Aisle-sign H1 (the page title), and an optional one-line intro under it | Title always; intro optional |
| 4 | Header image | One wide photo in a chamfered frame | Optional. Left out if empty, with no blank frame |
| 5 | **Body** | The page content from the WordPress editor, in one readable column (max 720px) with the site's type and spacing | Yes |
| 6 | Help band | "Need something for this? Add it to your list, or WhatsApp us." with the Browse catalogue and WhatsApp buttons | Yes (staff can switch it off per page) |
| 7 | Visit us card | The location card from Home | Yes |
| 8 | Footer | Same as every page | Yes |

**What staff can put in the body.** The WordPress editor only offers these blocks, each already styled to match the site:

| Block | Looks like |
|---|---|
| Heading (H2, H3 only) | Big Shoulders Display for H2, Archivo bold for H3 |
| Paragraph, list | Archivo body text; links in red |
| Image, gallery | Photos in the site's frames, with captions |
| Table | Clean rows for things like holiday hours or size charts |
| Quote | Large text with a red rule; for customer words or a counter tip |
| Button | Red chamfered button, or a text link |
| Separator | A thin steel line |
| YouTube video | Embedded at full column width, loads only when tapped |
| **Product grid** (custom) | Staff pick products; they show as real product cards with **Add to list** |
| **Notice** (custom) | A counter docket panel for an important message ("Closed on 24 September") |
| **Enquiry prompt** (custom) | The help band from part 6, placed anywhere in the text |

Staff **cannot** change colours, fonts, font sizes, spacing or column layouts, or paste raw HTML. Those controls are removed from the editor. That is what keeps every page on-brand.

**Where new pages appear**
- URL: `/{page-name}`, for example `/load-shedding-specials`.
- Tick **"Show in footer"** on the page to add it to the footer links. It's not in the main menu, which stays fixed so navigation stays simple.
- Included in the sitemap and search engines automatically, with the page title and description from Yoast.

## 8. Form behaviour (all forms)

- Labels sit above fields, always visible. Placeholders show examples only ("e.g. 082 123 4567").
- Validate **when a field is left** (not on every key press), and again on submit. Error text sits under the field with an icon: "Enter a 10-digit number starting with 0."
- Phone: accepts `082 123 4567`, `0821234567` and `+27 82 123 4567`, and formats it as you type.
- Required fields are marked "Required" in words; optional ones say "Optional".
- The submit button shows a gear loading indicator and disables itself while sending, so nothing is sent twice.
- Keyboard: full tab order, Enter moves to the next step, visible focus rings (2px red outline, 2px offset).
- Chips are real radio or checkbox inputs underneath, so screen readers and keyboards work.
- Form progress is kept if the visitor leaves and comes back (saved in the browser; cleared after sending).
- Every field and help text passes AA contrast.

---

## 9. Motion

Moderate and short. Each animation has a reason. Only `transform` and `opacity` are animated. Everything below turns into a simple instant change for people who set **reduce motion** on their device.

**Easing:** `cubic-bezier(0.2, 0.8, 0.2, 1)` (quick start, soft landing) for most things; a gentle overshoot only for the aisle sign and the stamp.

| Moment | Trigger | Animation | Time | Why |
|---|---|---|---|---|
| Page load (Home hero) | Load | Headline, sub-line, search and photo appear in order, 60ms apart, 12px rise | 450ms total | One clear entrance per page |
| Aisle sign | Department page load | Sign swings from 3° to 0° with one small overshoot | 600ms, once | Wayfinding moment, store feel |
| Section entrance | Section enters view (IntersectionObserver) | Fade in and 16px rise, once only | 350ms | Gives sections a start; never replays |
| Add to list | Click | Button becomes a stepper; gear turns 30°; list count bumps (scale 1 → 1.15 → 1) | 250ms | Confirms the action worked |
| List drawer | Open/close | Slides in from the right; page dims to 40% ink | 280ms in, 200ms out | Shows where the list lives |
| Filter change | Filter applied | Results cross-fade; count number updates | 180ms | Shows the result changed without a jump |
| Mega menu | Hover (150ms delay) or click | Drops 8px and fades in | 200ms | Fast; the delay stops it opening by accident |
| Form step | Next/Back | Old step slides out left, new one slides in; tape marker moves | 300ms | Shows direction through the form |
| Conditional fields | Chip chosen | Height opens, fields fade in | 200ms | Shows what was added |
| Sent | Success | "Received" stamp scales 1.4 → 1 with slight rotation | 400ms, once | A small reward at the end |
| Buttons and cards | Hover | Buttons darken to `--red-deep`; cards lift 2px | 150ms | Shows what can be clicked |
| Supplier marquee | Always | Slow scroll, pauses on hover | about 40s per loop | The only continuous motion on the site |

Not used: parallax, scroll-jacking, cursor effects, page-transition wipes, animated counters, typewriter text, looping background animation.

---

## 10. Accessibility

- WCAG 2.2 AA throughout. Contrast checks are in the colour table (2.1).
- Semantic HTML: one H1 per page, landmarks (header, nav, main, footer), skip-to-content link.
- Drawer and bottom sheet trap focus, close on Esc, and send focus back to the button that opened them.
- Add, remove and filter updates are announced to screen readers with a polite live region ("Brass ball valve 15mm added. 4 items on your list.").
- Images have useful alt text (product name and brand); decorative textures are hidden from screen readers.
- `prefers-reduced-motion` supported everywhere (section 9).
- Works at 200% zoom and at 320px wide, with no sideways scrolling.

---

## 11. Performance and SEO

**Targets:** LCP under 2.5s on a mid-range Android phone on mobile data, INP under 200ms, CLS under 0.1. This matters in SA, where data costs are high.

- Pages are pre-built, cached, and served from Cloudflare's Johannesburg edge. They refresh only when something changes in WordPress (sections 12.1 and 12.4.1).
- Product images: stored once in the **WordPress media library** (imported from the supplier sites and `geo-images/`, never hot-linked). WordPress makes each size once on upload (160, 320 and 640px, never larger than the original), and the free **Modern Image Formats** plugin saves AVIF and WebP copies. They are served through **Cloudflare's free CDN** in front of `cms.<domain>`. Lazy-loaded below the fold, with fixed aspect ratios so nothing jumps.
- Fonts: 3 families, subset to Latin, `font-display: swap`, display font preloaded.
- The search index loads only when someone uses search.
- The map is a static image until tapped, so no heavy Google Maps script on page load.

**Local SEO:**
- `HardwareStore` structured data (schema.org) with address, geo coordinates, opening hours, phone and logo.
- Page titles like "Geysers | Empire Solar & Hardware, Brits".
- Product pages with basic `Product` data (name, brand, SKU, image; no price).
- XML sitemap, clean URLs, Open Graph images (the black location tile works well as the default share image).
- Link to the store's Google Business Profile, and make sure the name, address and phone match it exactly.

---

## 12. Build approach: headless WordPress

### 12.1 How it fits together

```
STAFF                                              CUSTOMERS
  │                                                    │
  ▼                                                    ▼
WordPress admin  (cms.<domain>)                  Cloudflare (free CDN, Johannesburg edge)
  • WooCommerce: products, categories, brands          │
  • Pages, advice posts, store details                 ▼
  • Enquiries inbox                              Website  (<domain>): Next.js on Render
  │                                                • Pages pre-built and cached
  │                                                • Search, filters, enquiry list
  │                                                • Enquiry and contact forms
  │                                                    ▲        │
  │ 1. Staff press Publish                             │        │
  │ 2. WordPress tells the website what changed ─► Only those   │
  │    (a signed "revalidate" call)                pages refresh│
  │                                                (seconds)    │
  │ Preview: WordPress opens the draft in the real site design  │
  │                                                             │
  ◄──────────── 3. Forms send enquiries to WordPress ◄──────────┘
```

- **"Headless"** means customers never see WordPress itself. WordPress is the back office where staff manage everything. The public website is a separate Next.js front end that reads WordPress's data. If someone opens `cms.<domain>` without logging in, they are sent to the website (image files and the data API stay reachable, because the website needs them).
- **Why Next.js** (decided 30 Sep 2026, instead of Astro):
  - **Changes go live in seconds.** When staff publish, WordPress sends the website a list of what changed (for example "product 123, category Valves"). Next.js refreshes just those pages. Nothing else is rebuilt, and deploys stay short no matter how big the catalogue grows.
  - **True preview.** Staff press **Preview** in WordPress and see the unpublished page, product or article in the real site design before it goes live (Next.js "draft mode").
  - **Room to grow.** If the client later wants trade accounts, saved lists or logins, Next.js handles app-like features without rebuilding the site.
- **What stays the same:** pages are still pre-built and cached, every product name, code and hours table is in the HTML (SEO plan, section 3.8), and the website stays up if WordPress is down. Only the forms depend on WordPress, and they fall back to WhatsApp.
- **Keeping it light on mobile data:** Next.js loads the React runtime on every page, which Astro did not. To keep pages fast, everything is a **server component** by default and sends no JavaScript. Only the parts that need to react in the browser are client components: search, mega menu, filters, the enquiry list and Add buttons, the forms and the open-now line. Animations are plain CSS, so no animation library is loaded. **Budget: under 250 KB of compressed JavaScript on any content page** (raised from 150 KB on 1 Oct 2026, see the change list), checked in QA.
- **The "open now" line and today's hours** are worked out in the visitor's browser from the saved hours, so they are right every day without any refresh.

### 12.2 WordPress setup

| Part | Choice | Notes |
|---|---|---|
| Hosting | Managed WordPress host with daily backups, a staging site and PHP 8.3 or later | Customers never load WordPress, so speed matters less than reliability and backups |
| Products | **WooCommerce**, used only to store products | Cart, checkout, payments, coupons, customer accounts, tax, stock tracking and WooCommerce emails are all switched off. Price fields are left empty and the front end never reads them |
| Brands | WooCommerce Brands (built in) | Powers the brand filter and `/brands/{brand}` pages |
| Extra fields | **Secure Custom Fields** (free, on WordPress.org) | Page fields, category intros and FAQs, store details, counter tips (12.3). It is the free version of ACF maintained by WordPress.org and includes the repeater, gallery and options-page fields this plan needs, which ACF only offers in its paid Pro version |
| SEO fields | **Yoast SEO** (free) | Staff edit page titles and meta descriptions. Yoast's own sitemaps and schema are switched off, because the front end makes those (SEO plan, sections 3.6 and 3.7) |
| Email | WP Mail SMTP (free version) + a transactional email service, with SPF and DKIM set on the domain | So enquiry emails land in the inbox, not in spam |
| Images | **Modern Image Formats** (free, by the WordPress performance team) | Saves AVIF and WebP versions of every image size (section 11) |
| Our code | **`empire-core`**, a small custom plugin written by One S Digital | Enquiry inbox, form endpoints, refresh-on-publish and preview links, headless redirect, security rules |
| Security | Cloudflare (free) in front of `cms.`, host firewall or Wordfence (free version), two-factor login for all staff, XML-RPC off, login limits | The website reads data with a **read-only** API key |

**Every plugin above is free.** No paid plugins or licences are used. Keep the list this short: each extra plugin is another thing to update and another thing that can break.

### 12.3 What lives where in WordPress

| WordPress item | What it holds | Where it shows |
|---|---|---|
| **Products** (WooCommerce) | One product per **family** (SEO plan, section 3.2). Variable products hold each size or pack as a variation with its own code, photo and pack info. Single-code items are simple products | Product pages, listings, search |
| Product extra fields (Secure Custom Fields) | Counter tip · Supplier (internal only, for reordering) · Index tier (worked out automatically: has photo or specs → indexed; staff can override) · "Often needed with" · "Show on the counter" (Home hero) | Product pages, Home |
| **Product categories** | The 9-department tree (section 6.3), with custom fields: intro text, FAQs, tile image, aisle-sign label | Department and category pages, mega menu |
| **Attributes** | Size · Pack (bulk or pre-packed) · Power source · Range · Rating (amps, watts, kVA) | Filters and variation chips |
| **Brands** | Logo, short description | Brand wall, brand pages, brand filter |
| **Pages** | Home, About, Contact, FAQ, Privacy, each with custom fields (headline, sub-line, hero visual, "On the counter" products, popular categories, About sections, team members) | Those pages |
| **Advice** (post type) | Counter advice guides from the SEO plan, with a named staff author | `/advice/{slug}` |
| **Store details** (options page) | Address, map pin, phone, WhatsApp, email, hours per weekday, public holiday closures, reply time, delivery (yes or no, and where), social links, the stock-notice text | Header strip, footer, Contact, Visit us, schema |
| **Enquiries** (private) | Docket number, items, custom items, customer details, preferred reply, status, staff notes, uploaded photos | Admin only |

**New pages: one standard design (section 7.9)**
- Any WordPress page that isn't one of the fixed pages (Home, About, Contact, FAQ, Catalogue) is built with the **standard page template** in the front end. There is only one template, so every new page matches.
- **Locked editor:** WordPress's editor settings (`theme.json` in a small headless theme) turn off custom colours, font sizes, spacing and layout controls, and the allowed-blocks list limits staff to the blocks in 7.9. The editor loads the site's fonts and colours, so what staff see while writing looks close to the live page.
- **Custom blocks:** Product grid, Notice and Enquiry prompt are built into `empire-core` (free, our own code). The front end turns each one into the real site component.
- **Page fields:** intro line, header image, "Show help band" (on by default) and "Show in footer" (off by default).
- **Reserved names:** `empire-core` blocks page names the site already uses (`catalogue`, `p`, `brands`, `advice`, `search`, `enquiry` and the fixed pages), so a new page can't clash with or replace them.
- **Preview:** staff press **Preview** and see the unpublished page in the real site design (12.4). After Publish, it is live within seconds.

**Staff roles:** One S Digital keeps the Administrator login. Store staff get **Shop Manager** accounts: products, categories, pages, store details and enquiries, but no plugins or settings.

### 12.4 The front end

| Part | Choice |
|---|---|
| Framework | **Next.js** (App Router, TypeScript), server components by default |
| Styling | Plain CSS (CSS Modules) with the design tokens from section 2 |
| Interactive parts | Client components only where needed: search, mega menu, filters, enquiry list, forms, open-now line |
| Animation | CSS transitions and keyframes (section 9); no animation library |
| Data | Reads WooCommerce (products, variations, categories, brands) and WordPress (pages, advice, store details) through their REST APIs, on the server only, with a read-only key. Every fetch is cached and labelled (for example `product-123`, `category-valves`, `store-details`) so a change refreshes exactly the pages that use it |
| Pre-building | At deploy, the ~130 core pages (SEO plan, tier A) and the most-viewed products are pre-built. Every other product page is built the first time someone opens it, then cached. Deploys take a few minutes, however many products there are |
| Refresh on publish | `empire-core` calls `/api/revalidate` on the website with a secret key and the changed labels. The website refreshes those pages, clears the same URLs from Cloudflare's cache, and pings IndexNow with them (where the SEO plan says "build script", this is it) |
| Preview | WordPress's Preview button opens `/api/preview`, which switches on Next.js draft mode and shows unpublished content in the real design, for logged-in staff only |
| Pagination and filters | Rendered on the server from the cached data, so `?page=2` links work without JavaScript, as the SEO plan requires (section 3.4) |
| Search | MiniSearch index served as one cached file, refreshed whenever a product changes, with the synonyms list (section 6.5) |
| Forms | Server actions: the website's server checks the Turnstile token, then passes the enquiry to WordPress with a secret key (12.5). WordPress's form endpoints are never called from the browser. The server-action size limit is raised from Next.js's 1 MB default to 8 MB for photo uploads |
| SEO output | Page titles and descriptions from Yoast; JSON-LD, `sitemap.xml` (split by type) and `robots.txt` made by Next.js, as set out in the SEO plan |
| Images | `next/image` with a custom loader that picks the right size WordPress already made (section 11), so the website server does no image processing |

### 12.4.1 Hosting on Render

| Part | Setup | Why |
|---|---|---|
| Website | One Render **web service** running Next.js (`next build`, then `next start`), on a **paid instance** | Render's free instances go to sleep after about 15 minutes with no visitors, and the next visitor waits close to a minute. A shop's website can't do that |
| Region | **Frankfurt** | Render has no African region; Frankfurt is the closest to South Africa |
| CDN in front | **Cloudflare free plan** on `<domain>` and `cms.<domain>` | Serves cached pages, images and code from Cloudflare's Johannesburg edge, so most visitors never wait for Frankfurt. A cache rule lets Cloudflare cache pages for as long as Next.js allows, and refresh on publish clears changed URLs (12.4) |
| One instance | Run a single instance | Next.js keeps its page cache on the instance. With one instance, a refresh on publish reaches every visitor. If traffic ever needs two or more, add a shared cache (Render Key Value) first |
| Deploys | Auto-deploy from GitHub on every push to `main`, with Render's health check so a broken build never goes live | Zero-downtime deploys |
| Staging | A second, smaller Render service deploys the `staging` branch and reads the staging WordPress | Next.js and plugin updates are tested here first |
| Cache after a deploy or restart | Render's disk is wiped on each deploy, so the page cache starts empty. The first visit to each page rebuilds it; the core pages are pre-built during the deploy, so the busiest pages are never slow | Expected, no action needed |
| WordPress | Stays on a managed WordPress host (12.2), not Render | Render has no managed MySQL, and WordPress needs a permanent disk for uploads |

**Check with the SEO plan:** with Cloudflare in front of the website, switch off Cloudflare's AI bot blocking for the search crawlers listed in the SEO plan (section 3.7).

### 12.5 Enquiry and contact endpoints

`empire-core` adds two endpoints: `POST /wp-json/empire/v1/enquiry` and `POST /wp-json/empire/v1/contact`.

- Only accepts calls from the website's server, signed with a secret key. The website's server has already checked the Cloudflare Turnstile token and the honeypot field. WordPress also limits each visitor to a few sends per hour.
- Checks listed items against real product and variation IDs. Custom "not listed" items are kept as plain text. A list can have up to 100 lines.
- Saves the Enquiry, gives it the next docket number (`ESH-0001`, `ESH-0002` and so on), sends the emails (section 7.6) and returns the docket number to the success screen.
- **Photos** (contact form): JPG, PNG, WebP or HEIC only, up to 3 files, saved in a private folder that only logged-in staff can open. The browser shrinks each photo to 1600px before sending, so uploads are small and quick on mobile data.
- **POPIA:** the privacy page explains what is kept and why. Enquiries are deleted automatically after a set time (suggest 24 months; the client decides).

### 12.6 Moving the catalogue into WordPress (one time)

1. **Map and group.** A script reads `supplier-catalogue.xlsx` and the mapping table (section 6.4), groups rows into product families (SEO plan, section 3.2), and writes a WooCommerce import file with parents, variations, categories (`Plumbing > Valves > Ball Valves`), brands, attributes, codes and image links.
2. **Images.** All supplier images are downloaded into the media library, with permission confirmed. The 537 Geo photos go in first from `geo-images/`. Files get descriptive names on import (`geo-float-valve-15mm.jpg`, not `BFV15.jpg`), and alt text is set as brand + product + key spec.
3. **Staging first.** The import runs on the staging site. It uses WP-CLI in batches, because about 4,900 image downloads through the normal importer would time out. Our WPVibe connection can run these commands on the client's WordPress.
4. **Check the report:** product counts per supplier match the workbook, 0 unmapped rows, every code unique, images attached, and a list of families with no photo.
5. **Production.** The same import runs on the live site. From then on **WordPress is the source of truth** and the workbook is archived.

### 12.7 Day-to-day for staff

| Task | How | Live after |
|---|---|---|
| Add a product | Products → Add new: name, category, brand, photo, sizes and codes → Preview → Publish | within seconds |
| Change hours or add a holiday closure | Store details → edit → Save | within seconds |
| Answer an enquiry | Email arrives → open it in Enquiries → reply by WhatsApp or phone → set status to Replied | at once (admin only) |
| Swap in a store photo | Pages → Home → Hero visual → choose "Photo" → upload | within seconds |
| Feature products on Home | Tick "Show on the counter" on up to 4 products | within seconds |
| Add a new page | Pages → Add new → write it with the allowed blocks → Preview → Publish | within seconds |

At handover: a one-page staff guide with screenshots, and a 45-minute training session.

### 12.8 Costs to budget (ongoing)

- Managed WordPress hosting
- **Render:** a paid web service instance for the website, plus a smaller one for staging (12.4.1)
- Cloudflare: free plan
- Transactional email service (a free tier usually covers a store's volume)
- Domain
- Monthly maintenance: WordPress, plugin and security updates, Next.js updates, backup checks, and a check that refresh on publish still works

### 12.9 Risks and how the plan handles them

| Risk | Handling |
|---|---|
| Pages get heavy with JavaScript | Server components by default, CSS-only animation, a 250 KB JavaScript budget checked in QA |
| Server is in Frankfurt, far from Brits | Cloudflare serves cached pages and images from Johannesburg; checked on a real phone on mobile data in QA |
| A change doesn't show on the site | Each save sends labelled refreshes and clears Cloudflare for those URLs; a "Refresh whole site" button in `empire-core` as a fallback; covered in training |
| Next.js updates change how things work | Upgrades tested on the staging service first, as part of monthly maintenance |
| WordPress goes down | The website stays up; forms fall back to WhatsApp |
| Plugin updates break something | Short plugin list; updates tested on staging first; monthly maintenance |
| Spam enquiries | Turnstile, honeypot, rate limit |

---

## 13. What we need from the client

| # | Item | Blocks |
|---|---|---|
| 1 | **Logo approval** of the compact header version and the icon cut from their PNG (section 2.6). For large print later, the designer's original file | Header, favicon |
| 2 | **Store photos** from the shot list (13.1). The site launches without them and they are added in WordPress as they come in | Home hero photo, About, Solar band |
| 3 | Trading hours (including Saturday, Sunday and public holidays) | Utility strip, contact |
| 4 | Phone, WhatsApp number, enquiry email | Forms, header, footer |
| 5 | Do they deliver? Where to, and what does it cost? | Enquiry form step 2 |
| 6 | Usual reply time for enquiries | Success message |
| 7 | Exact map location (pin) | Map, structured data |
| 8 | About story: short interview (15 minutes) on the owners, history and the logo | About page |
| 9 | Supplier logo files | Brand wall |
| 10 | Which suppliers and ranges to show at launch (for example, should all 1,056 AirCraft fittings be listed?) | Catalogue scope |
| 11 | Popular categories to feature | Catalogue home |
| 12 | Answers to open data items: Geo "Small Spares" and "Pre Packed Ranges", 6 hidden WACO items, the missing Fivestar range | Catalogue completeness |
| 13 | High-resolution product photos from Geo (their catalogue photos are small), and product photos from AirCraft, Promac, Duram, Flash Harry, Africa Paints and Hanchu, which have none in the workbook | Photo quality, indexing (SEO plan, section 3.3) |
| 14 | Domain name, and who owns the Google Business Profile | Launch, SEO |
| 15 | Names and email addresses of staff who need WordPress logins | Staff accounts |
| 16 | Access to the domain's DNS settings. The domain's DNS moves to Cloudflare (free plan) | Cloudflare CDN, email delivery (SPF, DKIM), `cms.` subdomain |
| 17 | How long to keep enquiries (suggest 24 months) | POPIA |

The questions in the SEO plan (section 11.4) should be asked in the same client meeting.

**Supplier permission:** confirmed. The client buys directly from every supplier, so their product photos and descriptions can be used, including Wadfow and the solar brands.

### 13.1 Photo shot list for the client

Phone photos are fine. Guidelines:
- Shoot in daylight with the shop lights on; tidy the counter first.
- Hold the phone **sideways** (landscape) for everything except portraits.
- Send the **original files** by Google Drive or WeTransfer, not over WhatsApp, which shrinks them.
- Ask before photographing customers; better to leave them out.

| # | Photo | Used on |
|---|---|---|
| 1 | Storefront from the car park, sign readable | Home hero, About, Google Business Profile, share image |
| 2 | The counter, with staff behind it | About intro |
| 3 | One wide shot per main aisle (plumbing, electrical, tools, paint, solar) | Department headers, About |
| 4 | Each team member, same plain wall, chest up | About team section (only shown once these exist) |
| 5 | An inverter and battery installed on a wall (a customer install, with their OK) | Solar band on Home |
| 6 | Paint and waterproofing tins on the shelf, one brand per shot | Paint products with no photo |
| 7 | AirCraft fittings and compressors on display | Air tools products with no photo |
| 8 | The Empire sign close up | About |

---

## 14. Build phases (each with a check)

| Phase | Work | Done when |
|---|---|---|
| 1. WordPress and hosting setup | WordPress hosting, Render web services (live and staging), Cloudflare on both domains, staging site, free plugins (12.2), `empire-core` basics, staff roles, `cms.` subdomain, headless redirect, read-only API key | Staging admin works; a logged-out visit to `cms.` goes to the website; the read-only key returns products and cannot change anything |
| 2. Data import | Mapping table, product families, sub-category rules, import file, images, run on staging (12.6) | Counts per supplier match the workbook; 0 unmapped rows; all codes unique; report of families without photos |
| 3. Design system and logo | Tokens, type, chamfer, docket, aisle sign, buttons, form fields, cards, icons in one styleguide page; logo placements (section 2.6) | Styleguide passes contrast checks; client approves styleguide and the compact logo |
| 4. Layout and navigation | Header, mega menu, mobile bottom bar, footer, page shells, fed from WordPress | All pages reachable by keyboard; no sideways scroll at 320px; changing hours in WordPress shows on the site within a minute |
| 5. Catalogue | Department, listing, filters, family pages with variants, search with synonyms | Test searches find the right item: `RCSB18540`, "trip switch", "geezer", "sunsink", "15mm ball valve"; filtered URLs reload with the same results |
| 6. Enquiry list and forms | Drawer, custom items, saving in the browser, 3-step send, WordPress endpoints, emails, WhatsApp, success and error states | A test enquiry appears in the WordPress inbox and by email with the right items and docket number; a refresh keeps the list; a failed send keeps all data |
| 7. Home, About, Contact, standard page | Custom fields, "On the counter" hero, adaptive contact form, photo upload, map; standard page template, locked editor and the 3 custom blocks (7.9) | Each contact type saves the right fields; an uploaded photo can only be opened by logged-in staff; a staff member creates a test page using every allowed block and it matches the site with no developer help |
| 8. Motion and polish | Section 9 animations and reduced-motion versions | With reduce motion on, nothing moves; every animation is under 600ms |
| 9. Staff handover | Staff guide, training, refresh on publish and Preview tested | A staff member adds a product and changes the hours on their own, and sees both live |
| 10. QA and launch | Production import, Lighthouse, accessibility audit (axe), real phones (Android and iPhone), SEO checks from the SEO plan, POPIA notice | LCP < 2.5s on a mid-range Android; 0 serious axe issues; structured data validates |

---

## 15. Pre-flight checklist (before any page is called done)

- [ ] No em-dashes in any visible text or alt text
- [ ] Only Big Shoulders Display, Archivo and IBM Plex Mono are used
- [ ] Red is the only accent, used the same way everywhere
- [ ] No gradients, glows, glass cards, gradient blobs or badges above headlines
- [ ] No three-equal-card rows, no numbered step rows, no stat banners
- [ ] No more than two image-and-text rows in a row
- [ ] Hero fits the first screen on a 1366 × 768 laptop and a 390px phone
- [ ] Every image is a real photo or a real component. No stock people, no fake screenshots
- [ ] Stock notice appears on Catalogue home, listings, product pages and the enquiry form
- [ ] Every search has a way forward (no dead ends)
- [ ] All forms: labels above fields, errors with icon and text, AA contrast
- [ ] Every animation has a reason, is under 600ms and respects reduce motion
- [ ] Only one marquee on the site
- [ ] Empty, loading and error states designed for search, listings, the list and every form
- [ ] Mobile bottom bar works; tap targets are at least 44px
- [ ] Core Web Vitals targets met on a real Android phone
- [ ] No price, cart, checkout or "out of stock" text from WooCommerce appears anywhere on the website
- [ ] Logged-out visits to `cms.` go to the website, and the CMS is not indexed
- [ ] No photo is shown larger than its original size
- [ ] Every future store-photo slot works now without the photo (no empty frames)
- [ ] A new page made in WordPress uses the standard design; the editor offers no colour, font, spacing or HTML controls
