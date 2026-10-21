import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/site";
import { ToolSchema, FaqSchema, BreadcrumbSchema, FaqItem } from "@/components/StructuredData";
import FaqSection from "@/components/FaqSection";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import CompoundCalculator from "./CompoundCalculator";

const SLUG = "compound-interest-calculator";
const tool = getTool(SLUG)!;
const PATH = `/${SLUG}/`;

export const metadata: Metadata = buildMetadata({
  title: "Compound Interest Calculator — Grow Your Savings",
  description:
    "Free compound interest calculator with monthly contributions. See how your savings and investments grow over time, with a year-by-year breakdown. No sign-up.",
  path: PATH,
  keywords: [
    "compound interest calculator",
    "savings calculator",
    "investment growth calculator",
    "compound interest with monthly contributions",
    "future value calculator",
  ],
});

const faqs: FaqItem[] = [
  {
    question: "What is compound interest?",
    answer:
      "Compound interest is interest earned on both your original money and on the interest it has already earned. Instead of growing by the same amount each period, your balance grows faster and faster over time because each new interest payment is calculated on a larger total. Albert Einstein reportedly called it the eighth wonder of the world for this reason.",
  },
  {
    question: "How does compounding frequency affect my returns?",
    answer:
      "The more often interest compounds, the more you earn, because interest starts earning its own interest sooner. Daily compounding earns slightly more than monthly, which earns more than annual — though at typical rates the difference between monthly and daily is small. This calculator lets you compare annual, quarterly, monthly, and daily compounding.",
  },
  {
    question: "Why do monthly contributions matter so much?",
    answer:
      "Regular contributions are often the biggest driver of long-term growth. Each deposit you add gets more years to compound, so money invested early works hardest. The year-by-year chart above shows how contributions plus compounding can turn modest monthly savings into a large balance over one or two decades.",
  },
  {
    question: "What return rate should I use?",
    answer:
      "It depends on where your money is. A savings account might return 1–5%, while a diversified stock market portfolio has historically averaged around 7% per year after inflation over the long run — though returns vary year to year and are never guaranteed. Use a rate that reflects your actual accounts, and try a conservative figure to avoid over-optimistic projections.",
  },
  {
    question: "Is this the same as an APY calculation?",
    answer:
      "They're related. APY (annual percentage yield) is the effective yearly rate after compounding is applied, so it already bakes in the compounding frequency. This calculator works from a nominal annual rate plus a compounding frequency, which together produce a result equivalent to using the matching APY.",
  },
];

export default function Page() {
  return (
    <>
      <ToolSchema name={tool.title} description={tool.blurb} path={PATH} />
      <FaqSchema items={faqs} />
      <BreadcrumbSchema toolName={tool.shortTitle} path={PATH} />

      <div className="container-page py-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
          <Link href="/" className="hover:text-ivy-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{tool.shortTitle}</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Compound Interest Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          See how your money grows over time when interest compounds and you add regular
          monthly contributions. Includes a year-by-year growth chart.
        </p>

        <AdSlot />

        <div className="mt-6">
          <CompoundCalculator />
        </div>

        <AdSlot />

        <article className="prose-content mt-10 max-w-none">
          <h2>How compound interest works</h2>
          <p>
            With simple interest, you earn a fixed amount on your original deposit and nothing
            more. With compound interest, the interest you earn is added to your balance, and
            future interest is calculated on that new, larger balance. Over time this creates a
            snowball effect: your money earns interest, then that interest earns interest, and
            so on.
          </p>
          <p>
            The three levers that drive compound growth are the amount you start with, how much
            you add regularly, and how long you let it grow. Of these, time is usually the most
            powerful — which is why starting early, even with small amounts, often beats
            starting later with larger amounts.
          </p>

          <h2>An example of the snowball effect</h2>
          <p>
            Suppose you start with $10,000, add $300 a month, and earn 7% a year compounded
            monthly. After 20 years you would have contributed $82,000 of your own money, but
            your balance could grow to well over $180,000 — meaning compounding earned you more
            than you put in. Adjust the inputs above to model your own plan.
          </p>

          <h2>Making compound interest work for you</h2>
          <ul>
            <li>Start as early as you can — time is the biggest multiplier.</li>
            <li>Contribute consistently, even small amounts, and automate it if possible.</li>
            <li>Reinvest interest and dividends rather than withdrawing them.</li>
            <li>Keep fees low, since fees compound against you the same way returns compound for you.</li>
          </ul>
        </article>

        <FaqSection items={faqs} />

        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Projections are estimates for informational purposes only
          and are not investment advice. Real returns vary and are not guaranteed. See our{" "}
          <Link href="/disclaimer/" className="underline">full disclaimer</Link>.
        </div>

        <RelatedTools slug={SLUG} />
      </div>
    </>
  );
}
