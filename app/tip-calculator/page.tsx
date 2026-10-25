import type { Metadata } from "next";
import Link from "next/link";
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
  {
    question: "Do I need to tip if the bill already has a service charge?",
    answer:
      "Usually not. Many restaurants add an automatic gratuity (often around 18–20%) for large groups. Check the receipt: if a service charge or gratuity line is already there, extra tipping is optional, not expected.",
  },
  {
    question: "Why are tips such a big deal in the US?",
    answer:
      "Federal law lets employers pay tipped workers a cash wage as low as $2.13 an hour, as long as tips bring them to at least the $7.25 federal minimum wage. Many states set higher rates, but tips still make up a large part of a server's pay.",
  },
];

const EX = calcTip({ bill: 86.4, tipPercent: 20, people: 3, roundUp: false });
const EX18 = calcTip({ bill: 86.4, tipPercent: 18, people: 3, roundUp: false });
const EXR = calcTip({ bill: 86.4, tipPercent: 20, people: 3, roundUp: true });
const EXR_PCT = ((EXR.tip / 86.4) * 100).toFixed(1);
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
      sources={[
        {
          label: "U.S. Department of Labor — Fact Sheet #15: Tipped employees under the FLSA",
          url: "https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa",
        },
        { label: "U.S. Department of Labor — State minimum wages for tipped employees", url: "https://www.dol.gov/agencies/whd/state/minimum-wage/tipped" },
      ]}
    >
      <h2>How the tip is calculated</h2>
      <p>
        <code>Tip = bill × tip % ÷ 100</code> and <code>total = bill + tip</code>. When you split the bill, the total is divided
        evenly: <code>each share = total ÷ number of people</code>. With rounding on, each share is rounded up to a whole dollar and
        the tip grows by the difference.
      </p>
      <p>
        In plain English: turn the percentage into a decimal (20% becomes 0.20), multiply it by the bill, and add the result back
        on. Splitting comes last, so everyone pays the same share of both the food and the tip.
      </p>

      <h2>Worked example: three friends, an $86.40 check</h2>
      <p>Three people share a dinner that comes to $86.40 before the tip. Here is what the calculator gives at two common rates:</p>
      <ul>
        <li>
          <strong>20% tip:</strong> $86.40 × 0.20 = {usd(EX.tip)}. Total {usd(EX.total)}, so {usd(EX.perPerson)} each.
        </li>
        <li>
          <strong>18% tip:</strong> $86.40 × 0.18 = {usd(EX18.tip)}. Total {usd(EX18.total)}, so {usd(EX18.perPerson)} each.
        </li>
        <li>
          <strong>20% with “round up each share” on:</strong> {usd(EX.perPerson)} rounds up to {usd(EXR.perPerson)} each. The
          group pays {usd(EXR.total)}, so the tip becomes {usd(EXR.tip)} — about {EXR_PCT}% of the bill.
        </li>
      </ul>
      <p>
        Rounding up costs each person well under a dollar here, but it makes cash and payment-app splits much easier and the server
        gets a slightly better tip.
      </p>

      <h2>Mental-math shortcuts</h2>
      <ul>
        <li>
          <strong>10%:</strong> move the decimal one place left. $86.40 → $8.64.
        </li>
        <li>
          <strong>20%:</strong> double the 10% figure. $8.64 × 2 = $17.28.
        </li>
        <li>
          <strong>15%:</strong> 10% plus half of it. $8.64 + $4.32 = $12.96.
        </li>
        <li>
          <strong>25%:</strong> divide the bill by four. $86.40 ÷ 4 = $21.60.
        </li>
      </ul>

      <h2>A quick tipping guide</h2>
      <p>These are common US customs, not rules — tipping is always your choice, and norms differ by region and venue.</p>
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

      <h2>Why tips matter to the person serving you</h2>
      <p>
        Under the federal Fair Labor Standards Act, an employer can pay a tipped employee a direct cash wage of just $2.13 an hour
        and count tips toward the rest of the $7.25 federal minimum wage. If tips fall short, the employer must make up the
        difference. Many states set a higher tipped wage, and some require the full state minimum wage before tips. Either way, the
        tip is often a large share of a server&apos;s take-home pay, which is why US tipping norms are higher than in many other
        countries.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Tipping on a discounted total.</strong> If you used a coupon or gift card, the service was the same — many people
          tip on the original, pre-discount price.
        </li>
        <li>
          <strong>Double tipping.</strong> Large-party bills often include an automatic gratuity. Read the receipt before adding a
          tip on top.
        </li>
        <li>
          <strong>Splitting before tipping.</strong> If each person rounds their own share of the food and then tips separately,
          the totals rarely add up. Work out the tip on the whole bill first, then split.
        </li>
        <li>
          <strong>Misreading the tip screen.</strong> Card terminals sometimes calculate suggested percentages on the after-tax
          total. Check the dollar amount, not just the percentage button.
        </li>
      </ul>

      <h2>Practical tips</h2>
      <ul>
        <li>
          <strong>Decide the rate before the check arrives.</strong> Agreeing on 18% or 20% as a group avoids awkward math at the
          table and makes the split fair.
        </li>
        <li>
          <strong>Small checks deserve a floor.</strong> 20% of a $9 breakfast is $1.80; many people leave at least $2–3 because the
          server&apos;s work is similar to a larger order.
        </li>
        <li>
          <strong>Use round-up for cash.</strong> Rounding each share to a whole dollar means nobody needs coins, and the calculator
          shows exactly how much the tip rose.
        </li>
        <li>
          <strong>Keep an eye on budget.</strong> Tips on regular dining and delivery add up over a month. Adding them to your food
          budget gives you a truer picture of what eating out costs.
        </li>
      </ul>

      <h2>When an even split doesn&apos;t fit</h2>
      <p>
        The calculator divides the bill equally. If one person ordered a steak and another a salad, an even split may feel unfair —
        work out each person&apos;s items separately, then apply the same tip percentage to each subtotal. It also doesn&apos;t
        handle a service charge already on the bill or sales tax rules; enter the exact amount you want to tip on.
      </p>

      <h2>Related calculators</h2>
      <p>
        For any other “what is X% of Y” question, use the <Link href="/percentage-calculator/">percentage calculator</Link>. If you
        work for tips and want to see what an hourly wage adds up to over a year, try the{" "}
        <Link href="/salary-to-hourly-calculator/">salary to hourly calculator</Link>, and the{" "}
        <Link href="/paycheck-calculator/">paycheck calculator</Link> estimates take-home pay after taxes.
      </p>
    </ToolLayout>
  );
}
