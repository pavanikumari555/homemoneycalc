import type { MetadataRoute } from "next";
import { SITE, TOOLS } from "@/lib/site";

// Static export: build ke waqt ek baar file ban jaati hai (Next.js 16 me zaroori)
export const dynamic = "force-static";

// Auto-generated sitemap. Next.js outputs /sitemap.xml at build time (static).
// lastModified = tool ka asli "updated" date (lib/site.ts). Har build pe "aaj" dena
// Google ko galat signal deta hai, isliye real date use karte hain.
const PAGES_UPDATED = "2026-10-25"; // home + info pages; change when you edit them

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "calculators", "take-home-pay-by-state", "methodology", "editorial-policy", "about", "contact", "privacy-policy", "advertising-disclosure", "terms", "disclaimer"].map((p) => ({
    url: `${SITE.url}/${p ? p + "/" : ""}`,
    lastModified: new Date(p === "privacy-policy" ? "2026-10-30" : PAGES_UPDATED),
    changeFrequency: (p === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: p === "" ? 1 : 0.5,
  }));

  // Home + /calculators naye tool ke saath sach me badalte hain (naya card) — isliye unka lastmod
  // = latest published tool ki date (agar wo PAGES_UPDATED se nayi ho). Fake "aaj" kabhi nahi.
  const latestTool = TOOLS.reduce((d, t) => (t.added > d ? t.added : d), PAGES_UPDATED);
  for (const p of staticPages) {
    if (p.url === `${SITE.url}/` || p.url === `${SITE.url}/calculators/`) p.lastModified = new Date(latestTool);
  }

  const toolPages = TOOLS.map((t) => ({
    url: `${SITE.url}/${t.slug}/`,
    lastModified: new Date(t.updated),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
