import { revalidatePath } from "next/cache";
import { clearCatalogueCache, getFamilies } from "@/lib/catalogue";
import { changedPaths, submitToIndexNow } from "@/lib/indexnow";

// Called by WordPress (empire-core) after a product is saved: POST with header x-revalidate-secret.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }
  // Compare the catalogue before and after to find the pages that really changed, then tell IndexNow about them.
  // With no earlier copy in memory (a fresh start) there is nothing to compare, so nothing is sent.
  let before: Awaited<ReturnType<typeof getFamilies>> | null = null;
  try {
    before = await getFamilies();
  } catch {}
  clearCatalogueCache();
  revalidatePath("/", "layout");
  revalidatePath("/search-index.json");
  revalidatePath("/sitemap.xml");
  revalidatePath("/sitemaps/[file]", "page");

  let indexnow: Awaited<ReturnType<typeof submitToIndexNow>> | null = null;
  try {
    if (before) indexnow = await submitToIndexNow(changedPaths(before, await getFamilies()));
  } catch (e) {
    console.warn("IndexNow:", (e as Error).message);
  }
  return Response.json({ ok: true, indexnow });
}
