import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Web app manifest — improves mobile experience + gives Google extra site metadata.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "browser",
    background_color: "#f8fafc",
    theme_color: "#2a6a44",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
