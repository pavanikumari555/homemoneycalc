import type { Metadata } from "next";
import { SITE } from "./site";

// ============================================================================
// SEO METADATA HELPER
// Har page isi function se apni metadata banata hai -> consistent titles,
// descriptions, canonical URLs, Open Graph + Twitter cards, robots directives.
// Ye "on-page SEO" hai jo Google ko page samajhne me help karta hai.
// ============================================================================

interface PageSeoInput {
  title: string; // page-specific title (site name auto-append hoga)
  description: string; // 150-160 chars ideal
  // Path relative to domain, e.g. "/paycheck-calculator/". Used for canonical.
  path: string;
  // Optional: keywords hint (Google ignores mostly, par kuch engines use karte)
  keywords?: string[];
  // If true, tells search engines NOT to index (used for thin/utility pages)
  noindex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  noindex = false,
}: PageSeoInput): Metadata {
  // Canonical URL = the one true URL for this page (avoids duplicate-content issues)
  const canonical = `${SITE.url}${path}`;
  const fullTitle = `${title} | ${SITE.name}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords,
    alternates: {
      canonical,
    },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      title: fullTitle,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
