import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import AutoLoanCalculator from "./AutoLoanCalculator";
import { calcAutoLoan, usd0 } from "@/lib/calc";

const SLUG = "auto-loan-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Car Payment Calculator with Trade-In, Tax & Fees",
  description:
    "Estimate your monthly car payment including trade-in, sales tax, fees and down payment, then compare 36–84 month loan terms.",
  path: `/${SLUG}/`,
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

const SOURCES = [
  { label: "CFPB — Auto loans", url: "https://www.consumerfinance.gov/consumer-tools/auto-loans/" },
  { label: "CFPB — What is amortization?", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/" },
];

const EX = calcAutoLoan({ vehiclePrice: 35000, downPayment: 3000, tradeInValue: 8000, amountOwedOnTrade: 2000, salesTaxPercent: 6.5, fees: 600, annualRatePercent: 7.2, termMonths: 60, taxCreditOnTradeIn: true });
const ANSWER = `A $35,000 car with $3,000 down and an $8,000 trade-in (still owing $2,000) at 7.2% APR for 60 months costs about ${usd0(EX.monthlyPayment)} a month, including 6.5% sales tax and $600 in fees.`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Auto Loan Calculator with Trade-In"
      answer={ANSWER}
      intro="Your real monthly car payment with trade-in, sales tax and fees — and how the loan length changes what you pay in total."
      calculator={<AutoLoanCalculator />}
      faqs={faqs}
      sources={SOURCES}
    >
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
    </ToolLayout>
  );
}
