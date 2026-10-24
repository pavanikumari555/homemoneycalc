import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Static export: build ke waqt ek baar file ban jaati hai (Next.js 16 me zaroori)
export const dynamic = "force-static";

// Web app manifest — "Add to Home Screen" pe CalcIvy ek app ki tarah khulta hai.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Money Calculators`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8f6",
    theme_color: "#2a6a44",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
