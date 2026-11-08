import Link from "next/link";
import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";
import { calcMortgage, usd, duration } from "@/lib/calc";
import { calcOvertimeDeduction } from "@/lib/tools/no-tax-on-overtime-calculator";

const CLASS_MORTGAGE = calcMortgage({principal:300000,annualRatePercent:6.5,yearsLeft:30,extraMonthly:200,extraYearly:0,oneTime:0});
const CLASS_OVERTIME = calcOvertimeDeduction({mode:"hours",hourlyRate:25,overtimeHoursPerWeek:5,weeks:50,multiplier:1.5,magi:70000,status:"single",taxYear:2026});

export const metadata: Metadata = buildMetadata({
  title: "How We Calculate — Methodology & Data Sources",
  description:
    "The formulas, tax data and assumptions behind every HomeMoney Calc calculator, with links to the official sources we use and how often we update them.",
  path: "/methodology/",
});

export default function Page() {
  return (
    <PageShell title="How we calculate" intro="The math, data and assumptions behind every HomeMoney Calc calculator — in plain English.">
      <h2>Our principles</h2>
      <ul>
        <li>
          <strong>Standard formulas only.</strong> We use the same textbook formulas banks, lenders and payroll systems use. No
          proprietary &ldquo;magic&rdquo; numbers.
        </li>
        <li>
          <strong>Official data.</strong> Tax rates and limits come from the IRS, the Social Security Administration and each
          state&apos;s revenue department. Each calculator page links to its sources.
        </li>
        <li>
          <strong>Clear assumptions.</strong> Where we simplify (for example, ignoring local city taxes), we say so on the page.
        </li>
        <li>
          <strong>Your data stays with you.</strong> Calculations run in your browser. We never receive the numbers you type.
        </li>
      </ul>

      <h2>Loans: mortgages, auto loans and credit cards</h2>
      <p>
        The regular monthly payment uses the amortization formula <code>M = P × r / (1 − (1 + r)^−n)</code>, where P is the amount
        borrowed, r is the annual rate ÷ 12, and n is the number of monthly payments. We then simulate the loan month by month:
        interest for the month is <code>balance × r</code>, your payment (plus any extra) is applied, and the remainder reduces the
        balance. Payoff dates, total interest and schedules all come from that simulation.
      </p>
      <p>
        Credit card minimum payments are modeled as 1% of the balance plus that month&apos;s interest, with a $25 floor — a common
        issuer formula. Your card&apos;s exact formula may differ.
      </p>

      <h2>Debt payoff: snowball and avalanche</h2>
      <p>
        Your monthly budget is the sum of every minimum payment plus your extra amount, and it stays fixed. Each month every debt
        gets its minimum, and everything left over goes to the priority debt: the smallest balance (snowball) or the highest rate
        (avalanche). When a debt is paid off, its minimum rolls into the next target. &ldquo;Minimums only&rdquo; pays each debt
        its own minimum with no rollover, for comparison.
      </p>

      <h2>Take-home pay</h2>
      <p>
        We apply the 2026 federal income tax brackets and standard deduction published by the IRS to your income after pre-tax
        deductions, then add Social Security (6.2% up to the annual wage base), Medicare (1.45%, plus 0.9% above the additional
        Medicare threshold) and your state&apos;s income tax using its published brackets, deductions, exemptions and credits.
        Employee-paid state payroll taxes such as disability or paid-family-leave insurance are included where they apply.
      </p>
      <p>
        We don&apos;t model itemized deductions, dependents and tax credits, local or city income taxes, or your specific W-4
        choices, so your actual withholding can differ. The result is an annual estimate divided evenly across your pay periods.
      </p>

      <h2>Savings and compound interest</h2>
      <p>
        Growth is calculated monthly. Your chosen compounding frequency is converted to an exact equivalent monthly growth rate,{" "}
        <code>(1 + rate ÷ n)^(n ÷ 12)</code>, so daily, monthly, quarterly and yearly compounding all give precise results. Deposits
        are added at the end of each month.
      </p>

      <h2 id="classroom-examples">Free worked examples for educators</h2>
      <p>Use these scenarios in a lesson or workshop, then change one input to discuss what changes. No student account or payment is required. Calculator inputs and saved plans stay in the browser. These are educational estimates, not individualized financial advice.</p>
      <ul>
        <li><strong>Extra mortgage principal:</strong> a $300,000 balance at 6.5% with 30 years left and $200 extra each month saves {usd(CLASS_MORTGAGE.interestSaved)} in modeled interest and {duration(CLASS_MORTGAGE.monthsSaved)}. <Link href="/mortgage-payoff-calculator/?b=300000&amp;r=6.5&amp;y=30&amp;x=200&amp;a=0&amp;o=0#mortgage-calculator">Open the mortgage scenario</Link>, compare monthly schedules and download its CSV. Ask learners why a later extra payment saves less interest.</li>
        <li><strong>Overtime deduction versus refund:</strong> in 2026, $25 an hour and five FLSA overtime hours a week for 50 weeks produces {usd(CLASS_OVERTIME.qualifiedOvertime)} of qualified premium. A single filer with $70,000 MAGI saves {usd(CLASS_OVERTIME.taxSaved)} under the basic-standard-deduction assumptions. <Link href="/no-tax-on-overtime-calculator/?m=hours&amp;r=25&amp;h=5&amp;w=50&amp;x=1.5&amp;i=70000&amp;f=single&amp;y=2026">Open the overtime scenario</Link> and compare head-of-household status. The deduction is not a refund of all overtime withholding; employer reporting requirements still apply.</li>
        <li><strong>Percentage increase:</strong> <a href="/percentage-calculator/?a4=110&amp;b4=6">increase 110 by 6%</a>. The added amount is 6.6 and the final total is 116.6. Ask learners to explain why multiplying by 1.06 differs from multiplying by 0.06.</li>
      </ul>
      <p>Every published calculator also offers an optional embed under “Embed this calculator on your site.” You may share a scenario, use an embed, or cite the method without giving a backlink. Publishers choose their own wording and link attributes. We do not offer payment, reciprocal links or endorsements for inclusion. <Link href="/contact/">Send corrections or teaching feedback</Link>.</p>

      <h2>How often we update</h2>
      <p>
        We review tax figures each year when the IRS and states publish new numbers (usually October to January), and whenever
        laws change mid-year. Each calculator shows the date it was last updated. If you spot an error, please{" "}
        <Link href="/contact/">tell us</Link> — we fix confirmed errors quickly. Read more in our{" "}
        <Link href="/editorial-policy/">editorial policy</Link>.
      </p>
    </PageShell>
  );
}
