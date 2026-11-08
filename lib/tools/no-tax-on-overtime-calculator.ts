// ============================================================================
// NO TAX ON OVERTIME — qualified overtime deduction (OBBBA, P.L. 119-21, sec. 70202)
// Tax years 2025–2028. Math follows Schedule 1-A (Form 1040), Part III:
//   deduction = min(qualified OT, $12,500 / $25,000 MFJ)
//             − $100 × floor((MAGI − $150,000 / $300,000 MFJ) ÷ $1,000), never below 0.
// Married filing separately: not allowed (must file jointly).
// Income-tax deduction only — Social Security + Medicare still apply.
// Shared helpers yahan hain; tips calculator bhi inhe use karta hai.
// ============================================================================

import { FEDERAL_2026, type Bracket } from "@/lib/tax2026";
import { bracketTax } from "@/lib/paycheck";

export type DeductionStatus = "single" | "hoh" | "mfj" | "mfs";
export type OvertimeTaxYear = 2025 | 2026;

// IRS Rev. Proc. 2024-40 §2.01 (2025 brackets), 2025-32 §§3.01/4.01/4.14
// (amended 2025 standard deductions; 2026 brackets and standard deductions).
const brackets = (rows: number[][]): Bracket[] => rows.map(([over, rate]) => ({over, rate}));
const FEDERAL_2025 = {
  single: brackets([[0,.1],[11925,.12],[48475,.22],[103350,.24],[197300,.32],[250525,.35],[626350,.37]]),
  married: brackets([[0,.1],[23850,.12],[96950,.22],[206700,.24],[394600,.32],[501050,.35],[751600,.37]]),
  hoh: brackets([[0,.1],[17000,.12],[64850,.22],[103350,.24],[197300,.32],[250500,.35],[626350,.37]]),
  stdDeduction: {single:15750,married:31500,hoh:23625},
};
const FEDERAL_2026_DEDUCTION = {
  ...FEDERAL_2026,
  hoh: brackets([[0,.1],[17700,.12],[67450,.22],[105700,.24],[201750,.32],[256200,.35],[640600,.37]]),
  stdDeduction: {...FEDERAL_2026.stdDeduction,hoh:24150},
};

/** Safe number: NaN/negative -> 0, huge -> capped (keeps math finite). */
export function safeAmount(x: number): number {
  if (!Number.isFinite(x) || x <= 0) return 0;
  return Math.min(x, 1_000_000_000);
}

export const PHASE_OUT_START = { single: 150_000, mfj: 300_000 } as const;
export const PHASE_OUT_STEP = 1_000; // per full $1,000 of MAGI over the threshold…
export const PHASE_OUT_CUT = 100; // …the deduction drops by $100

export const OVERTIME_CAP = { single: 12_500, mfj: 25_000 } as const;

export interface PhaseOutResult {
  capped: number; // after the dollar cap
  reduction: number; // phase-out cut (never more than `capped`)
  deduction: number; // final deduction
  fullyPhasedOutAt: number; // MAGI where this deduction hits $0
}

/** Schedule 1-A phase-out: whole $1,000 steps only (1.5 -> 1, 0.05 -> 0). */
export function applyCapAndPhaseOut(amount: number, cap: number, magi: number, start: number): PhaseOutResult {
  const capped = Math.min(safeAmount(amount), cap);
  const over = safeAmount(magi) - start;
  const steps = over > 0 ? Math.floor(over / PHASE_OUT_STEP) : 0;
  const reduction = Math.min(capped, steps * PHASE_OUT_CUT);
  const deduction = Math.max(0, capped - reduction);
  // Smallest MAGI that wipes out `capped`: need steps ≥ capped/100
  const fullyPhasedOutAt = start + Math.ceil(capped / PHASE_OUT_CUT) * PHASE_OUT_STEP;
  return { capped, reduction, deduction, fullyPhasedOutAt };
}

export interface FederalSavings {
  taxableBefore: number; // taxable income before the new deduction (MAGI − standard deduction)
  taxSaved: number; // exact federal income tax difference
  marginalRate: number; // bracket of the last dollar before the deduction
}

/**
 * Federal income tax saved using the selected year's brackets/basic standard
 * deduction (assumes ordinary income, no itemizing, credits or other deductions).
 * MFS can't claim these deductions, so its saving is always $0 (brackets don't matter).
 */
export function federalSavings(magi: number, deduction: number, status: DeductionStatus, year: OvertimeTaxYear = 2026): FederalSavings {
  const key = status === "mfj" ? "married" : status === "hoh" ? "hoh" : "single";
  const federal = year === 2025 ? FEDERAL_2025 : FEDERAL_2026_DEDUCTION;
  const taxableBefore = Math.max(0, safeAmount(magi) - federal.stdDeduction[key]);
  const taxableAfter = Math.max(0, taxableBefore - (status === "mfs" ? 0 : safeAmount(deduction)));
  const brackets = federal[key];
  const taxSaved = bracketTax(taxableBefore, brackets) - bracketTax(taxableAfter, brackets);
  let marginalRate = brackets[0].rate;
  for (const b of brackets) if (taxableBefore > b.over) marginalRate = b.rate;
  return { taxableBefore, taxSaved: Math.max(0, taxSaved), marginalRate };
}

// ---------------------------------------------------------------------------

export type OvertimeMode = "hours" | "total" | "premium";

export interface OvertimeDeductionInput {
  mode: OvertimeMode;
  // mode "hours": your regular hourly rate and FLSA overtime hours for the year
  hourlyRate?: number;
  overtimeHoursPerWeek?: number;
  weeks?: number;
  // mode "total": total overtime pay on pay stubs (premium is 1/3 at 1.5x, 1/4 at 2x)
  totalOvertimePay?: number;
  multiplier?: 1.5 | 2;
  // mode "premium": amount already split out (W-2 box 12 code TT from 2026)
  premium?: number;
  magi: number; // modified AGI, including the overtime
  status: DeductionStatus;
  taxYear?: OvertimeTaxYear;
}

export interface OvertimeDeductionResult {
  eligible: boolean; // false for married filing separately
  totalOvertimePay: number; // all overtime dollars (0 if only the premium is known)
  qualifiedOvertime: number; // the "half" premium portion
  cap: number;
  capped: number;
  reduction: number;
  deduction: number;
  fullyPhasedOutAt: number;
  taxSaved: number;
  marginalRate: number;
}

export function calcOvertimeDeduction(input: OvertimeDeductionInput): OvertimeDeductionResult {
  const mult = input.multiplier === 2 ? 2 : 1.5;
  let total = 0;
  let qualified = 0;

  if (input.mode === "hours") {
    const rate = safeAmount(input.hourlyRate ?? 0);
    const hours = Math.min(safeAmount(input.overtimeHoursPerWeek ?? 0), 128); // 168 − 40
    const weeks = Math.min(safeAmount(input.weeks ?? 0), 52);
    total = rate * mult * hours * weeks;
    qualified = rate * 0.5 * hours * weeks; // only the FLSA "half" counts, even at double time
  } else if (input.mode === "total") {
    total = safeAmount(input.totalOvertimePay ?? 0);
    qualified = total * (0.5 / mult); // 1.5x -> ÷3, 2x -> ÷4 (IRS examples)
  } else {
    qualified = safeAmount(input.premium ?? 0);
  }

  const status = input.status;
  const eligible = status !== "mfs";
  const key = status === "mfj" ? "mfj" : "single";
  const cap = OVERTIME_CAP[key];
  const po = applyCapAndPhaseOut(qualified, cap, input.magi, PHASE_OUT_START[key]);
  const deduction = eligible ? po.deduction : 0;
  const fed = federalSavings(input.magi, deduction, status, input.taxYear);

  return {
    eligible,
    totalOvertimePay: total,
    qualifiedOvertime: qualified,
    cap,
    capped: po.capped,
    reduction: eligible ? po.reduction : 0,
    deduction,
    fullyPhasedOutAt: po.fullyPhasedOutAt,
    taxSaved: fed.taxSaved,
    marginalRate: fed.marginalRate,
  };
}
