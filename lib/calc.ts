// ============================================================================
// CALCULATION LOGIC (pure functions, no UI)
// Saara math yahan. UI se alag rakha -> clean, reusable, easy to verify.
// Sab client-side chalta (browser me), koi server nahi -> free + fast + secure.
// ============================================================================

// ---- Shared helpers ----

/** Clamp a number between min and max (guards against garbage input). */
export function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/** Format a number as USD currency, e.g. 1234.5 -> "$1,234.50" */
export function usd(n: number): string {
  if (!Number.isFinite(n)) return "$0.00";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

/** Format a plain number with commas, e.g. 1234.5 -> "1,234.5" */
export function num(n: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
}

// ---- Multi-currency support (for universal tools like compound interest) ----
// NOTE: This only changes the SYMBOL/formatting, not any tax logic. Use it only
// on tools where the math is the same worldwide (e.g. compound interest).

export interface Currency {
  code: string; // ISO code, e.g. "USD"
  label: string; // shown in dropdown
  locale: string; // for correct number grouping (1,000 vs 1.000)
}

// The Tier-1 currencies that bring the most ad revenue, plus INR for wider reach.
export const CURRENCIES: Currency[] = [
  { code: "USD", label: "$ US Dollar", locale: "en-US" },
  { code: "GBP", label: "£ British Pound", locale: "en-GB" },
  { code: "EUR", label: "€ Euro", locale: "en-IE" },
  { code: "CAD", label: "C$ Canadian Dollar", locale: "en-CA" },
  { code: "AUD", label: "A$ Australian Dollar", locale: "en-AU" },
  { code: "INR", label: "₹ Indian Rupee", locale: "en-IN" },
];

/** Format a number in the chosen currency, e.g. money(1234.5, "GBP") -> "£1,234.50" */
export function money(n: number, currencyCode: string): string {
  const c = CURRENCIES.find((x) => x.code === currencyCode) ?? CURRENCIES[0];
  if (!Number.isFinite(n)) n = 0;
  return n.toLocaleString(c.locale, {
    style: "currency",
    currency: c.code,
    maximumFractionDigits: 2,
  });
}

// ============================================================================
// 1. PAYCHECK CALCULATOR (US, simplified federal estimate)
// NOTE: This is an ESTIMATE using 2024 federal brackets + FICA. Not tax advice.
// State tax varies widely, so we keep state as an optional flat % the user enters.
// ============================================================================

export interface PaycheckInput {
  grossAnnual: number; // gross yearly salary
  payPeriodsPerYear: number; // 12 monthly, 24 semi-monthly, 26 biweekly, 52 weekly
  filingSingle: boolean; // true = single, false = married filing jointly
  stateTaxPercent: number; // user-entered flat state tax % (0 if none)
  pretaxDeductionsAnnual: number; // 401k, health premiums etc (reduce taxable)
}

export interface PaycheckResult {
  grossPerPeriod: number;
  federalTaxAnnual: number;
  socialSecurityAnnual: number;
  medicareAnnual: number;
  stateTaxAnnual: number;
  netAnnual: number;
  netPerPeriod: number;
  effectiveTaxRate: number; // total tax / gross
}

// 2024 federal income tax brackets (taxable income after standard deduction)
const FED_BRACKETS_SINGLE = [
  { upTo: 11600, rate: 0.1 },
  { upTo: 47150, rate: 0.12 },
  { upTo: 100525, rate: 0.22 },
  { upTo: 191950, rate: 0.24 },
  { upTo: 243725, rate: 0.32 },
  { upTo: 609350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];
const FED_BRACKETS_MARRIED = [
  { upTo: 23200, rate: 0.1 },
  { upTo: 94300, rate: 0.12 },
  { upTo: 201050, rate: 0.22 },
  { upTo: 383900, rate: 0.24 },
  { upTo: 487450, rate: 0.32 },
  { upTo: 731200, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];
const STD_DEDUCTION_SINGLE = 14600;
const STD_DEDUCTION_MARRIED = 29200;
const SS_RATE = 0.062;
const SS_WAGE_CAP = 168600; // 2024 Social Security wage base
const MEDICARE_RATE = 0.0145;

function federalTax(taxableIncome: number, single: boolean): number {
  const brackets = single ? FED_BRACKETS_SINGLE : FED_BRACKETS_MARRIED;
  let tax = 0;
  let lower = 0;
  for (const b of brackets) {
    if (taxableIncome > b.upTo) {
      tax += (b.upTo - lower) * b.rate;
      lower = b.upTo;
    } else {
      tax += (taxableIncome - lower) * b.rate;
      break;
    }
  }
  return Math.max(0, tax);
}

export function calcPaycheck(input: PaycheckInput): PaycheckResult {
  const gross = clamp(input.grossAnnual, 0, 100_000_000);
  const periods = clamp(input.payPeriodsPerYear, 1, 52);
  const pretax = clamp(input.pretaxDeductionsAnnual, 0, gross);
  const stateRate = clamp(input.stateTaxPercent, 0, 20) / 100;

  const stdDeduction = input.filingSingle ? STD_DEDUCTION_SINGLE : STD_DEDUCTION_MARRIED;
  const taxableIncome = Math.max(0, gross - pretax - stdDeduction);

  const federalTaxAnnual = federalTax(taxableIncome, input.filingSingle);
  // FICA is on gross wages minus pretax (approx), capped for SS
  const ficaBase = Math.max(0, gross - pretax);
  const socialSecurityAnnual = Math.min(ficaBase, SS_WAGE_CAP) * SS_RATE;
  const medicareAnnual = ficaBase * MEDICARE_RATE;
  const stateTaxAnnual = Math.max(0, gross - pretax) * stateRate;

  const totalTax =
    federalTaxAnnual + socialSecurityAnnual + medicareAnnual + stateTaxAnnual;
  const netAnnual = Math.max(0, gross - totalTax - pretax);

  return {
    grossPerPeriod: gross / periods,
    federalTaxAnnual,
    socialSecurityAnnual,
    medicareAnnual,
    stateTaxAnnual,
    netAnnual,
    netPerPeriod: netAnnual / periods,
    effectiveTaxRate: gross > 0 ? totalTax / gross : 0,
  };
}

// ============================================================================
// 2. MORTGAGE PAYOFF CALCULATOR (extra payments)
// ============================================================================

export interface MortgageInput {
  principal: number; // remaining loan balance
  annualRatePercent: number; // e.g. 6.5
  termYears: number; // e.g. 30
  extraMonthly: number; // extra paid each month
}

export interface MortgageResult {
  monthlyPayment: number; // base payment (no extra)
  monthsBase: number;
  monthsWithExtra: number;
  monthsSaved: number;
  totalInterestBase: number;
  totalInterestWithExtra: number;
  interestSaved: number;
  payoffYearsWithExtra: number;
}

/** Standard amortized monthly payment (principal + interest). */
export function monthlyMortgagePayment(
  principal: number,
  annualRatePercent: number,
  termYears: number
): number {
  const r = annualRatePercent / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return n > 0 ? principal / n : 0;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Simulate paying down the loan month by month, return months + total interest. */
function amortize(
  principal: number,
  annualRatePercent: number,
  monthlyPayment: number,
  extra: number
): { months: number; totalInterest: number } {
  const r = annualRatePercent / 100 / 12;
  let balance = principal;
  let months = 0;
  let totalInterest = 0;
  const pay = monthlyPayment + extra;
  // Safety cap: 100 years of months, avoids infinite loop if payment too small
  const MAX_MONTHS = 1200;
  while (balance > 0.01 && months < MAX_MONTHS) {
    const interest = balance * r;
    let principalPaid = pay - interest;
    if (principalPaid <= 0) {
      // Payment doesn't even cover interest -> never pays off
      return { months: MAX_MONTHS, totalInterest: Infinity };
    }
    if (principalPaid > balance) principalPaid = balance;
    balance -= principalPaid;
    totalInterest += interest;
    months++;
  }
  return { months, totalInterest };
}

export function calcMortgage(input: MortgageInput): MortgageResult {
  const principal = clamp(input.principal, 0, 100_000_000);
  const rate = clamp(input.annualRatePercent, 0, 30);
  const years = clamp(input.termYears, 1, 50);
  const extra = clamp(input.extraMonthly, 0, 1_000_000);

  const monthlyPayment = monthlyMortgagePayment(principal, rate, years);
  const base = amortize(principal, rate, monthlyPayment, 0);
  const withExtra = amortize(principal, rate, monthlyPayment, extra);

  return {
    monthlyPayment,
    monthsBase: base.months,
    monthsWithExtra: withExtra.months,
    monthsSaved: base.months - withExtra.months,
    totalInterestBase: base.totalInterest,
    totalInterestWithExtra: withExtra.totalInterest,
    interestSaved: base.totalInterest - withExtra.totalInterest,
    payoffYearsWithExtra: withExtra.months / 12,
  };
}

// ============================================================================
// 3. DEBT PAYOFF CALCULATOR (Snowball vs Avalanche)
// ============================================================================

export interface Debt {
  name: string;
  balance: number;
  annualRatePercent: number;
  minPayment: number;
}

export interface DebtStrategyResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  payoffOrder: string[]; // order debts were cleared
}

export interface DebtResult {
  snowball: DebtStrategyResult;
  avalanche: DebtStrategyResult;
  // Which one saves more interest
  betterByInterest: "snowball" | "avalanche" | "tie";
  interestDifference: number;
}

function simulateDebts(
  debts: Debt[],
  extraBudget: number,
  order: "snowball" | "avalanche"
): DebtStrategyResult {
  // Deep copy so we don't mutate caller's data
  let list = debts.map((d) => ({ ...d }));
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const payoffOrder: string[] = [];
  const MAX_MONTHS = 1200;

  while (list.some((d) => d.balance > 0.01) && months < MAX_MONTHS) {
    // Sort target order: snowball = smallest balance first, avalanche = highest rate first
    const active = list.filter((d) => d.balance > 0.01);
    active.sort((a, b) =>
      order === "snowball"
        ? a.balance - b.balance
        : b.annualRatePercent - a.annualRatePercent
    );

    // Add interest for the month
    for (const d of list) {
      if (d.balance > 0.01) {
        const interest = d.balance * (d.annualRatePercent / 100 / 12);
        d.balance += interest;
        totalInterest += interest;
      }
    }

    // Available money = sum of min payments + extra
    let budget =
      active.reduce((s, d) => s + Math.min(d.minPayment, d.balance), 0) + extraBudget;

    // Pay minimums first (in target order), then throw remainder at the target debt
    // Pay everything toward the first debt in the sorted order, min on the rest.
    for (const d of active) {
      if (budget <= 0) break;
      const isTarget = d.name === active[0].name;
      let payment = isTarget ? budget : Math.min(d.minPayment, d.balance);
      payment = Math.min(payment, d.balance, budget);
      d.balance -= payment;
      budget -= payment;
      totalPaid += payment;
      if (d.balance <= 0.01 && !payoffOrder.includes(d.name)) {
        payoffOrder.push(d.name);
      }
    }
    months++;
  }

  return { months, totalInterest, totalPaid, payoffOrder };
}

export function calcDebtPayoff(debts: Debt[], extraBudget: number): DebtResult {
  const clean = debts
    .filter((d) => d.balance > 0)
    .map((d) => ({
      name: d.name || "Debt",
      balance: clamp(d.balance, 0, 100_000_000),
      annualRatePercent: clamp(d.annualRatePercent, 0, 100),
      minPayment: clamp(d.minPayment, 0, 1_000_000),
    }));

  const extra = clamp(extraBudget, 0, 1_000_000);
  const snowball = simulateDebts(clean, extra, "snowball");
  const avalanche = simulateDebts(clean, extra, "avalanche");

  const diff = snowball.totalInterest - avalanche.totalInterest;
  let betterByInterest: "snowball" | "avalanche" | "tie" = "tie";
  if (Math.abs(diff) > 1) {
    betterByInterest = diff > 0 ? "avalanche" : "snowball";
  }

  return {
    snowball,
    avalanche,
    betterByInterest,
    interestDifference: Math.abs(diff),
  };
}

// ============================================================================
// 4. AUTO LOAN CALCULATOR (with trade-in)
// ============================================================================

export interface AutoLoanInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  amountOwedOnTrade: number; // negative equity if you still owe
  salesTaxPercent: number;
  fees: number; // doc/registration fees
  annualRatePercent: number;
  termMonths: number;
  // Many states tax price minus trade-in. Toggle for that benefit.
  taxCreditOnTradeIn: boolean;
}

export interface AutoLoanResult {
  netTradeIn: number; // trade-in minus what you owe on it
  taxableAmount: number;
  salesTax: number;
  loanAmount: number;
  monthlyPayment: number;
  totalLoanCost: number; // principal + interest
  totalInterest: number;
  totalCostOfVehicle: number; // everything you pay
}

export function calcAutoLoan(input: AutoLoanInput): AutoLoanResult {
  const price = clamp(input.vehiclePrice, 0, 100_000_000);
  const down = clamp(input.downPayment, 0, price + 1_000_000);
  const tradeIn = clamp(input.tradeInValue, 0, 100_000_000);
  const owed = clamp(input.amountOwedOnTrade, 0, 100_000_000);
  const taxRate = clamp(input.salesTaxPercent, 0, 20) / 100;
  const fees = clamp(input.fees, 0, 1_000_000);
  const rate = clamp(input.annualRatePercent, 0, 40);
  const term = clamp(input.termMonths, 1, 120);

  const netTradeIn = tradeIn - owed; // can be negative (you owe more than it's worth)

  // Taxable amount: price minus trade-in credit (if state allows), never below 0
  const taxableAmount = input.taxCreditOnTradeIn
    ? Math.max(0, price - Math.max(0, tradeIn))
    : price;
  const salesTax = taxableAmount * taxRate;

  // Loan = price + tax + fees - down payment - net trade-in
  let loanAmount = price + salesTax + fees - down - netTradeIn;
  loanAmount = Math.max(0, loanAmount);

  const r = rate / 100 / 12;
  const monthlyPayment =
    r === 0 ? loanAmount / term : (loanAmount * r) / (1 - Math.pow(1 + r, -term));
  const totalLoanCost = monthlyPayment * term;
  const totalInterest = totalLoanCost - loanAmount;

  return {
    netTradeIn,
    taxableAmount,
    salesTax,
    loanAmount,
    monthlyPayment,
    totalLoanCost,
    totalInterest,
    totalCostOfVehicle: down + netTradeIn + totalLoanCost,
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
  if (b === 0) return 0;
  return (a / b) * 100;
}

/** Percentage change from oldVal to newVal, e.g. 100 -> 125 = +25% */
export function percentChange(oldVal: number, newVal: number): number {
  if (oldVal === 0) return 0;
  return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
}

// ============================================================================
// 6. COMPOUND INTEREST CALCULATOR
// ============================================================================

export interface CompoundInput {
  principal: number; // starting amount
  monthlyContribution: number;
  annualRatePercent: number;
  years: number;
  compoundsPerYear: number; // 1 annually, 4 quarterly, 12 monthly, 365 daily
}

export interface CompoundResult {
  futureValue: number;
  totalContributions: number; // principal + all monthly deposits
  totalInterest: number;
  // Year-by-year balance for a simple table/chart
  yearlyBalances: { year: number; balance: number; contributed: number }[];
}

export function calcCompoundInterest(input: CompoundInput): CompoundResult {
  const principal = clamp(input.principal, 0, 1_000_000_000);
  const monthly = clamp(input.monthlyContribution, 0, 10_000_000);
  const rate = clamp(input.annualRatePercent, 0, 100) / 100;
  const years = clamp(input.years, 0, 100);
  const n = clamp(input.compoundsPerYear, 1, 365);

  const yearlyBalances: CompoundResult["yearlyBalances"] = [];
  let balance = principal;
  let contributed = principal;

  // Simulate month by month for accuracy with monthly contributions
  const periodRate = rate / n;
  const monthsPerCompound = 12 / n;
  let monthCounter = 0;

  for (let month = 1; month <= years * 12; month++) {
    balance += monthly;
    contributed += monthly;
    monthCounter++;
    // Apply compounding when a compounding period completes
    if (monthCounter >= monthsPerCompound) {
      balance *= 1 + periodRate;
      monthCounter = 0;
    }
    if (month % 12 === 0) {
      yearlyBalances.push({
        year: month / 12,
        balance,
        contributed,
      });
    }
  }

  return {
    futureValue: balance,
    totalContributions: contributed,
    totalInterest: balance - contributed,
    yearlyBalances,
  };
}
