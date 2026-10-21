import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/site";
import { ToolSchema, FaqSchema, BreadcrumbSchema, FaqItem } from "@/components/StructuredData";
import FaqSection from "@/components/FaqSection";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import DebtCalculator from "./DebtCalculator";

const SLUG = "debt-payoff-calculator";
const tool = getTool(SLUG)!;
const PATH = `/${SLUG}/`;

export const metadata: Metadata = buildMetadata({
  title: "Debt Payoff Calculator — Snowball vs Avalanche",
  description:
    "Free debt payoff calculator comparing the snowball and avalanche methods. Add your debts and extra payment to see which pays off faster and saves the most interest.",
  path: PATH,
  keywords: [
    "debt payoff calculator",
    "debt snowball calculator",
    "debt avalanche calculator",
    "pay off debt fast",
    "debt free calculator",
  ],
});

const faqs: FaqItem[] = [
  {
    question: "What is the difference between the snowball and avalanche methods?",
    answer:
      "Both put every spare dollar toward one debt while paying minimums on the rest. The avalanche method targets the debt with the highest interest rate first, which mathematically saves the most money. The snowball method targets the smallest balance first, which clears individual debts quickly and gives motivating early wins. Avalanche is cheaper; snowball is often easier to stick with.",
  },
  {
    question: "Which debt payoff method should I choose?",
    answer:
      "Choose avalanche if your priority is saving the most money and you're disciplined enough to stay the course when progress feels slow. Choose snowball if you're motivated by seeing debts disappear one by one and worry about losing momentum. The best method is the one you'll actually finish, so if snowball keeps you going, its slightly higher interest cost can be worth it.",
  },
  {
    question: "How does the extra payment amount affect payoff time?",
    answer:
      "The extra payment is the engine of both strategies. It's applied on top of all minimums to the current target debt, and once that debt is cleared, the freed-up minimum plus the extra rolls onto the next debt. Increasing the extra amount, even by a small figure, can dramatically shorten your payoff time because more money hits principal every month.",
  },
  {
    question: "Should I stop investing while paying off debt?",
    answer:
      "High-interest debt like credit cards (often 20% or more) usually costs more than investments reliably earn, so clearing it first is generally the stronger move. However, many people still contribute enough to get a full employer 401(k) match, because that match is an immediate guaranteed return. Balance depends on your rates and goals.",
  },
  {
    question: "Does this calculator account for interest accruing monthly?",
    answer:
      "Yes. It simulates your debts month by month, adding interest to each balance before applying payments, so the payoff times and total interest reflect how real debt behaves. This is more accurate than a simple division and is why the two methods can show meaningfully different total interest.",
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
          Debt Payoff Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Compare the two most popular debt payoff strategies — snowball and avalanche — to
          find your fastest, cheapest route to being debt-free. Add your debts below.
        </p>

        <AdSlot />

        <div className="mt-6">
          <DebtCalculator />
        </div>

        <AdSlot />

        <article className="prose-content mt-10 max-w-none">
          <h2>How the debt payoff methods work</h2>
          <p>
            Both strategies share the same foundation: you always pay the minimum on every
            debt, then throw every extra dollar you can spare at one specific target debt.
            When that target is paid off, all the money that was going to it — its old minimum
            plus your extra — rolls onto the next target. This rolling effect is what makes
            both methods so powerful over time.
          </p>
          <p>The only difference is which debt you target first:</p>
          <ul>
            <li>
              <strong>Avalanche</strong> attacks the highest interest rate first. Since
              interest is what makes debt expensive, killing the priciest debt first minimizes
              the total interest you pay and usually gets you debt-free soonest.
            </li>
            <li>
              <strong>Snowball</strong> attacks the smallest balance first. You clear whole
              debts quickly, which feels great and builds momentum — a psychological edge that
              helps many people finish what they start.
            </li>
          </ul>

          <h2>Why motivation matters as much as math</h2>
          <p>
            On paper, avalanche always wins on cost. But paying off debt is a long journey, and
            studies of real behavior show that people who see quick wins are more likely to
            stick with their plan. If the snowball method keeps you engaged and you finish,
            you come out ahead of an avalanche plan you abandon halfway. Use the calculator to
            see the actual dollar difference for your situation, then pick the plan you&apos;ll
            realistically follow.
          </p>

          <h2>Tips to pay off debt faster</h2>
          <ul>
            <li>Find extra money by pausing non-essential spending and redirecting it to debt.</li>
            <li>Call lenders to ask for a lower interest rate — it often works.</li>
            <li>Consider a balance transfer or consolidation only if it genuinely lowers your rate.</li>
            <li>Avoid taking on new debt while you execute the plan.</li>
          </ul>
        </article>

        <FaqSection items={faqs} />

        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Estimates for informational purposes only, not financial
          advice. See our{" "}
          <Link href="/disclaimer/" className="underline">full disclaimer</Link>.
        </div>

        <RelatedTools slug={SLUG} />
      </div>
    </>
  );
}
