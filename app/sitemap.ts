import type { MetadataRoute } from "next";
import { SITE, TOOLS } from "@/lib/site";

// Auto-generated sitemap. Next.js outputs /sitemap.xml at build time (static).
// Naya tool add karo -> automatically sitemap me aa jayega (TOOLS array se).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    "", // home
    "about",
    "contact",
    "privacy-policy",
    "terms",
    "disclaimer",
  ].map((p) => ({
    url: `${SITE.url}/${p ? p + "/" : ""}`,
    lastModified: now,
    changeFrequency: (p === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: p === "" ? 1 : 0.5,
  }));

  const toolPages = TOOLS.map((t) => ({
    url: `${SITE.url}/${t.slug}/`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
