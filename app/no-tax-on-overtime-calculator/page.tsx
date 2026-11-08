import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import { usd, usd0 } from "@/lib/calc";
import { calcOvertimeDeduction } from "@/lib/tools/no-tax-on-overtime-calculator";
import OvertimeDeductionCalculator from "./OvertimeDeductionCalculator";

const SLUG = "no-tax-on-overtime-calculator";

export const metadata: Metadata = buildMetadata({
  title: "No Tax on Overtime Calculator (2025 & 2026)",
  description:
    "Calculate your 2025 or 2026 overtime deduction and federal tax savings. Compare filing statuses, income phase-outs and W-2 code TT rules.",
  path: `/${SLUG}/`,
  keywords: ["no tax on overtime calculator", "overtime deduction 2026", "qualified overtime deduction", "w-2 code tt", "box 12 tt overtime"],
});

// Worked examples — computed by the same function the calculator uses
const EX = calcOvertimeDeduction({ mode: "hours", hourlyRate: 25, overtimeHoursPerWeek: 5, weeks: 50, multiplier: 1.5, magi: 70_000, status: "single" });
const EX_DOUBLE = calcOvertimeDeduction({ mode: "total", totalOvertimePay: 20_000, multiplier: 2, magi: 70_000, status: "single" });
const EX_PHASE = calcOvertimeDeduction({ mode: "premium", premium: 20_000, magi: 320_500, status: "mfj" });

const ANSWER = `For 2026, a single worker earning $25 an hour with 5 FLSA overtime hours a week for 50 weeks gets ${usd0(EX.totalOvertimePay)} of overtime pay, but only the “half” premium — ${usd0(EX.qualifiedOvertime)} — qualifies before the deduction limits. At a $70,000 income that saves about ${usd(EX.taxSaved)} in federal income tax under the standard-deduction assumptions below.`;

const faqs: FaqItem[] = [
  {
    question: "Is overtime really tax-free now?",
    answer:
      "Not fully. For tax years 2025 through 2028 you can deduct the premium part of FLSA-required overtime — the extra “half” in time-and-a-half — up to $12,500 ($25,000 on a joint return). The straight-time part of your overtime is taxed as usual, and Social Security and Medicare still apply to all of it.",
  },
  {
    question: "What does code TT in box 12 of my W-2 mean?",
    answer:
      "Starting with 2026 Forms W-2, employers report qualified overtime compensation in box 12 with code TT. That is the premium portion before your deduction limits. If it is missing or understated, request a corrected W-2c; pay stubs alone do not replace employer reporting for a 2026 claim. The IRS allowed reasonable pay-record methods for 2025 under Notice 2025-69.",
  },
  {
    question: "Do I have to itemize to get the overtime deduction?",
    answer:
      "No. It is claimed on Schedule 1-A and works whether you take the standard deduction or itemize. It lowers taxable income, not adjusted gross income.",
  },
  {
    question: "Does overtime required by my state count?",
    answer:
      "Only overtime the federal Fair Labor Standards Act requires — generally hours over 40 in a workweek. Extra pay that exists only because of state law (such as California daily overtime), a union contract or company policy does not count. If your employer pays double time, only the half-time premium the FLSA requires qualifies.",
  },
  {
    question: "Can married couples filing separately claim it?",
    answer:
      "No. If you are married you must file a joint return to take the deduction, and the person who earned the overtime needs a valid Social Security number.",
  },
  {
    question: "Is the deduction the same as a refund of overtime withholding?",
    answer:
      "No. A deduction reduces taxable income; it is not a dollar-for-dollar refund of the tax withheld from overtime checks. A $3,125 deduction at a 22% marginal rate may save $687.50 under the calculator assumptions. Your actual refund also depends on total withholding, credits and the rest of your return. Withholding changes only if you update Form W-4 to account for the deduction.",
  },
];

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="No Tax on Overtime Calculator"
      answer={ANSWER}
      intro="Estimate your qualified overtime deduction and tax savings for 2025 or 2026. Choose your tax year and filing status; only the FLSA-required premium qualifies."
      calculator={<OvertimeDeductionCalculator />}
      faqs={faqs}
      sources={[
        { label: "IRS — Working Families Tax Cuts: provisions for individuals and workers", url: "https://www.irs.gov/newsroom/working-families-tax-cuts-individuals-and-workers" },
        { label: "IRS — Updated overtime FAQs, August 2026 (FS-2026-13)", url: "https://www.irs.gov/pub/taxpros/fs-2026-13.pdf" },
        { label: "IRS — Guidance for individuals who received tips or overtime during tax year 2025 (Notice 2025-69)", url: "https://www.irs.gov/newsroom/treasury-irs-provide-guidance-for-individuals-who-received-tips-or-overtime-during-tax-year-2025" },
        { label: "IRS — Schedule 1-A (Form 1040), Additional Deductions", url: "https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf" },
        { label: "IRS — General Instructions for Forms W-2 and W-3 (2026), box 12 code TT", url: "https://www.irs.gov/instructions/iw2w3" },
        { label: "IRS — Tax inflation adjustments for tax year 2026", url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" },
        { label: "IRS — Rev. Proc. 2024-40, 2025 tax brackets", url: "https://www.irs.gov/pub/irs-drop/rp-24-40.pdf" },
        { label: "IRS — Rev. Proc. 2025-32, 2026 tables and amended 2025 standard deductions", url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" },
        { label: "U.S. Department of Labor — Overtime pay under the FLSA", url: "https://www.dol.gov/agencies/whd/overtime" },
      ]}
    >
      <h2>What the “no tax on overtime” rule actually does</h2>
      <p>
        The One, Big, Beautiful Bill Act (Public Law 119-21, signed July 2025) created a new federal income tax deduction for{" "}
        <strong>qualified overtime compensation</strong>. It applies for <strong>tax years 2025 through 2028</strong>. Despite the
        nickname, your overtime is not tax-free. You still pay tax on your regular pay and on the straight-time part of every overtime
        hour. What you can deduct is the <em>premium</em> — the extra half you earn on top of your regular rate when you work more than 40
        hours in a week.
      </p>
      <p>
        Under the Fair Labor Standards Act (FLSA), covered non-exempt employees must be paid at least one and a half times their regular
        rate for hours over 40 in a workweek. If your regular rate is $25, an overtime hour pays $37.50. Of that, $25 is the normal wage and
        $12.50 is the premium. Only the $12.50 counts toward this deduction.
      </p>

      <h2>How the deduction is calculated</h2>
      <p>The calculator follows the same steps as Part III of IRS Schedule 1-A:</p>
      <ol>
        <li>
          <strong>Find the qualified overtime.</strong> That&apos;s the half-time premium: regular rate × 0.5 × overtime hours. If you only
          know your total overtime pay, divide it by 3 when you&apos;re paid time and a half, or by 4 when you&apos;re paid double time
          (because the FLSA only requires the half). From 2026 your W-2 shows this number in box 12 with code TT.
        </li>
        <li>
          <strong>Apply the cap:</strong> at most <strong>$12,500</strong> per return, or <strong>$25,000</strong> if married filing
          jointly.
        </li>
        <li>
          <strong>Apply the income phase-out.</strong> If your modified adjusted gross income (MAGI) is over <strong>$150,000</strong>{" "}
          (<strong>$300,000</strong> joint), subtract <strong>$100 for every full $1,000</strong> above that line. Partial thousands are
          dropped, so $1,999 over counts as one step. The deduction can&apos;t go below zero.
        </li>
        <li>
          <strong>Estimate the tax saved.</strong> We subtract the selected year&apos;s basic standard deduction from your MAGI to estimate taxable income, then
          run that year&apos;s ordinary-income federal brackets twice — with and without the deduction. Single, head-of-household and joint filers use their own brackets. The difference is your saving. If the deduction straddles
          two brackets, this is more accurate than simply multiplying by your top rate.
        </li>
      </ol>
      <p>
        MAGI starts with adjusted gross income and adds back the excluded income listed in Schedule 1-A, Part I, such as certain foreign, Puerto Rico and American Samoa income. Your overtime pay is already part of that income. This estimate assumes ordinary income and the basic standard deduction; itemizing, age/blindness additions, dependents, credits and other deductions can change the actual saving. Future 2027–2028 tax brackets are not substituted with 2026 figures here.
      </p>

      <h2>Worked example</h2>
      <p>
        In 2026, Maria is single, earns $25 an hour and works 45 hours a week for 50 weeks of the year. Her overtime pay is $25 × 1.5 × 5 hours × 50
        weeks = <strong>{usd(EX.totalOvertimePay)}</strong>. The deductible premium is $25 × 0.5 × 5 × 50 ={" "}
        <strong>{usd(EX.qualifiedOvertime)}</strong>, well under the $12,500 cap. Her MAGI of $70,000 is below $150,000, so nothing is
        phased out. After the $16,100 standard deduction her taxable income is about $53,900, in the 22% bracket, so the deduction saves
        about <strong>{usd(EX.taxSaved)}</strong> in federal income tax. She still owes Social Security and Medicare on all{" "}
        {usd0(EX.totalOvertimePay)} of overtime, subject to the applicable wage caps and payroll rules. The calculator does not estimate that payroll-tax amount because MAGI alone does not identify Social Security wages or Additional Medicare Tax.
      </p>
      <p>
        <strong>Double time:</strong> if a worker is paid {usd0(20_000)} of overtime at twice the regular rate, the qualified amount is{" "}
        {usd0(20_000)} ÷ 4 = <strong>{usd0(EX_DOUBLE.qualifiedOvertime)}</strong> — the same half-time premium the FLSA requires, not the
        full extra amount.
      </p>
      <p>
        <strong>Phase-out:</strong> a married couple filing jointly with {usd0(20_000)} of qualified overtime and a MAGI of $320,500 is
        $20,500 over the $300,000 line. That is 20 full thousands, so the deduction drops by $2,000 to{" "}
        <strong>{usd0(EX_PHASE.deduction)}</strong>.
      </p>

      <h2>Who qualifies — and who doesn&apos;t</h2>
      <ul>
        <li>
          <strong>Qualifies:</strong> non-exempt employees paid FLSA overtime for hours over 40 in a workweek, including hourly workers and
          non-exempt salaried staff. The IRS also lets certain public-sector workers count FLSA overtime paid under special work-period
          rules and FLSA compensatory time when it is paid out.
        </li>
        <li>
          <strong>Doesn&apos;t qualify:</strong> overtime paid only because of state law (for example daily overtime after 8 hours), a
          union contract or employer policy; overtime for exempt salaried employees; and the straight-time part of any overtime hour.
        </li>
        <li>
          <strong>Filing rules:</strong> you need a valid Social Security number, and married couples must file jointly. Married filing
          separately gets no deduction. Head of household uses the same $12,500 cap and $150,000 threshold as single filers, but its own standard deduction and tax brackets are used for the savings estimate.
        </li>
      </ul>

      <h2>Practical tips</h2>
      <ul>
        <li>
          <strong>Match your records to the tax year.</strong> For 2025, retain pay stubs and the calculation allowed by Notice 2025-69. For 2026, compare records with W-2 box 12 code TT and ask your employer for Form W-2c if the reported amount is missing or wrong. Do not replace required 2026 employer reporting with a pay-stub estimate.
        </li>
        <li>
          <strong>Expect the saving at tax time.</strong> Withholding doesn&apos;t change unless you file a new Form W-4. Adjusting it can
          put the money in your paychecks, but under-withholding can leave you with a bill.
        </li>
        <li>
          <strong>Check your state.</strong> This is a federal deduction. Some states follow it and others don&apos;t, so your state return
          may still tax the full amount.
        </li>
        <li>
          <strong>It ends after 2028</strong> unless Congress extends it, so plan around it as a temporary benefit.
        </li>
      </ul>
      <p>
        Want to see your gross overtime pay first? Use our <Link href="/overtime-calculator/">overtime pay calculator</Link>.
      </p>
    </ToolLayout>
  );
}
