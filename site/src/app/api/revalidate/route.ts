import { revalidatePath } from "next/cache";
import { clearCatalogueCache } from "@/lib/catalogue";

// Called by WordPress (empire-core) after a product is saved: POST with header x-revalidate-secret.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }
  clearCatalogueCache();
  revalidatePath("/", "layout");
  revalidatePath("/search-index.json");
  revalidatePath("/sitemap.xml");
  revalidatePath("/sitemaps/[file]", "page");
  return Response.json({ ok: true });
}
