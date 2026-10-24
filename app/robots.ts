import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Static export: build ke waqt ek baar file ban jaati hai (Next.js 16 me zaroori)
export const dynamic = "force-static";

// Generates /robots.txt at build time. Allows all crawlers, points to sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/"], // private owner dashboard
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
