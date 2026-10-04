import { sitemapIndex } from "@/lib/sitemap";

// Static like search-index.json; /api/revalidate rebuilds it when a product changes in WordPress.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  return new Response(await sitemapIndex(), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
