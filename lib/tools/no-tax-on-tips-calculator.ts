// ============================================================================
// NO TAX ON TIPS — qualified tips deduction (OBBBA, P.L. 119-21, sec. 70201)
// Tax years 2025–2028. Math follows Schedule 1-A (Form 1040), Part II:
//   deduction = min(qualified tips, $25,000 per return — same for MFJ)
//             − $100 × floor((MAGI − $150,000 / $300,000 MFJ) ÷ $1,000), never below 0.
// Tips must be from an occupation on the IRS tipped-occupations list.
// Self-employed: can't exceed net profit of that business. MFS: not allowed.
// Income-tax deduction only — Social Security + Medicare still apply.
// ============================================================================

import { FEDERAL_2026 } from "@/lib/tax2026";
import {
  applyCapAndPhaseOut,
  federalSavings,
  safeAmount,
  PHASE_OUT_START,
  type DeductionStatus,
} from "@/lib/tools/no-tax-on-overtime-calculator";

export const TIPS_CAP = 25_000; // per return, single or joint

export interface TipsDeductionInput {
  tips: number; // qualified tips (W-2 box 7 / box 12 code TP, 1099s, or Form 4137)
  listedOccupation: boolean; // worked in an occupation on IRS.gov/TippedOccupations
  selfEmployed: boolean;
  netProfit?: number; // self-employed only: net profit of the business where tips were earned
  magi: number;
  status: DeductionStatus;
}

export interface TipsDeductionResult {
  eligible: boolean;
  reason: "" | "mfs" | "occupation";
  qualifiedTips: number; // after the self-employed net-profit limit
  limitedByProfit: boolean;
  capped: number;
  reduction: number;
  deduction: number;
  fullyPhasedOutAt: number;
  taxSaved: number;
  marginalRate: number;
  ficaOnTips: number; // employee share of Social Security + Medicare (rough); self-employed pay SE tax instead
}

export function calcTipsDeduction(input: TipsDeductionInput): TipsDeductionResult {
  const tips = safeAmount(input.tips);
  const profit = safeAmount(input.netProfit ?? 0);
  const qualifiedTips = input.selfEmployed ? Math.min(tips, profit) : tips;
  const limitedByProfit = input.selfEmployed && profit < tips;

  const reason = input.status === "mfs" ? "mfs" : !input.listedOccupation ? "occupation" : "";
  const eligible = reason === "";
  const key = input.status === "mfj" ? "mfj" : "single";
  const po = applyCapAndPhaseOut(qualifiedTips, TIPS_CAP, input.magi, PHASE_OUT_START[key]);
  const deduction = eligible ? po.deduction : 0;
  const fed = federalSavings(input.magi, deduction, input.status);
  const fica = FEDERAL_2026.socialSecurity.rate + FEDERAL_2026.medicare.rate;

  return {
    eligible,
    reason,
    qualifiedTips,
    limitedByProfit,
    capped: po.capped,
    reduction: eligible ? po.reduction : 0,
    deduction,
    fullyPhasedOutAt: po.fullyPhasedOutAt,
    taxSaved: fed.taxSaved,
    marginalRate: fed.marginalRate,
    ficaOnTips: input.selfEmployed ? 0 : tips * fica,
  };
}
