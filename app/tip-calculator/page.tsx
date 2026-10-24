import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import TipCalculator from "./TipCalculator";
import { calcTip, usd } from "@/lib/calc";

const SLUG = "tip-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Tip Calculator: Split the Bill & Tip Per Person",
  description:
    "Calculate the tip and split the bill per person, with one-tap tip amounts, rounding and a quick US tipping guide.",
  path: `/${SLUG}/`,
  keywords: ["tip calculator", "bill split calculator", "how much to tip", "20 percent tip", "split the check"],
});

const faqs: FaqItem[] = [
  {
    question: "How much should I tip at a restaurant in the US?",
    answer:
      "For sit-down service, 15–20% of the pre-tax bill is the common range, with 18–20% typical for good service. Many people tip more for excellent service or small checks.",
  },
  {
    question: "Should I tip on the total before or after tax?",
    answer:
      "Etiquette guides usually say the pre-tax amount, but tipping on the total is common and simpler. Enter whichever amount you prefer as the bill.",
  },
  {
    question: "How do I quickly work out 20%?",
    answer: "Move the decimal point one place left to get 10%, then double it. On an $86.40 bill: 10% is $8.64, so 20% is $17.28.",
  },
  {
    question: "What does “round up each share” do?",
    answer:
      "It rounds every person's share up to the next whole dollar — handy when paying cash or splitting with an app. The few extra cents go to the tip, and the calculator shows the real tip percentage that results.",
  },
];

const EX = calcTip({ bill: 86.4, tipPercent: 20, people: 3, roundUp: false });
const ANSWER = `A 20% tip on an $86.40 bill is ${usd(EX.tip)}, making the total ${usd(EX.total)} — ${usd(EX.perPerson)} each for three people. Quick trick: move the decimal one place left (10%) and double it.`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Tip Calculator"
      answer={ANSWER}
      intro="Work out the tip and split the bill in seconds — with quick-pick percentages and optional rounding."
      calculator={<TipCalculator />}
      faqs={faqs}
      finance={false}
    >
      <h2>How the tip is calculated</h2>
      <p>
        <code>Tip = bill × tip % ÷ 100</code> and <code>total = bill + tip</code>. When you split the bill, the total is divided
        evenly: <code>each share = total ÷ number of people</code>. With rounding on, each share is rounded up to a whole dollar and
        the tip grows by the difference.
      </p>

      <h2>A quick tipping guide</h2>
      <ul>
        <li>
          <strong>Sit-down restaurants:</strong> 15–20%, often 18–20% for good service.
        </li>
        <li>
          <strong>Bars:</strong> $1–2 per drink, or 15–20% of the tab.
        </li>
        <li>
          <strong>Food delivery:</strong> 15–20%, with a few dollars minimum on small orders.
        </li>
        <li>
          <strong>Hair and beauty:</strong> 15–20% of the service price.
        </li>
        <li>
          <strong>Counter service:</strong> optional; many people leave 10% or round up.
        </li>
      </ul>
      <p>Tipping customs vary by country and change over time — when traveling, check local norms.</p>
    </ToolLayout>
  );
}
