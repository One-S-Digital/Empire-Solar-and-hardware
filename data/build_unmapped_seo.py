"""Title tags and meta descriptions for the 83 category and sub-category pages the keyword map does not cover.
Written by hand from the catalogue (brands and product types come from the data). Counts are the catalogue's own:
{n} in a description is replaced with the page's product count. Writes site/src/data/category-seo-extra.json,
which site/src/lib/seo.ts merges under the keyword-map copy (the map always wins). Drafts: the SEO lead should review.
Run from the project root: python3 data/build_unmapped_seo.py
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAIL = " Not on the shelf? We'll order it in. Kremetart Centre, Brits."
cat = json.loads((ROOT / "site/src/data/catalogue.json").read_text())
mapped = json.loads((ROOT / "site/src/data/category-seo.json").read_text())
rows = {}
for d in cat["departments"]:
    for c in d["categories"]:
        rows[f"/catalogue/{d['slug']}/{c['slug']}"] = c["rows"]
        for s in c.get("subs", []):
            rows[f"/catalogue/{d['slug']}/{c['slug']}/{s['slug']}"] = s["rows"]

P = "/catalogue/"
# path (after /catalogue/): (title words before "in Brits", description before the tail)
S = {
"plumbing/pipe-fittings/pipe": ("Plumbing Pipe", "{n} Geo pipes: copper, HDPE, PEX, perforated drainage and PVC downpipe."),
"plumbing/pipe-fittings/batts-couplings": ("Pipe Batts & Couplings", "{n} Geo batts, holderbatts and couplings for fixing and joining pipe."),
"plumbing/valves/gate-valves": ("Gate Valves", "{n} Geo gate valves, full bore and standard, in compression and female ends."),
"plumbing/valves/angle-valves": ("Angle Valves", "{n} Geo angle valves for basins and toilets, including elbow and dual versions."),
"plumbing/valves/check-valves": ("Check Valves", "{n} Geo non-return, spring-loaded and swing check valves for water lines."),
"plumbing/valves/stopcocks": ("Stopcocks", "{n} Geo stopcocks in compression and female ends, to isolate a water supply."),
"plumbing/valves/washing-machine-valves": ("Washing Machine Valves", "{n} Geo washing machine valves in straight, elbow and tee versions."),
"plumbing/valves/other-valves": ("Strainer & T-Handle Valves", "{n} Geo Y strainer valves and nylon T handle valves."),
"plumbing/taps-mixers/mixer-ranges": ("Basin & Bath Mixers", "{n} Geo mixers in the Arctic, Cosmos, Jabulani, Lindi and Nova ranges and more."),
"plumbing/taps-mixers/eternity-premium-range": ("Eternity Premium Taps & Showers", "{n} Geo Eternity premium range parts: spouts, hand showers, traps and wastes."),
"plumbing/taps-mixers/taps-tap-spares": ("Taps & Tap Spares", "{n} Geo garden taps, mixer spouts, spindles, back nuts and extension pieces."),
"plumbing/taps-mixers/packed-taps": ("Bib Taps & Tap Spares", "{n} Geo packed taps and spares: bib taps, headparts, jumpers and washers, aerators."),
"plumbing/bathroom-toilet/shower-bath": ("Showers & Bath Fittings", "{n} Geo shower roses, arms, hand showers and combinations, in sizes from 100mm to 200mm."),
"plumbing/bathroom-toilet/toilet-cistern": ("Toilet & Cistern Parts", "{n} Geo cistern flush kits, stoppers and toilet spares, in close couple and other types."),
"plumbing/bathroom-toilet/wastes-waste-spares": ("Basin, Bath & Sink Wastes", "{n} Geo basin, bath and kitchen sink wastes, plugs and waste spares."),
"plumbing/bathroom-toilet/traps": ("Basin & Bath Traps", "{n} Geo bottle, flexi and adjustable plastic traps, plus trap spares."),
"plumbing/drainage-rainwater/drainage-system": ("Drainage Channels", "{n} Geo floway drainage parts: channels with grates, gullies, corners, end caps."),
"plumbing/drainage-rainwater/pvc-rainwater": ("PVC Gutters & Rainwater", "{n} Geo PVC rainwater parts: gutter and fascia fittings, bolts, leaf catchers, first flush kits."),
"plumbing/drainage-rainwater/econo-rainwater": ("Econo Gutters & Downpipes", "{n} Geo Econo gutters and downpipe fittings, in D-shaped and half round."),
"plumbing/tanks-hose/tank-fittings-accessories": ("Water Tank Fittings", "{n} Geo tank fittings: float valve kits, connectors and cam fittings."),
"plumbing/tanks-hose/hose": ("Hoses & Flexible Connectors", "{n} Geo braided flexible connectors and washing machine hoses."),
"plumbing/sheeting-membranes/builders-sheeting": ("Builders Plastic & DPC", "{n} Geo builders sheeting in black, clear and blue/black, plus DPC."),
"plumbing/sheeting-membranes/shadecloth-foil-membrane": ("Shadecloth & Foil Membrane", "{n} Geo shadecloth, clips, reflective foil, geotextile and birdproof netting."),
"electrical/switches-plugs-sockets/switches": ("Electrical Switches & Isolators", "{n} WACO switches: change-over switches, enclosed and base mount isolators, contact blocks."),
"electrical/switches-plugs-sockets/plugs-multiplugs": ("Plugs & Multiplugs", "{n} WACO plugs, multi adaptors and cordsets, including 5 way and Euro adaptors."),
"electrical/switches-plugs-sockets/industrial-plugs-sockets": ("Industrial Plugs & Sockets", "{n} WACO metal clad, caravan and marine plugs, sockets and inlets."),
"electrical/circuit-protection-control/circuit-breakers-mcbs": ("Circuit Breakers (MCBs)", "{n} WACO circuit breakers, surge arresters and busbars."),
"electrical/circuit-protection-control/isolators": ("Isolators & Fireman Switches", "{n} WACO isolators: enclosed, fireman switches and weatherproof switched sockets."),
"electrical/circuit-protection-control/automation-pilot-devices": ("Pilot Devices & Motor Starters", "{n} WACO push buttons, emergency stops, auxiliary contacts and manual motor starters."),
"electrical/circuit-protection-control/sounders": ("Electrical Sounders", "{n} WACO sounders: Flashtone and Multitone."),
"electrical/circuit-protection-control/meters": ("Electricity Meters", "{n} WACO kWh meters, including a single phase meter."),
"electrical/batteries-torches": ("Batteries & Torches", "{n} WACO batteries and torches, including Energizer cells."),
"lighting/indoor-led-downlights/aluminium-downlights": ("Aluminium Downlights", "{n} WACO aluminium downlights: bevelled rim and tilt styles in chrome, satin chrome, white and brass."),
"lighting/indoor-led-downlights/steel-downlights": ("Steel Downlights", "{n} WACO steel downlights: eyeball and stilt styles, plus electronic transformers."),
"lighting/indoor-led-downlights/led-indoor": ("LED Indoor Lights", "{n} indoor LED lights from WACO and Fivestar: spotlights, pendants and ceiling lights."),
"lighting/indoor-led-downlights/glass-fittings": ("Glass Ceiling Lights", "{n} WACO glass ceiling lights, including round fittings from 180mm to 290mm and alabaster styles."),
"lighting/outdoor-security-lighting/bulkheads": ("Bulkhead Lights", "{n} WACO bulkhead lights: oval eyelid, grid and plain styles."),
"lighting/outdoor-security-lighting/brick-lights": ("Brick Lights & Lanterns", "{n} WACO outdoor lanterns and brick lights, from half lantern to pedestal styles."),
"lighting/outdoor-security-lighting/led-outdoor": ("Outdoor LED Sensor Lights", "{n} WACO LED floodlights and spotlights with sensors, from 10W to 50W."),
"lighting/outdoor-security-lighting/garden-spikes": ("Garden Spike Lights", "A WACO garden spike light."),
"lighting/fluorescent-fittings/indoor": ("Indoor Fluorescent Fittings", "{n} WACO decorative fluorescent fittings in 2 x 18W to 2 x 58W."),
"lighting/fluorescent-fittings/outdoor": ("Vapour Proof Fluorescent Lights", "{n} WACO vapour proof fluorescent fittings, plus empty LED tube fittings."),
"lighting/general-lighting": ("General Lighting & Spares", "{n} lighting products from WACO and Fivestar: fittings, globes, bowls, switches and spares."),
"solar-backup-power/batteries-energy-storage/residential-single-phase": ("Hanchu Single Phase Home Storage", "{n} Hanchu ESS single phase products: inverters, a battery and a gateway."),
"solar-backup-power/batteries-energy-storage/residential-three-phase": ("Hanchu Three Phase Home Storage", "{n} Hanchu ESS three phase inverters and high-voltage batteries."),
"solar-backup-power/batteries-energy-storage/commercial-industrial": ("Hanchu Commercial Battery Storage", "{n} Hanchu ESS commercial and industrial energy storage systems."),
"power-tools/garden-cleaning": ("Cordless Garden Tools", "{n} Ingco 20V garden tools: blowers, chain saws, grass and hedge trimmers, sprayers."),
"power-tools/other-power-tools": ("Specialist Power Tools", "{n} Ingco power tools: nailers, caulking guns, concrete vibrators and tile tools."),
"power-tools/drill-bits/masonry-drill-bits": ("Masonry Drill Bits", "{n} Ruwag masonry and concrete drill bits, core bits and SDS shanks."),
"power-tools/drill-bits/metal-drill-bits": ("Metal Drill Bits", "{n} Ruwag metal drill bits: cobalt, HSS step and countersink, annular cutters."),
"power-tools/drill-bits/wood-drill-bits": ("Wood Drill Bits", "{n} Ruwag wood drill bits: brad point, flat, auger and turbo."),
"power-tools/drill-bits/ceramic-drill-bits": ("Tile & Glass Drill Bits", "{n} Ruwag ceramic tile, glass and diamond core drill bits."),
"power-tools/drill-bits/drill-bit-sets": ("Drill Bit Sets", "{n} Ruwag drill bit sets for metal, masonry and wood, from 10 to 19 pieces."),
"power-tools/drill-bits/drill-chucks": ("Drill Chucks & Keys", "{n} Ruwag drill chucks: key type, keyless and SDS adapter, plus chuck keys."),
"power-tools/saw-cutting-blades/circular-saw-blades": ("Circular Saw Blades", "{n} Ruwag circular saw blades: combination, crosscut, ripping and aluminium."),
"power-tools/saw-cutting-blades/diamond-blades": ("Diamond Blades", "{n} diamond blades from Ruwag and Wadfow for concrete, asphalt and demolition work."),
"power-tools/saw-cutting-blades/jigsaw-blades": ("Jigsaw Blades", "{n} Ruwag jigsaw blades for wood, metal, plastic, acrylic and ceramic."),
"power-tools/saw-cutting-blades/hacksaw-blades": ("Hacksaw Blades", "{n} Ruwag hacksaw blades: bi-metal cobalt, bi-metal HSS and standard metal."),
"power-tools/saw-cutting-blades/hole-saws": ("Hole Saws & Arbours", "{n} Ruwag hole saws, bi-metal and HSS, with arbours and a handyman set."),
"power-tools/other-accessories": ("Power Tool Accessories", "{n} power tool accessories: a router bit set, planer blades and a brush set."),
"hand-tools/tin-snips": ("Tin Snips", "{n} tin snips and aviation snips from Harden and Wadfow, left, right and straight."),
"hand-tools/tool-sets-kits": ("Tool Sets & Kits", "{n} Ingco tool sets, from tool chest sets to an insulated hand tool set."),
"hand-tools/other-hand-tools": ("Specialist Hand Tools", "{n} hand tools from Harden, Wadfow, Ingco and Ruwag: staple guns, glass cutters, extractors."),
"fixings-adhesives/tapes/masking": ("Masking Tape", "{n} tesa masking tapes, Basic and Professional, including an outdoor version."),
"fixings-adhesives/tapes/packaging": ("Packaging Tape", "{n} tesa packaging tapes, plus a hand dispenser."),
"fixings-adhesives/tapes/insulation": ("Insulation & Anti-Slip Tape", "{n} tesa insulation, anti-slip and aluminium tapes."),
"fixings-adhesives/tapes/repair": ("Repair & Duct Tape", "{n} tesa extra Power repair tapes and Professional cloth tapes."),
"fixings-adhesives/bath-household": ("Adhesive Hooks & Household", "{n} tesa Powerstrips hooks in large and small, classic, oval and round."),
"air-tools-compressors/air-tools/nail-guns-staplers": ("Air Nail Guns & Staplers", "{n} AirCraft air nailers, staplers and brad nails."),
"air-tools-compressors/air-tools/sanders": ("Air Sanders", "{n} AirCraft air sanders: orbital, palm and angle, with hook and loop pads."),
"air-tools-compressors/air-tools/tyre-inflators": ("Tyre Inflators & Air Chucks", "{n} AirCraft tyre chucks and air chucks, including heavy duty dual head."),
"air-tools-compressors/air-tools/other-air-tools": ("Air Grinders & Other Air Tools", "{n} AirCraft air tools: angle and die grinders, body saws and more."),
"paint-waterproofing/interior-paint/walls": ("Interior Wall Paint", "{n} Duram interior wall paints, including DuraSheen and Matt Acrylic."),
"paint-waterproofing/interior-paint/ceilings": ("Ceiling Paint", "{n} ceiling and interior paints from Duram and Africa Paints."),
"paint-waterproofing/interior-paint/kitchen-bathroom": ("Kitchen & Bathroom Paint", "Duram bathroom and kitchen paint."),
"paint-waterproofing/exterior-paint/walls": ("Exterior Wall Paint", "{n} Duram exterior wall paints, including Armaguard and Armatex."),
"paint-waterproofing/exterior-paint/fascias-gutters": ("Fascia & Gutter Paint", "{n} Duram Roofkote and Weather Roof for fascias and gutters."),
"paint-waterproofing/waterproofing/acrylic": ("Acrylic Waterproofing", "{n} Flash Harry acrylic waterproofing: Fibre Flex, Fix-a-Leak, Flash Patch, Liquid Plastic."),
"paint-waterproofing/waterproofing/bitumen": ("Bitumen Waterproofing", "{n} Flash Harry bitumen waterproofing: mastic, Drip Stop and Drip Stop Fibre."),
"paint-waterproofing/waterproofing/torch-on": ("Torch-on Waterproofing", "{n} Flash Harry torch-on products: Thermoflex, primers and Alu-coat."),
"paint-waterproofing/waterproofing/cementitious": ("Cementitious Waterproofing", "{n} Flash Harry cementitious products: slurry seal, Hypercrete, bonding and membrane."),
"paint-waterproofing/waterproofing/damp-proofing": ("Damp Proofing", "{n} Flash Harry Damp Doctor sealers and injectors, plus a masonry sealer."),
"paint-waterproofing/waterproofing/self-adhesive": ("Self-adhesive Waterproofing", "{n} Flash Harry self-adhesive flashing and roof plasters."),
}

out, errs = {}, []
for k, (t, d) in S.items():
    p = P + k
    if p not in rows: errs.append(f"no such page: {p}"); continue
    if p in mapped: errs.append(f"already in the keyword map: {p}"); continue
    base = f"{t} in Brits"
    title = base + " | Empire Solar & Hardware"
    if len(title) > 60: title = base + " | Empire"
    if len(title) > 60: errs.append(f"title {len(title)}: {title}")
    desc = d.replace("{n}", str(rows[p])) + TAIL
    if len(desc) > 165: errs.append(f"description {len(desc)}: {p}")
    out[p] = {"title": title, "description": desc}
missing = [p for p in rows if p not in mapped and p not in out and p.count("/") >= 3 and p.split("/")[2:] and p not in {f"/catalogue/{x}" for x in []}]
# pages with copy are categories/subs; departments (2 segments) are hand-written in seo.ts
missing = [p for p in missing if p.count("/") >= 3]
if missing: errs.append(f"{len(missing)} unmapped pages without copy: {missing[:5]}")
(ROOT / "site/src/data/category-seo-extra.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
print(f"{len(out)} pages written")
for e in errs: print("  ", e)
sys.exit(1 if errs else 0)
