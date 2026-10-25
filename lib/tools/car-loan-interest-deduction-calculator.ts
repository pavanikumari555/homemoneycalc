// ============================================================================
// CAR LOAN INTEREST DEDUCTION — "No Tax on Car Loan Interest"
// OBBBA (P.L. 119-21, sec. 70203), tax years 2025–2028.
// Math follows Schedule 1-A (Form 1040) 2025, Part IV:
//   line 24  capped   = min(interest paid in the year, $10,000)
//   line 28  steps    = (MAGI − $100,000 / $200,000 MFJ) ÷ $1,000, rounded UP to a whole number
//   line 29  cut      = steps × $200
//   line 30  deduction = capped − cut, never below 0
// Eligibility (new, US final assembly, personal use, loan after 2024, first lien,
// VIN on return, no leases) user khud confirm karta hai — math sirf amount nikalta hai.
// Tax-saved estimate 2026 federal brackets + standard deduction se (lib/tax2026.ts).
// ============================================================================

import { amortizedPayment } from "@/lib/calc";
import { FEDERAL_2026 } from "@/lib/tax2026";
import { bracketTax } from "@/lib/paycheck";

export type CarLoanStatus = "single" | "mfj"; // "single" = single, head of household, married filing separately

export const CAR_INTEREST_CAP = 10_000;
export const CAR_PHASE_OUT_START = { single: 100_000, mfj: 200_000 } as const;
export const CAR_PHASE_OUT_STEP = 1_000; // per $1,000 (or part of $1,000) over the threshold…
export const CAR_PHASE_OUT_CUT = 200; // …the deduction drops by $200
export const CAR_DEDUCTION_YEARS = [2025, 2026, 2027, 2028] as const;

/** Safe money: NaN / negative -> 0, huge -> capped so math stays finite. */
function money(x: number): number {
  if (!Number.isFinite(x) || x <= 0) return 0;
  return Math.min(x, 1_000_000_000);
}

function clampInt(x: number, lo: number, hi: number, fallback: number): number {
  if (!Number.isFinite(x)) return fallback;
  return Math.min(hi, Math.max(lo, Math.round(x)));
}

export interface CarLoanDeductionInput {
  loanAmount: number; // amount financed
  annualRatePercent: number; // APR
  termMonths: number;
  purchaseMonth: number; // 1–12 (first payment is due the following month)
  purchaseYear: number; // 2025–2028
  taxYear: number; // year to estimate (2025–2028)
  magi: number; // modified AGI (Schedule 1-A line 3)
  status: CarLoanStatus;
}

export interface CarLoanYearRow {
  year: number;
  interest: number; // interest paid in that calendar year
  deduction: number; // after $10k cap + phase-out (0 outside 2025–2028)
}

export interface CarLoanDeductionResult {
  monthlyPayment: number;
  paymentsInYear: number; // payments falling in the tax year
  interestInYear: number; // interest paid in the tax year
  capped: number; // line 24
  reduction: number; // line 29 (limited to `capped`)
  deduction: number; // line 30
  fullyPhasedOutAbove: number; // deduction is $0 when MAGI is above this
  taxableBefore: number; // MAGI − 2026 standard deduction (estimate)
  taxSaved: number; // federal income tax difference
  marginalRate: number;
  yearOutsideWindow: boolean; // tax year not in 2025–2028
  purchaseTooEarly: boolean; // bought before 2025 -> not eligible
  totalInterestLoan: number;
  years: CarLoanYearRow[]; // 2025–2028 only (deduction window)
  totalDeduction: number; // sum over the window (same MAGI every year)
}

/** Schedule 1-A Part IV phase-out: partial $1,000 counts as a full step (rounded UP). */
export function carLoanPhaseOut(interest: number, magi: number, status: CarLoanStatus) {
  const capped = Math.min(money(interest), CAR_INTEREST_CAP);
  const start = CAR_PHASE_OUT_START[status];
  const over = money(magi) - start;
  const steps = over > 0 ? Math.ceil(over / CAR_PHASE_OUT_STEP) : 0;
  const reduction = Math.min(capped, steps * CAR_PHASE_OUT_CUT);
  const deduction = Math.max(0, capped - reduction);
  // Deduction is $0 once MAGI is ABOVE this: steps ≥ capped/200, and steps round up,
  // so any MAGI above start + (needed − 1) × $1,000 is enough.
  const needed = Math.ceil(capped / CAR_PHASE_OUT_CUT);
  const fullyPhasedOutAbove = needed === 0 ? start : start + (needed - 1) * CAR_PHASE_OUT_STEP;
  return { capped, reduction, deduction, fullyPhasedOutAbove };
}

/** Federal income tax saved by a deduction, using 2026 brackets (estimate). */
export function federalSavings(magi: number, deduction: number, status: CarLoanStatus) {
  const key = status === "mfj" ? "married" : "single";
  const taxableBefore = Math.max(0, money(magi) - FEDERAL_2026.stdDeduction[key]);
  const brackets = FEDERAL_2026[key];
  const taxSaved = bracketTax(taxableBefore, brackets) - bracketTax(Math.max(0, taxableBefore - money(deduction)), brackets);
  let marginalRate = 0;
  for (const b of brackets) if (taxableBefore > b.over) marginalRate = b.rate;
  return { taxableBefore, taxSaved, marginalRate };
}

/** Interest paid in each calendar year, payments starting the month after purchase. */
function interestByYear(principal: number, rate: number, term: number, purchaseMonth: number, purchaseYear: number) {
  const pay = amortizedPayment(principal, rate, term);
  const r = rate / 100 / 12;
  const byYear = new Map<number, { interest: number; payments: number }>();
  let balance = principal;
  let total = 0;
  for (let k = 1; k <= term && balance > 0.005; k++) {
    const idx = purchaseMonth - 1 + k; // months after Jan of purchase year (0-based)
    const year = purchaseYear + Math.floor(idx / 12);
    const interest = balance * r;
    const principalPaid = Math.min(balance, pay - interest);
    balance -= principalPaid;
    total += interest;
    const row = byYear.get(year) ?? { interest: 0, payments: 0 };
    row.interest += interest;
    row.payments += 1;
    byYear.set(year, row);
  }
  return { pay, byYear, total };
}

export function calcCarLoanDeduction(input: CarLoanDeductionInput): CarLoanDeductionResult {
  const principal = money(input.loanAmount);
  const rate = Math.min(money(input.annualRatePercent), 100);
  const term = clampInt(input.termMonths, 1, 120, 60);
  const purchaseMonth = clampInt(input.purchaseMonth, 1, 12, 1);
  const purchaseYear = clampInt(input.purchaseYear, 2000, 2100, 2026);
  const taxYear = clampInt(input.taxYear, 2000, 2100, 2026);
  const status: CarLoanStatus = input.status === "mfj" ? "mfj" : "single";
  const magi = money(input.magi);

  const { pay, byYear, total } = interestByYear(principal, rate, term, purchaseMonth, purchaseYear);
  const purchaseTooEarly = purchaseYear < 2025;
  const inWindow = (y: number) => y >= 2025 && y <= 2028;
  const yearOutsideWindow = !inWindow(taxYear);

  const thisYear = byYear.get(taxYear) ?? { interest: 0, payments: 0 };
  const eligible = !purchaseTooEarly && !yearOutsideWindow;
  const po = carLoanPhaseOut(eligible ? thisYear.interest : 0, magi, status);
  const fed = federalSavings(magi, po.deduction, status);

  const years: CarLoanYearRow[] = CAR_DEDUCTION_YEARS.map((year) => {
    const interest = byYear.get(year)?.interest ?? 0;
    const deduction = purchaseTooEarly ? 0 : carLoanPhaseOut(interest, magi, status).deduction;
    return { year, interest, deduction };
  });

  return {
    monthlyPayment: pay,
    paymentsInYear: thisYear.payments,
    interestInYear: thisYear.interest,
    capped: po.capped,
    reduction: po.reduction,
    deduction: po.deduction,
    fullyPhasedOutAbove: po.fullyPhasedOutAbove,
    taxableBefore: fed.taxableBefore,
    taxSaved: fed.taxSaved,
    marginalRate: fed.marginalRate,
    yearOutsideWindow,
    purchaseTooEarly,
    totalInterestLoan: total,
    years,
    totalDeduction: years.reduce((s, y) => s + y.deduction, 0),
  };
}
