import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import CreditCardCalculator from "./CreditCardCalculator";

const SLUG = "credit-card-payoff-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Credit Card Payoff Calculator: Debt-Free Date",
  description:
    "Find out how long it takes to pay off a credit card, what minimum payments really cost, and the payment that clears it by your goal date.",
  path: `/${SLUG}/`,
  keywords: ["credit card payoff calculator", "credit card interest calculator", "how long to pay off credit card", "credit card minimum payment calculator"],
});

const faqs: FaqItem[] = [
  {
    question: "How is credit card interest calculated?",
    answer:
      "Most cards charge interest daily using your APR divided by 365, applied to your average daily balance, and add it to your bill once a month. This calculator uses the simpler monthly rate (APR ÷ 12), which gives a very close estimate for planning.",
  },
  {
    question: "Why does paying the minimum take so long?",
    answer:
      "Minimum payments are mostly interest plus a small slice of the balance (often 1%). As the balance falls, the minimum falls too, so you pay down the principal very slowly. Your statement is required by law to show how long minimum-only payments would take.",
  },
  {
    question: "What payment do I need to be debt-free in a year?",
    answer:
      "Switch the calculator to “What to pay”, set 12 months, and it will show the fixed monthly payment that clears the balance, including interest, in exactly that time.",
  },
  {
    question: "Does a balance transfer help?",
    answer:
      "It can, if the promotional rate is low and you can clear the balance before it ends. Most transfers charge a fee of 3–5% of the amount moved. Run the numbers at the new rate (plus the fee added to the balance) and compare with your current card.",
  },
  {
    question: "I have several cards. Which should I pay first?",
    answer:
      "Pay the minimum on all of them, then put every extra dollar on one card: either the highest rate (avalanche, cheapest) or the smallest balance (snowball, quickest wins). Our debt payoff calculator compares both for all your debts at once.",
  },
];

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Credit Card Payoff Calculator"
      intro="See your payoff date and total interest — or the exact payment you need to be card-debt-free by a goal date."
      calculator={<CreditCardCalculator />}
      faqs={faqs}
      sources={[
        { label: "CFPB — How is my credit card interest calculated?", url: "https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/" },
        { label: "Federal Reserve — Consumer credit (G.19), average credit card rates", url: "https://www.federalreserve.gov/releases/g19/current/" },
      ]}
    >
      <h2>How credit card payoff works</h2>
      <p>
        Each month your card adds interest to the balance, then your payment is applied. Only the part of your payment above that
        month&apos;s interest actually reduces what you owe. With a 22.9% APR, a $6,000 balance gathers about $115 of interest in the
        first month — so a $150 payment only knocks about $35 off the balance.
      </p>
      <p>
        The calculator runs that process month by month until the balance hits zero. In &ldquo;What to pay&rdquo; mode it works
        backwards using the loan payment formula <code>M = B × r / (1 − (1 + r)^−n)</code>, where <strong>B</strong> is the
        balance, <strong>r</strong> is APR ÷ 12 and <strong>n</strong> is the number of months.
      </p>

      <h2>Why the minimum payment trap is expensive</h2>
      <p>
        Issuers typically set the minimum at around 1% of the balance plus that month&apos;s interest (with a floor such as $25).
        Because it shrinks as your balance shrinks, minimum-only repayment can stretch a few thousand dollars over a decade or more.
        A fixed payment — even one only a little above the first minimum — cuts that time dramatically.
      </p>

      <h2>Ways to pay it off faster</h2>
      <ul>
        <li>Pay a fixed amount every month instead of the shrinking minimum.</li>
        <li>Ask your issuer for a lower APR — a short phone call sometimes works.</li>
        <li>Stop adding new purchases to the card while you pay it down.</li>
        <li>
          Juggling several cards? Use the <Link href="/debt-payoff-calculator/">debt snowball vs avalanche calculator</Link>.
        </li>
      </ul>
    </ToolLayout>
  );
}
