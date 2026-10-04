import "server-only";
import { getBrands, getDepartments, getFamilies } from "./catalogue";
import { brandPath } from "./brands";
import { absolute, siteUrl } from "./site-url";

// Split by type (SEO plan 3.7): pages, categories, products-1..n. No lastmod: the catalogue does not record when a
// page really changed, and the plan says to leave it out rather than guess. 
export const PRODUCTS_PER_FILE = 2000;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const XML = '<?xml version="1.0" encoding="UTF-8"?>\n';

type Entry = { path: string; image?: string; imageTitle?: string };

function urlset(entries: Entry[], images = false) {
  const ns = `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${images ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ""}`;
  const rows = entries.map(
    (e) =>
      `<url><loc>${esc(absolute(e.path))}</loc>${
        e.image ? `<image:image><image:loc>${esc(absolute(e.image))}</image:loc>${e.imageTitle ? `<image:title>${esc(e.imageTitle)}</image:title>` : ""}</image:image>` : ""
      }</url>`,
  );
  return `${XML}<urlset ${ns}>\n${rows.join("\n")}\n</urlset>\n`;
}

/** Tier B product families only: Tier C (thin) stay out of the sitemap as well as noindex. */
async function indexableProducts() {
  return (await getFamilies()).filter((f) => f.tier === "B");
}

export async function sitemapIndex() {
  const files = ["pages.xml", "categories.xml", "brands.xml"];
  const pages = Math.max(1, Math.ceil((await indexableProducts()).length / PRODUCTS_PER_FILE));
  for (let i = 1; i <= pages; i++) files.push(`products-${i}.xml`);
  return `${XML}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files
    .map((f) => `<sitemap><loc>${siteUrl}/sitemaps/${f}</loc></sitemap>`)
    .join("\n")}\n</sitemapindex>\n`;
}

export async function sitemapFile(name: string): Promise<string | null> {
  if (name === "pages.xml") return urlset(["/", "/catalogue", "/about", "/contact"].map((path) => ({ path })));
  if (name === "categories.xml") {
    const entries: Entry[] = [];
    for (const d of await getDepartments()) {
      entries.push({ path: `/catalogue/${d.slug}` });
      for (const c of d.categories) {
        entries.push({ path: `/catalogue/${d.slug}/${c.slug}` });
        for (const s of c.subs ?? []) entries.push({ path: `/catalogue/${d.slug}/${c.slug}/${s.slug}` });
      }
    }
    return urlset(entries);
  }
  if (name === "brands.xml") return urlset((await getBrands()).map((b) => ({ path: brandPath(b.slug) })));
  const m = /^products-(\d+)\.xml$/.exec(name);
  if (m) {
    const n = Number(m[1]);
    const slice = (await indexableProducts()).slice((n - 1) * PRODUCTS_PER_FILE, n * PRODUCTS_PER_FILE);
    if (n < 1 || slice.length === 0) return null;
    return urlset(
      slice.map((f) => ({ path: `/p/${f.slug}`, image: f.image, imageTitle: `${f.brand} ${f.name}` })),
      true,
    );
  }
  return null;
}

