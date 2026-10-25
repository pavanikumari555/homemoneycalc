// ============================================================================
// SOCIAL SECURITY COLA — 2027 raise estimate
// SSA announced a 3.6% COLA for 2027 on Oct 14, 2026 (Dec 2026 benefits, paid Jan 2027).
// Rounding (42 U.S.C. 415): increased amount drops to the next lower 10 cents;
// the monthly payment (after the Medicare Part B deduction) drops to the next
// lower whole dollar. SSA COLA ko PIA pe lagata hai, hum benefit pe — isliye
// result $1–2 tak alag ho sakta hai.
// Part B: 2027 premium CMS ne abhi (Oct 2026) announce nahi kiya — user input hai,
// default 2026 ka $202.90. "Hold harmless": jinke check se Part B katta hai,
// unka premium badhna COLA ke dollar raise se zyada nahi ho sakta.
// ============================================================================

export const COLA_2027_PERCENT = 3.6; // SSA, Oct 14, 2026
export const COLA_2026_PERCENT = 2.8;
export const PART_B_2026 = 202.9; // CMS fact sheet, Nov 14, 2025

function money(x: number): number {
  if (!Number.isFinite(x) || x <= 0) return 0;
  return Math.min(x, 1_000_000);
}

/** Round down to the next lower multiple of $0.10 (tiny epsilon guards float noise like 2071.9999). */
export function floorDime(x: number): number {
  return Math.floor(x * 10 + 1e-6) / 10;
}

export interface ColaInput {
  benefit: number; // current monthly benefit BEFORE Medicare is taken out (Dec 2026 / 2026 amount)
  colaPercent: number; // 3.6 for 2027
  partBNow: number; // 2026 Part B premium deducted (0 if none)
  partBNext: number; // 2027 Part B premium (user estimate until CMS announces)
  holdHarmless: boolean; // Part B was deducted from the check in both years
}

export interface ColaResult {
  newBenefit: number; // gross after COLA (to the dime)
  raiseMonthly: number; // gross increase
  raiseYearly: number;
  netNow: number; // deposit now (whole dollars)
  netNext: number; // deposit in 2027 (whole dollars)
  netChangeMonthly: number;
  partBCharged: number; // 2027 premium actually charged (after hold harmless)
  holdHarmlessApplied: boolean;
  partBEatsPercent: number; // share of the raise taken by the Part B increase (0–100+)
  effectiveRaisePercent: number; // net deposit change in %
}

export function calcCola(input: ColaInput): ColaResult {
  const benefit = money(input.benefit);
  const cola = Math.max(-50, Math.min(Number.isFinite(input.colaPercent) ? input.colaPercent : 0, 100));
  const partBNow = Math.min(money(input.partBNow), benefit);
  const partBNextRaw = money(input.partBNext);

  const newBenefit = floorDime(benefit * (1 + cola / 100));
  const raiseMonthly = newBenefit - benefit;

  // Hold harmless: premium increase capped at the dollar COLA raise (only if it'd shrink the check)
  let partBCharged = partBNextRaw;
  let holdHarmlessApplied = false;
  if (input.holdHarmless && partBNow > 0 && partBNextRaw - partBNow > Math.max(0, raiseMonthly)) {
    partBCharged = partBNow + Math.max(0, raiseMonthly);
    holdHarmlessApplied = true;
  }
  partBCharged = Math.min(partBCharged, newBenefit);

  const netNow = Math.floor(Math.max(0, benefit - partBNow) + 1e-6);
  const netNext = Math.floor(Math.max(0, newBenefit - partBCharged) + 1e-6);
  const premiumRise = partBCharged - partBNow;

  return {
    newBenefit,
    raiseMonthly,
    raiseYearly: raiseMonthly * 12,
    netNow,
    netNext,
    netChangeMonthly: netNext - netNow,
    partBCharged,
    holdHarmlessApplied,
    partBEatsPercent: raiseMonthly > 0 ? Math.max(0, (premiumRise / raiseMonthly) * 100) : 0,
    effectiveRaisePercent: netNow > 0 ? ((netNext - netNow) / netNow) * 100 : 0,
  };
}
