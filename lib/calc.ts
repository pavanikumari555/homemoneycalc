// ============================================================================
// CALCULATION LOGIC (pure functions, no UI)
// Saara math yahan. UI se alag rakha -> clean, reusable, easy to verify.
// Sab client-side chalta (browser me), koi server nahi -> free + fast + secure.
// Paycheck (tax) logic alag file me hai: lib/paycheck.ts
// ============================================================================

// ---- Shared helpers ----

/** Clamp a number between min and max (guards against garbage input). */
export function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/** Format a number as USD currency, e.g. 1234.5 -> "$1,234.50" */
export function usd(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Whole-dollar USD for big headline numbers, e.g. "$12,340" */
export function usd0(n: number): string {
  return usd(n, 0);
}

/** Format a plain number with commas, e.g. 1234.5 -> "1,234.5" */
export function num(n: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
}

/** 125 months -> "10 yr 5 mo" */
export function duration(months: number): string {
  if (!Number.isFinite(months)) return "never";
  const m = Math.round(months);
  const y = Math.floor(m / 12);
  const r = m % 12;
  if (y === 0) return `${r} mo`;
  return r ? `${y} yr ${r} mo` : `${y} yr`;
}

/** Month label N months from `from` (default: this month), e.g. "March 2031" */
export function monthsFromNow(months: number, from = new Date()): string {
  if (!Number.isFinite(months)) return "never";
  const d = new Date(from.getFullYear(), from.getMonth() + Math.round(months), 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ---- Multi-currency support (for universal tools like compound interest) ----
// NOTE: This only changes the SYMBOL/formatting, not any tax logic. Use it only
// on tools where the math is the same worldwide (e.g. compound interest).

export interface Currency {
  code: string; // ISO code, e.g. "USD"
  label: string; // shown in dropdown
  locale: string; // for correct number grouping (1,000 vs 1.000)
  symbol: string; // for compact chart labels
}

// The Tier-1 currencies that bring the most ad revenue, plus INR for wider reach.
export const CURRENCIES: Currency[] = [
  { code: "USD", label: "$ US Dollar", locale: "en-US", symbol: "$" },
  { code: "GBP", label: "£ British Pound", locale: "en-GB", symbol: "£" },
  { code: "EUR", label: "€ Euro", locale: "en-IE", symbol: "€" },
  { code: "CAD", label: "C$ Canadian Dollar", locale: "en-CA", symbol: "C$" },
  { code: "AUD", label: "A$ Australian Dollar", locale: "en-AU", symbol: "A$" },
  { code: "INR", label: "₹ Indian Rupee", locale: "en-IN", symbol: "₹" },
];

/** Format a number in the chosen currency, e.g. money(1234.5, "GBP") -> "£1,234.50" */
export function money(n: number, currencyCode: string, digits = 2): string {
  const c = CURRENCIES.find((x) => x.code === currencyCode) ?? CURRENCIES[0];
  if (!Number.isFinite(n)) n = 0;
  return n.toLocaleString(c.locale, {
    style: "currency",
    currency: c.code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Standard amortized monthly payment (principal + interest). */
export function amortizedPayment(principal: number, annualRatePercent: number, months: number): number {
  const r = annualRatePercent / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

const MAX_MONTHS = 1200; // 100 years safety cap (prevents infinite loops)

// ============================================================================
// AMORTIZATION ENGINE (mortgage, auto loan, credit card sab yahi use karte)
// ============================================================================

export interface AmortYear {
  year: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface AmortResult {
  months: number; // Infinity if the payment never pays it off
  totalInterest: number;
  balances: { x: number; y: number }[]; // x = month, y = balance (for charts)
  yearly: AmortYear[];
}

interface AmortOptions {
  principal: number;
  annualRatePercent: number;
  payment: number; // regular monthly payment
  extraMonthly?: number;
  extraYearly?: number; // lump sum every 12th month
  oneTime?: number; // lump sum in month 1
}

export function amortize(o: AmortOptions): AmortResult {
  const r = o.annualRatePercent / 100 / 12;
  let balance = Math.max(0, o.principal - (o.oneTime ?? 0));
  let months = 0;
  let totalInterest = 0;
  const balances = [{ x: 0, y: balance }];
  const yearly: AmortYear[] = [];
  let yi = 0;
  let yp = 0;

  while (balance > 0.005 && months < MAX_MONTHS) {
    months++;
    const interest = balance * r;
    let pay = o.payment + (o.extraMonthly ?? 0) + (months % 12 === 0 ? o.extraYearly ?? 0 : 0);
    if (pay <= interest && months === 1 && !(o.extraYearly && o.extraYearly > 0)) {
      // Payment doesn't even cover the interest -> balance grows forever
      return { months: Infinity, totalInterest: Infinity, balances, yearly };
    }
    pay = Math.min(pay, balance + interest);
    balance = balance + interest - pay;
    totalInterest += interest;
    yi += interest;
    yp += pay - interest;
    balances.push({ x: months, y: Math.max(0, balance) });
    if (months % 12 === 0 || balance <= 0.005) {
      yearly.push({ year: Math.ceil(months / 12), interest: yi, principal: yp, balance: Math.max(0, balance) });
      yi = 0;
      yp = 0;
    }
  }
  if (balance > 0.005) return { months: Infinity, totalInterest: Infinity, balances, yearly };
  return { months, totalInterest, balances, yearly };
}

// ============================================================================
// 1. MORTGAGE PAYOFF CALCULATOR (extra payments)
// ============================================================================

export interface MortgageInput {
  principal: number; // remaining loan balance
  annualRatePercent: number; // e.g. 6.5
  yearsLeft: number; // remaining term, e.g. 30
  extraMonthly: number;
  extraYearly: number; // e.g. tax refund / bonus once a year
  oneTime: number; // lump sum today
}

export interface MortgageResult {
  monthlyPayment: number; // base P&I payment (no extra)
  base: AmortResult;
  withExtra: AmortResult;
  monthsSaved: number;
  interestSaved: number;
}

export function calcMortgage(input: MortgageInput): MortgageResult {
  const principal = clamp(input.principal, 0, 100_000_000);
  const rate = clamp(input.annualRatePercent, 0, 30);
  const years = clamp(input.yearsLeft, 1 / 12, 50);
  const payment = amortizedPayment(principal, rate, years * 12);

  const base = amortize({ principal, annualRatePercent: rate, payment });
  const withExtra = amortize({
    principal,
    annualRatePercent: rate,
    payment,
    extraMonthly: clamp(input.extraMonthly, 0, 1_000_000),
    extraYearly: clamp(input.extraYearly, 0, 10_000_000),
    oneTime: clamp(input.oneTime, 0, principal),
  });

  return {
    monthlyPayment: payment,
    base,
    withExtra,
    monthsSaved: base.months - withExtra.months,
    interestSaved: base.totalInterest - withExtra.totalInterest,
  };
}

// ============================================================================
// 2. DEBT PAYOFF CALCULATOR (Snowball vs Avalanche)
// Asli snowball: total monthly budget FIXED rehta hai (sab minimums + extra).
// Ek debt khatam -> uska minimum agle target pe "roll" ho jaata hai.
// ============================================================================

export interface Debt {
  name: string;
  balance: number;
  annualRatePercent: number;
  minPayment: number;
}

export type DebtStrategy = "snowball" | "avalanche" | "minimum";

export interface DebtStrategyResult {
  months: number; // Infinity if budget can't keep up with interest
  totalInterest: number;
  payoffOrder: { name: string; month: number }[];
  timeline: { x: number; y: number }[]; // total balance per month
}

export interface DebtResult {
  snowball: DebtStrategyResult;
  avalanche: DebtStrategyResult;
  minimumOnly: DebtStrategyResult;
  monthlyBudget: number;
}

function simulateDebts(debts: Debt[], extra: number, strategy: DebtStrategy): DebtStrategyResult {
  const list = debts.map((d, i) => ({ ...d, i }));
  const budgetTotal = list.reduce((s, d) => s + d.minPayment, 0) + (strategy === "minimum" ? 0 : extra);
  // Fixed priority order decided once (standard method definitions)
  const order = [...list].sort((a, b) =>
    strategy === "avalanche" ? b.annualRatePercent - a.annualRatePercent || a.balance - b.balance : a.balance - b.balance
  );

  let months = 0;
  let totalInterest = 0;
  const payoffOrder: { name: string; month: number }[] = [];
  const timeline = [{ x: 0, y: list.reduce((s, d) => s + d.balance, 0) }];

  while (list.some((d) => d.balance > 0.005) && months < MAX_MONTHS) {
    months++;

    for (const d of list) {
      if (d.balance > 0.005) {
        const interest = d.balance * (d.annualRatePercent / 100 / 12);
        d.balance += interest;
        totalInterest += interest;
      }
    }

    // Minimums first. "minimum" strategy: each debt only ever gets its own minimum.
    let budget = budgetTotal;
    for (const d of list) {
      if (d.balance <= 0.005) continue;
      const pay = Math.min(d.minPayment, d.balance, budget);
      d.balance -= pay;
      budget -= pay;
    }
    if (strategy !== "minimum") {
      // Whatever is left (extra + freed-up minimums) cascades down the priority list
      for (const d of order) {
        if (budget <= 0.005) break;
        const target = list[d.i];
        if (target.balance <= 0.005) continue;
        const pay = Math.min(target.balance, budget);
        target.balance -= pay;
        budget -= pay;
      }
    }

    for (const d of list) {
      if (d.balance <= 0.005 && !payoffOrder.some((p) => p.name === `${d.i}`)) {
        d.balance = 0;
        payoffOrder.push({ name: `${d.i}`, month: months });
      }
    }

    const endTotal = list.reduce((s, d) => s + d.balance, 0);
    timeline.push({ x: months, y: endTotal });
    // Temporary balance growth does not prove a plan can never repay.
  }

  if (list.some(d => d.balance > 0.005)) return { months: Infinity, totalInterest: Infinity, payoffOrder: [], timeline };
  return {
    months,
    totalInterest,
    // map index back to the user's debt names
    payoffOrder: payoffOrder.map((p) => ({ name: debts[Number(p.name)].name, month: p.month })),
    timeline,
  };
}

export function calcDebtPayoff(debts: Debt[], extraBudget: number): DebtResult {
  const clean = debts
    .map((d, i) => ({ ...d, row: i }))
    .filter((d) => d.balance > 0)
    .map((d) => ({
      name: d.name.trim() || `Debt ${d.row + 1}`,
      balance: clamp(d.balance, 0, 100_000_000),
      annualRatePercent: clamp(d.annualRatePercent, 0, 100),
      minPayment: clamp(d.minPayment, 0, 1_000_000),
    }));
  const extra = clamp(extraBudget, 0, 1_000_000);

  return {
    snowball: simulateDebts(clean, extra, "snowball"),
    avalanche: simulateDebts(clean, extra, "avalanche"),
    minimumOnly: simulateDebts(clean, 0, "minimum"),
    monthlyBudget: clean.reduce((s, d) => s + d.minPayment, 0) + extra,
  };
}

// ============================================================================
// 3. CREDIT CARD PAYOFF
// ============================================================================

export interface CardInput {
  balance: number;
  aprPercent: number;
  mode: "payment" | "goal";
  monthlyPayment: number; // used in "payment" mode
  goalMonths: number; // used in "goal" mode
}

export interface CardResult {
  payment: number; // the payment used (entered, or required for the goal)
  plan: AmortResult;
  minimumPlan: AmortResult; // typical issuer minimum: interest + 1% of balance, $25 floor
  interestSavedVsMinimum: number;
  inputError?: string;
}

/** Typical card minimum payment: 1% of balance + that month's interest, at least $25. */
function simulateMinimumPayments(balance: number, aprPercent: number): AmortResult {
  const r = aprPercent / 100 / 12;
  let b = balance;
  let months = 0;
  let totalInterest = 0;
  const balances = [{ x: 0, y: b }];
  while (b > 0.005 && months < MAX_MONTHS) {
    months++;
    const interest = b * r;
    const pay = Math.min(b + interest, Math.max(25, b * 0.01 + interest));
    b = b + interest - pay;
    totalInterest += interest;
    balances.push({ x: months, y: Math.max(0, b) });
  }
  return { months: b > 0.005 ? Infinity : months, totalInterest, balances, yearly: [] };
}

export function calcCreditCard(input: CardInput): CardResult {
  const inputError = !Number.isFinite(input.balance) || input.balance < 0 || input.balance > 10_000_000 ? "Enter a card balance from $0 to $10,000,000." :
    !Number.isFinite(input.aprPercent) || input.aprPercent < 0 || input.aprPercent > 80 ? "Enter an APR from 0% to 80%." :
    input.mode === "goal" && (!Number.isInteger(input.goalMonths) || input.goalMonths < 1 || input.goalMonths > 600) ? "Enter a whole number of months from 1 to 600." :
    input.mode === "payment" && (!Number.isFinite(input.monthlyPayment) || input.monthlyPayment < 0 || input.monthlyPayment > 10_000_000) ? "Enter a monthly payment from $0 to $10,000,000." : undefined;
  if (inputError) {
    const empty: AmortResult = { months: NaN, totalInterest: NaN, balances: [], yearly: [] };
    return { payment: NaN, plan: empty, minimumPlan: empty, interestSavedVsMinimum: NaN, inputError };
  }
  const balance = clamp(input.balance, 0, 10_000_000);
  const apr = clamp(input.aprPercent, 0, 80);
  const payment =
    input.mode === "goal"
      ? amortizedPayment(balance, apr, clamp(Math.round(input.goalMonths), 1, 600))
      : clamp(input.monthlyPayment, 0, 10_000_000);

  const plan = amortize({ principal: balance, annualRatePercent: apr, payment });
  const minimumPlan = simulateMinimumPayments(balance, apr);
  return {
    payment,
    plan,
    minimumPlan,
    interestSavedVsMinimum: minimumPlan.totalInterest - plan.totalInterest,
  };
}

// ============================================================================
// 4. AUTO LOAN CALCULATOR (with trade-in)
// ============================================================================

export interface AutoLoanInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  amountOwedOnTrade: number; // negative equity if you still owe more than it's worth
  salesTaxPercent: number;
  fees: number; // doc/registration fees
  annualRatePercent: number;
  termMonths: number;
  // Most states tax price minus trade-in. Toggle for that benefit.
  taxCreditOnTradeIn: boolean;
}

export interface AutoLoanResult {
  netTradeIn: number;
  taxableAmount: number;
  salesTax: number;
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCostOfVehicle: number; // everything you pay: down + trade equity + all payments (minus any excess, see below)
  excessCash: number; // down + trade-in equity beyond price + tax + fees (no loan needed; not counted as cost)
  byTerm: { term: number; payment: number; interest: number }[]; // comparison table
  balances: { x: number; y: number }[];
}

export function calcAutoLoan(input: AutoLoanInput): AutoLoanResult {
  const price = clamp(input.vehiclePrice, 0, 100_000_000);
  const down = clamp(input.downPayment, 0, price + 1_000_000);
  const tradeIn = clamp(input.tradeInValue, 0, 100_000_000);
  const owed = clamp(input.amountOwedOnTrade, 0, 100_000_000);
  const taxRate = clamp(input.salesTaxPercent, 0, 20) / 100;
  const fees = clamp(input.fees, 0, 1_000_000);
  const rate = clamp(input.annualRatePercent, 0, 40);
  const term = clamp(Math.round(input.termMonths), 1, 120);

  const netTradeIn = tradeIn - owed;
  const taxableAmount = input.taxCreditOnTradeIn ? Math.max(0, price - tradeIn) : price;
  const salesTax = taxableAmount * taxRate;
  const amountDue = price + salesTax + fees - down - netTradeIn;
  const loanAmount = Math.max(0, amountDue); // can't borrow a negative amount
  const excessCash = Math.max(0, -amountDue); // you'd get this back / wouldn't actually pay it

  const loanFor = (months: number) => {
    const payment = amortizedPayment(loanAmount, rate, months);
    return { payment, interest: payment * months - loanAmount };
  };
  const main = loanFor(term);
  const plan = amortize({ principal: loanAmount, annualRatePercent: rate, payment: main.payment });

  return {
    netTradeIn,
    taxableAmount,
    salesTax,
    loanAmount,
    monthlyPayment: main.payment,
    totalInterest: main.interest,
    totalCostOfVehicle: down + netTradeIn + main.payment * term - excessCash,
    excessCash,
    byTerm: [36, 48, 60, 72, 84].map((t) => ({ term: t, ...loanFor(t) })),
    balances: plan.balances,
  };
}

// ============================================================================
// 5. PERCENTAGE CALCULATOR
// ============================================================================

/** What is p% of n?  e.g. 20% of 150 = 30 */
export function percentOf(p: number, n: number): number {
  return (p / 100) * n;
}

/** a is what percent of b?  e.g. 30 is what % of 150 = 20% */
export function whatPercent(a: number, b: number): number {
  if (b === 0) return NaN;
  return (a / b) * 100;
}

/** Percentage change from oldVal to newVal, e.g. 100 -> 125 = +25% */
export function percentChange(oldVal: number, newVal: number): number {
  if (oldVal === 0) return NaN;
  return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
}

// ============================================================================
// 6. COMPOUND INTEREST CALCULATOR
// ============================================================================

export interface CompoundInput {
  principal: number;
  monthlyContribution: number;
  annualRatePercent: number;
  years: number;
  compoundsPerYear: number; // 1 annually, 4 quarterly, 12 monthly, 365 daily
  annualIncreasePercent: number; // raise monthly deposit each year (e.g. 3%)
}

export interface CompoundResult {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  yearly: { x: number; balance: number; contributed: number }[];
  doublingYears: number; // rule-of-72 style exact doubling time for the rate
}

export function calcCompoundInterest(input: CompoundInput): CompoundResult {
  const principal = clamp(input.principal, 0, 1_000_000_000);
  let monthly = clamp(input.monthlyContribution, 0, 10_000_000);
  const rate = clamp(input.annualRatePercent, -50, 100) / 100;
  const years = clamp(input.years, 0, 100);
  const months = Math.round(years * 12);
  const n = clamp(input.compoundsPerYear, 1, 365);
  const raise = clamp(input.annualIncreasePercent, 0, 50) / 100;

  // Effective monthly growth that matches the chosen compounding frequency exactly
  const monthlyGrowth = Math.pow(1 + rate / n, n / 12);

  let balance = principal;
  let contributed = principal;
  const yearly = [{ x: 0, balance, contributed }];

  for (let month = 1; month <= months; month++) {
    balance = balance * monthlyGrowth + monthly; // deposit at end of month
    contributed += monthly;
    if (month % 12 === 0 || month === months) {
      yearly.push({ x: month / 12, balance, contributed });
    }
    if (month % 12 === 0) monthly *= 1 + raise;
  }

  const effectiveAnnual = Math.pow(1 + rate / n, n) - 1;
  return {
    futureValue: balance,
    totalContributions: contributed,
    totalInterest: balance - contributed,
    yearly,
    doublingYears: effectiveAnnual > 0 ? Math.log(2) / Math.log(1 + effectiveAnnual) : Infinity,
  };
}

// ============================================================================
// 7. SALARY <-> HOURLY
// ============================================================================

export interface SalaryInput {
  mode: "salary" | "hourly";
  amount: number; // annual salary or hourly wage depending on mode
  hoursPerWeek: number;
  weeksPerYear: number; // paid weeks (52 minus unpaid time off)
  overtimeHoursPerWeek: number; // hourly mode only, paid at 1.5x
}

export interface SalaryResult {
  hourly: number;
  daily: number;
  weekly: number;
  biweekly: number;
  semimonthly: number;
  monthly: number;
  annual: number;
  /** Hours/week was 0, empty or out of range (1-120) and got clamped -> UI should show a message, not the rate. */
  hoursInvalid: boolean;
  /** Paid weeks/year was 0, empty or out of range (1-52) and got clamped. */
  weeksInvalid: boolean;
}

export function calcSalary(input: SalaryInput): SalaryResult {
  const hours = clamp(input.hoursPerWeek, 1, 120);
  const weeks = clamp(input.weeksPerYear, 1, 52);
  // clamp chupke se 0 ko 1 bana deta -> flag do taaki UI galat rate na dikhaye
  const hoursInvalid = !(input.hoursPerWeek >= 1 && input.hoursPerWeek <= 120);
  const weeksInvalid = !(input.weeksPerYear >= 1 && input.weeksPerYear <= 52);
  const ot = input.mode === "hourly" ? clamp(input.overtimeHoursPerWeek, 0, 80) : 0;
  const amount = clamp(input.amount, 0, 1_000_000_000);

  const hourly = input.mode === "salary" ? amount / (hours * weeks) : amount;
  const weekly = hourly * hours + hourly * 1.5 * ot;
  const annual = input.mode === "salary" ? amount : weekly * weeks;

  return {
    hourly,
    daily: weekly / 5,
    weekly,
    biweekly: annual / 26,
    semimonthly: annual / 24,
    monthly: annual / 12,
    annual,
    hoursInvalid,
    weeksInvalid,
  };
}

// ============================================================================
// 8. TIP CALCULATOR
// ============================================================================

export interface TipInput {
  bill: number;
  tipPercent: number;
  people: number;
  roundUp: boolean; // round each person's share up to the next dollar
}

export interface TipResult {
  tip: number;
  total: number;
  perPerson: number;
  tipPerPerson: number;
}

export function calcTip(input: TipInput): TipResult {
  const bill = clamp(input.bill, 0, 10_000_000);
  const pct = clamp(input.tipPercent, 0, 100);
  const people = clamp(Math.round(input.people), 1, 100);
  let tip = bill * (pct / 100);
  let perPerson = (bill + tip) / people;
  if (input.roundUp) {
    perPerson = Math.ceil(perPerson - 1e-9);
    tip = perPerson * people - bill;
  }
  return { tip, total: bill + tip, perPerson, tipPerPerson: tip / people };
}

// ============================================================================
// 9. AGE CALCULATOR
// ============================================================================

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  bornWeekday: string;
  nextBirthday: Date;
  daysToBirthday: number; // 0 = today!
  nextAge: number;
}

/** Parse "YYYY-MM-DD" as a local calendar date (no timezone surprises). */
export function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const [y, mo, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(y, mo - 1, day);
  // Reject impossible dates like 2026-02-31 (JS would silently roll them into March)
  return d.getFullYear() === y && d.getMonth() === mo - 1 && d.getDate() === day ? d : null;
}

/** birth + k months, clamping the day (Jan 31 + 1 month = Feb 28/29). */
function addMonthsClamped(birth: Date, k: number): Date {
  const y = birth.getFullYear() + Math.floor((birth.getMonth() + k) / 12);
  const mo = (((birth.getMonth() + k) % 12) + 12) % 12;
  const lastDay = new Date(y, mo + 1, 0).getDate();
  return new Date(y, mo, Math.min(birth.getDate(), lastDay));
}

export function calcAge(birth: Date, asOf: Date): AgeResult | null {
  if (birth > asOf) return null;
  const DAY = 86_400_000;
  const utc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  // Count whole months to the last "monthiversary" on or before asOf, then the days after it
  let fullMonths = (asOf.getFullYear() - birth.getFullYear()) * 12 + (asOf.getMonth() - birth.getMonth());
  if (utc(addMonthsClamped(birth, fullMonths)) > utc(asOf)) fullMonths--;
  const anchor = addMonthsClamped(birth, fullMonths);
  const days = Math.round((utc(asOf) - utc(anchor)) / DAY);
  const years = Math.floor(fullMonths / 12);
  const months = fullMonths % 12;
  const totalDays = Math.round((utc(asOf) - utc(birth)) / DAY);

  // Feb 29 birthdays celebrate on Feb 28 in non-leap years
  const birthdayIn = (year: number) => {
    const d = new Date(year, birth.getMonth(), birth.getDate());
    return d.getMonth() === birth.getMonth() ? d : new Date(year, birth.getMonth() + 1, 0);
  };
  let next = birthdayIn(asOf.getFullYear());
  if (utc(next) < utc(asOf)) next = birthdayIn(asOf.getFullYear() + 1);

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths: years * 12 + months,
    bornWeekday: birth.toLocaleDateString("en-US", { weekday: "long" }),
    nextBirthday: next,
    daysToBirthday: Math.round((utc(next) - utc(asOf)) / DAY),
    nextAge: next.getFullYear() - birth.getFullYear(),
  };
}
