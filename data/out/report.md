# Catalogue build report

Generated 2026-10-02 by `data/build_catalogue.py`. Source: `supplier-catalogue.xlsx`.

## Checks (Website Plan, phase 2 'done when')

- Source rows: **6,319**. Rows placed in exactly one family: **6,319**. Unmapped rows: **0**.
- Per-supplier row counts match the workbook (asserted by the script; it stops if they don't).
- Product families: **2,810** (SEO plan estimated about 2,800). Families with more than one code: 1,051.
- Duplicate source rows merged into one variant (same family, same code): **12**.
- Every code is unique, ignoring upper and lower case (asserted by the script). 10 fixes from `sku_fixes.csv` were applied (see below).
- Geo photos copied to `site/public/products/`: 0 new files.

| Supplier | Workbook rows | Families |
|---|---:|---:|
| Geo Plumbing | 1,850 | 370 |
| WACO | 1,502 | 681 |
| AirCraft (Vermont Sales) | 1,056 | 377 |
| Ruwag | 903 | 633 |
| Ingco | 510 | 253 |
| Wadfow | 105 | 105 |
| Promac | 96 | 96 |
| Five-star Solar (Fivestar LED) | 84 | 84 |
| Duram | 68 | 67 |
| Sunsynk | 43 | 43 |
| Flash Harry | 37 | 37 |
| Africa Paints | 29 | 29 |
| Hanchu ESS | 20 | 20 |
| Deye | 10 | 9 |
| Luxpower | 6 | 6 |
| **Total** | **6,319** | **2,810** |

## Departments

| Department | Rows | Families | Categories |
|---|---:|---:|---:|
| Plumbing | 1,850 | 370 | 9 |
| Electrical | 1,176 | 439 | 10 |
| Lighting | 355 | 271 | 8 |
| Solar & Backup Power | 138 | 137 | 10 |
| Power Tools & Accessories | 444 | 314 | 17 |
| Hand Tools | 780 | 423 | 15 |
| Fixings & Adhesives | 290 | 250 | 12 |
| Air Tools & Compressors | 1,061 | 380 | 10 |
| Paint & Waterproofing | 230 | 229 | 9 |

Empty categories (defined in the plan but no products yet): 0

## Indexing tiers (SEO plan 3.3, applied to product families)

- Tier B (has a photo or real specs, indexed): **2,742**
- Tier C (no photo and no specs, `noindex, follow` until enriched): **68**
- Families with no photo at all: **92** (full list in `families-without-photo.csv`)
- Brand names shared by more than one family with the same product name (need a spec added to the name before they can be indexed): **29**

## Changes to the plan's category list

The plan's section 6.3 list was followed. These were added because real products had no home:

- **Electrical > Batteries & Torches**: 40+ Energizer-brand batteries and torches sit under WACO Security
- **Power Tools & Accessories > Garden & Cleaning**: Ingco cordless and petrol blowers
- **Power Tools & Accessories > Other Power Tools**: catch-all for Ingco items with no plan category
- **Hand Tools > Tool Sets & Kits**: Ingco and Wadfow chest sets and kits
- **Hand Tools > Other Hand Tools**: catch-all (riveters, staple guns, gear pullers)
- Sub-categories added under Valves (Ball, Gate, Angle, Float, Check, Stopcocks, Washing Machine) so the SEO plan's `/valves/ball-valves` page exists.

## Keyword rules (Ingco, Wadfow, AirCraft 'other', Geo valves, some paints)

Rows that matched no rule fall to the catch-all set in `mapping.csv`. Review these lists and sort any you disagree with by editing `keyword_rules.csv`.

### `africa-paints`: 8 fell to the default (8 distinct names)

Hi-Cover PVA, Master Coat, Master Supreme Coat, Satin Sheen, Super 2000 Acrylic PVA, Super Acrylic PVA Matt, Super PVA, The Ultimate Wall Coat

### `aircraft-other`: 34 fell to the default (34 distinct names)

Air Angle Grinder 125mm With Safety Trigger Thread Size 10x1.5 Male, Air Angle Grinder M12 180mm 7" Heavy Duty Thread Size 12x1.25 Female, Air Body Saw Metal (1.6mm Max).2.0mm Aluminium.plastic & Fibreglass 2., Air Die Grinder 6mm 14 Piece Kit Blow Mould Case, Air Die Grinder 6mm 4000rpm, Air Die Grinder 6mm Mini, Air Die-grinder 3" With Swivel Metal Guard, Air Drill 10mm Reversable 1800rpm (3/8"), Air Drill 12.5mm Reversable 550rpm (1/2"), Air Duster/blow Gun Blister, Air Duster/blow Gun Long Nozzle, Air Duster/blow Gun Plastic Handle Long Nozzle, Air Hydraulic Riveter 1/4" Professional, Air Impact Wrench 1/2" 17 Piece Kit Single Hammer, Air Impact Wrench 1/2" Single Hammer, Air Impact Wrench 1/2" Twin Hammer, Air Needle Scaler For Removing Paint Rust Dirt Or Welding Slag, Air Ratchet Wrench 1/2" (single Ratchet Paw), Air Ratchet Wrench 3/8" (single Ratchet Paw), Air Tire Buffer For Roughing Low Areas. Recapping And Tire Scuffing, Bevel Pinion Gear For At0025, Mini Air Duster/blow Gun, Sand Blast Sand 150 Grit Alum Oxide 1kg, Sand Blast Sand 150 Grit Alum Oxide For Air Brush 25kg, Sand Blast Sand B125 50kg Coarse & Gen.purpose, Sand Blast Sand B60 50 Kg Fine & Gen.purpose, Sand Blast Sand B60 Fine & Gen.purpose 2kg Tub, Sand Blast Sand B90 50kg Fine & Gen.purpose, Sand Blast Sand B90 Fine & Gen.purpose 2kg Tub, Sand Blast Sand Fine General Purp B60 1.5kg, Sand Blast Sand Fine General Purp B90 1.5kg, Sandblaster / Etcher / Eraser Kit Mini, Wash / Paraffin Gun Blister Pack, Wash / Paraffin Gun Bulk

### `duram-doors`: 5 fell to the default (5 distinct names)

ColorPro, Enamel&Trim, Gloss Enamel, NuGlo | MATT, NuGlo | SATIN

### `flash-roof`: 1 fell to the default (1 distinct names)

Frogskin - Roof Paint

### `geo-valves`: 9 fell to the default (6 distinct names)

Nylon T Handle Valve – 15mm, Nylon T Handle Valve – 20mm, Nylon T Handle Valve – 25mm, Y Strainer Valve – 15mm, Y Strainer Valve – 22mm, Y Strainer Valve – 25mm

### `hand-tools`: 24 fell to the default (15 distinct names)

3 In 1 staple gun, 3 IN 1 Staples Gun, Concertina Hand Riveter, Gear Puller, Hand Riveter, Hydraulic Crimping Tool, Hydraulic floor jack 2.5ton, Hydraulic floor jack 2ton, Key ring accessories 40 Piece, Magnetic wristband, Oil can 250ml, PVC Anti-slip warning tape, Rivet nut gun kit, Staples Gun, Swivel Hand Riveter

### `harden-accessories`: 11 fell to the default (11 distinct names)

10MX9mm Drain Cleaner, 12X7.4X176mm 12 Piece Oval Carpentry Pencil, 135-640mm Telescopic Magnetic Pickup, 150mm Magnetic Tray, 175mm 3 Piece Brush Set, 175mm Auto-Oil Glass Cutter, 250mm Pro Rotary Punch with Multi Hole, 3MX6mm Drain Cleaner, 5MX9mm Drain Cleaner, Booster Cable 3m 220A, Spring Magnet Pickup

### `power-tools`: 53 fell to the default (31 distinct names)

20V Cordless tile vibration machine, 20V Lithium-Ion Caulking Gun, 20V Lithium-Ion Concrete Vibrator, 20V Lithium-Ion Cordless Brad Nailer, 20V Lithium-Ion Cordless Brick Nailer, 20V Lithium-Ion Cordless Pin Nailer, 20V Lithium-Ion Crown Stapler Nailer, 20V Lithium-Ion Fan, 20V Lithium-Ion Gauge Straight Shear, 20V Lithium-Ion Grease Gun, 20V Lithium-Ion Heat Gun, 20V Lithium-Ion Mixer, 20V Lithium-Ion Multi-tool, 20V Lithium-Ion Portable Lamp, 20V Lithium-Ion Soldering Iron, 20V Lithium-Ion Spray Gun, 20V Lithium-Ion Work Lamp, Earth Auger, Gasoline Concrete Vibrator (Claw), Gasoline Plate Compactor, Gasoline Power Trowel, Gasoline Tamping Rammer, Glue Gun, Heat Gun, HVLP Spray Gun, Lithium-ion 2 Piece Combo Kit, Lithium-ion Cordless 2 Piece Combo Kit, Mixer, Multi-Tools, Spray Gun, Wall Chaser

### `promac-prep`: 13 fell to the default (13 distinct names)

All Purpose Crack Filler, Bonding Liquid SB, Bonding Liquid WB, Galv Prep, Multi-Surface Primer, Plaster Primer SB, Plaster Primer WB, Plasterlock, Rust Converter, Stone Chip, Universal Undercoat, Wall Skim Plaster, Wood Primer

### `waco-security`: 7 fell to the default (7 distinct names)

4 CHANNEL 4 CAMERA, INFRARED 180° MOTION SENSOR, INFRARED 350° OCCUPANCY SENSOR, MOTION SENSOR, ROYCE THOMPSON, TWIN SPOTLIGHT WITH MOTION SENSOR, WACO BLUE

### `wadfow-accessories`: 1 fell to the default (1 distinct names)

Medium bristle brush set 3 Piece

## SKU fixes (`sku_fixes.csv`)

Change a row's action there and rebuild to overrule it. The script stops if the workbook no longer matches a row.

| Action | Supplier | Row | Product | Change | Why |
|---|---|---:|---|---|---|
| new-sku | AirCraft (Vermont Sales) | 5328 | Ptfe Tape 19mmx0.075mmx10m Roll Bulk | `PTFE19` to `PTFE19-10M` | Two different products share PTFE19: Geo's 40 m roll and AirCraft's 10 m roll. AirCraft's codes follow PTFE<width>[-<spec>] (PTFE12, PTFE12-5, PTFE19-1), so the new code adds the roll length. The supplier's own code is kept as supplierCode for re-ordering |
| fix-typo | Geo Plumbing | 1870 | Flexi Braided Connectors – FxF 15mm x 450mm | `FBC45OFF` to `FBC450FF` | Letter O typed for zero. Its pre-packed twin is FBC450FF_PP and its neighbours are FBC350FF and FBC600FF |
| fix-typo | Geo Plumbing | 1877 | Flexi Braided Connectors – MxF 15mm x 15mm x 450mm | `FBC 15/15/450MF_PP` to `FBC15/15/450MF_PP` | Stray space. Its bulk twin is FBC15/15/450MF. A space would also stop a search for the code from matching |
| fix-typo | Deye | 4409 | Deye 20Kw Three Phase Hybrid Inverter 48v (Low Voltage) | `SUN-20K-SG05LP3 -EU-SM2` to `SUN-20K-SG05LP3-EU-SM2` | Stray space before -EU. Every other Deye code in the workbook has none |
| merge | Ruwag | 204 | Brace Flat | folded into row 205 (Brace Flat) | Same product listed twice on Ruwag's site. Row 205 is the full 3-size page and already contains this code |
| merge | Ruwag | 238 | Nut Setter | folded into row 298 (Magnetic Socket) | Same two codes under two names (Nut Setter in Ruwag's pre-packs, Magnetic Socket in Power Bits). Kept in Power Bits, also listed under Ironmongery |
| merge | Ruwag | 244 | Pozi Bit | folded into row 302 (Pozi Bits) | Overlapping variants of one product (shares RF-PB1025-2). Kept as Pozi Bits in Power Bits, also listed under Ironmongery |
| merge | Ruwag | 165 | Stainless Steel Flat Washer | folded into row 355 (Stainless Steel Washers) | Same three codes under two names (a pre-pack page and the Washers page). Kept under Washers, also listed under Fastener Kits & Pre-packs |
| merge | Ruwag | 168 | Stainless Steel Self Tapper Pan Head | folded into row 338 (Stainless Steel Self Tapping Screws) | Same three codes under two names (a pre-pack page and the Screws page). Kept under Screws, also listed under Fastener Kits & Pre-packs |
| merge | Deye | 4412 | DEYE SUN-8K 8KVA/8KW GRID TIED HYBRID INVERTER | folded into row 4411 (Deye 8kW Hybrid Inverter) | Solar Shop lists the same SUN-8K-SG05LP1-EU-SM2 inverter twice. The workbook already notes 'Same SKU as another Solar Shop listing' |

## Families made by grouping size variants and identical names

`data/sizes.py` takes sizes, threads and pack words out of names (mapping.csv `grouping` = `sizes`: AirCraft fittings, Ruwag Harden), and Ingco rows with an identical name become one family (`name`). 248 families now hold more than one row; the full list is in `family-grouping-review.csv`. Check the biggest and any you doubt.

| Family | Supplier | Rows | Examples |
|---|---|---:|---|
| Pu Hose Fitting Tee | AirCraft (Vermont Sales) | 61 | 10mm | 10mm X 1/2"f X 1/2"m | 10mm X 1/4"f X 1/4"m | 10mm X 1/8"f X 1/8"m |
| Screwdriver with Soft Handle | Ruwag | 44 | 3x100mm | 3x150mm | 3x200mm | 3x75mm |
| Metal Pu Fitting Straight | AirCraft (Vermont Sales) | 41 | 10mm | 10mm 1/2" F | 10mm 1/4" F | 10mm 1/8" F |
| Pu Hose Fitting Straight Stud | AirCraft (Vermont Sales) | 39 | 10mm-1/2 F | 10mm-1/2 M | 10mm-1/4 F | 10mm-1/4 M |
| Pu Hose Fitting Elbow | AirCraft (Vermont Sales) | 29 | 10mm | 10mm-1/2 F | 10mm-1/2 M | 10mm-1/4 F |
| Pu Hose Fitting Valve | AirCraft (Vermont Sales) | 25 | 1/2"m X 1/2"m | 1/4"m X 1/4"m | 1/8"m X 1/4"m | 1/8"m X 1/8"m |
| Pu Hose Fitting Y Joint | AirCraft (Vermont Sales) | 25 | 10mm | 10mm-1/2 M | 10mm-1/4 M | 10mm-1/8 M |
| Combination Spanner | Ruwag | 24 | 10mm | 11mm | 12mm | 13mm |
| Metal Pu Fitting Elbow | AirCraft (Vermont Sales) | 23 | 10mm | 10mm 1/2" M | 10mm 1/4" M | 10mm 1/8" M |
| Metal Pu Fitting T-joint | AirCraft (Vermont Sales) | 23 | 10mm | 10mm 1/2" M | 10mm 1/4" M | 10mm 1/8" M |
| Nipple Brass | AirCraft (Vermont Sales) | 22 | 1/2x1/2 M/m | 1/2x1/2 M/m 1pc Pack | 1/2x3/4 M/m | 1/2x3/4 M/m 1pc Pack |
| Reducer Brass | AirCraft (Vermont Sales) | 22 | 1/2x1/2 M/f | 1/2x1/2 M/f 1pc Pack | 1/2x3/4 M/f | 1/2x3/4 M/f 1pc Pack |

## Variants the workbook says exist but does not list

Ruwag rows say '5 variants' but list only the first 3 codes. The family page can show only the codes we have.

- Families affected: **187**
  - Ruwag: All Purpose Sanding Rolls (has 3 codes, says 8)
  - Ruwag: Bandfile Sanding Belt (has 3 codes, says 4)
  - Ruwag: Cabinet Paper Sanding Sheets (has 3 codes, says 14)
  - Ruwag: Delta Sanding Disc Add-Ons (has 3 codes, says 4)
  - Ruwag: Delta Sanding Discs (has 3 codes, says 4)
  - Ruwag: Economy Sanding Rolls (has 3 codes, says 6)
  - Ruwag: Fibre Discs (has 3 codes, says 30)
  - Ruwag: Industrial Zirconium Flap Discs (has 3 codes, says 8)
  - Ruwag: Orbital Sanding Sheets (has 3 codes, says 21)
  - Ruwag: Random Orbital Sanding Discs (has 3 codes, says 13)
  - Ruwag: Sanding Belts (has 3 codes, says 25)
  - Ruwag: Standard Zirconium Flap Discs (has 3 codes, says 8)

## Duplicate rows merged

- Ruwag: Brace Flat (`RF-BF6161-2`, row 205)
- Ruwag: Magnetic Socket (`RF-MST3/8-1`, row 298)
- Ruwag: Magnetic Socket (`RF-MST5/16-1`, row 298)
- Ruwag: Pozi Bits (`RF-PB1025-2`, row 302)
- Ruwag: Stainless Steel Self Tapping Screws (`RF-STST3513-10`, row 338)
- Ruwag: Stainless Steel Self Tapping Screws (`RF-STST3516-10`, row 338)
- Ruwag: Stainless Steel Self Tapping Screws (`RF-STST3519-10`, row 338)
- Ruwag: Stainless Steel Washers (`RF-SSFLW03-10`, row 355)
- Ruwag: Stainless Steel Washers (`RF-SSFLW04-10`, row 355)
- Ruwag: Stainless Steel Washers (`RF-SSFLW05-10`, row 355)
- Deye: DEYE SUN-8K 8KVA/8KW GRID TIED HYBRID INVERTER (`SUN-8K-SG05LP1-EU-SM2`, row 4412)
- Ingco: 20V Lithium-Ion Impact Drill (`CIDLI20558`, row 4641)

## Other data notes

- 546 family names are ALL CAPS (WACO). The front end needs a display pass that title-cases them and keeps acronyms.
- 'Also listed in' cross-listings resolved into a second category for 87 families. 306 entries were not used because the supplier's words are not one of its own category paths (mostly Ruwag's second Harden set: Spray Finishing > Spray Guns x69, Harden (brand) > Striking x31, Harden (brand) > Professional Pliers x27, Inverters x18).
- **No electric fence energizers exist in the workbook.** The 'ENERGIZER' rows under WACO Security are Energizer-brand batteries, chargers and torches (now in Electrical > Batteries & Torches). The SEO plan lists fence energizers as a priority category.
