// ============================================================================
// HSA CALCULATOR — contribution limit, room left, tax savings, growth.
// Limits: IRS Rev. Proc. 2025-19 (2026) aur Rev. Proc. 2026-24 (2027).
// Catch-up $1,000 (age 55+) law me fixed hai — IRC §223(b)(3), inflation se nahi badhta.
// Tax savings = taxes WITH vs WITHOUT the contribution (lib/paycheck.ts engine se),
// isliye bracket boundary cross ho to bhi sahi aata hai.
// ============================================================================

import { calcPaycheck, type FilingStatus } from "../paycheck";
import { clamp, calcCompoundInterest } from "../calc";

export type HsaYear = 2026 | 2027;
export type HsaCoverage = "self" | "family";

/** Annual HSA contribution limits (employee + employer combined). */
export const HSA_LIMITS: Record<HsaYear, { self: number; family: number; catchUp: number; minDeductible: { self: number; family: number }; maxOutOfPocket: { self: number; family: number } }> = {
  // Rev. Proc. 2025-19 §2.01
  2026: { self: 4_400, family: 8_750, catchUp: 1_000, minDeductible: { self: 1_700, family: 3_400 }, maxOutOfPocket: { self: 8_500, family: 17_000 } },
  // Rev. Proc. 2026-24 §3.01
  2027: { self: 4_500, family: 9_000, catchUp: 1_000, minDeductible: { self: 1_750, family: 3_500 }, maxOutOfPocket: { self: 8_700, family: 17_400 } },
};

// These states tax HSA contributions (no state deduction / exclusion).
export const NO_STATE_HSA_DEDUCTION = new Set(["CA", "NJ"]);

export interface HsaInput {
  year: HsaYear;
  coverage: HsaCoverage;
  age55: boolean;
  yourContribution: number; // per year, what YOU put in
  employerContribution: number; // per year, employer seed/match
  viaPayroll: boolean; // cafeteria plan (Section 125) -> also skips FICA
  income: number; // annual wages
  status: FilingStatus;
  stateCode: string;
  // Growth projection
  startBalance: number;
  years: number;
  returnPercent: number;
}

export interface HsaResult {
  limit: number;
  totalContribution: number; // you + employer (as entered)
  roomLeft: number; // how much more you could add this year (>= 0)
  excess: number; // amount over the limit (6% excise tax each year it stays)
  countedContribution: number; // your contribution that actually gets tax benefits (capped)
  federalSaved: number;
  ficaSaved: number;
  stateSaved: number;
  stateDeductible: boolean;
  totalSaved: number;
  effectiveCost: number; // your contribution minus tax saved
  perPaycheck26: number; // your contribution split over 26 biweekly checks
  futureValue: number;
  totalDeposited: number;
  growth: number;
  yearly: { x: number; balance: number; contributed: number }[];
}

export function calcHsa(input: HsaInput): HsaResult {
  const L = HSA_LIMITS[input.year] ?? HSA_LIMITS[2026];
  const limit = (input.coverage === "family" ? L.family : L.self) + (input.age55 ? L.catchUp : 0);

  const yours = clamp(input.yourContribution, 0, 1_000_000);
  const employer = clamp(input.employerContribution, 0, 1_000_000);
  const income = clamp(input.income, 0, 100_000_000);
  const totalContribution = yours + employer;
  const roomLeft = Math.max(0, limit - totalContribution);
  const excess = Math.max(0, totalContribution - limit);

  // Employer money counts toward the limit first; your tax-favored part is what fits after it.
  // Payroll contributions can't exceed your wages.
  const counted = Math.min(yours, Math.max(0, limit - employer), income);

  const base = { grossAnnual: income, payPeriodsPerYear: 26, status: input.status, stateCode: input.stateCode, retirementPercent: 0 };
  const without = calcPaycheck({ ...base, otherPretaxAnnual: 0 });
  const withHsa = calcPaycheck({ ...base, otherPretaxAnnual: counted });

  const federalSaved = Math.max(0, without.federalTax - withHsa.federalTax);
  const ficaSaved = input.viaPayroll
    ? Math.max(0, without.socialSecurity + without.medicare - withHsa.socialSecurity - withHsa.medicare)
    : 0;
  const stateDeductible = !NO_STATE_HSA_DEDUCTION.has(withHsa.state.code);
  const stateSaved = stateDeductible ? Math.max(0, without.stateTax - withHsa.stateTax) : 0;
  const totalSaved = federalSaved + ficaSaved + stateSaved;

  // Growth: same yearly total (you + employer, capped at the limit) deposited monthly
  const yearlyDeposit = Math.min(totalContribution, limit);
  const g = calcCompoundInterest({
    principal: clamp(input.startBalance, 0, 100_000_000),
    monthlyContribution: yearlyDeposit / 12,
    annualRatePercent: clamp(input.returnPercent, -50, 50),
    years: clamp(Math.round(input.years), 0, 60),
    compoundsPerYear: 12,
    annualIncreasePercent: 0,
  });

  return {
    limit,
    totalContribution,
    roomLeft,
    excess,
    countedContribution: counted,
    federalSaved,
    ficaSaved,
    stateSaved,
    stateDeductible,
    totalSaved,
    effectiveCost: Math.max(0, counted - totalSaved),
    perPaycheck26: yours / 26,
    futureValue: g.futureValue,
    totalDeposited: g.totalContributions,
    growth: g.totalInterest,
    yearly: g.yearly,
  };
}
