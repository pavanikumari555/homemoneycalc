import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import ColaCalculator from "./ColaCalculator";
import { usd, usd0 } from "@/lib/calc";
import { calcCola, COLA_2027_PERCENT, COLA_2026_PERCENT, PART_B_2026 } from "@/lib/tools/social-security-cola-calculator";

const SLUG = "social-security-cola-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Social Security COLA Calculator 2027 (3.6% Raise)",
  description:
    "See your 2027 Social Security benefit after the 3.6% COLA: new monthly amount, yearly raise, and what's left after the Medicare Part B premium.",
  path: `/${SLUG}/`,
  keywords: [
    "social security cola 2027 calculator",
    "2027 cola increase",
    "how much will my social security increase",
    "social security raise 2027",
    "cola and medicare part b",
  ],
});

// Worked examples — build time pe asli function se
const EX = calcCola({ benefit: 2000, colaPercent: COLA_2027_PERCENT, partBNow: PART_B_2026, partBNext: PART_B_2026, holdHarmless: true });
const EX_B = calcCola({ benefit: 2000, colaPercent: COLA_2027_PERCENT, partBNow: PART_B_2026, partBNext: 215, holdHarmless: true });
const EX_SMALL = calcCola({ benefit: 300, colaPercent: COLA_2027_PERCENT, partBNow: PART_B_2026, partBNext: 220, holdHarmless: true });

const faqs: FaqItem[] = [
  {
    question: "What is the Social Security COLA for 2027?",
    answer: `Social Security announced on October 14, 2026 that benefits will rise ${COLA_2027_PERCENT}% for 2027. The increase starts with December 2026 benefits, which are paid in January 2027. SSI payments rise by the same percentage, starting with the payment dated December 31, 2026. For 2026 the COLA was ${COLA_2026_PERCENT}%.`,
  },
  {
    question: "How much will my Social Security check go up in 2027?",
    answer: `Multiply your current monthly benefit (before Medicare is deducted) by ${COLA_2027_PERCENT / 100}. On a $2,000 benefit that's ${usd(EX.raiseMonthly)} a month, or ${usd0(EX.raiseYearly)} a year. What reaches your bank account also depends on the 2027 Medicare Part B premium, which is deducted from most retirees' checks.`,
  },
  {
    question: "When will I see the 2027 COLA in my check?",
    answer:
      "In January 2027, because each month's benefit is paid the following month. SSI recipients see it on the payment dated December 31, 2026. You don't need to apply — the increase is automatic. SSA posts COLA notices in my Social Security and mails them to people who haven't chosen paperless notices.",
  },
  {
    question: "Will the Medicare Part B increase eat my COLA?",
    answer: `Part of it, usually. The 2026 standard Part B premium is $${PART_B_2026.toFixed(2)}; CMS announces the 2027 premium separately, normally in the fall. If your premium is deducted from your Social Security check, the hold-harmless rule stops a Part B increase from shrinking your net deposit — but it doesn't apply to people paying income-related (IRMAA) premiums or new enrollees.`,
  },
  {
    question: "How is the COLA calculated?",
    answer:
      "SSA compares the average Consumer Price Index for Urban Wage Earners and Clerical Workers (CPI-W) for July, August and September with the same three-month average from the last year a COLA took effect. The percentage increase, rounded to the nearest tenth of a percent, becomes the COLA.",
  },
];

const SOURCES = [
  { label: "SSA — Social Security Announces 3.6 Percent Benefit Increase for 2027 (Oct 14, 2026)", url: "https://www.ssa.gov/news/en/press/releases/2026-10-14.html" },
  { label: "SSA — Cost-of-Living Adjustment (COLA) information", url: "https://www.ssa.gov/news/en/cola/index.html" },
  { label: "SSA Ticket to Work — Update: 2027 Cost of Living Adjustment", url: "https://choosework.ssa.gov/blog/2026-10-15-update-2027-cost-of-living-adjustment" },
  { label: "SSA — How COLAs are calculated (CPI-W)", url: "https://www.ssa.gov/oact/cola/latestCOLA.html" },
  { label: "CMS — 2026 Medicare Parts A & B premiums and deductibles", url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles" },
  { label: "42 U.S.C. § 415(g), (i) — benefit rounding rules", url: "https://www.law.cornell.edu/uscode/text/42/415" },
  { label: "42 U.S.C. § 1395r(f) — Part B hold-harmless rule", url: "https://www.law.cornell.edu/uscode/text/42/1395r" },
];

const ANSWER = `The 2027 Social Security COLA is ${COLA_2027_PERCENT}%. A $2,000 monthly benefit rises to ${usd(EX.newBenefit)} — ${usd(EX.raiseMonthly)} more a month, or ${usd0(EX.raiseYearly)} a year — before any change in the Medicare Part B premium.`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Social Security COLA Calculator 2027"
      answer={ANSWER}
      intro={`Enter your current benefit to see your 2027 check after the ${COLA_2027_PERCENT}% cost-of-living adjustment — and how much is left after Medicare Part B.`}
      calculator={<ColaCalculator />}
      faqs={faqs}
      sources={SOURCES}
    >
      <h2>The 2027 COLA: {COLA_2027_PERCENT}%</h2>
      <p>
        On October 14, 2026, the Social Security Administration announced a {COLA_2027_PERCENT}% cost-of-living adjustment for
        2027. It applies to retirement, survivor and disability benefits starting with December 2026 benefits, paid in January
        2027, and to Supplemental Security Income (SSI) starting with the payment dated December 31, 2026. That is larger than
        the {COLA_2026_PERCENT}% COLA for 2026.
      </p>
      <p>
        The COLA is automatic. You don&apos;t need to apply, call, or &quot;activate&quot; anything — and anyone who asks you to
        pay or share personal details to receive it is running a scam, as SSA&apos;s Inspector General warns.
      </p>

      <h2>How your new benefit is calculated</h2>
      <p>In plain English, the calculator does four things:</p>
      <ol>
        <li>
          <strong>Raise the gross benefit.</strong> New benefit = current monthly benefit × (1 + COLA). For 2027 that&apos;s × 1.036.
        </li>
        <li>
          <strong>Round down to the dime.</strong> Federal law drops increased amounts to the next lower 10 cents.
        </li>
        <li>
          <strong>Subtract Medicare Part B</strong> if it&apos;s deducted from your check, applying the hold-harmless limit if it
          covers you.
        </li>
        <li>
          <strong>Round the payment down to the whole dollar.</strong> That&apos;s the deposit you actually receive (before any
          voluntary tax withholding).
        </li>
      </ol>
      <p>
        One honest caveat: SSA applies the COLA to your primary insurance amount (your full-retirement-age benefit) and then
        reapplies any early-claiming reduction or delayed-retirement credit. Starting from your current check instead, as this
        calculator does, can leave the result a dollar or two off the figure on your official notice.
      </p>

      <h2>Worked examples</h2>
      <ul>
        <li>
          <strong>$2,000 benefit, Part B unchanged.</strong> $2,000 × 1.036 = {usd(EX.newBenefit)}, a raise of{" "}
          {usd(EX.raiseMonthly)} a month. After the ${PART_B_2026.toFixed(2)} Part B premium, the deposit goes from{" "}
          {usd0(EX.netNow)} to <strong>{usd0(EX.netNext)}</strong>.
        </li>
        <li>
          <strong>Same benefit, Part B rises to $215 (a hypothetical figure).</strong> The premium goes up{" "}
          {usd(EX_B.partBCharged - PART_B_2026)}, which takes about {Math.round(EX_B.partBEatsPercent)}% of the raise. The deposit
          rises from {usd0(EX_B.netNow)} to {usd0(EX_B.netNext)} — {usd0(EX_B.netChangeMonthly)} more instead of{" "}
          {usd0(EX.netChangeMonthly)}.
        </li>
        <li>
          <strong>Small $300 benefit, hypothetical $220 premium.</strong> The COLA adds only {usd(EX_SMALL.raiseMonthly)}, less than
          the premium increase. Hold harmless caps the premium at {usd(EX_SMALL.partBCharged)}, so the deposit stays at{" "}
          {usd0(EX_SMALL.netNext)} instead of falling.
        </li>
      </ul>

      <h2>Medicare Part B and the hold-harmless rule</h2>
      <p>
        Most people on Medicare have the Part B premium taken straight out of their Social Security. The 2026 standard premium
        is ${PART_B_2026.toFixed(2)} a month, set by CMS. CMS announces the next year&apos;s premium separately from the COLA,
        usually in November, and it had not published the 2027 figure when this page was last updated. That&apos;s why the 2027
        premium is an input here: it starts at the 2026 amount, and you can type in the official 2027 number once CMS releases
        it.
      </p>
      <p>
        The hold-harmless rule in the Social Security Act says that if your Part B premium is deducted from your benefit in
        both December and January, a premium increase can&apos;t make your net check smaller than the year before. It does not
        protect people who pay income-related premiums (IRMAA), people new to Medicare or to Social Security, or people whose
        premium is paid by their state.
      </p>

      <h2>Who gets the COLA</h2>
      <p>
        Everyone receiving Social Security retirement, spouse, survivor or disability (SSDI) benefits gets the same percentage
        increase, and so do SSI recipients. If you claimed early, the raise is applied to your full benefit amount and then
        reduced the same way your benefit already is — so in dollars it&apos;s close to {COLA_2027_PERCENT}% of what you
        receive now. Even if you haven&apos;t started benefits yet, COLAs are added to your future benefit from the year you turn
        62.
      </p>
      <p>
        One thing that doesn&apos;t move with the COLA: the income thresholds that decide whether your benefits are taxable
        ($25,000 single and $32,000 married filing jointly in combined income) are set in law and not indexed for inflation. A
        bigger benefit can push a little more of it into taxable income.
      </p>

      <h2>Practical tips</h2>
      <ul>
        <li>
          <strong>Look at your notice.</strong> SSA posts COLA notices in my Social Security from late November and mails the
          rest in December. Check that the new amount roughly matches this estimate.
        </li>
        <li>
          <strong>Revisit your withholding.</strong> If you have federal tax withheld from benefits, a higher benefit can change
          how much you owe. Retirees 65+ may also qualify for the new{" "}
          <Link href="/senior-deduction-calculator/">$6,000 senior deduction</Link>.
        </li>
        <li>
          <strong>Budget on the net, not the gross.</strong> Rent, groceries and bills are paid from the deposit, so use the
          after-Part-B number when planning 2027.
        </li>
        <li>
          <strong>Keep the COLA in perspective.</strong> It tracks a past price index, so your own costs — especially health care
          — may rise faster or slower than {COLA_2027_PERCENT}%.
        </li>
      </ul>
    </ToolLayout>
  );
}
