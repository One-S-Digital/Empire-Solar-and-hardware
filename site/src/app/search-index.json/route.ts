import { searchPayload } from "@/lib/search";

// Built once per deploy and cached, like any static file. It will be rebuilt whenever a product changes in WordPress.
export const dynamic = "force-static";

export function GET() {
  return new Response(searchPayload(), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
