// ============================================================================
// HOLIDAY BUDGET CALCULATOR — gifts (person × amount) + travel, food, decor, other.
// Total vs budget, aur aaj se chosen date tak har week / har paycheck kitna bachana hai.
// Koi tax nahi. Khaali rows aur 0 safe hain.
// ============================================================================

import { clamp } from "../calc";

export interface GiftRow {
  name: string;
  amount: number;
}

export interface HolidayInput {
  gifts: GiftRow[];
  travel: number;
  food: number;
  decorations: number;
  other: number;
  budget: number; // 0 = no budget set
  alreadySaved: number;
  today: Date;
  target: Date; // when you need the money
  paychecksPerYear: number; // 52, 26, 24, 12
}

export interface HolidayResult {
  giftsTotal: number;
  giftCount: number; // rows with an amount > 0
  averageGift: number;
  extrasTotal: number;
  total: number;
  overBudget: number; // > 0 when total exceeds budget
  underBudget: number; // > 0 when there is room left
  stillToSave: number; // total − already saved (>= 0)
  daysLeft: number; // calendar days from today to target (0 if past/today)
  weeksLeft: number; // whole weeks, at least 1 when days > 0
  paychecksLeft: number; // paydays between now and target, at least 1 when days > 0
  perWeek: number;
  perPaycheck: number;
  perDay: number;
  categories: { label: string; value: number }[];
}

const MAX = 10_000_000;
const DAY = 86_400_000;

export function calcHolidayBudget(input: HolidayInput): HolidayResult {
  const gifts = input.gifts.map((g) => ({ name: g.name, amount: clamp(Number.isFinite(g.amount) ? g.amount : 0, 0, MAX) }));
  const giftsTotal = gifts.reduce((s, g) => s + g.amount, 0);
  const giftCount = gifts.filter((g) => g.amount > 0).length;
  const travel = clamp(input.travel, 0, MAX);
  const food = clamp(input.food, 0, MAX);
  const decorations = clamp(input.decorations, 0, MAX);
  const other = clamp(input.other, 0, MAX);
  const extrasTotal = travel + food + decorations + other;
  const total = giftsTotal + extrasTotal;

  const budget = clamp(input.budget, 0, MAX * 10);
  const overBudget = budget > 0 ? Math.max(0, total - budget) : 0;
  const underBudget = budget > 0 ? Math.max(0, budget - total) : 0;
  const stillToSave = Math.max(0, total - clamp(input.alreadySaved, 0, MAX * 10));

  // Calendar days (UTC midnight math so daylight-saving can't shift the count)
  const utc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const daysLeft = Math.max(0, Math.round((utc(input.target) - utc(input.today)) / DAY));
  const periods = [52, 26, 24, 12].includes(input.paychecksPerYear) ? input.paychecksPerYear : 26;
  const weeksLeft = daysLeft > 0 ? Math.max(1, Math.floor(daysLeft / 7)) : 0;
  const paychecksLeft = daysLeft > 0 ? Math.max(1, Math.floor((daysLeft / 365.25) * periods)) : 0;

  return {
    giftsTotal,
    giftCount,
    averageGift: giftCount > 0 ? giftsTotal / giftCount : 0,
    extrasTotal,
    total,
    overBudget,
    underBudget,
    stillToSave,
    daysLeft,
    weeksLeft,
    paychecksLeft,
    perWeek: weeksLeft > 0 ? stillToSave / weeksLeft : stillToSave,
    perPaycheck: paychecksLeft > 0 ? stillToSave / paychecksLeft : stillToSave,
    perDay: daysLeft > 0 ? stillToSave / daysLeft : stillToSave,
    categories: [
      { label: "Gifts", value: giftsTotal },
      { label: "Travel", value: travel },
      { label: "Food & hosting", value: food },
      { label: "Decorations", value: decorations },
      { label: "Other", value: other },
    ],
  };
}

/** Next Dec 25 on or after `from` (if today is Dec 25, it's today). */
export function nextChristmas(from: Date): Date {
  const y = from.getFullYear();
  const thisYear = new Date(y, 11, 25);
  const fromDay = new Date(y, from.getMonth(), from.getDate());
  return fromDay <= thisYear ? thisYear : new Date(y + 1, 11, 25);
}
