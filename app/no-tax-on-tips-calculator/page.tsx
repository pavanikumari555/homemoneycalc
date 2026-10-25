import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import { usd, usd0 } from "@/lib/calc";
import { calcTipsDeduction } from "@/lib/tools/no-tax-on-tips-calculator";
import TipsDeductionCalculator from "./TipsDeductionCalculator";

const SLUG = "no-tax-on-tips-calculator";

export const metadata: Metadata = buildMetadata({
  title: "No Tax on Tips Calculator (2025–2028 Deduction)",
  description:
    "Estimate your qualified tips deduction and federal tax saved: the $25,000 cap, $150k / $300k income phase-out, eligible jobs and W-2 code TP.",
  path: `/${SLUG}/`,
  keywords: ["no tax on tips calculator", "tips deduction 2026", "no tax on tips refund", "w-2 code tp", "qualified tips deduction"],
});

// Worked examples — computed by the same function the calculator uses
const EX = calcTipsDeduction({ tips: 18_000, listedOccupation: true, selfEmployed: false, magi: 48_000, status: "single" });
const EX_PHASE = calcTipsDeduction({ tips: 30_000, listedOccupation: true, selfEmployed: false, magi: 175_800, status: "single" });
const EX_SE = calcTipsDeduction({ tips: 7_000, listedOccupation: true, selfEmployed: true, netProfit: 5_200, magi: 40_000, status: "single" });

const ANSWER = `A single server with ${usd0(18_000)} in reported tips and a $48,000 income can deduct all ${usd0(EX.deduction)}, saving about ${usd0(EX.taxSaved)} in federal income tax. The deduction is capped at $25,000 per return and applies for tax years 2025–2028.`;

const faqs: FaqItem[] = [
  {
    question: "Are tips tax-free now?",
    answer:
      "Partly. For tax years 2025 through 2028 you can deduct up to $25,000 of qualified tips from your federal taxable income. Tips are still reported as income, Social Security and Medicare still apply, and your state may tax them.",
  },
  {
    question: "Is the $25,000 limit doubled for married couples?",
    answer:
      "No. The cap is $25,000 per tax return, whether you file single or jointly. Married couples get a higher phase-out start ($300,000 of MAGI instead of $150,000), but not a bigger cap.",
  },
  {
    question: "Which jobs qualify for no tax on tips?",
    answer:
      "Only occupations on the Treasury list of jobs that customarily and regularly received tips — more than 70 occupations in eight groups, from bartenders and wait staff to hair stylists, delivery drivers and tour guides. The full list is at IRS.gov/TippedOccupations.",
  },
  {
    question: "What is code TP on my W-2?",
    answer:
      "From 2026, employers report the total cash tips you reported to them in box 12 with code TP, and put your Treasury tipped-occupation code in box 14b. If box 14b shows only 000, those tips were from a job that doesn't qualify.",
  },
  {
    question: "Do automatic service charges count as tips?",
    answer:
      "No. A mandatory charge the customer can't remove or change — such as an automatic 18% charge for large parties — isn't a qualified tip, even if it's passed on to staff. Tips must be paid voluntarily and not be negotiated.",
  },
  {
    question: "Can I claim it if I don't itemize?",
    answer:
      "Yes. The deduction is claimed on Schedule 1-A and is available whether you take the standard deduction or itemize. Married couples must file jointly to claim it.",
  },
];

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="No Tax on Tips Calculator"
      answer={ANSWER}
      intro="Estimate how much of your tip income you can deduct under the new federal rule for tax years 2025–2028, and roughly what it saves."
      calculator={<TipsDeductionCalculator />}
      faqs={faqs}
      sources={[
        { label: "IRS — Working Families Tax Cuts: provisions for individuals and workers", url: "https://www.irs.gov/newsroom/working-families-tax-cuts-individuals-and-workers" },
        { label: "IRS — What the “No Tax on Tips” deduction means for you", url: "https://www.irs.gov/newsroom/what-the-no-tax-on-tips-deduction-means-for-you" },
        { label: "IRS — Final regulations listing tipped occupations (IR-2026-49)", url: "https://www.irs.gov/newsroom/treasury-irs-issue-final-regulations-listing-occupations-where-workers-customarily-and-regularly-receive-tips-under-the-one-big-beautiful-bill" },
        { label: "IRS — Schedule 1-A (Form 1040), Additional Deductions", url: "https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf" },
        { label: "IRS — General Instructions for Forms W-2 and W-3 (2026), box 12 code TP", url: "https://www.irs.gov/instructions/iw2w3" },
        { label: "IRS — Guidance for individuals who received tips or overtime during tax year 2025", url: "https://www.irs.gov/newsroom/treasury-irs-provide-guidance-for-individuals-who-received-tips-or-overtime-during-tax-year-2025" },
        { label: "IRS — Tax inflation adjustments for tax year 2026", url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" },
      ]}
    >
      <h2>What “no tax on tips” means</h2>
      <p>
        The One, Big, Beautiful Bill Act (Public Law 119-21) added a federal income tax deduction for <strong>qualified tips</strong> for{" "}
        <strong>tax years 2025 through 2028</strong>. You still report your tips as income, but you can then subtract up to{" "}
        <strong>$25,000</strong> of them on Schedule 1-A, which lowers your taxable income. It is a deduction, not an exclusion — so it
        doesn&apos;t touch Social Security or Medicare tax, and it doesn&apos;t automatically change your state tax.
      </p>

      <h2>How the deduction is calculated</h2>
      <ol>
        <li>
          <strong>Add up your qualified tips.</strong> Use the tips on your W-2 (box 7; from 2026 also box 12 code TP), any tips reported on
          Forms 1099-NEC, 1099-MISC or 1099-K, and unreported tips you add with Form 4137. Self-employed workers can&apos;t deduct more than
          the net profit of the business where the tips were earned.
        </li>
        <li>
          <strong>Apply the cap:</strong> the smaller of your qualified tips or <strong>$25,000</strong>. The cap is per return, so it is
          the same for single and joint filers.
        </li>
        <li>
          <strong>Apply the income phase-out.</strong> If your modified adjusted gross income (MAGI) is above <strong>$150,000</strong>{" "}
          (<strong>$300,000</strong> married filing jointly), the deduction drops by <strong>$100 for each full $1,000</strong> over the
          line. Partial thousands don&apos;t count, and the result can&apos;t go below zero. A full $25,000 deduction is gone at $400,000
          of MAGI for single filers and $550,000 for joint filers.
        </li>
        <li>
          <strong>Estimate the tax saved.</strong> We take MAGI minus the 2026 standard deduction as your taxable income, then work out 2026
          federal income tax with and without the deduction. The difference is the estimate shown.
        </li>
      </ol>

      <h2>Worked examples</h2>
      <p>
        <strong>Server, single:</strong> Jordan earns {usd0(18_000)} in reported tips plus wages, for a MAGI of $48,000. All{" "}
        {usd0(EX.deduction)} is deductible because it&apos;s under the cap and her income is well below $150,000. Her taxable income falls
        from about $31,900 to $13,900, all within the 12% bracket, so she saves about <strong>{usd(EX.taxSaved)}</strong> in federal income
        tax. Social Security and Medicare on those tips (about {usd(EX.ficaOnTips)}) are unchanged.
      </p>
      <p>
        <strong>High earner:</strong> a single bartender at a busy venue receives {usd0(30_000)} in tips with a MAGI of $175,800. The cap
        cuts the tips to {usd0(EX_PHASE.capped)}. MAGI is $25,800 over $150,000 — 25 full thousands — so the deduction drops by{" "}
        {usd0(EX_PHASE.reduction)} to <strong>{usd0(EX_PHASE.deduction)}</strong>.
      </p>
      <p>
        <strong>Self-employed:</strong> a rideshare driver gets {usd0(7_000)} in tips through an app but shows a net profit of{" "}
        {usd0(5_200)} after expenses. The deduction is limited to <strong>{usd0(EX_SE.deduction)}</strong>.
      </p>

      <h2>Who qualifies — and who doesn&apos;t</h2>
      <ul>
        <li>
          <strong>Eligible jobs:</strong> occupations on the Treasury list of jobs that customarily received tips — more than 70, grouped
          into food and beverage service, entertainment and events, hospitality, home services, personal services, personal appearance and
          wellness, recreation and instruction, and transportation and delivery. Check yours at IRS.gov/TippedOccupations.
        </li>
        <li>
          <strong>Qualified tips</strong> are paid voluntarily by customers in cash or by card, or shared with you through a tip pool.
          Mandatory service charges and negotiated amounts don&apos;t count.
        </li>
        <li>
          <strong>Not eligible:</strong> married filing separately; anyone without a valid Social Security number; and self-employed
          people in a “specified service trade or business” (such as health, law or performing arts under section 199A), or employees
          whose employer is one.
        </li>
      </ul>

      <h2>Practical tips</h2>
      <ul>
        <li>
          <strong>Report every tip to your employer.</strong> Only tips that appear on a W-2, 1099 or Form 4137 can be deducted. Keeping a
          daily tip log also helps if the IRS asks.
        </li>
        <li>
          <strong>Check box 14b on your 2026 W-2.</strong> It shows your tipped-occupation code. A code of 000 means the tips came from a
          job that isn&apos;t on the list.
        </li>
        <li>
          <strong>Already filed for 2025?</strong> The IRS says you can file an amended return to claim or fix the deduction.
        </li>
        <li>
          <strong>Overtime too?</strong> The <Link href="/no-tax-on-overtime-calculator/">no tax on overtime calculator</Link> covers the
          separate overtime deduction, which you can claim on top of this one.
        </li>
      </ul>
      <p>
        Splitting a bill or deciding what to leave as a customer? That&apos;s a different job — try our{" "}
        <Link href="/tip-calculator/">tip calculator</Link>.
      </p>
    </ToolLayout>
  );
}
