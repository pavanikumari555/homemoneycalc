// ============================================================================
// SENIOR DEDUCTION — "enhanced deduction for seniors" (OBBBA, P.L. 119-21, sec. 70103)
// Tax years 2025–2028. Math follows Schedule 1-A (Form 1040) 2025, Part V:
//   line 34  cut       = 6% × (MAGI − $75,000 / $150,000 MFJ), if positive
//   line 35  perPerson = $6,000 − cut, never below 0
//   line 37  total     = perPerson × (you 65+ with valid SSN) + perPerson × (spouse, MFJ only)
// Note: MFJ me 6% cut har spouse ke $6,000 pe alag lagta hai (line 35 dono ke liye same).
// Married filing separately: not allowed. Ye regular 65+ additional standard
// deduction ke UPAR milta hai, itemize karo ya na karo.
// Tax-saved estimate 2026 brackets + 2026 standard deduction (+ 65+ add-on) se.
// ============================================================================

import { FEDERAL_2026 } from "@/lib/tax2026";
import { bracketTax } from "@/lib/paycheck";

export type SeniorStatus = "single" | "mfj" | "mfs"; // "single" also covers head of household for the phase-out

export const SENIOR_AMOUNT = 6_000;
export const SENIOR_PHASE_OUT_START = { single: 75_000, mfj: 150_000 } as const;
export const SENIOR_PHASE_OUT_RATE = 0.06;

/** 2026 additional standard deduction for age 65+ (Rev. Proc. 2025-32): unmarried $2,050; married, per spouse $1,650. */
export const ADDITIONAL_STD_65_2026 = { unmarried: 2_050, married: 1_650 } as const;

function money(x: number): number {
  if (!Number.isFinite(x) || x <= 0) return 0;
  return Math.min(x, 1_000_000_000);
}

export interface SeniorInput {
  status: SeniorStatus;
  magi: number;
  you65: boolean; // 65 or older by Dec 31 of the tax year, with a valid SSN
  spouse65: boolean; // only counts for MFJ
}

export interface SeniorResult {
  qualifyingPeople: number; // 0, 1 or 2
  perPerson: number; // line 35
  cutPerPerson: number; // line 34 (limited to $6,000)
  total: number; // line 37
  maxPossible: number; // $6,000 × qualifying people
  fullyPhasedOutAt: number; // MAGI where it reaches $0
  mfsBlocked: boolean;
  regularAddOn: number; // 2026 additional standard deduction for 65+ (already in the law before OBBBA)
  taxableBefore: number; // MAGI − 2026 standard deduction − 65+ add-on (estimate)
  taxSaved: number; // federal income tax saved by the $6,000 deduction(s)
  marginalRate: number;
}

export function calcSeniorDeduction(input: SeniorInput): SeniorResult {
  const status: SeniorStatus = input.status === "mfj" || input.status === "mfs" ? input.status : "single";
  const magi = money(input.magi);
  const mfsBlocked = status === "mfs";
  const qualifyingPeople = mfsBlocked ? 0 : (input.you65 ? 1 : 0) + (status === "mfj" && input.spouse65 ? 1 : 0);

  const start = status === "mfj" ? SENIOR_PHASE_OUT_START.mfj : SENIOR_PHASE_OUT_START.single;
  const cut = Math.max(0, magi - start) * SENIOR_PHASE_OUT_RATE;
  const cutPerPerson = Math.min(SENIOR_AMOUNT, cut);
  const perPerson = Math.max(0, SENIOR_AMOUNT - cut);
  const total = perPerson * qualifyingPeople;
  const fullyPhasedOutAt = start + SENIOR_AMOUNT / SENIOR_PHASE_OUT_RATE; // $175k / $250k

  // Regular 65+ add-on (people 65+ get it even under MFS; spouse only counts on a joint return here)
  const people65 = (input.you65 ? 1 : 0) + (status === "mfj" && input.spouse65 ? 1 : 0);
  const regularAddOn = status === "single" ? people65 * ADDITIONAL_STD_65_2026.unmarried : people65 * ADDITIONAL_STD_65_2026.married;

  const key = status === "mfj" ? "married" : "single"; // MFS uses single-width brackets + $16,100 std deduction
  const taxableBefore = Math.max(0, magi - FEDERAL_2026.stdDeduction[key] - regularAddOn);
  const brackets = FEDERAL_2026[key];
  const taxSaved = bracketTax(taxableBefore, brackets) - bracketTax(Math.max(0, taxableBefore - total), brackets);
  let marginalRate = 0;
  for (const b of brackets) if (taxableBefore > b.over) marginalRate = b.rate;

  return {
    qualifyingPeople,
    perPerson,
    cutPerPerson,
    total,
    maxPossible: SENIOR_AMOUNT * qualifyingPeople,
    fullyPhasedOutAt,
    mfsBlocked,
    regularAddOn,
    taxableBefore,
    taxSaved,
    marginalRate,
  };
}
