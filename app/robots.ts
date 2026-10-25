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
      // Admin public build me hota hi nahi (aur X-Robots-Tag), isliye yahan naam nahi likhte
      disallow: ["/go/", "/embed/"], // affiliate redirects, iframe widgets
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
