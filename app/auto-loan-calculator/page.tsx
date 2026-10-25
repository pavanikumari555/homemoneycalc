import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import AutoLoanCalculator from "./AutoLoanCalculator";
import { calcAutoLoan, usd, usd0 } from "@/lib/calc";

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
  { label: "CFPB — Data spotlight: negative equity findings from the Auto Finance Data Pilot (2024)", url: "https://www.consumerfinance.gov/data-research/research-reports/data-spotlight-negative-equity-findings-from-the-auto-finance-data-pilot/" },
];

// Worked example — calcAutoLoan se compute (same inputs as the answer box)
const BASE = { vehiclePrice: 35000, downPayment: 3000, tradeInValue: 8000, amountOwedOnTrade: 2000, salesTaxPercent: 6.5, fees: 600, annualRatePercent: 7.2, termMonths: 60, taxCreditOnTradeIn: true };
const EX = calcAutoLoan(BASE);
const NO_CREDIT = calcAutoLoan({ ...BASE, taxCreditOnTradeIn: false });
const UNDERWATER = calcAutoLoan({ ...BASE, amountOwedOnTrade: 11000 });
const T36 = EX.byTerm.find((t) => t.term === 36)!;
const T84 = EX.byTerm.find((t) => t.term === 84)!;
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
        <li>
          <strong>Monthly payment</strong> = <code>L × r / (1 − (1 + r)^−n)</code>, where <strong>L</strong> is the amount
          financed, <strong>r</strong> is the APR ÷ 12 and <strong>n</strong> is the number of months.
        </li>
      </ul>
      <p>
        The payment formula spreads the loan into equal monthly payments. Early payments are mostly interest because the balance is
        highest; later payments are mostly principal. Total interest is simply all your payments added up, minus the amount you
        borrowed.
      </p>

      <h2>A worked example, step by step</h2>
      <p>
        Say you&apos;re buying a $35,000 car with $3,000 down. The dealer offers $8,000 for your current car, which still has
        $2,000 left on its loan. Your state charges 6.5% sales tax and gives a trade-in tax credit, fees are $600, and your rate is
        7.2% APR for 60 months.
      </p>
      <ol>
        <li>Net trade-in: $8,000 − $2,000 = <strong>{usd0(EX.netTradeIn)}</strong>.</li>
        <li>Taxable amount: $35,000 − $8,000 = {usd0(EX.taxableAmount)}, so sales tax is <strong>{usd0(EX.salesTax)}</strong>.</li>
        <li>
          Amount financed: $35,000 + {usd0(EX.salesTax)} + $600 − $3,000 − {usd0(EX.netTradeIn)} ={" "}
          <strong>{usd0(EX.loanAmount)}</strong>.
        </li>
        <li>
          Monthly payment at 7.2% for 60 months: <strong>{usd(EX.monthlyPayment)}</strong>, with{" "}
          <strong>{usd0(EX.totalInterest)}</strong> of total interest.
        </li>
      </ol>
      <p>
        Counting your down payment, your trade-in equity and all 60 payments, the car costs you about{" "}
        {usd0(EX.totalCostOfVehicle)} in total.
      </p>

      <h2>How the loan term changes the cost</h2>
      <p>
        Same car, same {usd0(EX.loanAmount)} financed, same 7.2% rate — only the length changes:
      </p>
      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Monthly payment</th>
            <th>Total interest</th>
          </tr>
        </thead>
        <tbody>
          {EX.byTerm.map((t) => (
            <tr key={t.term}>
              <td>{t.term} months</td>
              <td>{usd0(t.payment)}</td>
              <td>{usd0(t.interest)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Stretching from 36 to 84 months drops the payment by about {usd0(T36.payment - T84.payment)} a month but adds about{" "}
        {usd0(T84.interest - T36.interest)} in interest. In real life, lenders often charge a higher rate on longer terms, so the gap
        is usually bigger than this table shows.
      </p>

      <h2>Why the trade-in tax credit matters</h2>
      <p>
        In states that tax the price after trade-in, a valuable trade can cut your tax bill noticeably. In the example above, sales
        tax is {usd0(EX.salesTax)} with the credit. Without it, tax is charged on the full $35,000 — {usd0(NO_CREDIT.salesTax)} — which
        raises the amount financed to {usd0(NO_CREDIT.loanAmount)} and the payment to {usd(NO_CREDIT.monthlyPayment)}. Check your
        state&apos;s rule and set the toggle in the calculator to match.
      </p>

      <h2>Negative equity: the expensive mistake</h2>
      <p>
        If you owe more on your trade-in than it&apos;s worth, the shortfall is added to the new loan. Change the example so you
        still owe $11,000 on the $8,000 trade-in: the net trade-in becomes {usd0(UNDERWATER.netTradeIn)}, the amount financed jumps to{" "}
        {usd0(UNDERWATER.loanAmount)}, and the payment rises to about {usd0(UNDERWATER.monthlyPayment)} a month with{" "}
        {usd0(UNDERWATER.totalInterest)} of interest. A 2024 CFPB study of auto lending data found that loans with rolled-in negative
        equity had larger amounts, higher payments and higher interest rates, and these borrowers were more likely to have their account sent to repossession
        within two years.
        If you can, keep driving the old car a little longer or pay the gap down before you trade.
      </p>

      <h2>Paying a car loan off early</h2>
      <p>
        Most auto loans charge interest on the balance you still owe, so any extra you send to principal cuts future interest the
        same way it does on a mortgage. Before you prepay, read the contract for a prepayment penalty and ask the lender to apply
        the extra to principal rather than to your next payment. Because interest is front-loaded, extra payments in the first
        year or two save the most; near the end of the loan, most of each payment is already principal.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>Shopping by monthly payment alone — a longer term can hide a higher price or rate.</li>
        <li>Forgetting tax and fees, which can add a few thousand dollars to the amount financed.</li>
        <li>Rolling add-ons (extended warranties, service plans) into the loan without pricing them separately.</li>
        <li>Entering the trade-in&apos;s retail value instead of the dealer&apos;s actual offer.</li>
      </ul>

      <h2>When this calculator doesn&apos;t fit</h2>
      <p>
        It assumes a simple-interest loan with equal monthly payments and a fixed rate. It doesn&apos;t model leases, balloon loans,
        manufacturer rebates applied before or after tax (rules vary by state), or local taxes added on top of the state rate. For
        those, use the dealer&apos;s itemized buyer&apos;s order and enter the final numbers here as a check.
      </p>

      <h2>Tips before you finance a car</h2>
      <ul>
        <li>Get pre-approved by your bank or credit union so you know your real rate.</li>
        <li>Negotiate the vehicle price separately from the monthly payment.</li>
        <li>Put down enough to avoid being underwater as the car depreciates.</li>
        <li>Compare the total interest, not just the monthly payment, across loan terms.</li>
        <li>
          Check what the payment does to your budget with the <Link href="/paycheck-calculator/">paycheck calculator</Link>, and if
          you&apos;re carrying other debts, see how the new loan fits with the{" "}
          <Link href="/debt-payoff-calculator/">debt payoff calculator</Link>.
        </li>
      </ul>
    </ToolLayout>
  );
}
