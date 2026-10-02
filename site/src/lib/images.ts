import manifest from "@/data/images.json";
import categoryManifest from "@/data/category-images.json";

type Entry = { aspect: string; files: Record<string, { path: string; height: number }> };
const images = manifest as Record<string, Entry>;

/** srcSet, the largest file (as the src fallback) and its size, from the generated manifest (art/convert.py). */
export function imageSet(name: string) {
  const entry = images[name];
  if (!entry) throw new Error(`Unknown image "${name}"`);
  const widths = Object.keys(entry.files).map(Number).sort((a, b) => a - b);
  const largest = entry.files[String(widths[widths.length - 1])];
  return {
    srcSet: widths.map((w) => `${entry.files[String(w)].path} ${w}w`).join(", "),
    src: largest.path,
    width: widths[widths.length - 1],
    height: largest.height,
  };
}

type CategoryEntry = { alt: string; files: Record<string, { path: string; height: number }> };
const categoryImages = categoryManifest as Record<string, CategoryEntry>;

/** srcSet and fallback for a category's generated cover (art/convert_categories.py), or undefined if it has none. */
export function categoryImage(deptSlug: string, catSlug: string) {
  const entry = categoryImages[`${deptSlug}/${catSlug}`];
  if (!entry) return undefined;
  const widths = Object.keys(entry.files).map(Number).sort((a, b) => a - b);
  const largest = entry.files[String(widths[widths.length - 1])];
  return {
    srcSet: widths.map((w) => `${entry.files[String(w)].path} ${w}w`).join(", "),
    src: largest.path,
    width: widths[widths.length - 1],
    height: largest.height,
  };
}
