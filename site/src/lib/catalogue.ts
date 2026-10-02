import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

// Reads the file made by data/build_catalogue.py. When WordPress is connected this module is the
// one place that changes: the same functions will read WooCommerce instead.

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

type Catalogue = {
  generated: string;
  totals: { rows: number; families: number; suppliers: number; brands: number };
  departments: Department[];
  brands: Brand[];
  families: Family[];
};

let cache: { data: Catalogue; bySlug: Map<string, Family> } | null = null;

function load() {
  if (!cache) {
    const file = path.join(process.cwd(), "src", "data", "catalogue.json");
    const data = JSON.parse(readFileSync(file, "utf8")) as Catalogue;
    cache = { data, bySlug: new Map(data.families.map((f) => [f.slug, f])) };
  }
  return cache;
}

export const getTotals = () => load().data.totals;
export const getDepartments = () => load().data.departments;
export const getBrands = () => load().data.brands;
export const getFamilies = () => load().data.families;
export const getFamily = (slug: string) => load().bySlug.get(slug);

export const getDepartment = (slug: string) => getDepartments().find((d) => d.slug === slug);

export function getCategory(deptSlug: string, catSlug: string) {
  const dept = getDepartment(deptSlug);
  const cat = dept?.categories.find((c) => c.slug === catSlug);
  return dept && cat ? { dept, cat } : undefined;
}

export function getSub(deptSlug: string, catSlug: string, subSlug: string) {
  const found = getCategory(deptSlug, catSlug);
  const sub = found?.cat.subs?.find((s) => s.slug === subSlug);
  return found && sub ? { ...found, sub } : undefined;
}

/** Families whose home, or second listing, is this department, category or sub-category. A to Z. */
export function familiesIn(dept: string, cat?: string, sub?: string): Family[] {
  const match = (f: Family) => {
    const places = [[f.dept, f.cat, f.sub ?? ""], ...(f.also ?? [])];
    return places.some(
      ([d, c, s]) => d === dept && (!cat || c === cat) && (!sub || s === sub),
    );
  };
  return load()
    .data.families.filter(match)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

export function familiesOfBrand(brandSlug: string): Family[] {
  return load().data.families.filter((f) => f.brandSlug === brandSlug);
}

/** Other families in the same category (or department, if the category is small). */
export function relatedFamilies(family: Family, count = 8): Family[] {
  const sameCat = familiesIn(family.dept, family.cat).filter((f) => f.id !== family.id);
  // Prefer ones with a photo, then the rest, keeping A to Z inside each group
  const ranked = [...sameCat.filter((f) => f.image), ...sameCat.filter((f) => !f.image)];
  return ranked.slice(0, count);
}
