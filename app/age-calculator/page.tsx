import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import AgeCalculator from "./AgeCalculator";
import { calcAge, parseDate } from "@/lib/calc";

const SLUG = "age-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Age Calculator: Exact Age in Years, Months & Days",
  description:
    "Get your exact age in years, months and days, total days lived, the weekday you were born and a countdown to your next birthday.",
  path: `/${SLUG}/`,
  keywords: ["age calculator", "how old am i", "exact age calculator", "days until my birthday", "age in days"],
});

const faqs: FaqItem[] = [
  {
    question: "How is exact age calculated?",
    answer:
      "Count the full years since your birth date, then the full months since your last birthday, then the remaining days. If the day of the month hasn't arrived yet, borrow a month and add the number of days in the previous month.",
  },
  {
    question: "What if I was born on February 29?",
    answer:
      "In years without a February 29, the calculator counts your birthday as February 28, which is the most common convention. Your legal birthday may depend on your state or country.",
  },
  {
    question: "Can I calculate age on a past or future date?",
    answer:
      "Yes. Change “Age on this date” to any date — useful for forms, eligibility checks or working out how old someone will be at an event.",
  },
  {
    question: "How many days old am I?",
    answer:
      "Enter your birth date and the calculator shows total days lived, counting every leap day. For example, someone born on June 15, 1995 is 11,454 days old on October 24, 2026.",
  },
  {
    question: "Is my birth date stored anywhere?",
    answer:
      "No. Everything is calculated in your browser. If you come back on the same device we remember your last entry locally so you don't have to retype it — use “Start fresh” to clear it.",
  },
];

const EX = calcAge(parseDate("1995-06-15")!, parseDate("2026-10-24")!)!;
const ANSWER = `Count the full years since your last birthday, then the months and days after it. Someone born on June 15, 1995 is ${EX.years} years, ${EX.months} months and ${EX.days} days old on October 24, 2026.`;

// Edge cases worked out with the same calcAge() the tool uses
const EX_MONTH_END = calcAge(parseDate("2006-01-31")!, parseDate("2026-03-01")!)!;
const EX_LEAP = calcAge(parseDate("2000-02-29")!, parseDate("2026-10-25")!)!;

const fmt = (n: number) => n.toLocaleString("en-US");

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Age Calculator"
      answer={ANSWER}
      intro="Your exact age in years, months and days — plus how many days until your next birthday."
      calculator={<AgeCalculator />}
      faqs={faqs}
      finance={false}
      sources={[
        { label: "Social Security Administration — Full retirement age and benefit reduction", url: "https://www.ssa.gov/benefits/retirement/planner/agereduction.html" },
        { label: "Medicare.gov — Get started with Medicare", url: "https://www.medicare.gov/basics/get-started-with-medicare" },
        {
          label: "IRS — Retirement topics: Exceptions to tax on early distributions",
          url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions",
        },
      ]}
    >
      <h2>How age is calculated</h2>
      <p>
        The calculator compares your date of birth with the date you choose (today by default). It counts complete years first,
        then complete months since your last birthday, then the days left over. When the current day of the month is earlier than
        your birth day, it borrows the length of the previous month — the same way you&apos;d count on a calendar.
      </p>
      <p>
        Total days are counted exactly, including leap years. Total weeks are total days divided by seven, and total months are
        your years times twelve plus the extra months.
      </p>
      <p>
        Put simply: <code>age = full years + full months since the last birthday + leftover days</code>. Subtracting birth years
        alone (2026 − 1995 = 31) is right only once this year&apos;s birthday has passed; before that, you are one year younger.
      </p>

      <h2>Worked example</h2>
      <p>Take a birth date of June 15, 1995, and an “age on” date of October 24, 2026:</p>
      <ul>
        <li>
          <strong>Full years:</strong> the 31st birthday was June 15, 2026, so the person is {EX.years}.
        </li>
        <li>
          <strong>Full months:</strong> from June 15 to October 15 is {EX.months} months.
        </li>
        <li>
          <strong>Days:</strong> October 15 to October 24 is {EX.days} days.
        </li>
        <li>
          <strong>Totals:</strong> {fmt(EX.totalDays)} days lived, or {fmt(EX.totalWeeks)} full weeks and {EX.totalMonths} full
          months. They were born on a {EX.bornWeekday}, and their next birthday (age {EX.nextAge}) is {EX.daysToBirthday} days away.
        </li>
      </ul>

      <h2>Tricky dates, handled</h2>
      <h3>Birthdays at the end of a month</h3>
      <p>
        Months have different lengths, so “one month after January 31” has no exact match in February. The calculator uses the last
        day of the shorter month instead. Someone born January 31, 2006 is {EX_MONTH_END.years} years, {EX_MONTH_END.months} month
        and {EX_MONTH_END.days} day old on March 1, 2026: their month mark fell on February 28, and March 1 is one day later.
      </p>
      <h3>Leap-day birthdays</h3>
      <p>
        A person born February 29, 2000 is {EX_LEAP.years} years, {EX_LEAP.months} months and {EX_LEAP.days} days old on October
        25, 2026. Their next birthday is shown as February 28, 2027, because 2027 is not a leap year. Laws on when a leap-day baby
        legally turns a new age vary, so check with the agency involved if it matters for a deadline.
      </p>

      <h2>When exact age matters</h2>
      <ul>
        <li>
          <strong>Medicare:</strong> most people become eligible at 65, and the initial enrollment window opens three months before
          the month you turn 65.
        </li>
        <li>
          <strong>Social Security:</strong> full retirement age is 67 for anyone born in 1960 or later. You can claim as early as 62
          with a permanent reduction, or delay up to 70 for a larger benefit.
        </li>
        <li>
          <strong>Retirement accounts:</strong> withdrawals from IRAs and 401(k)s before age 59½ usually carry a 10% additional
          tax unless an exception applies — and “½” means you need the exact months, not just the year.
        </li>
        <li>School entry cut-off dates, insurance quotes and medical forms that ask for age on a specific date.</li>
        <li>Planning milestone birthdays or anniversaries (try your 10,000-day birthday!).</li>
      </ul>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Subtracting years only.</strong> This overstates your age by one for every day before your birthday each year.
        </li>
        <li>
          <strong>Assuming every month is 30 days.</strong> Over decades this drifts by weeks. The calculator counts the real
          calendar.
        </li>
        <li>
          <strong>Forgetting leap days in day counts.</strong> A 31-year span includes seven or eight February 29ths; skipping them
          makes “days lived” wrong.
        </li>
        <li>
          <strong>Mixing up “age on” and “age at the end of the year.”</strong> Some forms want your age on December 31 or on a
          policy date — set the “Age on this date” field to match.
        </li>
      </ul>

      <h2>Practical tips</h2>
      <ul>
        <li>
          <strong>Check a future date.</strong> Set “Age on this date” to a deadline — a school cut-off, an enrollment window or a
          trip — to see exactly how old you or your child will be then.
        </li>
        <li>
          <strong>Plan around milestones.</strong> The birthday countdown makes it easy to put Medicare enrollment, a Social
          Security decision or a retirement-account birthday on your calendar months ahead.
        </li>
        <li>
          <strong>Use total days for fun goals.</strong> Your 10,000th day falls a little after age 27; the calculator shows how close
          you are.
        </li>
      </ul>

      <h2>When this calculator doesn&apos;t apply</h2>
      <p>
        This is calendar age, which is what US forms and agencies use. It is not biological or “health” age, and it doesn&apos;t
        handle age systems used in some other cultures (for example, counting a newborn as one year old). Government programs can
        also apply their own rules — the Social Security Administration, for instance, treats you as reaching an age on the day
        before your birthday — so confirm the exact date with the agency for any benefit or legal deadline.
      </p>

      <h2>Related calculators</h2>
      <p>
        Once you know how many years you have until retirement, the <Link href="/compound-interest-calculator/">compound interest
        calculator</Link> shows how much your savings could grow in that time. The{" "}
        <Link href="/paycheck-calculator/">paycheck calculator</Link> helps you see what you can set aside from each check, and the{" "}
        <Link href="/percentage-calculator/">percentage calculator</Link> handles any quick percent question along the way.
      </p>
    </ToolLayout>
  );
}
