import type { MetadataRoute } from "next";
import { SITE, TOOLS } from "@/lib/site";

// Auto-generated sitemap. Next.js outputs /sitemap.xml at build time (static).
// lastModified = tool ka asli "updated" date (lib/site.ts). Har build pe "aaj" dena
// Google ko galat signal deta hai, isliye real date use karte hain.
const PAGES_UPDATED = "2026-10-24"; // home + info pages; change when you edit them

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "calculators", "take-home-pay-by-state", "methodology", "editorial-policy", "about", "contact", "privacy-policy", "terms", "disclaimer"].map((p) => ({
    url: `${SITE.url}/${p ? p + "/" : ""}`,
    lastModified: new Date(PAGES_UPDATED),
    changeFrequency: (p === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: p === "" ? 1 : 0.5,
  }));

  const toolPages = TOOLS.map((t) => ({
    url: `${SITE.url}/${t.slug}/`,
    lastModified: new Date(t.updated),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
