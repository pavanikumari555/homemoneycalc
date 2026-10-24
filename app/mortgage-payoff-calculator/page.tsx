import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import MortgageCalculator from "./MortgageCalculator";

const SLUG = "mortgage-payoff-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Mortgage Payoff Calculator: Extra Payments & Savings",
  description:
    "See how extra monthly, yearly or lump-sum payments cut years and interest off your mortgage, with your payoff date and full schedule.",
  path: `/${SLUG}/`,
  keywords: ["mortgage payoff calculator", "extra payment calculator", "pay off mortgage early", "mortgage payoff date", "lump sum mortgage payment"],
});

const faqs: FaqItem[] = [
  {
    question: "How do extra mortgage payments save money?",
    answer:
      "Every extra dollar goes straight to principal — the amount you still owe. Interest is charged on the remaining principal each month, so lowering it sooner means less interest in every month that follows. On a 30-year loan, even a small regular extra payment can cut years off the term.",
  },
  {
    question: "Is a monthly extra payment better than one lump sum a year?",
    answer:
      "For the same total dollars, paying earlier always saves a little more, because the balance drops sooner. In practice the difference is small — pick whichever you'll actually stick with. You can enter both in the calculator to compare.",
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

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Mortgage Payoff Calculator"
      intro="Find your mortgage-free date and see how much time and interest extra payments save."
      calculator={<MortgageCalculator />}
      faqs={faqs}
      sources={[
        { label: "CFPB — What is amortization?", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/" },
        { label: "CFPB — What is a prepayment penalty?", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/" },
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
        balance reaches zero.
      </p>

      <h2>A worked example</h2>
      <p>
        A $300,000 balance at 6.5% over 30 years has a payment of about <strong>$1,896</strong> and costs about{" "}
        <strong>$382,600</strong> in interest. Paying <strong>$200 extra</strong> each month pays it off in about 23 years
        instead of 30 — <strong>6 years and 11 months sooner</strong> — and saves roughly <strong>$103,400</strong> in interest.
      </p>

      <h2>Smart ways to pay extra</h2>
      <ul>
        <li>Add a fixed amount to every payment (the &ldquo;Extra every month&rdquo; field).</li>
        <li>Put part of a yearly bonus or tax refund toward principal (&ldquo;Extra once a year&rdquo;).</li>
        <li>Round your payment up to the next $100 so the extra happens automatically.</li>
        <li>Pay half the payment every two weeks: that adds up to one extra monthly payment a year.</li>
      </ul>
      <p>Before you overpay, keep an emergency fund, clear higher-interest debt, and check your loan has no prepayment penalty.</p>
    </ToolLayout>
  );
}
