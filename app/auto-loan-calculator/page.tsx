import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/site";
import { ToolSchema, FaqSchema, BreadcrumbSchema, FaqItem } from "@/components/StructuredData";
import FaqSection from "@/components/FaqSection";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import AutoLoanCalculator from "./AutoLoanCalculator";

const SLUG = "auto-loan-calculator";
const tool = getTool(SLUG)!;
const PATH = `/${SLUG}/`;

export const metadata: Metadata = buildMetadata({
  title: "Auto Loan Calculator with Trade-In — Monthly Car Payment",
  description:
    "Free auto loan calculator with trade-in. Estimate your monthly car payment including down payment, trade-in value, sales tax, and fees. Instant results, no sign-up.",
  path: PATH,
  keywords: [
    "auto loan calculator",
    "car loan calculator with trade in",
    "monthly car payment calculator",
    "car finance calculator",
    "trade in calculator",
  ],
});

const faqs: FaqItem[] = [
  {
    question: "How does a trade-in affect my car loan?",
    answer:
      "Your trade-in reduces the amount you need to finance. The dealer applies your car's value against the new vehicle's price. If you still owe money on the trade-in, that balance is subtracted from its value first — this is your net trade-in. If you owe more than the car is worth (negative equity), the difference is usually rolled into your new loan, increasing the amount you borrow.",
  },
  {
    question: "Does a trade-in reduce the sales tax I pay?",
    answer:
      "In most U.S. states, yes. Many states charge sales tax only on the price after your trade-in value is deducted, which can save you hundreds of dollars. A few states tax the full purchase price regardless. This calculator lets you toggle that setting so your estimate matches your state's rule.",
  },
  {
    question: "What loan term should I choose for a car?",
    answer:
      "Shorter terms (36–48 months) mean higher monthly payments but far less total interest and less risk of owing more than the car is worth. Longer terms (72–84 months) lower the monthly payment but cost much more in interest and keep you 'underwater' longer. A common guideline is to choose the shortest term whose payment comfortably fits your budget.",
  },
  {
    question: "What is negative equity and why does it matter?",
    answer:
      "Negative equity means you owe more on your current car than it's worth. When you trade it in, that shortfall gets added to your new loan, so you're financing part of your old car plus the new one. This raises your payment and total interest, and it's worth clearing before trading in if you can, to avoid stacking debt.",
  },
  {
    question: "Is APR the same as the interest rate?",
    answer:
      "Not exactly. The interest rate is the cost of borrowing the principal, while APR (annual percentage rate) also includes certain loan fees, giving a fuller picture of the loan's cost. When comparing offers, compare APRs. This calculator uses the rate you enter to estimate payments, so entering the APR gives a more complete cost estimate.",
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
          Auto Loan Calculator with Trade-In
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Estimate your real monthly car payment — including your trade-in, down payment,
          sales tax, and fees — before you set foot in the dealership.
        </p>

        <AdSlot />

        <div className="mt-6">
          <AutoLoanCalculator />
        </div>

        <AdSlot />

        <article className="prose-content mt-10 max-w-none">
          <h2>How your car payment is calculated</h2>
          <p>
            Your monthly payment depends on how much you finance, your interest rate, and how
            long the loan lasts. The amount you finance isn&apos;t just the sticker price — it&apos;s
            the price plus sales tax and fees, minus your down payment and net trade-in. This
            calculator walks through each of those pieces so you can see exactly where your
            payment comes from.
          </p>
          <p>Here is the full flow the tool uses:</p>
          <ul>
            <li><strong>Net trade-in</strong> = trade-in value − what you still owe on it.</li>
            <li><strong>Taxable amount</strong> = price, or price − trade-in if your state gives that credit.</li>
            <li><strong>Sales tax</strong> = taxable amount × your state tax rate.</li>
            <li><strong>Amount financed</strong> = price + tax + fees − down payment − net trade-in.</li>
            <li>That amount is then spread over your loan term at your interest rate to get the monthly payment.</li>
          </ul>

          <h2>Why the trade-in tax credit matters</h2>
          <p>
            In states that tax the price after trade-in, a valuable trade can cut your tax bill
            noticeably. For example, on a $35,000 car with an $8,000 trade-in and a 7% tax rate,
            the trade-in credit saves you $560 in sales tax alone. Toggle the setting in the
            calculator to see the difference for your own numbers.
          </p>

          <h2>Tips before you finance a car</h2>
          <ul>
            <li>Get pre-approved by your bank or credit union so you know your real rate.</li>
            <li>Negotiate the vehicle price separately from the monthly payment.</li>
            <li>Put down enough to avoid being underwater as the car depreciates.</li>
            <li>Compare the total interest, not just the monthly payment, across loan terms.</li>
          </ul>
        </article>

        <FaqSection items={faqs} />

        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Estimates for informational purposes only, not financial
          advice. Dealer and lender figures may differ. See our{" "}
          <Link href="/disclaimer/" className="underline">full disclaimer</Link>.
        </div>

        <RelatedTools slug={SLUG} />
      </div>
    </>
  );
}
