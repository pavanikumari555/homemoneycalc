import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import MortgageCalculator from "./MortgageCalculator";
import { calcMortgage, duration, usd, usd0 } from "@/lib/calc";

const SLUG = "mortgage-payoff-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Mortgage Payoff Calculator: Extra Payments & Savings",
  description:
    "See how extra monthly, yearly or lump-sum payments cut years and interest off your mortgage, with your payoff date and full schedule.",
  path: `/${SLUG}/`,
  keywords: ["mortgage payoff calculator", "extra payment calculator", "pay off mortgage early", "mortgage payoff date", "lump sum mortgage payment"],
});

// Worked examples — calcMortgage se compute ($300k, 6.5%, 30 yr)
const LOAN = { principal: 300_000, annualRatePercent: 6.5, yearsLeft: 30, extraMonthly: 0, extraYearly: 0, oneTime: 0 };
const EX = calcMortgage({ ...LOAN, extraMonthly: 200 });
const YEARLY = calcMortgage({ ...LOAN, extraYearly: 2400 });
const LUMP = calcMortgage({ ...LOAN, oneTime: 10_000 });
const THIRTEENTH = calcMortgage({ ...LOAN, extraYearly: EX.monthlyPayment });
const FIRST_INTEREST = (300_000 * 0.065) / 12; // $1,625

const faqs: FaqItem[] = [
  {
    question: "How do extra mortgage payments save money?",
    answer:
      "Every extra dollar goes straight to principal — the amount you still owe. Interest is charged on the remaining principal each month, so lowering it sooner means less interest in every month that follows. On a 30-year loan, even a small regular extra payment can cut years off the term.",
  },
  {
    question: "Is a monthly extra payment better than one lump sum a year?",
    answer: `For the same total dollars, paying earlier always saves a little more, because the balance drops sooner. In practice the difference is small: on a $300,000, 6.5% loan, $200 a month saves about ${usd0(EX.interestSaved)} while $2,400 once a year saves about ${usd0(YEARLY.interestSaved)}. Pick whichever you'll actually stick with.`,
  },
  {
    question: "Should I tell my lender the extra payment is for principal?",
    answer:
      "Yes. Some servicers apply extra money to next month's payment instead of principal unless you tell them otherwise. Mark extra payments as 'apply to principal' so they reduce your balance.",
  },
  {
    question: "Does this calculator include property taxes and insurance?",
    answer:
      "No. It models principal and interest (P&I), the part of the payment that extra payments change. Taxes and insurance are usually paid through escrow and don't shrink when you pay down the loan faster.",
  },
  {
    question: "Are there downsides to paying off a mortgage early?",
    answer:
      "Money sent to the mortgage is hard to get back in an emergency, and it could earn more elsewhere if your rate is low. A few loans also have prepayment penalties. Most people build an emergency fund and clear high-interest debt first.",
  },
];

const ANSWER = `Paying $200 extra a month on a $300,000, 6.5%, 30-year mortgage pays it off ${duration(EX.monthsSaved)} early and saves about ${usd0(EX.interestSaved)} in interest.`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Mortgage Payoff Calculator"
      answer={ANSWER}
      intro="Find your mortgage-free date and see how much time and interest extra payments save."
      calculator={<MortgageCalculator />}
      faqs={faqs}
      sources={[
        { label: "CFPB — What is amortization?", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/" },
        { label: "CFPB — What is a prepayment penalty?", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/" },
        { label: "CFPB — Regulation Z §1026.43(g), limits on prepayment penalties", url: "https://www.consumerfinance.gov/rules-policy/regulations/1026/43/" },
        { label: "CFPB — When can I remove private mortgage insurance (PMI)?", url: "https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/" },
      ]}
    >
      <h2>How paying off your mortgage early works</h2>
      <p>
        A mortgage is an amortized loan: each payment is split between interest (the cost of borrowing) and principal (what you
        owe). Early on, most of each payment is interest because the balance is large. An extra payment skips the interest and
        goes straight to principal.
      </p>
      <p>
        Interest is charged on whatever balance is left, so a lower balance today means less interest every month after. That is
        why a modest extra payment adds up to large savings over hundreds of remaining months.
      </p>

      <h2>The formula</h2>
      <p>
        The regular monthly payment is <code>M = P × r / (1 − (1 + r)^−n)</code>, where <strong>P</strong> is the balance,{" "}
        <strong>r</strong> is the annual rate ÷ 12, and <strong>n</strong> is the number of months left. The calculator then runs
        the loan month by month: it adds that month&apos;s interest, subtracts your payment plus any extras, and repeats until the
        balance reaches zero. Your required payment never changes — extra payments simply make the last payment arrive sooner.
      </p>

      <h2>A worked example</h2>
      <p>
        A $300,000 balance at 6.5% over 30 years has a payment of about <strong>{usd0(EX.monthlyPayment)}</strong> and costs about{" "}
        <strong>{usd0(EX.base.totalInterest)}</strong> in interest. In the very first month, interest is 300,000 × 0.065 ÷ 12 ={" "}
        {usd0(FIRST_INTEREST)}, so only about {usd0(EX.monthlyPayment - FIRST_INTEREST)} of the payment reduces the balance. Adding
        $200 lifts that first month&apos;s principal paydown to about {usd0(EX.monthlyPayment - FIRST_INTEREST + 200)}.
      </p>
      <p>
        Keep paying <strong>$200 extra</strong> every month and the loan is gone in {duration(EX.withExtra.months)} instead of 30
        years — <strong>{duration(EX.monthsSaved)} sooner</strong> — saving roughly <strong>{usd0(EX.interestSaved)}</strong> in
        interest.
      </p>

      <h2>Comparing ways to pay extra</h2>
      <p>Same $300,000 loan at 6.5% with 30 years left, computed with this calculator:</p>
      <table>
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Paid off sooner by</th>
            <th>Interest saved</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>$200 extra every month</td>
            <td>{duration(EX.monthsSaved)}</td>
            <td>{usd0(EX.interestSaved)}</td>
          </tr>
          <tr>
            <td>$2,400 once a year</td>
            <td>{duration(YEARLY.monthsSaved)}</td>
            <td>{usd0(YEARLY.interestSaved)}</td>
          </tr>
          <tr>
            <td>One extra payment ({usd(EX.monthlyPayment)}) a year</td>
            <td>{duration(THIRTEENTH.monthsSaved)}</td>
            <td>{usd0(THIRTEENTH.interestSaved)}</td>
          </tr>
          <tr>
            <td>$10,000 lump sum today, nothing after</td>
            <td>{duration(LUMP.monthsSaved)}</td>
            <td>{usd0(LUMP.interestSaved)}</td>
          </tr>
        </tbody>
      </table>
      <p>
        Two lessons: the same yearly dollars save slightly more when paid monthly (the balance falls sooner), and money paid early
        in the loan is worth the most. The &ldquo;one extra payment a year&rdquo; row is roughly what a biweekly plan does — 26
        half-payments add up to 13 full payments a year.
      </p>

      <h2>Pay extra or invest the difference?</h2>
      <p>
        Every extra dollar on the mortgage earns a guaranteed return equal to your interest rate — 6.5% in the example — with no
        market risk. Investing the same money might earn more or less over time, and it stays easier to reach in an emergency.
        A simple way to decide: grab any employer 401(k) match first, pay off debts with higher rates than your mortgage, keep an
        emergency fund, and then split the rest based on how much you value being mortgage-free versus keeping money flexible.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Not marking the extra as principal.</strong> Some servicers hold extra money or apply it to next month&apos;s
          payment. Choose &ldquo;apply to principal&rdquo; and check your next statement.
        </li>
        <li>
          <strong>Paying a fee for a biweekly program.</strong> You can get the same effect free by adding one-twelfth of a payment
          each month.
        </li>
        <li>
          <strong>Expecting the monthly bill to drop.</strong> Extra payments shorten the loan; they don&apos;t lower the required
          payment unless the lender agrees to re-amortize (sometimes called a recast).
        </li>
        <li>
          <strong>Draining your emergency fund.</strong> Home equity is hard to tap quickly; keep cash for surprises first.
        </li>
      </ul>

      <h2>Prepayment penalties and PMI</h2>
      <p>
        Most mortgages made today have no prepayment penalty. Under the CFPB&apos;s Regulation Z, a penalty is only allowed on
        certain fixed-rate qualified mortgages that aren&apos;t higher-priced loans, it is capped at 2% of the amount prepaid in
        the first two years and 1% in the third, and it can&apos;t apply after three years. Your closing disclosure says whether
        your loan has one.
      </p>
      <p>
        Extra payments can also end private mortgage insurance sooner on a conventional loan. You can ask to cancel PMI once the
        balance reaches 80% of the home&apos;s original value, and it must end automatically when the balance is scheduled to
        reach 78%, as long as you&apos;re current.
      </p>

      <h2>When this calculator doesn&apos;t fit</h2>
      <p>
        It assumes a fixed rate. For an adjustable-rate mortgage, results are only accurate until the rate resets. It also leaves
        out escrow (taxes and insurance), and it doesn&apos;t weigh the trade-off of investing instead — if your mortgage rate is
        low, compare with the <Link href="/compound-interest-calculator/">compound interest calculator</Link>. Carrying credit
        card or car debt? That usually costs more than your mortgage, so check the{" "}
        <Link href="/debt-payoff-calculator/">debt payoff calculator</Link> first.
      </p>

      <h2>Smart ways to pay extra</h2>
      <ul>
        <li>Add a fixed amount to every payment (the &ldquo;Extra every month&rdquo; field).</li>
        <li>Put part of a yearly bonus or tax refund toward principal (&ldquo;Extra once a year&rdquo;).</li>
        <li>Round your payment up to the next $100 so the extra happens automatically.</li>
        <li>Pay half the payment every two weeks: that adds up to one extra monthly payment a year.</li>
        <li>
          Got a raise? See what it adds to each check with the <Link href="/paycheck-calculator/">paycheck calculator</Link> and
          send part of it to principal.
        </li>
      </ul>
      <p>Before you overpay, keep an emergency fund, clear higher-interest debt, and check your loan has no prepayment penalty.</p>
    </ToolLayout>
  );
}
