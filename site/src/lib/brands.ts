/**
 * Brand page facts from the SEO keyword map ("Brand pages" sheet): what Empire carries, in the plan's words.
 * Everything else on a brand page (ranges, counts, products) is worked out from the catalogue.
 */
type BrandNote = { carries: string; question?: string; name?: string; urlSlug?: string };

const NOTES: Record<string, BrandNote> = {
  geo: { carries: "Plumbing: fittings, valves, taps, geyser parts, drainage", question: "Where can I buy Geo plumbing fittings in Brits?" },
  waco: { carries: "Electrical and lighting (also ABB, Philips, 3M, CRC)" },
  sunsynk: { carries: "Inverters, batteries, kits, accessories", question: "Where can I buy a Sunsynk inverter near Hartbeespoort?" },
  deye: { carries: "Hybrid inverters, batteries, kits", question: "Where can I buy a Deye inverter near Brits?" },
  luxpower: { carries: "Inverters, all-in-one systems, kits" },
  hanchu: { carries: "Residential and commercial energy storage, EV chargers", name: "Hanchu ESS", urlSlug: "hanchu-ess" },
  fivestar: { carries: "Solar panels, charge controllers, solar accessories, fans, lights" },
  ingco: { carries: "Power tools, cordless, petrol tools, pumps, welders, hand tools", question: "Where can I buy Ingco tools in Brits?" },
  wadfow: { carries: "Hand tools and power tool accessories" },
  ruwag: { carries: "Blades, drill bits, abrasives, fixings" },
  harden: { carries: "Hand tools" },
  tesa: { carries: "Tapes, mounting, weather sealing" },
  aircraft: { carries: "Compressors, air tools, spray guns, fittings" },
  promac: { carries: "Paint, Rubber Duck waterproofing, Yes! Wood" },
  duram: { carries: "Paint, roof paint, waterproofing, primers", question: "Where can I buy Duram paint near Hartbeespoort?" },
  "flash-harry": { carries: "Waterproofing systems", question: "Where can I buy Flash Harry waterproofing in Brits?" },
  "africa-paints": { carries: "Economy, luxury and industrial paint ranges" },
};

export const brandNote = (slug: string) => NOTES[slug];

/** The page address from the keyword map (/brands/hanchu-ess, while the catalogue's own slug is "hanchu"). */
export const brandPath = (slug: string) => `/brands/${NOTES[slug]?.urlSlug ?? slug}`;

/** The catalogue slug behind a /brands/{x} address. */
export const brandSlugFromUrl = (urlSlug: string) =>
  Object.entries(NOTES).find(([slug, n]) => (n.urlSlug ?? slug) === urlSlug)?.[0];

export const brandDisplayName = (slug: string, catalogueName: string) => NOTES[slug]?.name ?? catalogueName;
