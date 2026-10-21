import Link from "next/link";
import type { Metadata } from "next";
import { TOOLS, CATEGORY_LABELS, ToolCategory } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { SiteSchema } from "@/components/StructuredData";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = buildMetadata({
  title: "Free Financial Calculators — Paycheck, Mortgage, Debt & More",
  description:
    "Free, fast online calculators for the US: take-home paycheck, mortgage payoff, debt payoff, auto loan, percentage, and compound interest. No sign-up, instant results.",
  path: "/",
  keywords: [
    "financial calculators",
    "paycheck calculator",
    "mortgage payoff calculator",
    "debt payoff calculator",
    "auto loan calculator",
    "compound interest calculator",
  ],
});

const categories = Object.keys(CATEGORY_LABELS) as ToolCategory[];

export default function HomePage() {
  return (
    <>
      <SiteSchema />

      {/* Hero */}
      <section className="bg-gradient-to-b from-ivy-50 to-slate-50">
        <div className="container-page py-14 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Free Financial Calculators
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Fast, free, no sign-up calculators for your money and everyday math.
            Get instant, accurate estimates for paychecks, loans, debt, savings, and more.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/paycheck-calculator/" className="btn-primary">
              Try the Paycheck Calculator
            </Link>
            <Link
              href="#all-tools"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:border-ivy-400"
            >
              Browse all calculators
            </Link>
          </div>
        </div>
      </section>

      <div className="container-page py-10">
        <AdSlot />

        {/* Tools by category */}
        <section id="all-tools" aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="sr-only">
            All calculators
          </h2>
          {categories.map((cat) => (
            <div key={cat} className="mb-10">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                {CATEGORY_LABELS[cat]}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {TOOLS.filter((t) => t.category === cat).map((t) => (
                  <Link
                    key={t.slug}
                    href={`/${t.slug}/`}
                    className="card group transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 text-3xl">{t.icon}</div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-ivy-700">
                      {t.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{t.blurb}</p>
                    <span className="mt-3 inline-block text-sm font-medium text-ivy-600">
                      Open calculator →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        <AdSlot />

        {/* SEO intro content - real, useful text (not thin) */}
        <section className="prose-content mt-8 max-w-none">
          <h2>Why use CalcIvy?</h2>
          <p>
            CalcIvy is a collection of free financial calculators built to give you fast,
            reliable answers to everyday money questions. Whether you want to know your
            real take-home pay after taxes, how quickly you can pay off your mortgage with
            extra payments, or how your savings grow with compound interest, each tool
            gives you an instant, clear result — no account, no downloads, no cost.
          </p>
          <p>
            Every calculator runs entirely in your browser. That means your numbers never
            leave your device: nothing you type is sent to a server or stored anywhere.
            It also means results are instant and the tools work on any phone, tablet, or
            computer.
          </p>
          <h2>How our calculators work</h2>
          <p>
            Each tool uses standard, widely accepted financial formulas — the same math
            used by banks and lenders. For example, our loan calculators use the standard
            amortization formula to work out monthly payments, and our compound interest
            calculator models growth period by period so contributions are handled
            accurately. Every result page explains the formula in plain English so you can
            understand exactly how the number was reached.
          </p>
          <h2>A note on accuracy</h2>
          <p>
            The results are careful estimates for planning and educational purposes. Real
            figures from a lender, employer, or tax authority may differ because of factors
            our tools can&apos;t see, such as your exact tax situation, lender fees, or local
            rules. Always confirm important decisions with a qualified professional. See our{" "}
            <Link href="/disclaimer/" className="text-ivy-600 underline">
              disclaimer
            </Link>{" "}
            for details.
          </p>
        </section>
      </div>
    </>
  );
}
