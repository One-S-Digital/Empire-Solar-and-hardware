import "server-only";
import { readFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fromWordPress, type WpCatalogue } from "./wp-source";

// The catalogue comes from WooCommerce (empire-core endpoint, wordpress/empire-core.php) when WP_URL is set,
// otherwise from src/data/catalogue.json, the output of data/build_catalogue.py. It is kept in memory for
// CACHE_SECONDS, and WordPress calls /api/revalidate on every product save to drop it sooner.

export type Variant = {
  code?: string;
  label?: string;
  size?: string;
  packQty?: number;
  prePacked?: boolean;
  details?: string;
  statedVariants?: number;
  /** The supplier's own code, only set when the site code had to change to stay unique */
  supplierCode?: string;
};

export type Family = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  supplier: string;
  dept: string;
  cat: string;
  sub?: string;
  also?: string[][];
  /** Other names the supplier lists the same product under */
  aka?: string[];
  tier: "B" | "C";
  image?: string;
  imageSize?: [number, number];
  imageUrl?: string;
  range?: string;
  powerSource?: string;
  variants: Variant[];
  rows: number[];
};

export type Sub = { slug: string; name: string; rows: number; families: number };
export type Category = { slug: string; name: string; rows: number; families: number; subs?: Sub[] };
export type Department = { slug: string; name: string; rows: number; families: number; categories: Category[] };
export type Brand = { slug: string; name: string; rows: number; families: number };

export type Catalogue = {
  generated: string;
  totals: { rows: number; families: number; suppliers: number; brands: number };
  departments: Department[];
  brands: Brand[];
  families: Family[];
};

type Loaded = { data: Catalogue; bySlug: Map<string, Family>; at: number };

const CACHE_SECONDS = 300;
// On globalThis because Next bundles the pages and the /api/revalidate route separately: module variables would be two copies
const shared = globalThis as typeof globalThis & { __empireCatalogue?: { cache: Loaded | null; inflight: Promise<Loaded> | null } };
const state = (shared.__empireCatalogue ??= { cache: null, inflight: null });

/** Drops the in-memory copy so the next read goes back to WordPress. Called by /api/revalidate. */
export function clearCatalogueCache() {
  state.cache = null;
}

/** Plain Node request: Next's patched fetch would try to cache this multi-MB response and make every page dynamic. */
function getJson(url: string): Promise<unknown> {
  const client = url.startsWith("https:") ? https : http;
  return new Promise((resolve, reject) => {
    client
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject)
      .setTimeout(60_000, function (this: http.ClientRequest) {
        this.destroy(new Error("timeout"));
      });
  });
}

async function readSource(): Promise<Catalogue> {
  const wp = process.env.WP_URL;
  if (wp) {
    try {
      return fromWordPress((await getJson(`${wp.replace(/\/$/, "")}/wp-json/empire/v1/catalogue`)) as WpCatalogue);
    } catch (e) {
      // Keep serving the last good copy; never mix in the old file silently outside development
      if (state.cache) return state.cache.data;
      if (process.env.NODE_ENV !== "development") throw new Error(`Cannot read the catalogue from ${wp}: ${(e as Error).message}`);
      console.warn(`catalogue: ${wp} not reachable (${(e as Error).message}); using src/data/catalogue.json`);
    }
  }
  const file = path.join(process.cwd(), "src", "data", "catalogue.json");
  return JSON.parse(await readFile(file, "utf8")) as Catalogue;
}

async function load(): Promise<Loaded> {
  if (state.cache && Date.now() - state.cache.at < CACHE_SECONDS * 1000) return state.cache;
  state.inflight ??= readSource()
    .then((data) => (state.cache = { data, bySlug: new Map(data.families.map((f) => [f.slug, f])), at: Date.now() }))
    .finally(() => {
      state.inflight = null;
    });
  return state.inflight;
}

export const getTotals = async () => (await load()).data.totals;
export const getDepartments = async () => (await load()).data.departments;
export const getBrands = async () => (await load()).data.brands;
export const getFamilies = async () => (await load()).data.families;
export const getFamily = async (slug: string) => (await load()).bySlug.get(slug);

export const getDepartment = async (slug: string) => (await getDepartments()).find((d) => d.slug === slug);

export async function getCategory(deptSlug: string, catSlug: string) {
  const dept = await getDepartment(deptSlug);
  const cat = dept?.categories.find((c) => c.slug === catSlug);
  return dept && cat ? { dept, cat } : undefined;
}

export async function getSub(deptSlug: string, catSlug: string, subSlug: string) {
  const found = await getCategory(deptSlug, catSlug);
  const sub = found?.cat.subs?.find((s) => s.slug === subSlug);
  return found && sub ? { ...found, sub } : undefined;
}

/** Families whose home, or second listing, is this department, category or sub-category. A to Z. */
export async function familiesIn(dept: string, cat?: string, sub?: string): Promise<Family[]> {
  const match = (f: Family) => {
    const places = [[f.dept, f.cat, f.sub ?? ""], ...(f.also ?? [])];
    return places.some(
      ([d, c, s]) => d === dept && (!cat || c === cat) && (!sub || s === sub),
    );
  };
  return (await load()).data.families
    .filter(match)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

export async function familiesOfBrand(brandSlug: string): Promise<Family[]> {
  return (await load()).data.families.filter((f) => f.brandSlug === brandSlug);
}

/** Other families in the same category (or department, if the category is small). */
export async function relatedFamilies(family: Family, count = 8): Promise<Family[]> {
  const sameCat = (await familiesIn(family.dept, family.cat)).filter((f) => f.id !== family.id);
  // Prefer ones with a photo, then the rest, keeping A to Z inside each group
  const ranked = [...sameCat.filter((f) => f.image), ...sameCat.filter((f) => !f.image)];
  return ranked.slice(0, count);
}
