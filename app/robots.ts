import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Generates /robots.txt at build time. Allows all crawlers, points to sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
