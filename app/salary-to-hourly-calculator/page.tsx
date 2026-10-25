import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import SalaryCalculator from "./SalaryCalculator";
import { calcSalary, usd } from "@/lib/calc";

const SLUG = "salary-to-hourly-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Salary to Hourly Calculator (+ Hourly to Salary)",
  description:
    "Convert annual salary to hourly pay or hourly to salary, with weekly, biweekly and monthly amounts. Handles part-time hours and overtime.",
  path: `/${SLUG}/`,
  keywords: ["salary to hourly", "hourly to salary", "salary converter", "how much is my salary per hour", "annual salary calculator"],
});

const faqs: FaqItem[] = [
  {
    question: "How do I convert a salary to an hourly rate?",
    answer:
      "Divide the annual salary by the hours you work in a year. For a standard full-time job that's 40 hours × 52 weeks = 2,080 hours. So a $65,000 salary is $65,000 ÷ 2,080 = $31.25 an hour.",
  },
  {
    question: "How do I convert an hourly wage to a yearly salary?",
    answer:
      "Multiply the hourly wage by hours per week, then by paid weeks per year. $25 an hour × 40 hours × 52 weeks = $52,000 a year. A quick shortcut for full-time work: double the hourly rate and add three zeros ($25 → about $50,000).",
  },
  {
    question: "Should I use 52 weeks or fewer?",
    answer:
      "Use 52 if your vacation and holidays are paid — you get paid every week of the year. If you take unpaid time off (common for hourly or contract work), subtract those weeks, e.g. 50 weeks for two unpaid weeks.",
  },
  {
    question: "What's the difference between biweekly and semimonthly pay?",
    answer:
      "Biweekly means every two weeks — 26 paychecks a year, so two months each year have three paydays. Semimonthly means twice a month, usually the 1st and 15th — 24 paychecks a year, each slightly larger than a biweekly check.",
  },
  {
    question: "How is overtime calculated?",
    answer:
      "Under the federal Fair Labor Standards Act, non-exempt employees earn at least 1.5 times their regular rate for hours over 40 in a workweek. Some states, such as California, also require overtime after 8 hours in a day.",
  },
  {
    question: "How much is minimum wage per year?",
    answer:
      "At the $7.25 federal minimum wage, 40 hours a week for 52 weeks is $15,080 a year before taxes. Many states and cities set a higher minimum, and the higher rate applies where it does.",
  },
];

const ANSWER = `$50,000 a year is ${usd(calcSalary({ mode: "salary", amount: 50_000, hoursPerWeek: 40, weeksPerYear: 52, overtimeHoursPerWeek: 0 }).hourly)} an hour for a full-time job (40 hours × 52 weeks = 2,080 hours). Divide the salary by your yearly hours.`;

// Worked examples — all from the same calcSalary() the tool runs
const S40 = calcSalary({ mode: "salary", amount: 65_000, hoursPerWeek: 40, weeksPerYear: 52, overtimeHoursPerWeek: 0 });
const S45 = calcSalary({ mode: "salary", amount: 65_000, hoursPerWeek: 45, weeksPerYear: 52, overtimeHoursPerWeek: 0 });
const H_OT = calcSalary({ mode: "hourly", amount: 25, hoursPerWeek: 40, weeksPerYear: 52, overtimeHoursPerWeek: 5 });
const H_50 = calcSalary({ mode: "hourly", amount: 25, hoursPerWeek: 40, weeksPerYear: 50, overtimeHoursPerWeek: 0 });

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Salary to Hourly Calculator"
      answer={ANSWER}
      intro="Turn a yearly salary into an hourly wage — or the other way round — with weekly, biweekly and monthly pay included."
      calculator={<SalaryCalculator />}
      faqs={faqs}
      sources={[
        { label: "U.S. Department of Labor — Overtime pay (FLSA)", url: "https://www.dol.gov/agencies/whd/overtime" },
        { label: "U.S. Department of Labor — Minimum wage", url: "https://www.dol.gov/agencies/whd/minimum-wage" },
        {
          label: "U.S. Office of Personnel Management — Computing hourly rates using the 2,087-hour divisor",
          url: "https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/computing-hourly-rates-of-pay-using-the-2087-hour-divisor/",
        },
        { label: "U.S. Bureau of Labor Statistics — Average hours and earnings", url: "https://www.bls.gov/ces/" },
      ]}
    >
      <h2>How the conversion works</h2>
      <p>
        Everything comes down to how many hours you&apos;re paid for in a year: <code>hours per week × paid weeks per year</code>.
        A full-time schedule of 40 hours for 52 weeks is <strong>2,080 hours</strong>.
      </p>
      <ul>
        <li>
          <strong>Salary → hourly:</strong> <code>annual salary ÷ yearly hours</code>
        </li>
        <li>
          <strong>Hourly → salary:</strong> <code>hourly wage × hours per week × weeks per year</code>, plus overtime at 1.5×
        </li>
      </ul>
      <p>
        The other amounts follow from the yearly total: weekly pay is the annual figure ÷ weeks worked, biweekly is annual ÷ 26,
        semimonthly is annual ÷ 24 and monthly is annual ÷ 12. Daily pay assumes a five-day week.
      </p>

      <h2>Worked examples</h2>
      <h3>A $65,000 salary</h3>
      <p>
        At 40 hours a week for 52 weeks, $65,000 ÷ 2,080 = <strong>{usd(S40.hourly)} an hour</strong>. That&apos;s{" "}
        {usd(S40.weekly)} a week, {usd(S40.biweekly)} every two weeks and {usd(S40.monthly)} a month before taxes.
      </p>
      <p>
        Now say the job really takes 45 hours a week with no overtime pay, which is common for salaried, exempt roles. The same
        $65,000 ÷ (45 × 52 = 2,340 hours) works out to just <strong>{usd(S45.hourly)} an hour</strong> — about $3.47 less for every
        hour you actually work.
      </p>
      <h3>$25 an hour with overtime</h3>
      <p>
        At $25 an hour for 40 hours, plus 5 overtime hours a week at 1.5× ($37.50), weekly pay is $1,000 + $187.50 ={" "}
        {usd(H_OT.weekly)}. Over 52 weeks that&apos;s <strong>{usd(H_OT.annual)} a year</strong>. Without the overtime, but taking
        two unpaid weeks off (50 paid weeks), the same $25 rate gives {usd(H_50.annual)}.
      </p>

      <h2>Quick reference (40 hours a week, 52 weeks)</h2>
      <ul>
        <li>$7.25/hour (federal minimum) ≈ $15,080 a year</li>
        <li>$15/hour ≈ $31,200 a year</li>
        <li>$20/hour ≈ $41,600 a year</li>
        <li>$25/hour ≈ $52,000 a year</li>
        <li>$30/hour ≈ $62,400 a year</li>
        <li>$50,000 a year ≈ $24.04/hour</li>
        <li>$75,000 a year ≈ $36.06/hour</li>
        <li>$100,000 a year ≈ $48.08/hour</li>
      </ul>

      <h2>Comparing a salaried job with an hourly one</h2>
      <p>
        A salary and an hourly wage can look equal on paper but differ in practice. Salaried roles often include paid time off and
        benefits but rarely pay overtime; hourly roles pay for every hour (and overtime) but may not pay for holidays. When you
        compare offers, adjust the weeks and hours to match what you&apos;d really work, and remember these are pre-tax numbers.
      </p>
      <p>
        Benefits matter too. Employer health insurance, a 401(k) match or paid leave can be worth thousands of dollars a year, so a
        slightly lower hourly figure on a job with strong benefits can still be the better deal.
      </p>

      <h2>Practical tips</h2>
      <ul>
        <li>
          <strong>Track a normal month first.</strong> Log the hours you actually work for four weeks, including email after hours
          and unpaid breaks you work through, then enter that average.
        </li>
        <li>
          <strong>Part-time work:</strong> enter your real weekly hours. At 25 hours a week, a $20 wage is $20 × 25 × 52 = $26,000 a
          year, not the $41,600 a full-time schedule would give.
        </li>
        <li>
          <strong>Budget from the smallest paycheck.</strong> If you&apos;re paid biweekly, build your monthly budget on two checks;
          the two extra paychecks each year then become savings or a buffer.
        </li>
        <li>
          <strong>Negotiating a raise?</strong> Convert both the current and the proposed pay to the same unit before comparing, so
          a salary offer and an hourly offer are measured on equal terms.
        </li>
      </ul>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Using 40 hours when you work 50.</strong> Your true hourly rate is based on the hours you actually put in.
        </li>
        <li>
          <strong>Counting unpaid weeks.</strong> Contractors and many hourly workers aren&apos;t paid for holidays or vacation —
          lower the weeks per year to match.
        </li>
        <li>
          <strong>Dividing by 4 for monthly pay.</strong> A month averages about 4.33 weeks. Divide the annual figure by 12 instead.
        </li>
        <li>
          <strong>Treating gross as take-home.</strong> Federal and state income tax, Social Security and Medicare come out first.
        </li>
      </ul>

      <h2>When this doesn&apos;t apply</h2>
      <p>
        The conversion assumes steady hours and pay. It won&apos;t fit well for commission or tip-heavy jobs, gig work with
        unpredictable hours, or self-employment, where you also pay both halves of Social Security and Medicare tax. Federal
        employees are a special case too: the government divides annual pay by <strong>2,087 hours</strong> (the average number of
        paid hours in a year, accounting for leap years) rather than 2,080, so their official hourly rate is slightly lower.
      </p>

      <h2>Related calculators</h2>
      <p>
        To see what lands in your bank account, run your salary through the{" "}
        <Link href="/paycheck-calculator/">paycheck calculator</Link>, which estimates federal and state taxes. Comparing a raise?
        The <Link href="/percentage-calculator/">percentage calculator</Link> shows the percent increase between two pay rates.
        And if you plan to invest part of each check, the <Link href="/compound-interest-calculator/">compound interest
        calculator</Link> projects how it could grow.
      </p>
    </ToolLayout>
  );
}
