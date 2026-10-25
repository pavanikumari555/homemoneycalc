import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import { usd, usd0 } from "@/lib/calc";
import { calcOvertime } from "@/lib/tools/overtime-calculator";
import OvertimeCalculator from "./OvertimeCalculator";

const SLUG = "overtime-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Overtime Calculator: Time and a Half Pay, After Tax",
  description:
    "Work out overtime pay at time and a half or double time: weekly and yearly overtime, gross pay, and a rough after-tax figure for your state.",
  path: `/${SLUG}/`,
  keywords: ["overtime calculator", "time and a half calculator", "overtime calculator after taxes", "overtime pay calculator", "double time calculator"],
});

// Worked examples — computed by the same function the calculator uses
const EX = calcOvertime({ hourlyRate: 22, hoursPerWeek: 48, multiplier: 1.5, weeks: 52, status: "single", stateCode: "TX" });
const EX_CA = calcOvertime({ hourlyRate: 22, hoursPerWeek: 48, multiplier: 1.5, weeks: 52, status: "single", stateCode: "CA" });
const EX_DOUBLE = calcOvertime({ hourlyRate: 22, hoursPerWeek: 48, multiplier: 2, weeks: 52, status: "single", stateCode: "TX" });
const EX_SALARY = calcOvertime({ hourlyRate: 900 / 40, hoursPerWeek: 46, multiplier: 1.5, weeks: 1 });

const ANSWER = `At $22 an hour, 48 hours in a week means 8 overtime hours at ${usd(EX.overtimeRate)} (time and a half): ${usd(EX.overtimePay)} of overtime and ${usd(EX.weeklyGross)} gross for the week. Over 52 weeks that's ${usd0(EX.annualOvertime)} of overtime a year.`;

const faqs: FaqItem[] = [
  {
    question: "How do you calculate time and a half?",
    answer:
      "Multiply your regular hourly rate by 1.5 to get the overtime rate, then multiply by the hours you worked over 40 in the workweek. At $22 an hour, time and a half is $33, so 8 overtime hours pay $264.",
  },
  {
    question: "Is overtime calculated daily or weekly?",
    answer:
      "Under federal law it's weekly: hours over 40 in a fixed workweek. Hours can't be averaged across two weeks. A few states also require daily overtime — California, for example, after 8 hours in a day — so check your state's labor department.",
  },
  {
    question: "Is overtime taxed more than regular pay?",
    answer:
      "No. Overtime is taxed at the same rates as the rest of your wages. It can feel taxed more because a bigger paycheck can push more income into a higher bracket, or because withholding tables treat that check as if you earned that much all year. Any over-withholding comes back when you file.",
  },
  {
    question: "Do salaried employees get overtime?",
    answer:
      "Only if they are non-exempt. Many salaried workers are exempt under the FLSA's executive, administrative or professional rules and get no overtime. For a non-exempt salaried employee, the regular rate is the weekly salary divided by the hours it is meant to cover.",
  },
  {
    question: "Is overtime pay tax-free now?",
    answer:
      "Not entirely. For tax years 2025–2028, you can deduct the premium part of FLSA overtime (the extra half) up to $12,500, or $25,000 on a joint return, with a phase-out above $150,000 / $300,000 of income. Social Security and Medicare still apply.",
  },
];

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Overtime Pay Calculator"
      answer={ANSWER}
      intro="Find your overtime rate, weekly and yearly overtime pay, and roughly how much of it you keep after tax."
      calculator={<OvertimeCalculator />}
      faqs={faqs}
      sources={[
        { label: "U.S. Department of Labor — Overtime pay", url: "https://www.dol.gov/agencies/whd/overtime" },
        { label: "U.S. Department of Labor — Handy Reference Guide to the FLSA", url: "https://www.dol.gov/agencies/whd/compliance-assistance/handy-reference-guide-flsa" },
        { label: "U.S. Department of Labor — FLSA overtime calculator advisor", url: "https://webapps.dol.gov/elaws/otcalculator.htm" },
        { label: "IRS — Tax inflation adjustments for tax year 2026", url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" },
        { label: "IRS — Working Families Tax Cuts: no tax on overtime", url: "https://www.irs.gov/newsroom/working-families-tax-cuts-individuals-and-workers" },
      ]}
    >
      <h2>The federal overtime rule</h2>
      <p>
        The Fair Labor Standards Act (FLSA) says covered, non-exempt employees must be paid at least <strong>one and a half times their
        regular rate</strong> for every hour worked <strong>over 40 in a workweek</strong>. A workweek is any fixed, recurring 168-hour
        period your employer sets — it doesn&apos;t have to start on Monday — and hours can&apos;t be averaged across two weeks. Federal law
        doesn&apos;t require extra pay for weekends, holidays or nights unless those hours push you past 40.
      </p>

      <h2>How the calculator works</h2>
      <ol>
        <li>
          <strong>Regular hours</strong> = the first 40 hours of the week. <strong>Overtime hours</strong> = anything above 40.
        </li>
        <li>
          <strong>Overtime rate</strong> = regular rate × 1.5 (or × 2 if your employer or state pays double time).
        </li>
        <li>
          <strong>Weekly pay</strong> = regular rate × regular hours + overtime rate × overtime hours. Multiply by the weeks you work that
          schedule to get a yearly figure.
        </li>
        <li>
          <strong>After-tax estimate:</strong> we run our paycheck engine twice — once on your pay with overtime, once without — using 2026
          federal brackets, the standard deduction, Social Security, Medicare and your state&apos;s tax. The difference is the overtime you
          actually keep. It assumes no 401(k) or other deductions.
        </li>
      </ol>

      <h2>Worked examples</h2>
      <p>
        <strong>Hourly worker:</strong> you earn $22 an hour and work 48 hours. The first 40 hours pay {usd(EX.regularPay)}. The overtime rate
        is $22 × 1.5 = {usd(EX.overtimeRate)}, so 8 overtime hours pay {usd(EX.overtimePay)}. Your week totals{" "}
        <strong>{usd(EX.weeklyGross)}</strong>. If you do that every week for a year, overtime adds <strong>{usd0(EX.annualOvertime)}</strong>{" "}
        to a gross income of {usd0(EX.annualGross)}. For a single filer in Texas, which has no state income tax, you&apos;d keep about{" "}
        {usd0(EX.overtimeTakeHomeAnnual)} of that overtime ({Math.round(EX.overtimeKeptPercent)}%). In California it&apos;s about{" "}
        {usd0(EX_CA.overtimeTakeHomeAnnual)} ({Math.round(EX_CA.overtimeKeptPercent)}%).
      </p>
      <p>
        <strong>Double time:</strong> at 2× the same 8 hours pay {usd(EX_DOUBLE.overtimePay)} a week instead of {usd(EX.overtimePay)}.
      </p>
      <p>
        <strong>Non-exempt salaried worker:</strong> a $900 weekly salary meant to cover 40 hours gives a regular rate of{" "}
        {usd(EX_SALARY.regularPay / 40)}. Working 46 hours adds 6 overtime hours at {usd(EX_SALARY.overtimeRate)} ={" "}
        <strong>{usd(EX_SALARY.overtimePay)}</strong>. Enter {usd(EX_SALARY.regularPay / 40)} as the hourly rate to get the same result.
      </p>

      <h2>What counts toward your regular rate</h2>
      <p>
        Your regular rate isn&apos;t always just your base wage. Under the FLSA it includes most pay for work: shift differentials, many
        non-discretionary bonuses (such as attendance or production bonuses) and commissions. Some payments are excluded, such as
        discretionary gifts, expense reimbursements and pay for time not worked like vacation. If you earn extra pay on top of your hourly
        wage, your true overtime rate may be higher than base pay × 1.5. The DOL&apos;s overtime calculator advisor walks through those cases.
      </p>

      <h2>Who gets overtime — and who doesn&apos;t</h2>
      <ul>
        <li>
          <strong>Usually covered:</strong> most hourly employees, and salaried employees who don&apos;t meet an exemption test.
        </li>
        <li>
          <strong>Often exempt:</strong> salaried executive, administrative and professional employees who meet the DOL&apos;s salary and
          duties tests, plus some outside sales and computer roles. Independent contractors aren&apos;t employees, so the FLSA doesn&apos;t
          apply.
        </li>
        <li>
          <strong>Special rules:</strong> some public safety workers, hospitals and nursing homes may use different work periods. Many states
          also have their own overtime laws; when state and federal law differ, you get the more generous rule.
        </li>
      </ul>

      <h2>Practical tips</h2>
      <ul>
        <li>
          <strong>Check your pay stub</strong> for overtime hours and rate each week. Mistakes are easier to fix quickly.
        </li>
        <li>
          <strong>A big overtime check may be over-withheld.</strong> Payroll withholding treats each paycheck as if it repeats all year.
          Your real tax is settled on your return.
        </li>
        <li>
          <strong>Know your real overtime wage.</strong> In the Texas example, each overtime hour pays {usd(EX.overtimeRate)} before tax but
          about {usd(EX.overtimeTakeHomeAnnual / (EX.overtimeHours * 52))} after federal tax, Social Security and Medicare. That after-tax
          number is the fair one to weigh against the time — and against costs like extra childcare or commuting that a longer week can
          bring.
        </li>
        <li>
          <strong>Track the premium.</strong> For tax years 2025–2028, the “half” part of FLSA overtime ({usd0(EX.annualPremium)} a year in
          the example above) may be deductible. Estimate it with the{" "}
          <Link href="/no-tax-on-overtime-calculator/">no tax on overtime calculator</Link>, or see your full take-home with the{" "}
          <Link href="/paycheck-calculator/">paycheck calculator</Link>.
        </li>
      </ul>
    </ToolLayout>
  );
}
