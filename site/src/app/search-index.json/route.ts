import { searchPayload } from "@/lib/search";

// Cached like a static file and rebuilt when /api/revalidate is called after a product changes in WordPress.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  return new Response(await searchPayload(), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
