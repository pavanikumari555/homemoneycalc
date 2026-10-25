import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import BonusCalculator from "./BonusCalculator";
import { usd, usd0 } from "@/lib/calc";
import { FEDERAL_2026 } from "@/lib/tax2026";
import { calcBonusTax, type BonusInput } from "@/lib/tools/bonus-tax-calculator";

const SLUG = "bonus-tax-calculator";
const WAGE_BASE = FEDERAL_2026.socialSecurity.wageBase;

export const metadata: Metadata = buildMetadata({
  title: "Bonus Tax Calculator 2026: Take-Home After Withholding",
  description:
    "See what you keep from a bonus after 2026 federal withholding (22% flat or aggregate), Social Security, Medicare and state tax — and why it isn't final.",
  path: `/${SLUG}/`,
  keywords: ["bonus tax calculator", "bonus tax rate 2026", "how much tax is taken out of a bonus", "supplemental tax rate", "bonus take home calculator"],
});

// Worked examples — computed with the same function the calculator uses
const BASE: BonusInput = {
  bonus: 5_000,
  salary: 75_000,
  payPeriodsPerYear: 26,
  status: "single",
  stateCode: "TX",
  method: "flat",
  ytdWages: 0,
  ytdSupplemental: 0,
};
const EX = calcBonusTax(BASE);
const EX_CA = calcBonusTax({ ...BASE, stateCode: "CA" });
const AGG_BASE: BonusInput = { ...BASE, salary: 60_000, bonus: 10_000 };
const EX_FLAT10 = calcBonusTax(AGG_BASE);
const EX_AGG10 = calcBonusTax({ ...AGG_BASE, method: "aggregate" });

const ANSWER = `Most US employers withhold a flat 22% federal tax on bonuses, plus 6.2% Social Security and 1.45% Medicare. On a ${usd0(BASE.bonus)} bonus in a state with no income tax, that's ${usd(EX.totalWithheld)} withheld, leaving ${usd(EX.net)}. Bonus pay over $1 million in a year is withheld at 37%.`;

const faqs: FaqItem[] = [
  {
    question: "What is the federal bonus tax rate for 2026?",
    answer:
      "Bonuses aren't taxed at a special rate — they're ordinary wages. But for withholding, the IRS lets employers use a flat 22% on bonuses paid separately from regular pay, and requires 37% on any supplemental wages above $1 million in a calendar year (IRS Publication 15, 2026).",
  },
  {
    question: "Why was so much taken out of my bonus?",
    answer:
      "Your employer may have used the aggregate method, which adds the bonus to a regular paycheck and withholds as if you earned that much every pay period. That temporarily pushes the paycheck into a higher bracket. Social Security, Medicare and state tax come out too. Any over-withholding comes back when you file your return.",
  },
  {
    question: "Will I get bonus tax back when I file?",
    answer:
      "Maybe. Withholding is only a prepayment. Your actual tax depends on your total income for the year. If your top bracket is 12%, 22% withholding is more than the bonus really costs and you may get some back; if your top bracket is 24% or higher, 22% may be too little and you could owe.",
  },
  {
    question: "Is Social Security tax taken out of a bonus?",
    answer: `Yes — 6.2% until your wages for the year reach the Social Security wage base (${usd0(WAGE_BASE)} for 2026). Medicare tax of 1.45% applies to the whole bonus, plus an extra 0.9% on wages above $200,000 in the year.`,
  },
  {
    question: "How are bonuses taxed by states?",
    answer:
      "It varies. Some states publish a flat supplemental rate — for example, California withholds 10.23% on bonuses and New York 11.70% for 2026. Others use their regular withholding tables, and states like Texas and Florida have no income tax on wages.",
  },
  {
    question: "Can I lower the tax on my bonus?",
    answer:
      "You can reduce the taxable amount by sending part of the bonus to a traditional 401(k) or HSA if your plan allows deferrals from bonuses. Withholding itself can't be negotiated on a flat-rate bonus, but you can adjust your Form W-4 for regular pay if you expect a big refund or balance due.",
  },
];

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Bonus Tax Calculator 2026"
      answer={ANSWER}
      intro="Find out how much of your bonus actually lands in your account after federal, FICA and state withholding — and whether you'll get some back at tax time."
      calculator={<BonusCalculator />}
      faqs={faqs}
      sources={[
        { label: "IRS Publication 15 (2026), Section 7 — Supplemental Wages", url: "https://www.irs.gov/publications/p15" },
        { label: "IRS Publication 15-T (2026) — percentage method tables", url: "https://www.irs.gov/publications/p15t" },
        { label: "SSA — 2026 Social Security wage base", url: "https://www.ssa.gov/oact/cola/cbb.html" },
        { label: "IRS — Additional Medicare Tax (Topic 560)", url: "https://www.irs.gov/taxtopics/tc560" },
        { label: "California EDD DE 231PS — supplemental wage rates", url: "https://edd.ca.gov/siteassets/files/pdf_pub_ctr/de231ps.pdf" },
        { label: "New York NYS-50-T-NYS (1/26) — supplemental withholding rate", url: "https://www.tax.ny.gov/pdf/publications/withholding/nys50_t_nys.pdf" },
        { label: "IRS Rev. Proc. 2025-32 — 2026 tax brackets", url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" },
      ]}
    >
      <h2>How bonuses are taxed: withholding first, real tax later</h2>
      <p>
        A bonus is taxed exactly like your salary — there is no separate &quot;bonus tax.&quot; What&apos;s different is how much your
        employer <strong>withholds</strong> when it pays the bonus. The IRS calls bonuses, commissions and similar payments{" "}
        <em>supplemental wages</em>, and Publication 15 gives employers two ways to withhold federal income tax on them:
      </p>
      <ol>
        <li>
          <strong>Flat (percentage) method — 22%.</strong> If the bonus is paid separately (or listed separately on the pay stub) and
          income tax was withheld from your regular wages this year or last year, the employer can simply withhold 22%. No other
          percentage is allowed, and your W-4 is ignored.
        </li>
        <li>
          <strong>Aggregate method.</strong> The employer adds the bonus to the regular wages for that pay period, works out withholding
          on the combined amount using your W-4 and the normal tables, then subtracts what it would have withheld from the regular pay
          alone. The rest comes out of the bonus.
        </li>
      </ol>
      <p>
        One rule is not optional: once your supplemental wages for the calendar year pass <strong>$1 million</strong>, everything above
        that is withheld at <strong>37%</strong>, whatever your W-4 says.
      </p>
      <p>
        On top of income tax, every bonus has Social Security (6.2%, until your wages for the year reach {usd0(WAGE_BASE)}) and Medicare
        (1.45%, plus 0.9% on wages over $200,000) taken out, and usually state tax too.
      </p>

      <h2>The formula in plain English</h2>
      <p>
        <code>Take-home bonus = bonus − federal withholding − Social Security − Medicare − state withholding</code>
      </p>
      <p>
        With the flat method, federal withholding is just <code>bonus × 22%</code>. With the aggregate method we use the 2026 IRS
        percentage-method tables (Publication 15-T) for a 2020-or-later W-4 with no extra adjustments: withholding on (regular paycheck +
        bonus), minus withholding on the regular paycheck alone.
      </p>

      <h2>Worked examples</h2>
      <p>
        <strong>$5,000 bonus, Texas, flat method.</strong> Federal: {usd(EX.federal)} (22%). Social Security: {usd(EX.socialSecurity)}.
        Medicare: {usd(EX.medicare)}. Texas has no income tax. Total withheld {usd(EX.totalWithheld)}, so you keep{" "}
        <strong>{usd(EX.net)}</strong>.
      </p>
      <p>
        <strong>Same bonus in California.</strong> California&apos;s flat rate for bonuses is 10.23%, which takes{" "}
        {usd(EX_CA.state)}, and state disability insurance (SDI) takes another {usd(EX_CA.statePayroll)}. You&apos;d keep{" "}
        <strong>{usd(EX_CA.net)}</strong>.
      </p>
      <p>
        <strong>Flat vs. aggregate.</strong> Say you earn $60,000, are paid every two weeks and get a $10,000 bonus with a regular
        paycheck. The flat method withholds {usd(EX_FLAT10.federal)} in federal tax. The aggregate method treats that paycheck as if you
        earned about $320,000 a year and withholds {usd(EX_AGG10.federal)}. Yet the bonus only adds about{" "}
        <strong>{usd(EX_AGG10.federalTaxOnBonus)}</strong> to your actual 2026 federal tax — part of it falls in the 12% bracket. The
        extra you paid comes back as a refund when you file.
      </p>

      <h2>Why withholding isn&apos;t your final tax</h2>
      <p>
        Withholding is a prepayment, not a bill. In April your total income for the year is run through the normal brackets, and
        everything withheld from paychecks <em>and</em> bonuses is credited against it. That&apos;s why the calculator also shows how much
        the bonus really adds to your federal tax (using 2026 brackets and the standard deduction) and whether you&apos;re likely
        over- or under-withheld. If your top bracket is 24% or more — roughly above {usd0(105_700 + FEDERAL_2026.stdDeduction.single)} of
        salary for a single filer — 22% withholding won&apos;t cover all of the tax, so plan for a smaller refund or a balance due.
      </p>

      <h2>State tax on bonuses</h2>
      <p>
        States handle bonuses differently. Where we&apos;ve verified a published supplemental rate on the state&apos;s own website, we use
        it: California 10.23% for bonuses and New York 11.70% for 2026 (New York City and Yonkers withholding are not included). For every
        other state with an income tax, we show an <strong>estimate</strong> of the extra state income tax the bonus adds at your salary,
        using our 2026 state tax engine. Your employer may withhold a different amount — check your pay stub. Employee payroll taxes such
        as California SDI and paid-family-leave premiums in several states are added where they apply.
      </p>

      <h2>Tips for a bigger take-home bonus</h2>
      <ul>
        <li>
          <strong>Ask payroll which method they use.</strong> If you&apos;re surprised by a big deduction, it was probably the aggregate
          method, and the difference is likely to come back at tax time.
        </li>
        <li>
          <strong>Defer some to retirement.</strong> Many 401(k) plans let you contribute a percentage of bonuses, which cuts federal (and
          usually state) income tax now. Our <Link href="/paycheck-calculator/">paycheck calculator</Link> shows the effect on regular
          pay.
        </li>
        <li>
          <strong>Check your W-4 after a big bonus.</strong> If 22% won&apos;t cover your bracket, the IRS Tax Withholding Estimator can
          suggest extra withholding so you aren&apos;t hit with a bill.
        </li>
        <li>
          <strong>Have a plan before it arrives.</strong> Putting part toward high-interest debt or savings goes further than you might
          think — see the <Link href="/credit-card-payoff-calculator/">credit card payoff calculator</Link>.
        </li>
      </ul>
      <p>
        Estimates assume a 2020-or-later Form W-4 with no dependents or extra withholding, and they don&apos;t include local or city
        taxes.
      </p>
    </ToolLayout>
  );
}
