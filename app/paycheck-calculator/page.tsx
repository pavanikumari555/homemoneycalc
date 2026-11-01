import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import { FEDERAL_2026 } from "@/lib/tax2026";
import { usd, usd0 } from "@/lib/calc";
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
// Worked example — single filer, Texas (no state or local income tax), $60k, biweekly
const EX = calcPaycheck({ grossAnnual: 60_000, payPeriodsPerYear: 26, status: "single", stateCode: "TX", retirementPercent: 0, otherPretaxAnnual: 0 });
const EX401 = calcPaycheck({ grossAnnual: 60_000, payPeriodsPerYear: 26, status: "single", stateCode: "TX", retirementPercent: 5, otherPretaxAnnual: 0 });
const SS_MAX = F.socialSecurity.wageBase * F.socialSecurity.rate;
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
        { label: "IRS — Publication 15-T, Federal Income Tax Withholding Methods", url: "https://www.irs.gov/publications/p15t" },
        { label: "IRS — Publication 15 (Circular E), supplemental wage withholding", url: "https://www.irs.gov/publications/p15" },
        { label: "IRS — 401(k) limit increases to $24,500 for 2026", url: "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500" },
        { label: "New Jersey Division of Taxation — wages and 401(k) contributions", url: "https://www.nj.gov/treasury/taxation/njit5.shtml" },
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

      <p>
        In formula form: <code>take-home = gross − pre-tax deductions − federal tax − Social Security − Medicare − state taxes</code>,
        then divided by your number of paychecks (52 weekly, 26 every two weeks, 24 twice a month, 12 monthly). Federal and state
        income tax are figured on the year as a whole and spread evenly across your checks.
      </p>

      <h2>A worked example: $60,000, single, Texas</h2>
      <p>
        Take a single filer earning $60,000 a year, paid every two weeks, living in Texas (no state or local income tax), with no
        401(k) or pre-tax benefits:
      </p>
      <ol>
        <li>
          Federal taxable income: $60,000 − {usd0(F.stdDeduction.single)} standard deduction ={" "}
          <strong>{usd0(EX.federalTaxable)}</strong>.
        </li>
        <li>
          Federal income tax: 10% on the first {usd0(F.single[1].over)} plus 12% on the rest ={" "}
          <strong>{usd0(EX.federalTax)}</strong>. The top dollar is taxed at {Math.round(EX.marginalFederal * 100)}%, but the
          overall federal rate is only about {Math.round((EX.federalTax / EX.gross) * 1000) / 10}% of salary.
        </li>
        <li>Social Security: 6.2% × $60,000 = <strong>{usd0(EX.socialSecurity)}</strong>.</li>
        <li>Medicare: 1.45% × $60,000 = <strong>{usd0(EX.medicare)}</strong>.</li>
        <li>
          Take-home: <strong>{usd0(EX.net)}</strong> a year, or <strong>{usd(EX.net / 26)}</strong> per paycheck. Total taxes are
          about {Math.round(EX.effectiveRate * 1000) / 10}% of gross.
        </li>
      </ol>
      <p>
        Now add a 5% traditional 401(k) contribution ({usd0(EX401.retirement)} a year). Federal tax falls to{" "}
        {usd0(EX401.federalTax)}, while Social Security and Medicare stay the same, because 401(k) deferrals are still FICA wages.
        Take-home becomes {usd0(EX401.net)} ({usd(EX401.net / 26)} per check) — so saving {usd0(EX401.retirement)} only costs you{" "}
        {usd0(EX.net - EX401.net)} of spendable pay.
      </p>

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
          Nine states don&apos;t tax wages at all, a growing group uses one flat rate, and the rest use brackets that range up to 13.3%
          in states like California and New York. On the same salary the difference can be several thousand dollars a year.
        </p>

        <div className="my-4 not-prose">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Calculate by popular state (1-click):
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/paycheck-calculator/?st=TX" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              🤠 Texas (0% tax)
            </Link>
            <Link href="/paycheck-calculator/?st=FL" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              🌴 Florida (0% tax)
            </Link>
            <Link href="/paycheck-calculator/?st=WA" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              🌲 Washington (0% tax)
            </Link>
            <Link href="/paycheck-calculator/?st=NV" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              🏔️ Nevada (0% tax)
            </Link>
            <Link href="/paycheck-calculator/?st=CA" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              ☀️ California (1%–9.3%)
            </Link>
            <Link href="/paycheck-calculator/?st=NY" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              🗽 New York (4%–6.85%)
            </Link>
            <Link href="/paycheck-calculator/?st=IL" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              🏙️ Illinois (4.95% flat)
            </Link>
            <Link href="/paycheck-calculator/?st=PA" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              🔔 Pennsylvania (3.07% flat)
            </Link>
          </div>
        </div>

        <div className="my-4 not-prose">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Calculate by benchmark salary:
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/take-home-pay-by-state/?sal=50000" className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              💼 $50,000 / yr (Median Single)
            </Link>
            <Link href="/take-home-pay-by-state/?sal=75000" className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              💵 $75,000 / yr (US Average)
            </Link>
            <Link href="/take-home-pay-by-state/?sal=100000" className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              🎯 $100,000 / yr (Six-Figure Benchmark)
            </Link>
            <Link href="/take-home-pay-by-state/?sal=150000" className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 hover:text-ivy transition">
              🚀 $150,000 / yr (Upper Bracket)
            </Link>
          </div>
        </div>

        <div className="my-6 rounded-xl border border-ivy-500/30 bg-surface p-4 shadow-sm not-prose">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-ink text-sm">Next Step: Put Your Take-Home Pay to Work</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Once you know your net paycheck, see how allocating an extra $150–$300/month saves thousands in interest and clears loans years ahead of schedule:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/debt-payoff-calculator/" className="inline-flex items-center gap-1 rounded-md bg-ivy-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-ivy-700 transition">
                  💳 Debt Payoff (Snowball vs. Avalanche) →
                </Link>
                <Link href="/mortgage-payoff-calculator/" className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-ivy-500 transition">
                  🏠 Mortgage Extra Principal Savings →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p>
          Compare all 50 states and Washington D.C. side-by-side in our dedicated{" "}
          <Link href="/take-home-pay-by-state/" className="text-ivy-600 underline font-medium">
            take-home pay by state table
          </Link>{" "}
          for $50k–$150k salaries.
        </p>

      <h2>Social Security and Medicare limits</h2>
      <p>
        Social Security stops once your wages for the year pass {usd0(F.socialSecurity.wageBase)}, so the most an employee pays in
        2026 is {usd0(SS_MAX)}. Medicare has no cap, and an extra 0.9% applies to wages above{" "}
        {usd0(F.medicare.additionalThreshold.single)} for a single filer. If you work two jobs, each employer withholds Social
        Security separately; any excess over the yearly maximum comes back as a credit on your tax return.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Dividing salary by 12 when you&apos;re paid every two weeks.</strong> Biweekly means 26 checks, so two months a
          year have three paychecks. Budget on the per-check amount.
        </li>
        <li>
          <strong>Confusing marginal and effective rates.</strong> Moving into a higher bracket only taxes the dollars above the
          line at the higher rate. A raise never lowers your take-home pay from federal income tax alone.
        </li>
        <li>
          <strong>Expecting bonus checks to match.</strong> Employers often withhold federal tax on bonuses at a flat 22% (37% on
          supplemental wages above $1 million), which may be more or less than your actual tax.
        </li>
        <li>
          <strong>Entering one spouse&apos;s salary as &ldquo;married&rdquo;.</strong> The married option uses joint brackets, so
          enter the couple&apos;s combined wages to get a household estimate.
        </li>
      </ul>

      <h2>When this estimate doesn&apos;t fit</h2>
      <p>
        Your employer&apos;s payroll system follows IRS Publication 15-T and the choices on your Form W-4, so dependents, extra
        withholding, other income or a second job can make real checks differ from this estimate. Maryland county income tax
        is included for the selected county; Indiana county tax is included when you enter your county rate. Other local
        taxes, such as New York City and Pennsylvania or Ohio city taxes, are not included. The retirement input models a
        traditional 401(k); New Jersey treats some other plans, including 403(b), differently. It also skips itemized
        deductions, tax credits such as the Child Tax Credit, and self-employment tax —
        if you&apos;re a contractor paid on a 1099, nothing is withheld and you pay both halves of Social Security and Medicare
        yourself.
      </p>

      <h2>Ways to keep more of your paycheck</h2>
      <ul>
        <li>Raise your traditional 401(k) contribution — at least enough to get any employer match.</li>
        <li>Use an HSA if you have a high-deductible health plan; contributions skip federal income tax and FICA through payroll.</li>
        <li>Check your W-4 so you aren&apos;t over-withholding and waiting for a big refund.</li>
        <li>
          Converting an hourly offer? Try the <Link href="/salary-to-hourly-calculator/">salary to hourly calculator</Link>.
        </li>
        <li>
          Once you know your real take-home, decide where the extra goes: the{" "}
          <Link href="/debt-payoff-calculator/">debt payoff calculator</Link> shows what an extra $100 a month does to your debts.
        </li>
      </ul>
    </ToolLayout>
  );
}
