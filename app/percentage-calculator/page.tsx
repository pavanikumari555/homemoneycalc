import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import PercentageCalculator from "./PercentageCalculator";

const SLUG = "percentage-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Percentage Calculator: %, Change, Increase & Off",
  description:
    "Work out X% of Y, percent change, percent increase or decrease and discounts instantly, with the formula shown for each.",
  path: `/${SLUG}/`,
  keywords: [
    "percentage calculator",
    "percent calculator",
    "percentage change calculator",
    "percentage increase calculator",
    "what percent is",
  ],
});

const faqs: FaqItem[] = [
  {
    question: "How do I calculate a percentage of a number?",
    answer:
      "Divide the percentage by 100 and multiply by the number. For example, 20% of 150 is (20 ÷ 100) × 150 = 0.20 × 150 = 30. The first tool above does this instantly — just enter the percentage and the number.",
  },
  {
    question: "How do I find what percent one number is of another?",
    answer:
      "Divide the part by the whole and multiply by 100. For example, 30 out of 150 is (30 ÷ 150) × 100 = 20%. This is useful for things like working out a score, a discount, or what share of a total something represents.",
  },
  {
    question: "How is percentage change calculated?",
    answer:
      "Subtract the old value from the new value, divide by the old value, and multiply by 100. For example, going from 100 to 125 is ((125 − 100) ÷ 100) × 100 = +25%. A positive result is an increase and a negative result is a decrease.",
  },
  {
    question: "What is the difference between percentage change and percentage points?",
    answer:
      "They're often confused. If an interest rate rises from 4% to 5%, that's an increase of 1 percentage point, but a 25% percentage change (because 1 is 25% of 4). Percentage points measure the absolute gap between two percentages; percentage change measures the relative difference.",
  },
];

const ANSWER = "To find X% of a number, multiply the number by X and divide by 100: 20% of 150 is 150 × 20 ÷ 100 = 30. Percentage change is (new − old) ÷ old × 100.";

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Percentage Calculator"
      answer={ANSWER}
      intro="Every common percentage question in one place, with the working shown so you can check it."
      calculator={<PercentageCalculator />}
      faqs={faqs}
      finance={false}
    >
      <h2>How to work out percentages</h2>
      <p>
        A percentage is simply a number expressed as a fraction of 100. The word literally
        means &quot;per hundred.&quot; Once you know that, every percentage problem becomes one of
        three simple patterns. The calculator above covers those three plus increasing or decreasing a number by a percent.
      </p>

      <h3>1. Finding a percent of a number</h3>
      <p>
        To find X% of Y, convert the percent to a decimal (divide by 100) and multiply.
        This is how you calculate a tip, a discount, or a tax. For instance, a 15% tip on a
        $60 bill is 0.15 × 60 = $9.
      </p>

      <h3>2. Finding what percent one number is of another</h3>
      <p>
        To find what percent A is of B, divide A by B and multiply by 100. This answers
        questions like &quot;I scored 42 out of 50 — what percent is that?&quot; (42 ÷ 50 × 100 = 84%).
      </p>

      <h3>3. Finding a percentage increase or decrease</h3>
      <p>
        To find the percentage change between two values, take the difference, divide by the
        original value, and multiply by 100. This is the go-to calculation for price changes,
        growth rates, and comparing before-and-after figures.
      </p>

      <h2>Everyday uses</h2>
      <ul>
        <li>Calculating sale discounts and final prices.</li>
        <li>Working out tips and splitting bills.</li>
        <li>Understanding interest rates and returns.</li>
        <li>Comparing statistics, scores, and growth figures.</li>
      </ul>
    </ToolLayout>
  );
}
