import "server-only";
import type { Family } from "./catalogue";
import { absolute, siteUrl } from "./site-url";

// IndexNow (SEO plan 3.7): tell Bing, Yandex, Seznam and Naver which pages changed, so ChatGPT and Copilot see
// them quickly. Google ignores it. The key file is served at /{key}.txt (see next.config.ts and app/indexnow-key).
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const BATCH = 10_000;

export const indexNowKey = process.env.INDEXNOW_KEY ?? "";
export const indexNowKeyValid = /^[A-Za-z0-9-]{8,128}$/.test(indexNowKey);

/** Why nothing would be sent, or null when it is on. Local and unconfigured sites never ping. */
export function indexNowOff(): string | null {
  if (!indexNowKeyValid) return "INDEXNOW_KEY is not set (8 to 128 letters, digits or dashes)";
  if (/^https?:\/\/(localhost|127\.|\[::1\])/.test(siteUrl)) return "SITE_URL is a local address";
  return null;
}

/** Sends the pages to IndexNow. INDEXNOW_DRY_RUN=1 returns what would be sent without sending it. */
export async function submitToIndexNow(paths: string[]): Promise<{ sent: number; skipped?: string; dryRun?: boolean; status?: number[] }> {
  const urls = [...new Set(paths.map(absolute))];
  const off = indexNowOff();
  if (urls.length === 0) return { sent: 0, skipped: "no pages" };
  if (off && !process.env.INDEXNOW_DRY_RUN) return { sent: 0, skipped: off };
  if (process.env.INDEXNOW_DRY_RUN) return { sent: urls.length, dryRun: true };
  const status: number[] = [];
  for (let i = 0; i < urls.length; i += BATCH) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(siteUrl).host, key: indexNowKey, keyLocation: `${siteUrl}/${indexNowKey}.txt`, urlList: urls.slice(i, i + BATCH) }),
    });
    status.push(res.status);
  }
  return { sent: urls.length, status };
}

const pathsOf = (f: Family) => [
  `/p/${f.slug}`,
  `/catalogue/${f.dept}/${f.cat}`,
  ...(f.sub ? [`/catalogue/${f.dept}/${f.cat}/${f.sub}`] : []),
  ...(f.also ?? []).map(([d, c, s]) => `/catalogue/${d}/${c}${s ? `/${s}` : ""}`),
];

/** Pages touched by products that are new, changed or gone between two copies of the catalogue. */
export function changedPaths(before: Family[], after: Family[]): string[] {
  const was = new Map(before.map((f) => [f.id, JSON.stringify(f)]));
  const now = new Map(after.map((f) => [f.id, f]));
  const out: string[] = [];
  for (const f of after) if (was.get(f.id) !== JSON.stringify(f)) out.push(...pathsOf(f));
  for (const f of before) if (!now.has(f.id)) out.push(...pathsOf(f));
  return out;
}
