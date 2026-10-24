// ============================================================================
// PAYCHECK (TAKE-HOME PAY) LOGIC — 2026
// Federal brackets + FICA + har state ka asli tax (lib/tax2026.ts se).
// Estimate hai: itemized deductions, dependents/credits, local city tax, W-4
// choices model nahi karte. Ye sab assumptions page pe clearly likhe hain.
// ============================================================================

import { FEDERAL_2026, STATES, StateTax, Bracket } from "./tax2026";
import { clamp } from "./calc";

export type FilingStatus = "single" | "married";

export interface PaycheckInput {
  grossAnnual: number;
  payPeriodsPerYear: number; // 52 weekly, 26 biweekly, 24 semimonthly, 12 monthly
  status: FilingStatus;
  stateCode: string;
  retirementPercent: number; // traditional 401(k)/403(b), % of gross (pre-tax)
  otherPretaxAnnual: number; // health/dental/HSA premiums etc. (pre-tax, also FICA-exempt)
}

export interface PaycheckResult {
  gross: number;
  retirement: number;
  otherPretax: number;
  federalTax: number;
  socialSecurity: number;
  medicare: number;
  stateTax: number;
  statePayroll: { name: string; amount: number }[];
  statePayrollTotal: number;
  net: number;
  effectiveRate: number; // all taxes / gross
  marginalFederal: number; // federal bracket of the last dollar
  federalTaxable: number;
  state: StateTax;
}

/** Progressive tax: each rate applies only to the slice of income in its bracket. */
export function bracketTax(income: number, brackets: Bracket[]): number {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const lo = brackets[i].over;
    const hi = i + 1 < brackets.length ? brackets[i + 1].over : Infinity;
    if (income <= lo) break;
    tax += (Math.min(income, hi) - lo) * brackets[i].rate;
  }
  return Math.max(0, tax);
}

function marginalRate(income: number, brackets: Bracket[]): number {
  let rate = 0;
  for (const b of brackets) if (income > b.over) rate = b.rate;
  return rate;
}

export function getState(code: string): StateTax {
  return STATES.find((s) => s.code === code) ?? STATES.find((s) => s.code === "TX") ?? STATES[0];
}

export function calcPaycheck(input: PaycheckInput): PaycheckResult {
  const gross = clamp(input.grossAnnual, 0, 100_000_000);
  const status = input.status;
  const retirement = gross * (clamp(input.retirementPercent, 0, 100) / 100);
  const otherPretax = clamp(input.otherPretaxAnnual, 0, Math.max(0, gross - retirement));
  const state = getState(input.stateCode);

  // Federal income tax: 401(k) and cafeteria-plan deductions both reduce taxable wages
  const federalTaxable = Math.max(0, gross - retirement - otherPretax - FEDERAL_2026.stdDeduction[status]);
  const federalTax = bracketTax(federalTaxable, FEDERAL_2026[status]);

  // FICA: 401(k) deferrals are still FICA wages; cafeteria-plan premiums are not
  const ficaWages = Math.max(0, gross - otherPretax);
  const socialSecurity = Math.min(ficaWages, FEDERAL_2026.socialSecurity.wageBase) * FEDERAL_2026.socialSecurity.rate;
  const m = FEDERAL_2026.medicare;
  const medicare = ficaWages * m.rate + Math.max(0, ficaWages - m.additionalThreshold[status]) * m.additionalRate;

  // State income tax (simplified: most states follow federal treatment of 401(k)/premiums)
  let stateTax = 0;
  if (state.type !== "none") {
    const stateTaxable = Math.max(
      0,
      gross - retirement - otherPretax - state.stdDeduction[status] - state.personalExemption[status]
    );
    stateTax = Math.max(0, bracketTax(stateTaxable, state[status]) - state.personalCredit[status]);
  }

  const statePayroll = state.payroll.map((p) => ({
    name: p.name,
    amount: Math.min(ficaWages, p.wageCap ?? Infinity) * p.rate,
  }));
  const statePayrollTotal = statePayroll.reduce((s, p) => s + p.amount, 0);

  const taxes = federalTax + socialSecurity + medicare + stateTax + statePayrollTotal;
  const net = Math.max(0, gross - retirement - otherPretax - taxes);

  return {
    gross,
    retirement,
    otherPretax,
    federalTax,
    socialSecurity,
    medicare,
    stateTax,
    statePayroll,
    statePayrollTotal,
    net,
    effectiveRate: gross > 0 ? taxes / gross : 0,
    marginalFederal: marginalRate(federalTaxable, FEDERAL_2026[status]),
    federalTaxable,
    state,
  };
}

/** Take-home for the same inputs in every state (for the "compare states" table). */
export function compareStates(input: PaycheckInput): { code: string; name: string; net: number }[] {
  return STATES.map((s) => ({ code: s.code, name: s.name, net: calcPaycheck({ ...input, stateCode: s.code }).net })).sort(
    (a, b) => b.net - a.net
  );
}
