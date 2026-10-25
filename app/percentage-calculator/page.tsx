import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import PercentageCalculator from "./PercentageCalculator";
import { percentOf, percentChange, whatPercent, usd } from "@/lib/calc";

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
  {
    question: "Why doesn't a 10% raise followed by a 10% cut get me back to where I started?",
    answer:
      "Because the second percentage is taken from a different, larger number. $100 up 10% is $110; $110 down 10% is $99. You end up 1% lower. To undo a 10% increase you need a cut of about 9.09%.",
  },
  {
    question: "How do I calculate a discount and the sale price?",
    answer:
      "Multiply the original price by the discount percent and divide by 100 to get the savings, then subtract it. A $80 item at 25% off saves $20, so you pay $60. Shortcut: pay (100 − discount)% of the price, so 75% of $80 = $60.",
  },
];

const ANSWER = "To find X% of a number, multiply the number by X and divide by 100: 20% of 150 is 150 × 20 ÷ 100 = 30. Percentage change is (new − old) ÷ old × 100.";

// Worked numbers — computed with the same helpers the calculator uses
const TAX = percentOf(8.25, 240); // 19.80
const RAISE = percentChange(52_000, 55_120); // +6%
const SCORE = whatPercent(42, 50); // 84
const DROP = percentChange(125, 100); // -20%

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
        questions like &quot;I scored 42 out of 50 — what percent is that?&quot; (42 ÷ 50 × 100 = {SCORE}%).
      </p>

      <h3>3. Finding a percentage increase or decrease</h3>
      <p>
        To find the percentage change between two values, take the difference, divide by the
        original value, and multiply by 100. This is the go-to calculation for price changes,
        growth rates, and comparing before-and-after figures.
      </p>

      <h2>The formulas at a glance</h2>
      <ul>
        <li>
          <strong>X% of Y:</strong> <code>Y × X ÷ 100</code>
        </li>
        <li>
          <strong>A is what % of B:</strong> <code>A ÷ B × 100</code>
        </li>
        <li>
          <strong>Percent change:</strong> <code>(new − old) ÷ old × 100</code>
        </li>
        <li>
          <strong>Increase Y by X%:</strong> <code>Y × (1 + X ÷ 100)</code>
        </li>
        <li>
          <strong>Decrease Y by X%:</strong> <code>Y × (1 − X ÷ 100)</code>
        </li>
      </ul>
      <p>
        A handy fact: X% of Y always equals Y% of X. So 8% of 50 is the same as 50% of 8, which is 4 — often much easier to do in
        your head.
      </p>

      <h2>Worked examples with real money</h2>
      <ul>
        <li>
          <strong>Sales tax:</strong> a $240 purchase with an 8.25% sales tax adds 240 × 8.25 ÷ 100 = {usd(TAX)}, for a total of{" "}
          {usd(240 + TAX)}.
        </li>
        <li>
          <strong>A raise:</strong> your pay goes from $52,000 to $55,120. The change is (55,120 − 52,000) ÷ 52,000 × 100 ={" "}
          <strong>{RAISE.toFixed(0)}%</strong>.
        </li>
        <li>
          <strong>A price drop:</strong> a monthly bill falls from $125 to $100. That&apos;s (100 − 125) ÷ 125 × 100 ={" "}
          <strong>{DROP.toFixed(0)}%</strong> — a 20% cut, even though going from $100 back up to $125 would be a 25% rise.
        </li>
      </ul>
      <p>
        That last pair shows why the starting value matters so much: the same $25 gap is a different percentage depending on which
        number you divide by.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Dividing by the wrong number.</strong> Percent change always divides by the <em>old</em> (starting) value, not the
          new one.
        </li>
        <li>
          <strong>Adding percentages that stack.</strong> A 20% discount plus an extra 10% off is not 30% off. It&apos;s 20% off,
          then 10% off the lower price: 0.80 × 0.90 = 0.72, or 28% off in total.
        </li>
        <li>
          <strong>Expecting changes to cancel.</strong> Up 50% then down 50% leaves you at 75% of where you began, not 100%.
        </li>
        <li>
          <strong>Mixing up points and percent.</strong> A mortgage rate moving from 6% to 7% is 1 percentage point, but a 16.7%
          increase in the rate.
        </li>
      </ul>

      <h2>Mental-math tips</h2>
      <ul>
        <li>
          <strong>Build from 10% and 1%.</strong> 10% moves the decimal one place; 1% moves it two. So 12% of 300 is 30 + 3 + 3 = 36.
        </li>
        <li>
          <strong>Use fractions you know.</strong> 25% is a quarter, 50% is half, 75% is three-quarters and about 33% is a third.
        </li>
        <li>
          <strong>Find the sale price in one step.</strong> For 30% off, multiply by 0.70; for a 6% raise, multiply by 1.06.
        </li>
        <li>
          <strong>Sanity-check the answer.</strong> A discount should always leave a smaller number, and anything over 100% of a
          number is larger than the number itself.
        </li>
      </ul>

      <h2>Everyday uses</h2>
      <ul>
        <li>Calculating sale discounts and final prices.</li>
        <li>Working out tips and splitting bills.</li>
        <li>Understanding interest rates and returns.</li>
        <li>Comparing statistics, scores, and growth figures.</li>
      </ul>

      <h2>When simple percentages aren&apos;t enough</h2>
      <p>
        Percent change compares two points and ignores what happened in between. For growth that builds on itself year after year —
        savings, investments or loan interest — a single percentage understates the effect, and you need a compounding formula
        instead. Percent change is also undefined when the starting value is zero, and it can mislead when the starting value is
        tiny (going from 1 to 3 is a 200% jump).
      </p>

      <h2>Related calculators</h2>
      <p>
        For restaurant bills, the <Link href="/tip-calculator/">tip calculator</Link> handles the percentage and splits the check.
        To see how a yearly percentage return snowballs over time, use the{" "}
        <Link href="/compound-interest-calculator/">compound interest calculator</Link>. And if you&apos;re weighing a raise, the{" "}
        <Link href="/salary-to-hourly-calculator/">salary to hourly calculator</Link> turns the new salary into an hourly rate.
      </p>
    </ToolLayout>
  );
}
