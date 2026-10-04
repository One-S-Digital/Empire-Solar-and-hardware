import categoryCopy from "../data/category-seo.json";
import categoryIntros from "../data/category-intros.json";

/**
 * Department titles are the title tags from SEO plan section 4.2. The intro lines follow its H1 rule:
 * the H1 is the plain department name, followed by one human line that includes the location.
 * These are written by hand from the plan's supporting terms. Staff edit them in WordPress later.
 */
export const DEPARTMENT_SEO: Record<string, { title: string; intro: string }> = {
  plumbing: {
    title: "Plumbing Supplies in Brits | Empire Solar & Hardware",
    intro: "Pipe, fittings, taps and geyser parts from Geo, at our counter in Brits.",
  },
  electrical: {
    title: "Electrical Supplies in Brits | Empire Solar & Hardware",
    intro: "Circuit breakers, DB boards, wire, plugs and switches from WACO, at our counter in Brits.",
  },
  lighting: {
    title: "Lighting & LED Globes in Brits | Empire Solar & Hardware",
    intro: "LED downlights, floodlights, bulkheads and globes from WACO and Fivestar, at our counter in Brits.",
  },
  "solar-backup-power": {
    title: "Solar, Inverters & Batteries in Brits | Empire",
    intro: "Inverters, lithium batteries, panels and backup kits from Sunsynk, Deye, Luxpower, Hanchu and Fivestar, at our counter in Brits.",
  },
  "power-tools": {
    title: "Power Tools in Brits | Empire Solar & Hardware",
    intro: "Angle grinders, drills, generators and water pumps from Ingco and Wadfow, plus Ruwag blades and bits, at our counter in Brits.",
  },
  "hand-tools": {
    title: "Hand Tools in Brits | Empire Solar & Hardware",
    intro: "Spanners, screwdrivers, pliers and measuring tools from Ingco, Wadfow and Harden, at our counter in Brits.",
  },
  "fixings-adhesives": {
    title: "Screws, Fixings & Tapes in Brits | Empire",
    intro: "Screws, anchors, bolts, hinges and tapes from Ruwag and tesa, at our counter in Brits.",
  },
  "air-tools-compressors": {
    title: "Compressors & Air Tools in Brits | Empire",
    intro: "Compressors, spray guns, air hose and push-in fittings from AirCraft and Ingco, at our counter in Brits.",
  },
  "paint-waterproofing": {
    title: "Paint & Waterproofing in Brits | Empire",
    intro: "Roof paint, waterproofing, primers and enamels from Promac, Duram, Africa Paints and Flash Harry, at our counter in Brits.",
  },
};

type CategoryCopy = { title: string; description: string; question: string | null; priority: string };

/**
 * Title tag and meta description for a category or sub-category page, from the keyword map
 * (data/build_seo_copy.py writes data/category-seo.json). Undefined for pages the map does not cover.
 */
export function categorySeo(path: string): CategoryCopy | undefined {
  return (categoryCopy as Record<string, CategoryCopy>)[path];
}

/** The hand-edited intro paragraph for a category page (SEO plan 4.3), when one has been written. */
export function categoryIntro(path: string): string | undefined {
  return (categoryIntros as Record<string, string>)[path];
}
