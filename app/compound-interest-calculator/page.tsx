import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import CompoundCalculator from "./CompoundCalculator";
import { calcCompoundInterest, usd0 } from "@/lib/calc";

const SLUG = "compound-interest-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Compound Interest Calculator with Monthly Deposits",
  description:
    "Project savings growth with monthly deposits and daily, monthly or yearly compounding, shown on a year-by-year chart. Any currency.",
  path: `/${SLUG}/`,
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

const SOURCES = [
  { label: "Investor.gov (SEC) — Compound interest explained", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" },
  { label: "FDIC — National rates and rate caps", url: "https://www.fdic.gov/national-rates-and-rate-caps" },
];

const EX = calcCompoundInterest({ principal: 10_000, monthlyContribution: 300, annualRatePercent: 7, years: 20, compoundsPerYear: 12, annualIncreasePercent: 0 });
const ANSWER = `$10,000 plus $300 a month at a 7% yearly return grows to about ${usd0(EX.futureValue)} in 20 years. You deposit ${usd0(EX.totalContributions)}; the rest, ${usd0(EX.totalInterest)}, is compound growth.`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Compound Interest Calculator"
      answer={ANSWER}
      intro="Watch your money grow with compound interest and monthly deposits — in dollars, pounds, euros, rupees and more."
      calculator={<CompoundCalculator />}
      faqs={faqs}
      sources={SOURCES}
    >
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
    </ToolLayout>
  );
}
