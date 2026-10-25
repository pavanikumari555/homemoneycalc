import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FaqItem } from "@/components/StructuredData";
import ToolLayout from "@/components/ToolLayout";
import HolidayBudgetCalculator from "./HolidayBudgetCalculator";
import { usd, usd0 } from "@/lib/calc";
import { calcHolidayBudget, type HolidayInput } from "@/lib/tools/holiday-budget-calculator";

const SLUG = "holiday-budget-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Christmas Budget Calculator: Plan Gifts & Savings",
  description:
    "Plan your Christmas budget: gifts per person plus travel, food and decorations vs. your budget — and how much to save each paycheck until Dec 25.",
  path: `/${SLUG}/`,
  keywords: ["christmas budget calculator", "holiday budget calculator", "gift budget per person", "christmas savings plan", "how much to spend on christmas"],
});

// Worked example (fixed dates so the numbers on the page never drift)
const EX_INPUT: HolidayInput = {
  gifts: [
    { name: "Mom", amount: 100 },
    { name: "Dad", amount: 100 },
    { name: "Partner", amount: 200 },
    { name: "Kid 1", amount: 150 },
    { name: "Kid 2", amount: 150 },
    { name: "Friends", amount: 100 },
  ],
  travel: 300,
  food: 250,
  decorations: 75,
  other: 50,
  budget: 1_500,
  alreadySaved: 0,
  today: new Date(2026, 10, 1),
  target: new Date(2026, 11, 25),
  paychecksPerYear: 26,
};
const EX = calcHolidayBudget(EX_INPUT);
const EX_SAVED = calcHolidayBudget({ ...EX_INPUT, alreadySaved: 400 });

const ANSWER = `Add up each gift, then travel, food, decorations and extras. Six gifts worth ${usd0(EX.giftsTotal)} plus ${usd0(EX.extrasTotal)} of other costs is ${usd0(EX.total)}; starting November 1, that means saving about ${usd0(EX.perWeek)} a week (${usd0(EX.perPaycheck)} per biweekly paycheck) to have it all by December 25.`;

const faqs: FaqItem[] = [
  {
    question: "How much should I budget for Christmas?",
    answer:
      "There's no right number — start from what you can pay in cash by the holiday without touching bills or emergency savings. Take what you can set aside each paycheck between now and December, multiply by the paychecks left, and add anything already saved. That total is your budget; then fit gifts and extras inside it.",
  },
  {
    question: "How much should I spend on each person?",
    answer:
      "Divide your gift budget by the number of people, then adjust: closest family usually gets more, coworkers and neighbors less. If the per-person amount feels too small, shorten the list with a family gift exchange or one shared gift for a household.",
  },
  {
    question: "How do I save for Christmas from each paycheck?",
    answer:
      "Subtract what you've already saved from your total, then divide by the paydays left before your deadline. Setting up an automatic transfer to a separate savings account on payday makes it happen without thinking about it.",
  },
  {
    question: "What holiday costs do people forget?",
    answer:
      "Shipping, wrapping and cards, hosting food and drinks, travel extras like parking and checked bags, holiday tips for service workers, gift exchanges at work or school, and last-minute gifts for people you didn't plan for. The \"Other\" line is there for these.",
  },
  {
    question: "Is it bad to put Christmas on a credit card?",
    answer:
      "Only if you can't pay it off when the statement comes. Card interest rates average around 22% for accounts that carry a balance (Federal Reserve, 2026), so a balance carried for months can make gifts cost noticeably more. Buy-now-pay-later plans can also lead to missed-payment fees.",
  },
];

export default function Page() {
  return (
    <ToolLayout
      slug={SLUG}
      h1="Christmas & Holiday Budget Calculator"
      answer={ANSWER}
      intro="List your gifts, add travel, food and decorations, compare with your budget, and see how much to put aside each paycheck until the big day."
      calculator={<HolidayBudgetCalculator />}
      faqs={faqs}
      finance={false}
      sources={[
        { label: "Federal Reserve G.19 — credit card interest rates", url: "https://www.federalreserve.gov/releases/g19/current/default.htm" },
        { label: "NRF — winter holiday data and 2026 forecast", url: "https://nrf.com/research-insights/holiday-data-and-trends/winter-holidays" },
      ]}
    >
      <h2>How the holiday budget is calculated</h2>
      <p>The math is simple on purpose — the hard part is remembering everything. In plain English:</p>
      <ol>
        <li>
          <strong>Gifts</strong> = the sum of every person&apos;s gift amount. Blank rows and $0 rows are skipped, so you can keep a
          name on the list as a reminder without counting it.
        </li>
        <li>
          <strong>Total</strong> = gifts + travel + food &amp; hosting + decorations + other.
        </li>
        <li>
          <strong>Budget check</strong> = your budget − total. A negative number means you&apos;re over.
        </li>
        <li>
          <strong>Still to save</strong> = total − what you&apos;ve already saved.
        </li>
        <li>
          <strong>Per paycheck</strong> = still to save ÷ paydays left before your date. <strong>Per week</strong> = still to save ÷
          full weeks left.
        </li>
      </ol>
      <p>
        Paydays are estimated from your pay schedule (for example, every two weeks is 26 a year) and the number of days until your
        date, rounded down so you never come up short. If your date is today or has passed, the calculator shows the full amount due
        now.
      </p>

      <h2>Worked example</h2>
      <p>
        Jordan makes a list on November 1, 2026: Mom $100, Dad $100, partner $200, two kids at $150 each, and $100 for friends. That&apos;s{" "}
        {usd0(EX.giftsTotal)} in gifts — an average of {usd(EX.averageGift)} per line. Add $300 for travel, $250 for the holiday meal,
        $75 for decorations and $50 for cards and wrapping ({usd0(EX.extrasTotal)}), and the total is <strong>{usd0(EX.total)}</strong>{" "}
        — {usd0(EX.underBudget)} under a {usd0(EX_INPUT.budget)} budget.
      </p>
      <p>
        From November 1 to December 25 there are {EX.daysLeft} days: {EX.weeksLeft} full weeks and about {EX.paychecksLeft} biweekly
        paychecks. Jordan needs to set aside about <strong>{usd(EX.perWeek)} a week</strong>, or{" "}
        <strong>{usd(EX.perPaycheck)} per paycheck</strong>. If Jordan already has $400 put away, that drops to {usd(EX_SAVED.perWeek)}{" "}
        a week or {usd(EX_SAVED.perPaycheck)} per paycheck.
      </p>
      <p>
        The per-paycheck number is the one to watch. If it&apos;s more than you can comfortably move to savings on payday, the plan is too
        big for the time left — trim the list now rather than in mid-December.
      </p>

      <h2>Tips to keep the holidays affordable</h2>
      <ul>
        <li>
          <strong>Set the budget first, then the list.</strong> Start from what you can actually save, not from what you&apos;d like to
          buy. Then divide it among people.
        </li>
        <li>
          <strong>Start early.</strong> Saving from September or October spreads the same total over twice as many paychecks.
          Next year, try putting a small amount aside every month starting in January.
        </li>
        <li>
          <strong>Use a separate account.</strong> An automatic transfer to a savings account on payday keeps holiday money away from
          everyday spending. See how even small deposits grow with the{" "}
          <Link href="/compound-interest-calculator/">compound interest calculator</Link>.
        </li>
        <li>
          <strong>Watch the extras.</strong> Travel and hosting often cost as much as gifts. Compare flights early, split hosting costs,
          or suggest a potluck.
        </li>
        <li>
          <strong>Try group gifts or a gift exchange.</strong> A family &quot;Secret Santa&quot; with a spending limit can cut a long list
          down to one gift each.
        </li>
        <li>
          <strong>Avoid holiday card debt.</strong> According to the Federal Reserve, accounts that pay interest were charged around 22%
          APR in 2026. If you&apos;re still paying off last year&apos;s holidays, use the{" "}
          <Link href="/credit-card-payoff-calculator/">credit card payoff calculator</Link> to see how long it will take and how much
          interest you&apos;ll pay — and make clearing it part of this year&apos;s plan.
        </li>
        <li>
          <strong>Track as you shop.</strong> Update each gift with the real price after buying it. Your list saves on this device, so
          you can come back and adjust.
        </li>
      </ul>

      <h2>Where holiday budgets usually go wrong</h2>
      <p>
        Most overspending doesn&apos;t come from one big gift. It comes from small additions nobody wrote down: an extra present for a
        new friend, a second trip to the store for the meal, express shipping because something was ordered late. That&apos;s why the
        calculator keeps gifts and &quot;everything else&quot; side by side — when the extras line grows, you see it eat into the gift
        budget straight away.
      </p>
      <p>
        The other common problem is timing. A plan that needs {usd0(EX.total)} feels manageable in October and stressful in the second
        week of December, when there may be only one payday left. Checking the per-paycheck number now, while there are still several
        paydays to go, is the easiest way to keep the season paid for in cash.
      </p>

      <h2>Not just Christmas</h2>
      <p>
        The same calculator works for Hanukkah, Kwanzaa, Diwali, Eid, birthdays or any gift-giving season. Change the date to the day
        you need the money, and rename the rows to whatever you&apos;re planning for.
      </p>
    </ToolLayout>
  );
}
