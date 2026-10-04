import type { Brand, Catalogue, Department, Family } from "./catalogue";

/** What wordpress/empire-core.php returns. */
export type WpCatalogue = {
  categories: { id: number; parent: number; name: string; slug: string }[];
  families: Family[];
};

/** Turns the endpoint's flat categories and families into the Catalogue the pages read, with counts. */
export function fromWordPress({ categories, families }: WpCatalogue): Catalogue {
  // PHP encodes an empty variant as [] rather than {}
  for (const f of families) f.variants = f.variants.map((v) => (Array.isArray(v) ? {} : v));

  const places = (f: Family) => [[f.dept, f.cat, f.sub ?? ""], ...(f.also ?? [])];
  const count = (dept: string, cat?: string, sub?: string) => {
    const hit = families.filter((f) => places(f).some(([d, c, s]) => d === dept && (!cat || c === cat) && (!sub || s === sub)));
    return { rows: hit.reduce((n, f) => n + f.rows.length, 0), families: hit.length };
  };
  const kids = (parent: number) => categories.filter((c) => c.parent === parent);

  const departments: Department[] = kids(0).map((d) => ({
    slug: d.slug,
    name: d.name,
    ...count(d.slug),
    categories: kids(d.id).map((c) => {
      const subs = kids(c.id).map((s) => ({ slug: s.slug, name: s.name, ...count(d.slug, c.slug, s.slug) }));
      return { slug: c.slug, name: c.name, ...count(d.slug, c.slug), ...(subs.length ? { subs } : {}) };
    }),
  }));

  const brandMap = new Map<string, Brand>();
  for (const f of families) {
    const b = brandMap.get(f.brandSlug) ?? { slug: f.brandSlug, name: f.brand, rows: 0, families: 0 };
    b.rows += f.rows.length;
    b.families += 1;
    brandMap.set(f.brandSlug, b);
  }
  const brands = [...brandMap.values()].sort((a, b) => b.rows - a.rows || a.name.localeCompare(b.name));

  return {
    generated: new Date().toISOString().slice(0, 10),
    totals: {
      rows: families.reduce((n, f) => n + f.rows.length, 0),
      families: families.length,
      suppliers: new Set(families.map((f) => f.supplier)).size,
      brands: brands.length,
    },
    departments,
    brands,
    families,
  };
}
