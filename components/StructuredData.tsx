import { SITE } from "@/lib/site";

// ============================================================================
// STRUCTURED DATA (JSON-LD)
// Google ko machine-readable signals deta hai -> rich snippets (FAQ dropdown,
// tool info) search results me. Zyada clicks. Ye pure data hai, no UI.
// ============================================================================

export interface FaqItem {
  question: string;
  answer: string;
}

// Renders a <script type="application/ld+json"> block safely.
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here (our own data, not user input)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// WebApplication schema for a calculator tool page.
export function ToolSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name,
        description,
        url: `${SITE.url}${path}`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any (web browser)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
        },
      }}
    />
  );
}

// FAQPage schema -> can trigger the FAQ rich result in Google.
export function FaqSchema({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer,
          },
        })),
      }}
    />
  );
}

// Breadcrumb schema -> shows Home > Tool path in search results.
export function BreadcrumbSchema({
  toolName,
  path,
}: {
  toolName: string;
  path: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: toolName,
            item: `${SITE.url}${path}`,
          },
        ],
      }}
    />
  );
}

// Organization + WebSite schema for the homepage (site-wide identity).
export function SiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
      }}
    />
  );
}
