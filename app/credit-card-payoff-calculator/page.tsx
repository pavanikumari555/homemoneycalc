import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import CreditCardCalculator from "./CreditCardCalculator";
import { calcCreditCard, duration, usd, usd0 } from "@/lib/calc";

const SLUG = "credit-card-payoff-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Credit Card Payoff Calculator: Debt-Free Date",
  description:
    "Find out how long it takes to pay off a credit card, what minimum payments really cost, and the payment that clears it by your goal date.",
  path: `/${SLUG}/`,
  keywords: ["credit card payoff calculator", "credit card interest calculator", "how long to pay off credit card", "credit card minimum payment calculator"],
});

// Worked example numbers — sab isi calculator ke functions se compute hote hain
const card = (monthlyPayment: number) =>
  calcCreditCard({ balance: 6000, aprPercent: 22.9, mode: "payment", monthlyPayment, goalMonths: 24 });
const EX = card(250);
const GOAL24 = calcCreditCard({ balance: 6000, aprPercent: 22.9, mode: "goal", monthlyPayment: 0, goalMonths: 24 });
const GOAL12 = calcCreditCard({ balance: 6000, aprPercent: 22.9, mode: "goal", monthlyPayment: 0, goalMonths: 12 });
const TABLE = [150, 175, 250, 300, 400].map((p) => ({ p, r: card(p).plan }));
const FIRST_INTEREST = (6000 * 0.229) / 12; // $114.50
const FIRST_MIN = FIRST_INTEREST + 6000 * 0.01; // $174.50 (1% + interest)

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
    answer: `Switch the calculator to “What to pay”, set 12 months, and it will show the fixed monthly payment that clears the balance, including interest, in exactly that time. For example, $6,000 at 22.9% APR needs about ${usd0(GOAL12.payment)} a month.`,
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

const ANSWER = `Paying $250 a month on a $6,000 card at 22.9% APR clears it in ${duration(EX.plan.months)} and costs ${usd0(EX.plan.totalInterest)} in interest. Paying only the minimum would take ${duration(EX.minimumPlan.months)}.`;

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Credit Card Payoff Calculator"
      answer={ANSWER}
      intro="See your payoff date and total interest — or the exact payment you need to be card-debt-free by a goal date."
      calculator={<CreditCardCalculator />}
      faqs={faqs}
      sources={[
        { label: "CFPB — How is my credit card interest calculated?", url: "https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/" },
        { label: "CFPB — Regulation Z §1026.7(b)(12), minimum payment warning on statements", url: "https://www.consumerfinance.gov/rules-policy/regulations/1026/7/" },
        { label: "Federal Reserve — Consumer credit (G.19), average credit card rates", url: "https://www.federalreserve.gov/releases/g19/current/" },
      ]}
    >
      <h2>How credit card payoff works</h2>
      <p>
        Each month your card adds interest to the balance, then your payment is applied. Only the part of your payment above that
        month&apos;s interest actually reduces what you owe. With a 22.9% APR, a $6,000 balance gathers about {usd(FIRST_INTEREST)}{" "}
        of interest in the first month (6,000 × 0.229 ÷ 12) — so a $150 payment only knocks about {usd(150 - FIRST_INTEREST)} off the
        balance. Next month the balance is slightly lower, so the interest is slightly lower and a little more of the same payment
        goes to principal. That slow tilt from interest toward principal is why a fixed payment speeds up over time.
      </p>
      <p>
        The calculator runs that process month by month until the balance hits zero. In &ldquo;What to pay&rdquo; mode it works
        backwards using the loan payment formula <code>M = B × r / (1 − (1 + r)^−n)</code>, where <strong>B</strong> is the
        balance, <strong>r</strong> is APR ÷ 12 and <strong>n</strong> is the number of months. In plain English: the payment has to
        cover each month&apos;s interest <em>and</em> retire the balance in exactly n equal payments.
      </p>
      <p>
        One rule falls straight out of this: if your payment is not bigger than the first month&apos;s interest, the balance never
        goes down. On the example card, any payment of {usd(FIRST_INTEREST)} or less means the debt never shrinks, and the
        calculator shows &ldquo;never&rdquo;.
      </p>

      <h2>A worked example: $6,000 at 22.9% APR</h2>
      <p>
        Suppose you owe $6,000 and stop using the card. A common minimum formula is 1% of the balance plus that month&apos;s
        interest, with a $25 floor, so your first minimum is about {usd(FIRST_MIN)}. Paying only the minimum each month — which
        shrinks as the balance shrinks — takes <strong>{duration(EX.minimumPlan.months)}</strong> and costs about{" "}
        <strong>{usd0(EX.minimumPlan.totalInterest)}</strong> in interest, more than the original balance.
      </p>
      <p>
        Now lock in a fixed payment instead. Here is what different fixed amounts do to the same card, computed with this
        page&apos;s calculator:
      </p>
      <table>
        <thead>
          <tr>
            <th>Fixed monthly payment</th>
            <th>Time to pay off</th>
            <th>Total interest</th>
          </tr>
        </thead>
        <tbody>
          {TABLE.map(({ p, r }) => (
            <tr key={p}>
              <td>{usd0(p)}</td>
              <td>{duration(r.months)}</td>
              <td>{usd0(r.totalInterest)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Simply keeping the payment at about the <em>first</em> minimum ($175) and never letting it shrink cuts the payoff time to{" "}
        {duration(TABLE[1].r.months)}. If your goal is to be done in two years, &ldquo;What to pay&rdquo; mode gives a payment of{" "}
        <strong>{usd(GOAL24.payment)}</strong> a month, with about {usd0(GOAL24.plan.totalInterest)} of total interest.
      </p>

      <h2>Why the minimum payment trap is expensive</h2>
      <p>
        Issuers typically set the minimum at around 1% of the balance plus that month&apos;s interest (with a floor such as $25),
        though the exact formula varies by card. Because it shrinks as your balance shrinks, minimum-only repayment can stretch a
        few thousand dollars over a decade or more. A fixed payment — even one only a little above the first minimum — cuts that
        time dramatically.
      </p>
      <p>
        Federal rules (Regulation Z, enforced by the CFPB) require your monthly statement to carry a &ldquo;Minimum Payment
        Warning&rdquo;: how long minimum-only payments would take and what they would cost in total. Unless the minimum already pays
        the balance off within about three years, the statement must also show the monthly payment that clears it in 36 months and
        how much you would save. Compare that box with this calculator — they should be in the same ballpark, and your statement
        uses your issuer&apos;s exact minimum formula.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Letting the payment shrink.</strong> Autopay set to &ldquo;minimum due&rdquo; quietly lowers your payment every
          month. Set autopay to a fixed dollar amount instead.
        </li>
        <li>
          <strong>Paying down the card while still charging on it.</strong> New purchases refill the balance, and on most cards
          carrying a balance means new purchases start collecting interest right away instead of getting a grace period.
        </li>
        <li>
          <strong>Entering the wrong rate.</strong> Use the purchase APR printed on your statement. If part of the balance is a cash
          advance at a higher APR, the real cost will be higher than this estimate.
        </li>
        <li>
          <strong>Ignoring the transfer fee.</strong> A 0% balance transfer with a 3–5% fee is still a good deal only if you can clear
          the balance before the promotion ends.
        </li>
      </ul>

      <h2>When this calculator doesn&apos;t fit</h2>
      <p>
        The math assumes one APR, no new charges and no fees. It is less accurate when a 0% promotional period ends partway through,
        when a store card uses <em>deferred interest</em> (interest from the start of the promotion can be added if the balance
        isn&apos;t paid in full by the deadline), or when one card holds several balances at different rates. Cards also charge
        interest daily on your average daily balance, so expect small differences from the monthly model used here.
      </p>

      <h2>Ways to pay it off faster</h2>
      <ul>
        <li>Pay a fixed amount every month instead of the shrinking minimum.</li>
        <li>Ask your issuer for a lower APR — a short phone call sometimes works.</li>
        <li>Stop adding new purchases to the card while you pay it down.</li>
        <li>Send windfalls such as a tax refund or bonus straight to the balance; every dollar stops costing you the card&apos;s APR.</li>
        <li>
          Juggling several cards? Use the <Link href="/debt-payoff-calculator/">debt snowball vs avalanche calculator</Link>.
        </li>
        <li>
          Not sure how much you can spare? Check your real take-home pay with the{" "}
          <Link href="/paycheck-calculator/">paycheck calculator</Link>, then see what that same monthly amount could grow to once
          the card is gone with the <Link href="/compound-interest-calculator/">compound interest calculator</Link>.
        </li>
      </ul>
    </ToolLayout>
  );
}
