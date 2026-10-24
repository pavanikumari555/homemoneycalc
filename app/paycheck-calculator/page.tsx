import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import { FEDERAL_2026 } from "@/lib/tax2026";
import { usd0 } from "@/lib/calc";
import PaycheckCalculator from "./PaycheckCalculator";
import { calcPaycheck } from "@/lib/paycheck";

const SLUG = "paycheck-calculator";
const F = FEDERAL_2026;

export const metadata: Metadata = buildMetadata({
  title: "Paycheck Calculator 2026: Take-Home Pay, All 50 States",
  description:
    "Estimate your take-home pay per paycheck after federal, state and FICA taxes. 2026 federal rules plus the latest tax tables for all 50 states and DC.",
  path: `/${SLUG}/`,
  keywords: ["paycheck calculator", "take home pay calculator", "salary after tax 2026", "net pay calculator", "state paycheck calculator"],
});

const faqs: FaqItem[] = [
  {
    question: "How is my take-home pay calculated?",
    answer:
      "Start with your gross salary and subtract pre-tax deductions such as 401(k) contributions and health premiums. Then subtract federal income tax (using the 2026 brackets and standard deduction), Social Security, Medicare, and your state's income and payroll taxes. What's left is your take-home pay, divided across your paychecks.",
  },
  {
    question: "Why is my paycheck smaller than my salary divided by my pay periods?",
    answer:
      "Taxes and deductions come out before you're paid. Federal income tax, Social Security (6.2%) and Medicare (1.45%) are withheld from every check, plus state tax in most states and any benefits you've signed up for. Together they often take 20% to 35% of gross pay.",
  },
  {
    question: "Which states have no income tax?",
    answer:
      "Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington and Wyoming don't tax wages. Washington does charge employees for its paid family leave and long-term care programs, which the calculator includes.",
  },
  {
    question: "Does contributing to a 401(k) reduce my taxes?",
    answer:
      "Yes. Traditional 401(k) contributions come out before federal and (in most states) state income tax, so each dollar you save costs you less than a dollar of take-home pay. They are still subject to Social Security and Medicare. Roth 401(k) contributions are after-tax and don't lower your current taxes.",
  },
  {
    question: "Why might my real paycheck differ from this estimate?",
    answer:
      "Your employer withholds based on your W-4, which may include dependents, extra withholding or other income. Local taxes (for example New York City or Philadelphia), itemized deductions, tax credits and bonuses taxed at a flat rate can also change the number. Use this as a planning estimate and compare with your pay stub.",
  },
];

const exampleNet = (st: string) =>
  calcPaycheck({ grossAnnual: 60_000, payPeriodsPerYear: 26, status: "single", stateCode: st, retirementPercent: 0, otherPretaxAnnual: 0 }).net;
const ANSWER = `On a $60,000 salary, a single filer in Texas takes home about ${usd0(exampleNet("TX"))} a year (${usd0(exampleNet("TX") / 26)} every two weeks) after federal income tax, Social Security and Medicare. In California it's about ${usd0(exampleNet("CA"))}.`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Paycheck Calculator 2026"
      answer={ANSWER}
      intro="Your real take-home pay after federal, state, Social Security and Medicare taxes — for all 50 states and DC."
      calculator={<PaycheckCalculator />}
      faqs={faqs}
      sources={[
        { label: "IRS — Tax inflation adjustments for tax year 2026 (Rev. Proc. 2025-32)", url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" },
        { label: "Social Security Administration — Contribution and benefit base", url: "https://www.ssa.gov/oact/cola/cbb.html" },
        { label: "IRS — Topic 560, Additional Medicare Tax", url: "https://www.irs.gov/taxtopics/tc560" },
        { label: "Each state's department of revenue (shown in the state note above)", url: "https://www.taxadmin.org/state-tax-agencies" },
      ]}
    >
      <h2>How your take-home pay is calculated</h2>
      <ol>
        <li>
          <strong>Pre-tax deductions</strong> come off first: traditional 401(k) or 403(b) contributions and your share of health,
          dental and HSA/FSA premiums.
        </li>
        <li>
          <strong>Federal income tax:</strong> we subtract the 2026 standard deduction ({usd0(F.stdDeduction.single)} single,{" "}
          {usd0(F.stdDeduction.married)} married filing jointly) and apply the progressive brackets from 10% to 37%. Each rate only
          applies to the slice of income inside its bracket.
        </li>
        <li>
          <strong>Social Security:</strong> 6.2% of wages up to the 2026 wage base of {usd0(F.socialSecurity.wageBase)}.
        </li>
        <li>
          <strong>Medicare:</strong> 1.45% of all wages, plus 0.9% on wages above {usd0(F.medicare.additionalThreshold.single)}{" "}
          (single).
        </li>
        <li>
          <strong>State taxes:</strong> your state&apos;s 2026 brackets or flat rate, its standard deduction, exemptions and credits,
          plus employee-paid programs like disability or paid family leave where they apply.
        </li>
      </ol>

      <h2>2026 federal tax brackets</h2>
      <p>For single filers, taxable income (after the standard deduction) is taxed like this:</p>
      <ul>
        {F.single.map((b, i) => {
          const next = F.single[i + 1];
          return (
            <li key={b.over}>
              <strong>{Math.round(b.rate * 100)}%</strong> on income {next ? `from ${usd0(b.over)} to ${usd0(next.over)}` : `over ${usd0(b.over)}`}
            </li>
          );
        })}
      </ul>
      <p>
        Married couples filing jointly have brackets roughly twice as wide. Your <em>marginal</em> rate (the top bracket you reach)
        is always higher than your <em>effective</em> rate (total tax ÷ income), which the calculator shows above.
      </p>

      <h2>Why your state matters so much</h2>
      <p>
        Nine states don&apos;t tax wages at all, a growing group uses one flat rate, and the rest use brackets that top out above 10%
        in states like California and New York. On the same salary the difference can be several thousand dollars a year — use the
        &ldquo;Same salary, other states&rdquo; ranking to see exactly how much, or browse our{" "}
        <Link href="/take-home-pay-by-state/">take-home pay by state table</Link> for $50k–$150k salaries.
      </p>

      <h2>Ways to keep more of your paycheck</h2>
      <ul>
        <li>Raise your traditional 401(k) contribution — at least enough to get any employer match.</li>
        <li>Use an HSA if you have a high-deductible health plan; contributions skip federal income tax and FICA through payroll.</li>
        <li>Check your W-4 so you aren&apos;t over-withholding and waiting for a big refund.</li>
        <li>
          Converting an hourly offer? Try the <Link href="/salary-to-hourly-calculator/">salary to hourly calculator</Link>.
        </li>
      </ul>
    </ToolLayout>
  );
}
