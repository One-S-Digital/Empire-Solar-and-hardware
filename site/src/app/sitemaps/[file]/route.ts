import { sitemapFile } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const xml = await sitemapFile((await params).file);
  if (!xml) return new Response("Not found", { status: 404 });
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
