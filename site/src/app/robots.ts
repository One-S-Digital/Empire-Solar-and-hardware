import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// SEO plan 3.7. Utility pages and multi-filter URLs are blocked. A single filter is allowed to be crawled so the
// canonical (pointing at the plain category) can be read; a second parameter, a sort or a view change is blocked.
const disallow = ["/search", "/enquiry", "/api/", "/styleguide", "/*?*&", "/*?*sort=", "/*?*view="];

// Search and answer crawlers from the plan. Each group repeats the rules, because a named group replaces the * group.
const AI_SEARCH = ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "Claude-SearchBot", "Claude-User", "Applebot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...AI_SEARCH.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
