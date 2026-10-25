import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import HsaCalculator from "./HsaCalculator";
import { usd, usd0 } from "@/lib/calc";
import { calcHsa, HSA_LIMITS, type HsaInput } from "@/lib/tools/hsa-calculator";

const SLUG = "hsa-calculator";
const L26 = HSA_LIMITS[2026];
const L27 = HSA_LIMITS[2027];

export const metadata: Metadata = buildMetadata({
  title: "HSA Calculator: 2026 & 2027 Limits and Tax Savings",
  description:
    "See your 2026 and 2027 HSA contribution limit, how much room is left after your employer's deposit, the taxes you save and how the account could grow.",
  path: `/${SLUG}/`,
  keywords: ["hsa calculator", "hsa contribution limits 2027", "hsa contribution limit 2026", "hsa per paycheck", "hsa tax savings"],
});

// Worked example — numbers come straight from the calculator's own function
const BASE: HsaInput = {
  year: 2026,
  coverage: "self",
  age55: false,
  yourContribution: 3_400,
  employerContribution: 1_000,
  viaPayroll: true,
  income: 75_000,
  status: "single",
  stateCode: "TX",
  startBalance: 0,
  years: 20,
  returnPercent: 6,
};
const EX = calcHsa(BASE);
const EX_IL = calcHsa({ ...BASE, stateCode: "IL" });
const EX_DIRECT = calcHsa({ ...BASE, viaPayroll: false });

const ANSWER = `For 2026 you can put ${usd0(L26.self)} into an HSA with self-only coverage or ${usd0(L26.family)} with family coverage (${usd0(L27.self)} and ${usd0(L27.family)} in 2027), plus ${usd0(L26.catchUp)} if you're 55 or older. A single Texas worker earning $75,000 who adds ${usd0(BASE.yourContribution)} through payroll saves about ${usd0(EX.totalSaved)} in federal income and FICA taxes.`;

const faqs: FaqItem[] = [
  {
    question: "What is the HSA contribution limit for 2026 and 2027?",
    answer: `For 2026 the limit is ${usd0(L26.self)} for self-only HDHP coverage and ${usd0(L26.family)} for family coverage (IRS Rev. Proc. 2025-19). For 2027 it rises to ${usd0(L27.self)} and ${usd0(L27.family)} (Rev. Proc. 2026-24). People 55 or older can add ${usd0(L26.catchUp)} more each year.`,
  },
  {
    question: "Does my employer's HSA contribution count toward the limit?",
    answer:
      "Yes. The annual limit covers everything that goes into your HSA for the year — your payroll deductions, money you deposit yourself, and any employer seed money or match. If your employer adds $1,000 and the limit is $4,400, you can add $3,400.",
  },
  {
    question: "How much tax does an HSA save?",
    answer:
      "Your contribution is free of federal income tax, so you save your top bracket rate on each dollar (for example 22%). If it goes through an employer cafeteria plan, it also skips Social Security and Medicare tax (7.65%). Most states give a deduction too; California and New Jersey do not.",
  },
  {
    question: "What happens if I contribute too much to my HSA?",
    answer:
      "Excess contributions are not deductible and face a 6% excise tax for every year they stay in the account. You can avoid the penalty by withdrawing the excess and any earnings on it before your tax-filing deadline (including extensions). Ask your HSA provider for an \"excess contribution removal\".",
  },
  {
    question: "Who can contribute to an HSA?",
    answer: `You must be covered by a high-deductible health plan (for 2026, a deductible of at least ${usd0(L26.minDeductible.self)} self-only or ${usd0(L26.minDeductible.family)} family), have no other disqualifying health coverage, not be enrolled in Medicare, and not be claimed as someone else's dependent.`,
  },
  {
    question: "Can I use the HSA catch-up if my spouse is also 55?",
    answer:
      "Each spouse who is 55 or older gets their own $1,000 catch-up, but it must go into that spouse's own HSA. Two people can't put both catch-ups into one account.",
  },
];

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="HSA Calculator"
      answer={ANSWER}
      intro="Check your 2026 or 2027 HSA limit, how much room is left after your employer's deposit, the taxes you save, and what the account could grow to."
      calculator={<HsaCalculator />}
      faqs={faqs}
      sources={[
        { label: "IRS Rev. Proc. 2025-19 — 2026 HSA limits", url: "https://www.irs.gov/pub/irs-drop/rp-25-19.pdf" },
        { label: "IRS Rev. Proc. 2026-24 — 2027 HSA limits", url: "https://www.irs.gov/pub/irs-drop/rp-26-24.pdf" },
        { label: "IRS Publication 969 — Health Savings Accounts", url: "https://www.irs.gov/publications/p969" },
        { label: "IRS Publication 15-B — cafeteria plan contributions and FICA", url: "https://www.irs.gov/publications/p15b" },
        { label: "IRS Rev. Proc. 2025-32 — 2026 tax brackets", url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" },
      ]}
    >
      <h2>HSA contribution limits for 2026 and 2027</h2>
      <p>
        A health savings account (HSA) has one yearly cap that covers <em>all</em> money going in — yours and your employer&apos;s. The
        IRS sets the amounts each spring for the following year:
      </p>
      <div className="mb-4 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm tabular-nums">
          <thead className="text-left text-xs uppercase tracking-wide text-muted">
            <tr className="border-b border-line">
              <th className="px-4 py-3">Limit</th>
              <th className="px-4 py-3">2026</th>
              <th className="px-4 py-3">2027</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink/80">
            <tr>
              <td className="px-4 py-2">Self-only HDHP</td>
              <td className="px-4 py-2">{usd0(L26.self)}</td>
              <td className="px-4 py-2">{usd0(L27.self)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Family HDHP</td>
              <td className="px-4 py-2">{usd0(L26.family)}</td>
              <td className="px-4 py-2">{usd0(L27.family)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Catch-up (age 55+)</td>
              <td className="px-4 py-2">+{usd0(L26.catchUp)}</td>
              <td className="px-4 py-2">+{usd0(L27.catchUp)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Minimum HDHP deductible (self / family)</td>
              <td className="px-4 py-2">
                {usd0(L26.minDeductible.self)} / {usd0(L26.minDeductible.family)}
              </td>
              <td className="px-4 py-2">
                {usd0(L27.minDeductible.self)} / {usd0(L27.minDeductible.family)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2">Max HDHP out-of-pocket (self / family)</td>
              <td className="px-4 py-2">
                {usd0(L26.maxOutOfPocket.self)} / {usd0(L26.maxOutOfPocket.family)}
              </td>
              <td className="px-4 py-2">
                {usd0(L27.maxOutOfPocket.self)} / {usd0(L27.maxOutOfPocket.family)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The $1,000 catch-up is written into the law and isn&apos;t adjusted for inflation, so it stays the same year to year. If you
        only have HDHP coverage for part of the year, your limit is generally prorated by month — unless you qualify for the
        &quot;last-month rule&quot; explained in IRS Publication 969.
      </p>

      <h2>How the calculator works</h2>
      <p>In plain English, it does three things:</p>
      <ol>
        <li>
          <strong>Your limit.</strong> Self-only or family amount for the year you pick, plus $1,000 if you&apos;re 55 or older.
        </li>
        <li>
          <strong>Room left.</strong> Limit minus your contribution minus your employer&apos;s contribution. Employer money counts first, so
          the most you can add yourself is the limit minus what your employer puts in.
        </li>
        <li>
          <strong>Tax saved.</strong> We work out your 2026 federal income tax (standard deduction and brackets) with and without your
          contribution, and the difference is your federal saving. If you contribute through payroll, we do the same for Social
          Security (6.2%) and Medicare (1.45%). Then we repeat it with your state&apos;s 2026 tax rules — except in California and New
          Jersey, which don&apos;t allow an HSA deduction.
        </li>
      </ol>
      <p>
        Comparing &quot;with&quot; and &quot;without&quot; is more accurate than simply multiplying by your bracket, because a large
        contribution can drop part of your income into a lower bracket.
      </p>

      <h2>Worked example</h2>
      <p>
        Maya is single, earns $75,000 in Texas and has self-only HDHP coverage in 2026. Her employer deposits $1,000, so she can add{" "}
        {usd0(L26.self - 1_000)} herself and reach the {usd0(L26.self)} limit. She contributes through payroll:
      </p>
      <ul>
        <li>
          Federal income tax saved: {usd(EX.federalSaved)} (her last dollars are taxed at 22%, and {usd0(BASE.yourContribution)} × 22% ={" "}
          {usd(EX.federalSaved)}).
        </li>
        <li>Social Security and Medicare saved: {usd(EX.ficaSaved)} (7.65% of {usd0(BASE.yourContribution)}).</li>
        <li>Texas has no income tax, so no state saving.</li>
        <li>
          Total: <strong>{usd(EX.totalSaved)}</strong>. Her {usd0(BASE.yourContribution)} only shrinks her take-home pay by about{" "}
          {usd0(EX.effectiveCost)} — about {usd0(EX.perPaycheck26)} a paycheck if she&apos;s paid every two weeks.
        </li>
      </ul>
      <p>
        If Maya lived in Illinois, she&apos;d also save {usd(EX_IL.stateSaved)} in state tax (4.95%), for {usd(EX_IL.totalSaved)} in all.
        If she instead deposited the money herself and deducted it on her tax return, she&apos;d keep the federal saving but lose the FICA
        part — her total would be {usd(EX_DIRECT.totalSaved)}. If she keeps depositing {usd0(L26.self)} a year and earns 6%, the account
        could reach about {usd0(EX.futureValue)} in 20 years (an assumption, not a promise — investments can lose value).
      </p>

      <h2>Why an HSA is called &quot;triple tax-advantaged&quot;</h2>
      <p>
        Money goes in before tax, grows without tax on interest or investment gains, and comes out tax-free when spent on qualified
        medical expenses. No other common account gets all three. After age 65 you can also withdraw for any reason and pay only regular
        income tax (like a traditional IRA); before 65, non-medical withdrawals owe income tax plus a 20% penalty.
      </p>

      <h2>Practical tips</h2>
      <ul>
        <li>
          <strong>Use payroll if you can.</strong> Contributions through your employer&apos;s cafeteria plan avoid the 7.65% FICA tax that
          direct deposits don&apos;t.
        </li>
        <li>
          <strong>Don&apos;t forget the employer deposit.</strong> It&apos;s the most common reason people go over the limit. Check your
          benefits portal for the exact amount.
        </li>
        <li>
          <strong>Divide by your paychecks.</strong> To max out evenly, divide your share of the limit by the number of paychecks left in
          the year. Our <Link href="/paycheck-calculator/">paycheck calculator</Link> shows the effect on take-home pay.
        </li>
        <li>
          <strong>Keep receipts.</strong> There&apos;s no deadline to reimburse yourself for a qualified expense paid after the HSA was
          opened, so some people pay medical bills out of pocket and let the HSA keep growing.
        </li>
        <li>
          <strong>Invest the long-term part.</strong> Many HSAs hold cash by default. If you have an emergency cushion, compare
          investment options and fees — see how growth adds up with the{" "}
          <Link href="/compound-interest-calculator/">compound interest calculator</Link>.
        </li>
        <li>
          <strong>Stop contributions when Medicare starts.</strong> Once you&apos;re enrolled in Medicare you can no longer contribute,
          though you can keep spending the balance.
        </li>
      </ul>
      <p>
        This calculator uses 2026 federal brackets and standard deductions for both years, ignores credits and itemized deductions, and
        treats your state&apos;s tax with our simplified 2026 state engine. Your actual savings depend on your full tax return.
      </p>
    </ToolLayout>
  );
}
