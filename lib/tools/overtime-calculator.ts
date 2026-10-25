// ============================================================================
// OVERTIME PAY — FLSA time-and-a-half (29 U.S.C. 207, DOL Wage and Hour)
// Hours over 40 in one workweek are paid at ≥ 1.5 × the regular rate.
// Optional 2x (double time) for employers/states that pay it.
// "After tax" = take-home with OT minus take-home without OT, via the paycheck engine.
// ============================================================================

import { calcPaycheck, type FilingStatus } from "@/lib/paycheck";
import { safeAmount } from "@/lib/tools/no-tax-on-overtime-calculator";

export const FLSA_WEEKLY_HOURS = 40;

export interface OvertimeInput {
  hourlyRate: number; // regular rate of pay
  hoursPerWeek: number; // total hours worked in the workweek
  multiplier: 1.5 | 2;
  weeks: number; // weeks a year you work this schedule
  // optional after-tax estimate
  status?: FilingStatus;
  stateCode?: string;
}

export interface OvertimeResult {
  regularHours: number;
  overtimeHours: number;
  overtimeRate: number;
  regularPay: number; // per week
  overtimePay: number; // per week
  weeklyGross: number;
  annualOvertime: number;
  annualGross: number;
  premiumPerWeek: number; // the FLSA "half" — what can count for the no-tax-on-overtime deduction
  annualPremium: number;
  // after-tax view (federal + FICA + state, from lib/paycheck)
  overtimeTakeHomeAnnual: number;
  overtimeTakeHomeWeekly: number;
  overtimeKeptPercent: number; // share of OT pay you keep after tax
}

export function calcOvertime(input: OvertimeInput): OvertimeResult {
  const rate = safeAmount(input.hourlyRate);
  const hours = Math.min(safeAmount(input.hoursPerWeek), 168); // a week has 168 hours
  const mult = input.multiplier === 2 ? 2 : 1.5;
  const weeks = Math.min(safeAmount(input.weeks), 52);

  const regularHours = Math.min(hours, FLSA_WEEKLY_HOURS);
  const overtimeHours = Math.max(0, hours - FLSA_WEEKLY_HOURS);
  const overtimeRate = rate * mult;
  const regularPay = rate * regularHours;
  const overtimePay = overtimeRate * overtimeHours;
  const weeklyGross = regularPay + overtimePay;
  const premiumPerWeek = rate * 0.5 * overtimeHours;

  const annualOvertime = overtimePay * weeks;
  const annualGross = weeklyGross * weeks;

  const base = {
    payPeriodsPerYear: 52,
    status: input.status ?? "single",
    stateCode: input.stateCode ?? "TX",
    retirementPercent: 0,
    otherPretaxAnnual: 0,
  } as const;
  const withOt = calcPaycheck({ ...base, grossAnnual: annualGross }).net;
  const withoutOt = calcPaycheck({ ...base, grossAnnual: regularPay * weeks }).net;
  const overtimeTakeHomeAnnual = Math.max(0, withOt - withoutOt);

  return {
    regularHours,
    overtimeHours,
    overtimeRate,
    regularPay,
    overtimePay,
    weeklyGross,
    annualOvertime,
    annualGross,
    premiumPerWeek,
    annualPremium: premiumPerWeek * weeks,
    overtimeTakeHomeAnnual,
    overtimeTakeHomeWeekly: weeks > 0 ? overtimeTakeHomeAnnual / weeks : 0,
    overtimeKeptPercent: annualOvertime > 0 ? (overtimeTakeHomeAnnual / annualOvertime) * 100 : 0,
  };
}
