import type { Family } from "./catalogue";

/**
 * Listing filters (Website Plan 7.4). State lives in the URL, so a filtered list can be shared on WhatsApp:
 *   ?brand=geo,ingco&size=15mm&power=cordless&range=core&sort=brand&view=list&page=2
 * Within one filter the choices are OR (Geo or Ingco); across filters they are AND.
 * Pure functions with no server-only imports, so the same code can run on the server and in the browser.
 */
export const FILTER_KEYS = ["brand", "size", "power", "range"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type Filters = Record<FilterKey, string[]>;
export type Sort = "az" | "brand";
export type View = "grid" | "list";

export type ListState = { filters: Filters; sort: Sort; view: View; page: number };

type RawParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseListState(sp: RawParams, cookieView?: string): ListState {
  const filters = {} as Filters;
  for (const key of FILTER_KEYS) {
    // ?brand=geo,ingco from our links, or ?brand=geo&brand=ingco from the plain form when JavaScript is off
    const raw = sp[key];
    const parts = (Array.isArray(raw) ? raw : [raw ?? ""]).flatMap((v) => v.split(","));
    filters[key] = [...new Set(parts.map((v) => v.trim()).filter(Boolean))].slice(0, 12);
  }
  const view = one(sp.view) || cookieView;
  return {
    filters,
    sort: one(sp.sort) === "brand" ? "brand" : "az",
    view: view === "list" ? "list" : "grid",
    page: Math.max(1, Number.parseInt(one(sp.page) || "1", 10) || 1),
  };
}

/** The value a family has for a filter. A family can have several (every size it comes in). */
function valuesOf(f: Family, key: FilterKey): string[] {
  switch (key) {
    case "brand":
      return [f.brandSlug];
    case "size":
      return [...new Set(f.variants.map((v) => v.size).filter((s): s is string => Boolean(s)))];
    case "power":
      return f.powerSource ? [f.powerSource.toLowerCase()] : [];
    case "range":
      return f.range ? [f.range] : [];
  }
}

const labelOf = (f: Family, key: FilterKey, value: string) => (key === "brand" ? f.brand : key === "power" ? f.powerSource ?? value : value);

export function applyFilters(families: Family[], filters: Filters, except?: FilterKey): Family[] {
  return families.filter((f) =>
    FILTER_KEYS.every((key) => key === except || !filters[key].length || valuesOf(f, key).some((v) => filters[key].includes(v))),
  );
}

export type FacetOption = { value: string; label: string; count: number; checked: boolean };
export type Facet = { key: FilterKey; title: string; options: FacetOption[] };

const TITLES: Record<FilterKey, string> = { brand: "Brand", size: "Size", power: "Power source", range: "Range" };

const sizeNumber = (s: string) => Number.parseFloat(s.replace(",", "."));

/**
 * Filters worth showing for this list, with counts. A count is how many listings you would get by ticking that
 * option with the other filters as they are now. Options that would give nothing stay visible with a count of 0
 * so people see why (the panel disables them). A filter with fewer than two real choices is left out.
 */
export function buildFacets(families: Family[], filters: Filters): Facet[] {
  const facets: Facet[] = [];
  for (const key of FILTER_KEYS) {
    const pool = applyFilters(families, filters, key);
    const everyValue = new Map<string, string>();
    for (const f of families) for (const v of valuesOf(f, key)) everyValue.set(v, labelOf(f, key, v));
    const counts = new Map<string, number>();
    for (const f of pool) for (const v of valuesOf(f, key)) counts.set(v, (counts.get(v) ?? 0) + 1);
    const live = [...counts.values()].filter((n) => n > 0).length;
    if (everyValue.size < 2 || (live < 2 && !filters[key].length)) continue;
    let options = [...everyValue.entries()].map(([value, label]) => ({
      value,
      label,
      count: counts.get(value) ?? 0,
      checked: filters[key].includes(value),
    }));
    options =
      key === "size"
        ? options.sort((a, b) => sizeNumber(a.value) - sizeNumber(b.value))
        : options.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    // Sizes can run to dozens: keep the commonest, plus anything already ticked
    if (key === "size" && options.length > 16) {
      const keep = new Set(
        [...options].sort((a, b) => b.count - a.count).slice(0, 16).map((o) => o.value).concat(filters.size),
      );
      options = options.filter((o) => keep.has(o.value));
    }
    facets.push({ key, title: TITLES[key], options });
  }
  return facets;
}

export function sortFamilies(families: Family[], sort: Sort): Family[] {
  const byName = (a: Family, b: Family) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  return sort === "brand"
    ? [...families].sort((a, b) => a.brand.localeCompare(b.brand, "en", { sensitivity: "base" }) || byName(a, b))
    : [...families].sort(byName);
}

export const activeFilterCount = (filters: Filters) => FILTER_KEYS.reduce((n, k) => n + filters[k].length, 0);

/** Query string for a state. Defaults are left out so links stay short and the plain listing keeps its plain URL. */
export function toQuery(state: Partial<ListState> & { filters: Filters }, overrides: Partial<ListState> = {}): string {
  const s = { sort: "az", view: "grid", page: 1, ...state, ...overrides } as ListState;
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) if (s.filters[key].length) params.set(key, s.filters[key].join(","));
  if (s.sort !== "az") params.set("sort", s.sort);
  if (s.view !== "grid") params.set("view", s.view);
  if (s.page > 1) params.set("page", String(s.page));
  const q = params.toString().replace(/%2C/g, ",");
  return q ? `?${q}` : "";
}

/** Value with one choice added or removed, for the removable chips. */
export function without(filters: Filters, key: FilterKey, value: string): Filters {
  return { ...filters, [key]: filters[key].filter((v) => v !== value) };
}
