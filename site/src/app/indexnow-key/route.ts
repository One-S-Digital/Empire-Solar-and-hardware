import { indexNowKey, indexNowKeyValid } from "@/lib/indexnow";

// Served at /{INDEXNOW_KEY}.txt through a rewrite in next.config.ts: the file IndexNow fetches to check we own the site.
export function GET() {
  if (!indexNowKeyValid) return new Response("Not found", { status: 404 });
  return new Response(indexNowKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
