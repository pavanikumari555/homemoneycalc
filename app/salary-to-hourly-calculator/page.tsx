import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import SalaryCalculator from "./SalaryCalculator";

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
];

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Salary to Hourly Calculator"
      intro="Turn a yearly salary into an hourly wage — or the other way round — with weekly, biweekly and monthly pay included."
      calculator={<SalaryCalculator />}
      faqs={faqs}
      sources={[
        { label: "U.S. Department of Labor — Overtime pay (FLSA)", url: "https://www.dol.gov/agencies/whd/overtime" },
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

      <h2>Quick reference (40 hours a week, 52 weeks)</h2>
      <ul>
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
    </ToolLayout>
  );
}
