// ============================================================================
// PAYCHECK (TAKE-HOME PAY) LOGIC — 2026
// Federal brackets + FICA + har state ka asli tax (lib/tax2026.ts se).
// Married couple me do earners ho sakte hain: Social Security cap, 401(k) limit
// aur state payroll caps PER WORKER lagte hain, household pe ek baar nahi.
// Maryland county tax model hota hai; Indiana county rate user dalta hai.
// Estimate hai: itemized deductions, dependents/credits, city taxes (PA/OH/NYC),
// W-4 choices model nahi karte. Ye sab assumptions page pe clearly likhe hain.
// ============================================================================

import { FEDERAL_2026, STATES, StateTax, Bracket, LOCAL_INCOME_TAX, LOCAL_TAX_NOTES, LocalIncomeTax } from "./tax2026";
import { clamp } from "./calc";

export type FilingStatus = "single" | "married";

export interface PaycheckInput {
  grossAnnual: number; // married: BOTH spouses' wages combined
  payPeriodsPerYear: number; // 52 weekly, 26 biweekly, 24 semimonthly, 12 monthly
  status: FilingStatus;
  stateCode: string;
  retirementPercent: number; // traditional 401(k)/403(b), % of gross (pre-tax), same % for each earner
  otherPretaxAnnual: number; // health/dental/HSA premiums etc. (pre-tax, also FICA-exempt)
  /** Married only: how much of grossAnnual the second earner makes. 0/omitted = one earner (old behavior). */
  spouseWages?: number;
  /** Part of otherPretaxAnnual that is an HSA contribution (California and New Jersey tax it). Default 0. */
  hsaAnnual?: number;
  /** County option code from LOCAL_INCOME_TAX (e.g. Maryland "MG"). Omitted = that state's default. */
  localCode?: string;
  /** User-entered county income tax rate in % (Indiana, or any county). Overrides localCode when > 0. */
  localRatePercent?: number;
}

export interface PaycheckResult {
  gross: number;
  retirementCapped: boolean; // 401(k) % would exceed the annual IRS limit (for at least one earner)
  retirement: number;
  otherPretax: number;
  federalTax: number;
  socialSecurity: number;
  medicare: number;
  stateTax: number;
  localTax: number; // county income tax (MD / IN); 0 elsewhere
  localName: string | null; // e.g. "Montgomery County" or "Your county (2.02%)"
  localMissing: boolean; // state has a mandatory county tax but no rate was given (Indiana) -> warn
  localNote: string | null; // city/local taxes we don't model (PA, OH, NY)
  local: LocalIncomeTax | null;
  statePayroll: { name: string; amount: number }[];
  statePayrollTotal: number;
  net: number;
  effectiveRate: number; // all taxes / gross
  marginalFederal: number; // federal bracket of the last dollar
  federalTaxable: number;
  earners: number; // 1 or 2
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

// 2026 employee 401(k)/403(b) elective deferral limit (IRS, before age-50 catch-up) — per person
export const RETIREMENT_LIMIT_2026 = 24_500;

// NJ excludes traditional 401(k) deferrals (other retirement plans can differ).
// Source: https://www.nj.gov/treasury/taxation/njit5.shtml
const NO_STATE_401K_DEDUCTION = new Set(["PA"]);

// States that tax HSA contributions (no state exclusion)
const NO_STATE_HSA_EXCLUSION = new Set(["CA", "NJ"]);

// Personal exemption that shrinks as income rises ($1 lost per $1 over the start)
const EXEMPTION_PHASE_OUT: Record<string, { single: number; married: number }> = {
  CT: { single: 30_000, married: 48_000 }, // CT DRS: gone by ~$45k single / ~$72k joint
};

// Standard deduction that shrinks by `rate` x income over `start` (never below 0)
const STD_DEDUCTION_PHASE_OUT: Record<string, { single: { start: number; rate: number }; married: { start: number; rate: number } }> = {
  // WI DOR 2026 Form 1-ES / WT-4A tables: $13,960 - 12% over $20,120 (0 at $136,453);
  // joint $25,840 - 19.778% over $29,040 (0 at $159,690)
  WI: { single: { start: 20_120, rate: 0.12 }, married: { start: 29_040, rate: 0.19778 } },
};

/** Which county brackets apply (or none). */
function resolveLocal(
  state: StateTax,
  status: FilingStatus,
  localCode: string | undefined,
  localRatePercent: number | undefined
): { local: LocalIncomeTax | null; brackets: Bracket[] | null; name: string | null; missing: boolean } {
  const local = LOCAL_INCOME_TAX[state.code] ?? null;
  if (!local) return { local: null, brackets: null, name: null, missing: false };
  const custom = Number.isFinite(localRatePercent) ? clamp(localRatePercent as number, 0, 10) : 0;
  if (custom > 0) {
    return { local, brackets: [{ over: 0, rate: custom / 100 }], name: `Your county (${+custom.toFixed(4)}%)`, missing: false };
  }
  const opt =
    local.options.find((o) => o.code === localCode) ?? local.options.find((o) => o.code === local.defaultCode) ?? null;
  if (!opt) return { local, brackets: null, name: null, missing: true };
  return { local, brackets: opt[status], name: opt.name, missing: false };
}

export function calcPaycheck(input: PaycheckInput): PaycheckResult {
  const gross = clamp(input.grossAnnual, 0, 100_000_000);
  const status = input.status;
  const state = getState(input.stateCode);

  // Earners: married couple can have two paychecks; single is always one
  const spouse = status === "married" ? clamp(input.spouseWages ?? 0, 0, gross) : 0;
  const wages = spouse > 0 ? [gross - spouse, spouse] : [gross];

  // 401(k): same % for each earner, IRS limit is per person
  const pct = clamp(input.retirementPercent, 0, 100) / 100;
  const retirement = wages.reduce((s, w) => s + Math.min(w * pct, RETIREMENT_LIMIT_2026), 0);
  const retirementCapped = wages.some((w) => w * pct > RETIREMENT_LIMIT_2026);

  const otherPretax = clamp(input.otherPretaxAnnual, 0, Math.max(0, gross - retirement));
  const hsa = clamp(input.hsaAnnual ?? 0, 0, otherPretax);

  // Federal income tax: 401(k) and cafeteria-plan deductions both reduce taxable wages
  const federalTaxable = Math.max(0, gross - retirement - otherPretax - FEDERAL_2026.stdDeduction[status]);
  const federalTax = bracketTax(federalTaxable, FEDERAL_2026[status]);

  // FICA: 401(k) deferrals are still FICA wages; cafeteria-plan premiums are not.
  // Premiums are split between earners in proportion to wages.
  const ficaByEarner = wages.map((w) => Math.max(0, w - (gross > 0 ? otherPretax * (w / gross) : 0)));
  const ficaWages = ficaByEarner.reduce((s, w) => s + w, 0);
  const ss = FEDERAL_2026.socialSecurity;
  const socialSecurity = ficaByEarner.reduce((s, w) => s + Math.min(w, ss.wageBase) * ss.rate, 0); // cap per worker
  const m = FEDERAL_2026.medicare;
  // Additional Medicare 0.9%: threshold is on the couple's combined wages for joint filers ($250k)
  const medicare = ficaWages * m.rate + Math.max(0, ficaWages - m.additionalThreshold[status]) * m.additionalRate;

  // State income tax (simplified: most states follow federal treatment of 401(k)/premiums)
  let stateTax = 0;
  let localTax = 0;
  const loc = resolveLocal(state, status, input.localCode, input.localRatePercent);
  if (state.type !== "none") {
    const stateWages =
      gross -
      otherPretax +
      (NO_STATE_HSA_EXCLUSION.has(state.code) ? hsa : 0) -
      (NO_STATE_401K_DEDUCTION.has(state.code) ? 0 : retirement);
    const phaseOut = EXEMPTION_PHASE_OUT[state.code];
    const exemption = phaseOut
      ? Math.max(0, state.personalExemption[status] - Math.ceil(Math.max(0, stateWages - phaseOut[status]) / 1000) * 1000)
      : state.personalExemption[status];
    const stdPhase = STD_DEDUCTION_PHASE_OUT[state.code];
    const stdDeduction = stdPhase
      ? Math.max(0, state.stdDeduction[status] - Math.max(0, stateWages - stdPhase[status].start) * stdPhase[status].rate)
      : state.stdDeduction[status];
    const stateTaxable = Math.max(0, stateWages - stdDeduction - exemption);
    stateTax = Math.max(0, bracketTax(stateTaxable, state[status]) - state.personalCredit[status]);
    // County tax (MD, IN) uses the same taxable income as the state tax
    if (loc.brackets) localTax = bracketTax(stateTaxable, loc.brackets);
  }

  // State payroll programs (SDI, PFML...) are capped per worker too
  const statePayroll = state.payroll.map((p) => ({
    name: p.name,
    amount: ficaByEarner.reduce((s, w) => s + Math.min(w, p.wageCap ?? Infinity) * p.rate, 0),
  }));
  const statePayrollTotal = statePayroll.reduce((s, p) => s + p.amount, 0);

  const taxes = federalTax + socialSecurity + medicare + stateTax + localTax + statePayrollTotal;
  const net = Math.max(0, gross - retirement - otherPretax - taxes);

  return {
    gross,
    retirementCapped,
    retirement,
    otherPretax,
    federalTax,
    socialSecurity,
    medicare,
    stateTax,
    localTax,
    localName: loc.brackets ? loc.name : null,
    localMissing: loc.missing,
    localNote: LOCAL_TAX_NOTES[state.code] ?? null,
    local: loc.local,
    statePayroll,
    statePayrollTotal,
    net,
    effectiveRate: gross > 0 ? taxes / gross : 0,
    marginalFederal: marginalRate(federalTaxable, FEDERAL_2026[status]),
    federalTaxable,
    earners: wages.length,
    state,
  };
}

/** Take-home for the same inputs in every state (for the "compare states" table). */
export function compareStates(input: PaycheckInput): { code: string; name: string; net: number }[] {
  // County choice/rate belongs to the chosen state only -> other states use their own defaults
  const others: PaycheckInput = { ...input, localCode: undefined, localRatePercent: undefined };
  return STATES.map((s) => ({
    code: s.code,
    name: s.name,
    net: calcPaycheck({ ...(s.code === input.stateCode ? input : others), stateCode: s.code }).net,
  })).sort((a, b) => b.net - a.net);
}
