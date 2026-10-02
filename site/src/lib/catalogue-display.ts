// Display helpers that do not read the catalogue file, so client components can import them too.
const KEEP_UPPER = new Set([
  "LED", "MCB", "DB", "PVC", "HDPE", "ABB", "USB", "CCTV", "UV", "AC", "DC", "PH", "SDS", "HSS", "RCD",
  "IP", "GU10", "CFL", "PIR", "SABS", "DZR", "BDP", "NFR", "ATEX", "WACO", "TV", "LCD", "AA", "AAA", "CR",
]);
const SMALL = new Set(["and", "with", "for", "of", "the", "in", "to", "a", "on"]);

/** Title-cases the ALL CAPS names WACO supplies, keeping acronyms and codes upper case. */
export function displayName(name: string): string {
  if (name !== name.toUpperCase() || !/[A-Z]/.test(name)) return name;
  return name
    .split(" ")
    .map((w, i) => {
      if (/\d/.test(w) || KEEP_UPPER.has(w.replace(/[^A-Z0-9]/g, ""))) return w;
      const lower = w.toLowerCase();
      if (i > 0 && SMALL.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

// Comma grouping, as written in the plan ("6,319 products")
export const formatCount = (n: number) => n.toLocaleString("en-GB");

/** The id of a size's row on the product page, so a link can jump straight to it. */
export const variantAnchor = (code: string) => `v-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
