import type { Metadata } from "next";
import Link from "next/link";
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

// Worked examples — every number below comes from the same calcCompoundInterest() the tool runs
const BASE = { principal: 10_000, monthlyContribution: 300, annualRatePercent: 7, years: 20, compoundsPerYear: 12, annualIncreasePercent: 0 };
const EX = calcCompoundInterest(BASE);
const EX_DAILY = calcCompoundInterest({ ...BASE, compoundsPerYear: 365 });
const EX_YEARLY = calcCompoundInterest({ ...BASE, compoundsPerYear: 1 });
const EX_RAISE = calcCompoundInterest({ ...BASE, annualIncreasePercent: 3 });
const LUMP = calcCompoundInterest({ ...BASE, monthlyContribution: 0 });
const SIMPLE_INTEREST = 10_000 * 0.07 * 20; // simple interest, for comparison
const START_25 = calcCompoundInterest({ ...BASE, principal: 0, years: 40 });
const START_35 = calcCompoundInterest({ ...BASE, principal: 0, years: 30 });

const faqs: FaqItem[] = [
  {
    question: "What is compound interest?",
    answer:
      "Compound interest is interest earned on both your original money and on the interest it has already earned. Instead of growing by the same amount each period, your balance grows faster and faster over time because each new interest payment is calculated on a larger total.",
  },
  {
    question: "How does compounding frequency affect my returns?",
    answer: `The more often interest compounds, the more you earn, but the gap is small at typical rates. With $10,000 plus $300 a month at 7% for 20 years, daily compounding gives ${usd0(EX_DAILY.futureValue)}, monthly ${usd0(EX.futureValue)} and yearly ${usd0(EX_YEARLY.futureValue)}.`,
  },
  {
    question: "Why do monthly contributions matter so much?",
    answer:
      "Regular contributions are often the biggest driver of long-term growth. Each deposit you add gets more years to compound, so money invested early works hardest. The year-by-year chart above shows how contributions plus compounding can turn modest monthly savings into a large balance over one or two decades.",
  },
  {
    question: "What return rate should I use?",
    answer:
      "Use a rate that matches where the money actually sits. Savings accounts and CDs pay a stated rate that can change; stock investments have no fixed rate and can lose value in any year. Run a conservative rate as well as your hoped-for rate so you see a realistic range.",
  },
  {
    question: "Is this the same as an APY calculation?",
    answer:
      "They're related. APY (annual percentage yield) is the effective yearly rate after compounding is applied, so it already bakes in the compounding frequency. This calculator works from a nominal annual rate plus a compounding frequency, which together produce a result equivalent to using the matching APY.",
  },
  {
    question: "How long does it take money to double?",
    answer: `Divide 72 by the annual rate for a quick estimate — about 10.3 years at 7%. The exact figure for 7% compounded monthly is ${EX.doublingYears.toFixed(1)} years, which the calculator shows alongside your results.`,
  },
];

const SOURCES = [
  { label: "Investor.gov (SEC) — Compound interest explained", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" },
  { label: "Investor.gov (SEC) — What is the Rule of 72?", url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/rule-72" },
  { label: "FDIC — National rates and rate caps", url: "https://www.fdic.gov/national-rates-and-rate-caps" },
];

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

      <h2>The formula in plain English</h2>
      <p>
        For a single deposit, the classic formula is <code>A = P × (1 + r ÷ n)^(n × t)</code>: the starting amount <code>P</code>{" "}
        grows by the annual rate <code>r</code> split into <code>n</code> compounding periods per year, repeated for{" "}
        <code>t</code> years. Monthly deposits are added on top, and each one compounds from the month it goes in.
      </p>
      <p>
        This calculator works month by month. Each month it grows the balance by the rate that matches your chosen compounding
        (daily, monthly, quarterly or yearly), then adds your deposit at the end of the month. If you set a yearly increase, your
        monthly deposit rises by that percent after each full year.
      </p>

      <h2>Worked example: the snowball effect</h2>
      <p>
        Start with $10,000, add $300 a month, and earn 7% a year compounded monthly. After 20 years you have deposited{" "}
        {usd0(EX.totalContributions)} of your own money ($10,000 + $300 × 240 months). The balance reaches about{" "}
        <strong>{usd0(EX.futureValue)}</strong>, so {usd0(EX.totalInterest)} — more than you put in — came from growth.
      </p>
      <ul>
        <li>
          <strong>Raise the deposit 3% a year</strong> (roughly in line with pay raises) and the 20-year balance becomes{" "}
          {usd0(EX_RAISE.futureValue)}.
        </li>
        <li>
          <strong>Compounding versus simple interest:</strong> the $10,000 alone, with no deposits, grows to{" "}
          {usd0(LUMP.futureValue)} — {usd0(LUMP.totalInterest)} of interest. Simple interest at 7% would pay only{" "}
          {usd0(SIMPLE_INTEREST)} over the same 20 years.
        </li>
        <li>
          <strong>Compounding frequency:</strong> switching from monthly to daily adds only about{" "}
          {usd0(EX_DAILY.futureValue - EX.futureValue)} over 20 years. Rate, deposits and time matter far more.
        </li>
      </ul>

      <h2>Why starting early matters</h2>
      <p>
        Two savers each put $300 a month into an account earning 7%, compounded monthly. One starts at 25, the other at 35; both
        stop at 65.
      </p>
      <ul>
        <li>
          <strong>Start at 25 (40 years):</strong> deposits of {usd0(START_25.totalContributions)} grow to about{" "}
          {usd0(START_25.futureValue)}.
        </li>
        <li>
          <strong>Start at 35 (30 years):</strong> deposits of {usd0(START_35.totalContributions)} grow to about{" "}
          {usd0(START_35.futureValue)}.
        </li>
      </ul>
      <p>
        The early starter puts in only $36,000 more but ends with more than twice as much, because those first ten years of deposits
        get the longest time to compound.
      </p>

      <h2>Reading your results</h2>
      <p>
        The chart plots your balance against what you deposited, and the gap between the two lines is growth. In the early years deposits
        make up most of the balance; later, growth takes over. In the main example, the balance after 10 years is about{" "}
        {usd0(EX.yearly[10].balance)} — and it more than doubles again over the next ten, even though you deposit the same $300 a
        month the whole time. The doubling time shown with your results tells you roughly how long your money takes to double at
        the chosen rate, before counting new deposits.
      </p>

      <h2>Making compound interest work for you</h2>
      <ul>
        <li>Start as early as you can — time is the biggest multiplier.</li>
        <li>Contribute consistently, even small amounts, and automate it if possible.</li>
        <li>Reinvest interest and dividends rather than withdrawing them.</li>
        <li>Keep fees low, since fees compound against you the same way returns compound for you.</li>
        <li>Pay off high-interest debt first — a credit card charging 20%+ compounds against you faster than most savings grow.</li>
      </ul>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Assuming a steady return.</strong> Investments rise and fall; a constant 7% is a planning assumption, not a
          promise. Bank rates can change too.
        </li>
        <li>
          <strong>Forgetting inflation.</strong> {usd0(EX.futureValue)} in 20 years will buy less than it does today. Use an
          inflation-adjusted (“real”) rate if you want results in today&apos;s dollars.
        </li>
        <li>
          <strong>Ignoring taxes.</strong> Interest in a regular savings or brokerage account is usually taxable each year, which
          slows growth. Tax-advantaged accounts like a 401(k) or IRA work differently.
        </li>
        <li>
          <strong>Confusing APR and APY.</strong> APY already includes compounding. If your bank quotes APY, enter it with yearly
          compounding to avoid counting the compounding twice.
        </li>
      </ul>

      <h2>When this calculator doesn&apos;t apply</h2>
      <p>
        It models a fixed rate with regular deposits. It isn&apos;t built for loans you are paying down, withdrawals in retirement,
        variable-rate products, or investments with uneven returns. For debt, compounding works in reverse — use a payoff
        calculator instead.
      </p>

      <h2>Related calculators</h2>
      <p>
        If you carry card balances, the <Link href="/credit-card-payoff-calculator/">credit card payoff calculator</Link> shows how
        compound interest works against you. The <Link href="/paycheck-calculator/">paycheck calculator</Link> helps you find a
        realistic monthly amount to save, and the <Link href="/mortgage-payoff-calculator/">mortgage payoff calculator</Link> lets
        you compare investing extra cash with paying down your home loan.
      </p>
    </ToolLayout>
  );
}
