import type MiniSearch from "minisearch";
import type { Options } from "minisearch";
import { expandQuery } from "./synonyms";

/** One search document per product family. Shared by the server index and the browser copy, which must match. */
export type SearchDoc = {
  id: number;
  name: string;
  brand: string;
  codes: string;
  labels: string;
  path: string;
  extra: string;
};

export const SEARCH_OPTIONS: Options<SearchDoc> = {
  fields: ["name", "brand", "codes", "labels", "path", "extra"],
  idField: "id",
  // MiniSearch splits on punctuation: "SUN-LYNKS-8.0" and "GPCV400/15" become the same pieces on both sides
  processTerm: (term) => term.toLowerCase(),
};

export const SEARCH_QUERY = {
  prefix: true,
  // Typos only for plain words of five letters or more: "sunsink" finds Sunsynk, "15mm" never turns into "16mm"
  fuzzy: (term: string) => (/^[a-z]{5,}$/.test(term) ? 0.2 : false),
  combineWith: "AND",
  boost: { name: 3, codes: 4, brand: 2, labels: 1.5, path: 1, extra: 1 },
} as const;

export type CategoryEntry = [name: string, href: string, context: string];

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);

/** Categories whose name starts with every word typed ("circuit break" finds Circuit Breakers). Exact names first. */
export function matchCategories(queries: string[], categories: CategoryEntry[], limit = 4): CategoryEntry[] {
  const hits = new Map<string, { entry: CategoryEntry; exact: boolean }>();
  for (const q of queries) {
    const typed = words(q);
    if (!typed.length) continue;
    for (const entry of categories) {
      const name = words(entry[0]);
      if (typed.every((t) => name.some((n) => n.startsWith(t) || (t.length > 3 && t.startsWith(n) && n.length > 3)))) {
        const exact = typed.join(" ") === name.join(" ");
        const known = hits.get(entry[1]);
        if (!known || (exact && !known.exact)) hits.set(entry[1], { entry, exact });
      }
    }
  }
  return [...hits.values()]
    .sort((a, b) => Number(b.exact) - Number(a.exact) || a.entry[0].length - b.entry[0].length)
    .slice(0, limit)
    .map((h) => h.entry);
}

/**
 * Ranks every product family for a query. Used by the results page (server) and the instant dropdown (browser),
 * so both give the same order: an exact code first, then products in a category the words name, then text score.
 * `home(id)` gives the family's category and sub-category links.
 */
export function runSearch(
  mini: MiniSearch<SearchDoc>,
  query: string,
  home: (id: number) => [categoryHref: string, subHref: string],
  categories: CategoryEntry[],
): { id: number; score: number }[] {
  const q = query.trim();
  if (!q) return [];
  const variants = expandQuery(q);
  const typedCode = q.toLowerCase();
  const best = new Map<number, number>();
  for (const variant of variants) {
    for (const hit of mini.search(variant, SEARCH_QUERY)) {
      const exact = Object.entries(hit.match).some(([term, fields]) => term === typedCode && fields.includes("codes"));
      const score = hit.score + (exact ? 5000 : 0);
      if ((best.get(hit.id) ?? -1) < score) best.set(hit.id, score);
    }
  }
  const named = matchCategories(variants, categories).filter(([, , context]) => context !== "Department").map((c) => c[1]);
  return [...best.entries()]
    .map(([id, score]) => {
      const [catHref, subHref] = home(id);
      return { id, score: score + (named.includes(catHref) || named.includes(subHref) ? 500 : 0) };
    })
    .sort((a, b) => b.score - a.score || a.id - b.id);
}
