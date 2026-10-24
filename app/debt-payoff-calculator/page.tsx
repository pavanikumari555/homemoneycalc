import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import DebtCalculator from "./DebtCalculator";
import { calcDebtPayoff, duration, usd0 } from "@/lib/calc";

const SLUG = "debt-payoff-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Debt Snowball vs Avalanche Calculator",
  description:
    "Compare snowball and avalanche payoff plans side by side: your debt-free date, total interest and every payoff milestone.",
  path: `/${SLUG}/`,
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

const SOURCES = [
  { label: "CFPB — Debt collection resources", url: "https://www.consumerfinance.gov/consumer-tools/debt-collection/" },
  { label: "Federal Reserve — Consumer credit (G.19) interest rates", url: "https://www.federalreserve.gov/releases/g19/current/" },
];

const EX = calcDebtPayoff(
  [
    { name: "Credit card", balance: 6500, annualRatePercent: 24, minPayment: 180 },
    { name: "Car loan", balance: 14000, annualRatePercent: 7.5, minPayment: 320 },
    { name: "Personal loan", balance: 2500, annualRatePercent: 11, minPayment: 90 },
    { name: "Student loan", balance: 18000, annualRatePercent: 5.5, minPayment: 210 },
  ],
  250
);
const ANSWER = `The avalanche method (highest interest rate first) always costs the least interest; the snowball method (smallest balance first) clears your first debt sooner. With $41,000 of typical debts and $250 extra a month, avalanche finishes in ${duration(EX.avalanche.months)} and saves ${usd0(Math.max(0, EX.snowball.totalInterest - EX.avalanche.totalInterest))} in interest versus snowball (${duration(EX.snowball.months)}).`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Debt Payoff Calculator"
      answer={ANSWER}
      intro="Compare the snowball and avalanche methods side by side, see every milestone, and get your debt-free date."
      calculator={<DebtCalculator />}
      faqs={faqs}
      sources={SOURCES}
    >
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
    </ToolLayout>
  );
}
