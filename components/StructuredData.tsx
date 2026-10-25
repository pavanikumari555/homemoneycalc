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

// JSON ko <script> ke andar daalne layak banao: har "<" ko unicode escape (u003c) — taaki kisi FAQ/text me
// "</script>" aa jaaye (agent ka likha content bhi) to bhi HTML tod ke script inject na ho.
export function safeJson(data: object): string {
  const BACKSLASH = String.fromCharCode(92); // escape sequence likhne ka saaf tareeka
  return JSON.stringify(data).replace(/</g, `${BACKSLASH}u003c`);
}

// Renders a <script type="application/ld+json"> block safely.
function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(data) }} />;
}

// WebApplication schema for a calculator tool page.
export function ToolSchema({
  name,
  description,
  path,
  dateModified,
}: {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name,
        description,
        url: `${SITE.url}${path}`,
        ...(dateModified ? { dateModified } : {}),
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

// FAQPage schema. Google ne May 2026 se FAQ rich result dikhana band kiya, par
// markup harmless hai aur dusre search/AI engines page samajhne me use karte hain.
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
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          description: SITE.description,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
          logo: `${SITE.url}/favicon.svg`,
          email: SITE.email,
        }}
      />
    </>
  );
}
