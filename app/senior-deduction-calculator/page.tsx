import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import SeniorDeductionCalculator from "./SeniorDeductionCalculator";
import { usd0 } from "@/lib/calc";
import { calcSeniorDeduction } from "@/lib/tools/senior-deduction-calculator";

const SLUG = "senior-deduction-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Senior Deduction Calculator: $6,000 Over-65 Deduction",
  description:
    "Estimate the new $6,000 senior deduction for 2025–2028: the 6% phase-out over $75,000 MAGI ($150,000 joint), both spouses, and federal tax saved.",
  path: `/${SLUG}/`,
  keywords: [
    "senior deduction calculator",
    "$6000 senior deduction",
    "enhanced deduction for seniors",
    "senior deduction phase out",
    "over 65 tax deduction 2026",
  ],
});

const faqs: FaqItem[] = [
  {
    question: "Who qualifies for the $6,000 senior deduction?",
    answer:
      "Anyone who is 65 or older by the last day of the tax year and has a valid Social Security number, for tax years 2025 through 2028. If you're married, you must file a joint return. You don't need to be retired or collecting Social Security, and you get it whether you itemize or take the standard deduction.",
  },
  {
    question: "Can both spouses claim the $6,000 senior deduction?",
    answer:
      "Yes. On a joint return each spouse who is 65 or older gets their own $6,000, for up to $12,000. The 6% phase-out applies to each spouse's amount, so above $150,000 of MAGI a couple loses 12 cents of deduction per extra dollar of income, and both amounts reach $0 at $250,000.",
  },
  {
    question: "How does the senior deduction phase out?",
    answer:
      "The deduction drops by 6% of modified AGI above $75,000 (single or head of household) or $150,000 (married filing jointly). Single filers lose it completely at $175,000. For example, $95,000 of MAGI is $20,000 over, so the cut is $1,200 and the deduction is $4,800.",
  },
  {
    question: "Is this the same as the extra standard deduction for being over 65?",
    answer:
      "No. The older additional standard deduction still exists — for 2026 it's $2,050 if you're unmarried and $1,650 per qualifying spouse if married. The $6,000 senior deduction is on top of that, and it's claimed on Schedule 1-A rather than built into the standard deduction.",
  },
  {
    question: "Does the senior deduction mean no tax on Social Security?",
    answer:
      "Not exactly. The law didn't change how Social Security benefits are taxed. The deduction lowers taxable income, which can offset the tax on benefits for many retirees, but higher-income seniors can still owe tax on their benefits.",
  },
];

const SOURCES = [
  { label: "IRS — Check your eligibility for the new enhanced deduction for seniors", url: "https://www.irs.gov/newsroom/check-your-eligibility-for-the-new-enhanced-deduction-for-seniors" },
  { label: "IRS — Working Families Tax Cuts (One, Big, Beautiful Bill) provisions for individuals", url: "https://www.irs.gov/newsroom/working-families-tax-cuts-individuals-and-workers" },
  { label: "IRS — Schedule 1-A (Form 1040), Additional Deductions (Part V)", url: "https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf" },
  { label: "IRS — Schedule 1-A: What to know about the new form", url: "https://www.irs.gov/newsroom/schedule-1-a-additional-deductions-what-to-know-about-the-new-form" },
  { label: "IRS — Rev. Proc. 2025-32 (2026 standard deduction and 65+ add-on)", url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" },
];

// Worked examples — build time pe asli function se
const EX_SINGLE = calcSeniorDeduction({ status: "single", magi: 60000, you65: true, spouse65: false });
const EX_SINGLE_PO = calcSeniorDeduction({ status: "single", magi: 95000, you65: true, spouse65: false });
const EX_COUPLE = calcSeniorDeduction({ status: "mfj", magi: 170000, you65: true, spouse65: true });
const ANSWER = `A married couple, both 65 or older, with $170,000 of MAGI gets ${usd0(EX_COUPLE.total)} of senior deduction (${usd0(EX_COUPLE.perPerson)} each after the 6% phase-out), saving about ${usd0(EX_COUPLE.taxSaved)} in 2026 federal income tax.`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Senior Deduction Calculator ($6,000 Over-65)"
      answer={ANSWER}
      intro="Work out the new $6,000 deduction for people 65 and older for tax years 2025–2028 — including the income phase-out and what it saves you in federal tax."
      calculator={<SeniorDeductionCalculator />}
      faqs={faqs}
      sources={SOURCES}
    >
      <h2>What the $6,000 senior deduction is</h2>
      <p>
        The 2025 tax law (Public Law 119-21) added a temporary &quot;enhanced deduction for seniors&quot; of up to $6,000 per
        person aged 65 or older. It covers tax years 2025, 2026, 2027 and 2028, then expires unless Congress extends it. It is
        claimed on the new Schedule 1-A and works whether you take the standard deduction or itemize.
      </p>
      <p>
        It sits <strong>on top of</strong> the additional standard deduction that people 65 and older already got before the new
        law. For 2026 that older add-on is $2,050 for a single or head-of-household filer and $1,650 for each spouse 65 or older
        on a married return. So a single 70-year-old in 2026 can subtract the $16,100 standard deduction, the $2,050 add-on,
        and up to $6,000 more.
      </p>

      <h2>Who qualifies — and who doesn&apos;t</h2>
      <ul>
        <li>
          <strong>Age:</strong> you must be 65 or older by December 31 of the tax year. For 2025 that means born before January
          2, 1961; each later year moves the date forward by one year.
        </li>
        <li>
          <strong>Social Security number:</strong> each person claiming it needs a valid SSN on the return.
        </li>
        <li>
          <strong>Married couples must file jointly.</strong> Married filing separately gets nothing, even if both spouses are
          over 65.
        </li>
        <li>
          <strong>Income:</strong> it phases out above $75,000 of modified AGI ($150,000 joint) and is gone at $175,000
          ($250,000 joint).
        </li>
        <li>
          <strong>No work or benefit test.</strong> You don&apos;t need to be retired, working, or receiving Social Security.
        </li>
      </ul>

      <h2>How the deduction is calculated</h2>
      <p>Part V of Schedule 1-A does it in a few lines:</p>
      <ol>
        <li>Start with your modified AGI. For most people this is simply AGI from Form 1040, line 11.</li>
        <li>Subtract $75,000 ($150,000 if married filing jointly). If the result is zero or less, nothing is cut.</li>
        <li>Multiply the excess by 6%.</li>
        <li>Subtract that from $6,000. If the result is negative, use $0. This is the per-person amount.</li>
        <li>Count it once for you, and once more for your spouse if you file jointly and they also qualify.</li>
      </ol>
      <p>
        The key detail for couples: the 6% cut is applied to <em>each</em> spouse&apos;s $6,000. Both amounts shrink at the same
        time, which is why a two-senior couple loses it all at $250,000 rather than at $350,000.
      </p>
      <p>
        To estimate tax saved, the calculator subtracts the 2026 standard deduction and the regular 65+ add-on from your MAGI
        to approximate taxable income, then compares the 2026 federal tax with and without the senior deduction.
      </p>

      <h2>Worked examples (2026)</h2>
      <ul>
        <li>
          <strong>Single, age 68, MAGI $60,000.</strong> Under $75,000, so the full {usd0(EX_SINGLE.total)} applies. Estimated
          taxable income is about {usd0(EX_SINGLE.taxableBefore)}, in the 12% bracket, so the deduction saves about{" "}
          <strong>{usd0(EX_SINGLE.taxSaved)}</strong>.
        </li>
        <li>
          <strong>Single, age 72, MAGI $95,000.</strong> $20,000 over the line × 6% = {usd0(EX_SINGLE_PO.cutPerPerson)} cut,
          leaving <strong>{usd0(EX_SINGLE_PO.total)}</strong>. At 22% that&apos;s worth about {usd0(EX_SINGLE_PO.taxSaved)}.
        </li>
        <li>
          <strong>Married jointly, both over 65, MAGI $170,000.</strong> $20,000 over $150,000 × 6% ={" "}
          {usd0(EX_COUPLE.cutPerPerson)} off each spouse, so {usd0(EX_COUPLE.perPerson)} × 2 ={" "}
          <strong>{usd0(EX_COUPLE.total)}</strong>, saving about {usd0(EX_COUPLE.taxSaved)}.
        </li>
      </ul>

      <h2>Practical tips</h2>
      <ul>
        <li>
          <strong>Watch MAGI in the phase-out zone.</strong> Between $75,000 and $175,000 (single), each extra $1,000 of income
          costs $60 of deduction. Taking a large IRA withdrawal or realizing capital gains in one year can shrink it; spreading
          them out may help.
        </li>
        <li>
          <strong>Qualified charitable distributions</strong> from an IRA (age 70½ and older) are left out of AGI, so they can
          keep you under the threshold while meeting a required minimum distribution.
        </li>
        <li>
          <strong>Roth withdrawals</strong> that are qualified aren&apos;t in AGI, so they don&apos;t eat into the deduction.
        </li>
        <li>
          <strong>Check your withholding.</strong> If the deduction lowers your tax, you may be over-withholding from a pension
          or Social Security. Our <Link href="/paycheck-calculator/">paycheck calculator</Link> helps if you&apos;re still
          working.
        </li>
        <li>
          <strong>Plan for 2029.</strong> The deduction ends after 2028 unless extended, so don&apos;t build a long-term budget on
          it.
        </li>
      </ul>

      <h2>What this estimate leaves out</h2>
      <p>
        The tax-saved figure uses 2026 brackets for every year, treats MAGI minus the standard deduction as taxable income, and
        ignores itemized deductions, credits, the other Schedule 1-A deductions, and state tax. Head-of-household filers use
        the same $75,000 phase-out as single filers; their tax saving is estimated with single brackets. The extra add-on for
        being blind is not included. The deduction itself follows Schedule 1-A exactly.
      </p>
    </ToolLayout>
  );
}
