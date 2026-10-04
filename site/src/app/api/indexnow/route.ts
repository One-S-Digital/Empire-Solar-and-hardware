import { indexablePaths } from "@/lib/sitemap";
import { submitToIndexNow } from "@/lib/indexnow";

// Manual submit, for launch or after a big import: POST with header x-revalidate-secret.
// Body {"all": true} sends every indexable page; {"paths": ["/p/..."]} sends just those.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) return Response.json({ ok: false }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { all?: boolean; paths?: string[] };
  const paths = body.all ? await indexablePaths() : (body.paths ?? []).filter((p) => typeof p === "string" && p.startsWith("/"));
  return Response.json({ ok: true, ...(await submitToIndexNow(paths)) });
}
