import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE, getTool, isReleased } from "@/lib/site";
import { ToolSchema, FaqSchema, BreadcrumbSchema, FaqItem } from "./StructuredData";
import FaqSection from "./FaqSection";
import RelatedTools from "./RelatedTools";
import OfferBox from "./OfferBox";
import Icon from "./Icon";
import FavoriteButton from "./FavoriteButton";
import { TaxDatesButton } from "./calc/CheckIn";
import { TAX_DATES_2027 } from "@/lib/ics";

// In tools pe "tax deadlines calendar me daalo" button (Jan-Apr me log wapas aate hain)
const TAX_TOOLS = new Set([
  "paycheck-calculator",
  "no-tax-on-overtime-calculator",
  "no-tax-on-tips-calculator",
  "car-loan-interest-deduction-calculator",
  "senior-deduction-calculator",
  "bonus-tax-calculator",
]);

// ============================================================================
// TOOL PAGE LAYOUT — har calculator page ka same structure (SEO + E-E-A-T):
// breadcrumb -> H1 + intro -> calculator -> explainer -> sources -> partner offer ->
// FAQ -> disclaimer -> embed -> related tools. Page sirf content deta hai.
// ============================================================================

export interface Source {
  label: string;
  url: string;
}

interface ToolLayoutProps {
  slug: string;
  h1: string;
  intro: React.ReactNode;
  // One-sentence direct answer with a worked example (what search/AI answers quote)
  answer?: React.ReactNode;
  calculator: React.ReactNode;
  children: React.ReactNode; // the explainer article
  faqs: FaqItem[];
  sources?: Source[];
  finance?: boolean; // show the "not financial advice" box
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ToolLayout({ slug, h1, intro, answer, calculator, children, faqs, sources = [], finance = true }: ToolLayoutProps) {
  const tool = getTool(slug)!;
  // Release queue: publish date se pehle public build me page nahi banta (404)
  if (!isReleased(tool)) notFound();
  const path = `/${slug}/`;

  return (
    <>
      <ToolSchema name={tool.title} description={tool.blurb} path={path} dateModified={tool.updated} />
      <FaqSchema items={faqs} />
      <BreadcrumbSchema toolName={tool.shortTitle} path={path} />

      <div className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-ivy-100/70 to-transparent dark:from-ivy-900/25" />
        <div className="container-page pt-6 sm:pt-8">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
            <Link href="/" className="hover:text-ivy-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{tool.shortTitle}</span>
          </nav>

          <div className="flex items-start gap-4">
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-surface text-ivy-600 shadow-soft sm:grid dark:text-ivy-400">
              <Icon name={tool.icon} className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{h1}</h1>
              <p className="mt-2 max-w-2xl text-lg text-muted">{intro}</p>
              {answer && (
                <p className="mt-3 max-w-2xl rounded-xl border-l-4 border-ivy-500 bg-surface/80 px-3 py-2 text-sm leading-relaxed text-ink/90">
                  <strong className="text-ink">Quick answer:</strong> {answer}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
                <Link href="/editorial-policy/" className="underline underline-offset-2">Maintained by HomeMoney Calc</Link>
                <FavoriteButton slug={slug} />
                {TAX_TOOLS.has(slug) && <TaxDatesButton events={TAX_DATES_2027} />}
                <span>
                  Updated {formatDate(tool.updated)} ·{" "}
                  <Link href="/methodology/" className="underline underline-offset-2 hover:text-ivy-600">
                    How we calculate
                  </Link>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">{calculator}</div>
        </div>
      </div>

      <div className="container-page">
        <article className="prose-content mt-10">{children}</article>

        {sources.length > 0 && (
          <section className="mt-10 max-w-3xl rounded-2xl border border-line bg-surface p-5" aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="flex items-center gap-2 text-base font-bold text-ink">
              <Icon name="shield" className="h-5 w-5 text-ivy-600" />
              Sources &amp; assumptions
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              Figures are checked against these official sources and reviewed under our{" "}
              <Link href="/editorial-policy/" className="underline underline-offset-2">editorial policy</Link>.
            </p>
          </section>
        )}

        <OfferBox slug={slug} />

        <FaqSection items={faqs} />

        {finance && (
          <div className="mt-8 max-w-3xl rounded-2xl border border-sun-300/70 bg-sun-100/60 p-4 text-sm text-[#6b4300] dark:border-sun-600/40 dark:bg-sun-600/10 dark:text-sun-300">
            <strong>Estimate only, not financial advice.</strong> Results are for planning and education. Your lender, employer
            or tax authority may calculate differently. See our{" "}
            <Link href="/disclaimer/" className="underline">full disclaimer</Link>.
          </div>
        )}

        {/* Bloggers/teachers ke liye copy-paste iframe. Credit link iframe ke andar hi hai
            (brand naam, nofollow) — bahar koi keyword link nahi, taaki link-scheme na lage. */}
        <details className="mt-8 max-w-3xl rounded-2xl border border-line bg-surface p-4 text-sm">
          <summary className="cursor-pointer font-semibold text-ink">Embed this calculator on your site (free)</summary>
          <p className="mt-2 text-muted">Copy this code into your blog or class page. It stays free and updates automatically.</p>
          <textarea
            readOnly
            rows={3}
            aria-label="Embed code"
            className="mt-2 w-full rounded-xl border border-line bg-surface-2 p-2 font-mono text-xs text-ink"
            defaultValue={`<iframe src="${SITE.url}/embed/${slug}/" title="${tool.title}" width="100%" height="760" style="border:0;max-width:720px" loading="lazy"></iframe>`}
          />
        </details>

        <RelatedTools slug={slug} />
      </div>
    </>
  );
}
