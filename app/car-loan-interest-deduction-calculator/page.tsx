import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import CarLoanDeductionCalculator from "./CarLoanDeductionCalculator";
import { usd, usd0 } from "@/lib/calc";
import { calcCarLoanDeduction } from "@/lib/tools/car-loan-interest-deduction-calculator";

const SLUG = "car-loan-interest-deduction-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Car Loan Interest Deduction Calculator (2025–2028)",
  description:
    "Estimate your new car loan interest deduction: interest paid each year, the $10,000 cap, the $100,000/$200,000 MAGI phase-out and federal tax saved.",
  path: `/${SLUG}/`,
  keywords: [
    "car loan interest deduction calculator",
    "car loan interest deduction phase out",
    "schedule 1-a car loan",
    "no tax on car loan interest",
    "is car loan interest tax deductible",
  ],
});

const faqs: FaqItem[] = [
  {
    question: "Is car loan interest tax deductible now?",
    answer:
      "For tax years 2025 through 2028, yes — if the loan was taken out after December 31, 2024 to buy a new, personal-use car, SUV, van, pickup or motorcycle that had its final assembly in the United States, and the loan is secured by a first lien on that vehicle. You can deduct up to $10,000 of interest a year, whether you itemize or take the standard deduction.",
  },
  {
    question: "How does the car loan interest deduction phase out?",
    answer:
      "It starts shrinking when modified AGI is above $100,000 ($200,000 married filing jointly). Schedule 1-A takes the amount over the limit, divides it by $1,000, rounds up to a whole number and multiplies by $200. That amount comes off your deduction. So $5,500 over the limit counts as 6 steps, a $1,200 cut.",
  },
  {
    question: "Do used cars or leased cars qualify?",
    answer:
      "No. The vehicle's original use has to start with you, so a used car doesn't qualify, and lease payments don't qualify either. Business-use vehicles are also excluded — the deduction is for personal-use vehicles only.",
  },
  {
    question: "How do I know if my car was assembled in the US?",
    answer:
      "Check the window sticker (the label shows the final assembly point), ask the dealer, or enter your VIN in NHTSA's free VIN decoder. You must write the vehicle's VIN on Schedule 1-A for every year you claim the deduction.",
  },
  {
    question: "Does refinancing my car loan keep the deduction?",
    answer:
      "Generally yes, for interest on the refinanced amount, as long as the original loan qualified. If you take extra cash out when refinancing, that part wasn't used to buy the car, so check the IRS guidance before counting its interest.",
  },
  {
    question: "Is this a tax credit?",
    answer:
      "No, it's a deduction. It lowers your taxable income, so your saving is the deduction times your tax bracket. A $3,000 deduction saves about $360 at 12% and $660 at 22%. It does not reduce Social Security or Medicare tax.",
  },
];

const SOURCES = [
  { label: "IRS — Working Families Tax Cuts (One, Big, Beautiful Bill) provisions for individuals", url: "https://www.irs.gov/newsroom/working-families-tax-cuts-individuals-and-workers" },
  { label: "IRS — Schedule 1-A (Form 1040), Additional Deductions (Part IV)", url: "https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf" },
  { label: "IRS — Schedule 1-A: What to know about the new form", url: "https://www.irs.gov/newsroom/schedule-1-a-additional-deductions-what-to-know-about-the-new-form" },
  { label: "IRS — Notice 2025-57, qualified passenger vehicle loan interest", url: "https://www.irs.gov/pub/irs-drop/n-25-57.pdf" },
  { label: "IRS — Rev. Proc. 2025-32 (2026 tax brackets and standard deduction)", url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" },
  { label: "NHTSA — VIN decoder (check final assembly)", url: "https://vpic.nhtsa.dot.gov/decoder/" },
];

// Worked examples — page build time pe asli function se compute (andaaza nahi)
const BASE = { loanAmount: 40000, annualRatePercent: 7, termMonths: 60, purchaseMonth: 1, purchaseYear: 2026, taxYear: 2026 } as const;
const EX = calcCarLoanDeduction({ ...BASE, magi: 85000, status: "single" });
const EX_PHASE = calcCarLoanDeduction({ ...BASE, magi: 105000, status: "single" });
const ANSWER = `A $40,000 new-car loan at 7% for 60 months, taken out in January 2026, charges about ${usd0(EX.interestInYear)} of interest in 2026. A single filer with $85,000 of MAGI can deduct all of it, saving roughly ${usd0(EX.taxSaved)} in federal income tax.`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Car Loan Interest Deduction Calculator"
      answer={ANSWER}
      intro="See how much new-car loan interest you can deduct for tax years 2025–2028, how the income phase-out cuts it, and roughly what it saves you in federal tax."
      calculator={<CarLoanDeductionCalculator />}
      faqs={faqs}
      sources={SOURCES}
    >
      <h2>What the car loan interest deduction is</h2>
      <p>
        The 2025 tax law (Public Law 119-21, often called the One Big Beautiful Bill Act) created a temporary deduction for
        interest on loans used to buy a new personal-use vehicle. It applies to tax years 2025, 2026, 2027 and 2028. You claim it
        on the new Schedule 1-A, and you get it whether you take the standard deduction or itemize. Before this law, interest on
        a personal car loan was not deductible at all.
      </p>
      <p>
        It is a deduction, not a credit. It lowers your taxable income, so the money you actually keep depends on your tax
        bracket. That&apos;s why this calculator shows two numbers: the deduction itself, and an estimate of the federal income tax
        it saves.
      </p>

      <h2>Who qualifies — and who doesn&apos;t</h2>
      <p>According to the IRS, the interest counts only if all of these are true:</p>
      <ul>
        <li>The loan was <strong>originated after December 31, 2024</strong>.</li>
        <li>The money was used to <strong>buy</strong> the vehicle — lease payments don&apos;t qualify.</li>
        <li>The vehicle is <strong>new</strong>: its original use starts with you. Used cars don&apos;t qualify.</li>
        <li>It&apos;s for <strong>personal use</strong>, not business.</li>
        <li>
          It&apos;s a car, minivan, van, SUV, pickup truck or motorcycle with a gross vehicle weight rating under 14,000 pounds.
        </li>
        <li>Its <strong>final assembly happened in the United States</strong>.</li>
        <li>The loan is <strong>secured by a first lien</strong> on the vehicle.</li>
        <li>You report the vehicle&apos;s <strong>VIN</strong> on your return each year you claim it.</li>
      </ul>
      <p>
        Interest you already deduct as a business expense (on Schedule C, E or F) can&apos;t be counted again here.
      </p>

      <h2>How the deduction is calculated</h2>
      <p>The math follows Part IV of Schedule 1-A, line by line:</p>
      <ol>
        <li>
          <strong>Interest for the year.</strong> Add up the interest you paid during the tax year. Your lender should send a
          statement with this figure.
        </li>
        <li>
          <strong>Apply the cap.</strong> Take the smaller of that interest or $10,000. The cap is per return, not per car.
        </li>
        <li>
          <strong>Measure the excess income.</strong> Subtract $100,000 ($200,000 if married filing jointly) from your modified
          AGI. If the result is zero or less, there&apos;s no phase-out.
        </li>
        <li>
          <strong>Count the steps.</strong> Divide the excess by $1,000 and round <em>up</em> to a whole number. Even $1 over the
          line counts as one full step.
        </li>
        <li>
          <strong>Cut $200 per step</strong>, and subtract that from the capped interest. If the result is negative, the
          deduction is $0.
        </li>
      </ol>
      <p>
        Because the cut is $200 for every $1,000, the deduction falls quickly. A full $10,000 deduction disappears once MAGI is
        more than $49,000 over the limit — above $149,000 for single filers and above $249,000 for joint filers. Smaller amounts of
        interest vanish sooner.
      </p>
      <p>
        To estimate the year&apos;s interest, the calculator builds a normal amortization schedule from your loan amount, rate and
        term, assumes the first payment is due the month after you buy, and adds up the interest portion of every payment
        that falls in the tax year. Interest is highest in the first full year and drops as the balance shrinks.
      </p>

      <h2>Worked example</h2>
      <p>
        Say you finance <strong>$40,000 at 7% for 60 months</strong> and buy the car in January 2026. The monthly payment is{" "}
        {usd(EX.monthlyPayment)}. With the first payment in February, you make {EX.paymentsInYear} payments in 2026, and
        about <strong>{usd0(EX.interestInYear)}</strong> of them is interest.
      </p>
      <ul>
        <li>
          <strong>Single, MAGI $85,000:</strong> under the $100,000 limit, so the whole {usd0(EX.deduction)} is deductible.
          After the 2026 standard deduction, taxable income is about {usd0(EX.taxableBefore)}, which sits in the 22% bracket, so
          the deduction saves roughly <strong>{usd0(EX.taxSaved)}</strong>.
        </li>
        <li>
          <strong>Single, MAGI $105,000:</strong> $5,000 over the limit is 5 steps, a {usd0(EX_PHASE.reduction)} cut. The
          deduction falls to <strong>{usd0(EX_PHASE.deduction)}</strong>, saving about {usd0(EX_PHASE.taxSaved)}.
        </li>
      </ul>
      <p>
        Over 2026–2028, the same loan generates about {usd0(EX.totalDeduction)} of deductible interest for the $85,000 filer.
        The deduction then ends, even though the loan runs into 2030.
      </p>

      <h2>Tips before you count on it</h2>
      <ul>
        <li>
          <strong>Don&apos;t buy a pricier car for the deduction.</strong> At a 22% bracket, $1 of interest costs you about 78
          cents after tax. Paying less interest still beats deducting it.
        </li>
        <li>
          <strong>Check final assembly before you sign.</strong> Many models from US brands are built abroad, and some foreign
          brands build in the US. The window sticker or NHTSA&apos;s VIN decoder settles it.
        </li>
        <li>
          <strong>Keep the lender&apos;s interest statement</strong> and your purchase contract with your tax records.
        </li>
        <li>
          <strong>Watch your MAGI.</strong> If you&apos;re near the phase-out, pre-tax 401(k) or HSA contributions lower your AGI
          and can protect part of the deduction.
        </li>
        <li>
          <strong>Compare the loan itself first.</strong> Use our <Link href="/auto-loan-calculator/">auto loan calculator</Link>{" "}
          to see the payment and total interest across 36 to 84 months.
        </li>
      </ul>

      <h2>What this estimate leaves out</h2>
      <p>
        The tax saving uses 2026 federal brackets and the 2026 standard deduction ($16,100 single, $32,200 married filing
        jointly) for every year, and treats MAGI minus the standard deduction as your taxable income. Itemized deductions,
        credits, other Schedule 1-A deductions and state income tax are not included. Head-of-household and married
        filing separately filers use the $100,000 limit; their tax saving here is estimated with single brackets, so it may be
        a little off. Your lender&apos;s year-end statement is the number to use on your return.
      </p>
    </ToolLayout>
  );
}
