import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import DebtCalculator from "./DebtCalculator";
import { calcDebtPayoff, duration, usd0 } from "@/lib/calc";

const SLUG = "debt-payoff-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Debt Payoff Calculator: Snowball vs Avalanche",
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
  { label: "Kellogg School of Management — To beat debt, consider starting small (Gal & McShane, 2012)", url: "https://insight.kellogg.northwestern.edu/article/to_beat_debt_consider_starting_small" },
  { label: "CFPB — Regulation Z §1026.7(b)(12), minimum payment warning on card statements", url: "https://www.consumerfinance.gov/rules-policy/regulations/1026/7/" },
  { label: "CFPB — Debt collection resources", url: "https://www.consumerfinance.gov/consumer-tools/debt-collection/" },
  { label: "Federal Reserve — Consumer credit (G.19) interest rates", url: "https://www.federalreserve.gov/releases/g19/current/" },
];

// Worked example — calcDebtPayoff se compute hota hai (answer box wale same debts)
const DEBTS = [
  { name: "Credit card", balance: 6500, annualRatePercent: 24, minPayment: 180 },
  { name: "Car loan", balance: 14000, annualRatePercent: 7.5, minPayment: 320 },
  { name: "Personal loan", balance: 2500, annualRatePercent: 11, minPayment: 90 },
  { name: "Student loan", balance: 18000, annualRatePercent: 5.5, minPayment: 210 },
];
const EX = calcDebtPayoff(DEBTS, 250);
const EX500 = calcDebtPayoff(DEBTS, 500);
const order = (o: { name: string; month: number }[]) => o.map((p) => `${p.name} (month ${p.month})`).join(", ");
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

      <h2>The math in plain English</h2>
      <p>
        The calculator fixes your <strong>total monthly budget</strong> at the sum of all minimums plus your extra amount, and keeps
        it fixed until everything is paid. Each month it:
      </p>
      <ol>
        <li>Adds one month of interest to every balance (balance × APR ÷ 12).</li>
        <li>Pays the minimum on every debt that still has a balance.</li>
        <li>Sends whatever is left of the budget to the target debt — the highest rate (avalanche) or the smallest balance (snowball).</li>
        <li>When a debt hits zero, its minimum stays in the budget and flows to the next target.</li>
      </ol>
      <p>
        It also runs a third plan — minimums only, with no extra and no rollover — so you can see what doing nothing different
        would cost. If your budget can&apos;t keep up with the interest, the calculator says so instead of showing a date.
      </p>

      <h2>A worked example: four debts, $250 extra</h2>
      <p>
        Take a $6,500 credit card at 24% ($180 minimum), a $14,000 car loan at 7.5% ($320), a $2,500 personal loan at 11% ($90) and
        an $18,000 student loan at 5.5% ($210). The minimums add up to $800; with $250 extra the monthly budget is{" "}
        {usd0(EX.monthlyBudget)}.
      </p>
      <table>
        <thead>
          <tr>
            <th>Plan</th>
            <th>Debt-free in</th>
            <th>Total interest</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Avalanche</td>
            <td>{duration(EX.avalanche.months)}</td>
            <td>{usd0(EX.avalanche.totalInterest)}</td>
          </tr>
          <tr>
            <td>Snowball</td>
            <td>{duration(EX.snowball.months)}</td>
            <td>{usd0(EX.snowball.totalInterest)}</td>
          </tr>
          <tr>
            <td>Minimums only</td>
            <td>{duration(EX.minimumOnly.months)}</td>
            <td>{usd0(EX.minimumOnly.totalInterest)}</td>
          </tr>
        </tbody>
      </table>
      <p>
        Avalanche pays them off in this order: {order(EX.avalanche.payoffOrder)}. Snowball goes: {order(EX.snowball.payoffOrder)}.
        Snowball gives you a first win much sooner, avalanche costs about{" "}
        {usd0(EX.snowball.totalInterest - EX.avalanche.totalInterest)} less. Either one beats minimums only by years.
      </p>
      <p>
        The bigger lever is the extra amount. Raising it from $250 to $500 finishes avalanche in{" "}
        {duration(EX500.avalanche.months)} with {usd0(EX500.avalanche.totalInterest)} of interest — that matters far more than which
        method you pick.
      </p>

      <h2>Why motivation matters as much as math</h2>
      <p>
        On paper, avalanche always wins on cost. But paying off debt is a long journey. A 2012 study by Kellogg School of Management
        researchers, using records of thousands of people in a debt-settlement program, found that people who closed out small
        balances first were more likely to eliminate their debt entirely. It&apos;s one observational study, not a guarantee, but
        it matches common sense: a plan you finish beats a cheaper plan you abandon. Use the calculator to see the actual dollar
        difference for your situation — often it&apos;s small — then pick the plan you&apos;ll realistically follow.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Letting the budget shrink.</strong> When a debt is paid off, keep sending its old minimum to the next debt. Spending
          it instead is what turns a 4-year plan into a 9-year one.
        </li>
        <li>
          <strong>Using card minimums that fall over time.</strong> Card statements show a minimum that shrinks with the balance. For
          planning, enter the current minimum and keep paying at least that amount.
        </li>
        <li>
          <strong>Adding new debt during the plan.</strong> Every new charge pushes the debt-free date back.
        </li>
        <li>
          <strong>Skipping an emergency cushion.</strong> Without a small cash buffer, one surprise bill lands back on a credit card.
        </li>
      </ul>

      <h2>When this calculator doesn&apos;t fit</h2>
      <p>
        It assumes fixed rates, fixed minimums and no new borrowing. It doesn&apos;t model 0% promotional periods, income-driven
        student loan plans or forgiveness, variable-rate loans, or debts already in collections (where settlement or your legal
        rights may matter more than payoff order — see the CFPB&apos;s debt collection resources). For a single card, the{" "}
        <Link href="/credit-card-payoff-calculator/">credit card payoff calculator</Link> gives a more detailed view.
      </p>

      <h2>Tips to pay off debt faster</h2>
      <ul>
        <li>Find extra money by pausing non-essential spending and redirecting it to debt.</li>
        <li>Call lenders to ask for a lower interest rate — it often works.</li>
        <li>Consider a balance transfer or consolidation only if it genuinely lowers your rate.</li>
        <li>Avoid taking on new debt while you execute the plan.</li>
        <li>
          Working out your extra amount? Start from your real take-home with the{" "}
          <Link href="/paycheck-calculator/">paycheck calculator</Link>. Once you&apos;re debt-free, see what that same monthly
          budget could grow to with the <Link href="/compound-interest-calculator/">compound interest calculator</Link>.
        </li>
      </ul>
    </ToolLayout>
  );
}
