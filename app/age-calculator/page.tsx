import type { Metadata } from "next";
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
    question: "Is my birth date stored anywhere?",
    answer:
      "No. Everything is calculated in your browser. If you come back on the same device we remember your last entry locally so you don't have to retype it — use “Start fresh” to clear it.",
  },
];

const EX = calcAge(parseDate("1995-06-15")!, parseDate("2026-10-24")!)!;
const ANSWER = `Count the full years since your last birthday, then the months and days after it. Someone born on June 15, 1995 is ${EX.years} years, ${EX.months} months and ${EX.days} days old on October 24, 2026.`;

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

      <h2>When exact age matters</h2>
      <ul>
        <li>Eligibility rules — school entry, retirement accounts, Medicare at 65, Social Security claiming ages.</li>
        <li>Insurance quotes and medical forms that ask for age on a specific date.</li>
        <li>Planning milestone birthdays or anniversaries (try your 10,000-day birthday!).</li>
      </ul>
    </ToolLayout>
  );
}
