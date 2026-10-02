import "server-only";
import MiniSearch from "minisearch";
import { getDepartments, getFamilies, type Family } from "./catalogue";
import { matchCategories, runSearch, SEARCH_OPTIONS, type CategoryEntry, type SearchDoc } from "./search-config";
import { expandQuery } from "./synonyms";

// One index for the /search page (server) and one serialised copy for the browser (search-index.json).
let built: { mini: MiniSearch<SearchDoc>; families: Family[] } | null = null;

function docFor(f: Family, i: number, pathName: string): SearchDoc {
  return {
    id: i,
    name: [f.name, ...(f.aka ?? [])].join(" "),
    brand: f.brand,
    codes: f.variants.flatMap((v) => [v.code ?? "", v.supplierCode ?? ""]).join(" "),
    labels: f.variants.map((v) => v.label ?? "").join(" "),
    path: pathName,
    extra: [f.powerSource, f.range].filter(Boolean).join(" "),
  };
}

function build() {
  if (!built) {
    const families = getFamilies();
    const names = new Map<string, string>();
    for (const d of getDepartments()) {
      for (const c of d.categories) {
        names.set(`${d.slug}/${c.slug}`, `${d.name} ${c.name}`);
        for (const s of c.subs ?? []) names.set(`${d.slug}/${c.slug}/${s.slug}`, `${d.name} ${c.name} ${s.name}`);
      }
    }
    const mini = new MiniSearch<SearchDoc>(SEARCH_OPTIONS);
    mini.addAll(
      families.map((f, i) => docFor(f, i, names.get(`${f.dept}/${f.cat}/${f.sub ?? ""}`) ?? names.get(`${f.dept}/${f.cat}`) ?? "")),
    );
    built = { mini, families };
  }
  return built;
}

const homeOf = (f: Family): [string, string] => [`/catalogue/${f.dept}/${f.cat}`, f.sub ? `/catalogue/${f.dept}/${f.cat}/${f.sub}` : ""];

/** Search the catalogue: names, brands, codes, sizes and categories, tolerant of typos and local words. */
export function searchFamilies(query: string, limit = 120): { total: number; results: Family[] } {
  const { mini, families } = build();
  const ranked = runSearch(mini, query, (id) => homeOf(families[id]), categoryEntries());
  return { total: ranked.length, results: ranked.slice(0, limit).map((r) => families[r.id]) };
}

function categoryEntries(): CategoryEntry[] {
  const out: CategoryEntry[] = [];
  for (const d of getDepartments()) {
    out.push([d.name, `/catalogue/${d.slug}`, "Department"]);
    for (const c of d.categories) {
      out.push([c.name, `/catalogue/${d.slug}/${c.slug}`, d.name]);
      for (const s of c.subs ?? []) out.push([s.name, `/catalogue/${d.slug}/${c.slug}/${s.slug}`, `${c.name}, ${d.name}`]);
    }
  }
  return out;
}

/** Category matches for the top of the results page. */
export function searchCategories(query: string): CategoryEntry[] {
  return matchCategories(expandQuery(query), categoryEntries());
}

/** Everything the browser needs for instant results, as one cached file. */
export function searchPayload(): string {
  const { mini, families } = build();
  const docs = families.map((f) => [f.slug, f.name, f.brand, f.image ?? "", f.variants.find((v) => v.code)?.code ?? "", `${f.dept}/${f.cat}/${f.sub ?? ""}`]);
  return JSON.stringify({ index: mini.toJSON(), docs, categories: categoryEntries() });
}
