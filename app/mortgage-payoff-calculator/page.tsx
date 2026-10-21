import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/site";
import { ToolSchema, FaqSchema, BreadcrumbSchema, FaqItem } from "@/components/StructuredData";
import FaqSection from "@/components/FaqSection";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import MortgageCalculator from "./MortgageCalculator";

const SLUG = "mortgage-payoff-calculator";
const tool = getTool(SLUG)!;
const PATH = `/${SLUG}/`;

export const metadata: Metadata = buildMetadata({
  title: "Mortgage Payoff Calculator — Extra Payment Savings",
  description:
    "Free mortgage payoff calculator. See how much interest and time you save by making extra monthly payments on your home loan. Instant results, no sign-up.",
  path: PATH,
  keywords: [
    "mortgage payoff calculator",
    "extra payment calculator",
    "pay off mortgage early",
    "mortgage interest savings",
    "early mortgage payoff",
  ],
});

const faqs: FaqItem[] = [
  {
    question: "How do extra mortgage payments save money?",
    answer:
      "Every extra dollar you pay goes straight to your principal — the amount you still owe. Because interest is charged on the remaining principal, reducing it faster means less interest accrues in every future month. Over a 30-year loan, even a small consistent extra payment can cut years off the term and save tens of thousands of dollars in interest.",
  },
  {
    question: "Is it better to pay extra on my mortgage or invest the money?",
    answer:
      "It depends on your mortgage rate versus your expected investment return, and your comfort with risk. Paying down a mortgage is a guaranteed return equal to your interest rate, with no risk. Investing may earn more over time but isn't guaranteed. Many people do both, and paying extra also has the benefit of owning your home outright sooner.",
  },
  {
    question: "Should I tell my lender the extra payment is for principal?",
    answer:
      "Yes. Some lenders apply extra money to the next month's payment instead of the principal unless you specify otherwise. When you pay extra, mark it as 'apply to principal' so it actually reduces your balance and maximizes your interest savings.",
  },
  {
    question: "Does this calculator include taxes and insurance?",
    answer:
      "No. It focuses on principal and interest (P&I), which is the part of your payment that extra payments affect. Property taxes and homeowners insurance are usually collected in escrow and don't change based on extra principal payments, so they're left out to keep the savings figure clear and accurate.",
  },
  {
    question: "Are there downsides to paying off my mortgage early?",
    answer:
      "A few. You tie up cash that could be used for emergencies or higher-return investments, and a small number of loans charge prepayment penalties. Check your loan terms first, keep an emergency fund in place, and make sure higher-interest debt (like credit cards) is cleared before aggressively overpaying a low-rate mortgage.",
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
          Mortgage Payoff Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          See how much faster you could own your home — and how much interest you&apos;d save —
          by adding a little extra to your monthly mortgage payment.
        </p>

        <AdSlot />

        <div className="mt-6">
          <MortgageCalculator />
        </div>

        <AdSlot />

        <article className="prose-content mt-10 max-w-none">
          <h2>How paying off your mortgage early works</h2>
          <p>
            A mortgage is an amortized loan: each monthly payment is split between interest
            (the cost of borrowing) and principal (the balance you owe). In the early years,
            most of your payment goes to interest because the balance is large. Extra
            payments skip straight past the interest and knock down the principal directly.
          </p>
          <p>
            Because interest is always charged on the remaining balance, a lower balance today
            means less interest charged every single month for the rest of the loan. This is
            why a modest extra payment compounds into large savings over time — the effect
            snowballs across hundreds of remaining months.
          </p>

          <h2>An example</h2>
          <p>
            Imagine a $300,000 loan at 6.5% over 30 years. The base payment is around $1,896 a
            month, and you&apos;d pay roughly $382,000 in interest over the full term. Adding
            just $200 a month extra can pay the loan off several years early and save a large
            share of that interest. Enter your own numbers above to see your exact figures.
          </p>

          <h2>Smart ways to make extra payments</h2>
          <ul>
            <li>Add a fixed extra amount to every monthly payment, as shown in this tool.</li>
            <li>Make one extra full payment per year (for example, from a tax refund or bonus).</li>
            <li>Round your payment up to the nearest $100 for a painless, automatic overpayment.</li>
            <li>Switch to biweekly payments, which results in one extra monthly payment per year.</li>
          </ul>
          <p>
            Before overpaying, make sure you have an emergency fund and no higher-interest debt,
            and confirm your loan has no prepayment penalty.
          </p>
        </article>

        <FaqSection items={faqs} />

        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Estimates for informational purposes only, not financial
          advice. Your lender&apos;s figures may differ. See our{" "}
          <Link href="/disclaimer/" className="underline">full disclaimer</Link>.
        </div>

        <RelatedTools slug={SLUG} />
      </div>
    </>
  );
}
