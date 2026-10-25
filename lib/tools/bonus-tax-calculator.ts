// ============================================================================
// BONUS TAX CALCULATOR — federal supplemental wage WITHHOLDING (not final tax).
// IRS Pub 15 (2026) §7: optional flat 22%, mandatory 37% on supplemental wages
// over $1 million in a year, ya "aggregate" method (bonus + regular check ko ek
// payment maan ke Pub 15-T percentage method se withholding).
// FICA: SS 6.2% up to wage base, Medicare 1.45% + 0.9% withholding over $200k.
// State: sirf jin states ka supplemental rate official source se verify kiya
// (SUPPLEMENTAL_STATE_RATES); baaki states me bonus pe extra state tax ka estimate.
// ============================================================================

import { FEDERAL_2026 } from "../tax2026";
import { bracketTax, calcPaycheck, getState, type FilingStatus } from "../paycheck";
import { clamp } from "../calc";

export const FLAT_RATE = 0.22; // Pub 15 (2026): optional flat rate
export const MANDATORY_RATE = 0.37; // Pub 15 (2026): supplemental wages over $1M
export const MANDATORY_THRESHOLD = 1_000_000;
export const ADDL_MEDICARE_WITHHOLDING_THRESHOLD = 200_000; // employer withholds over $200k regardless of filing status

// Pub 15-T (2026) Worksheet 1A line 1g (2020+ Form W-4, Step 2 box not checked).
// The annual tables then start their 10% bracket at (standard deduction − this amount),
// so withholding = brackets applied to (annual wages − standard deduction).
// Checked: single table 0% band ends $7,500 = $16,100 − $8,600; MFJ $19,300 = $32,200 − $12,900.

/** State supplemental flat rates verified on the state's own site (2026). */
export const SUPPLEMENTAL_STATE_RATES: Record<string, { rate: number; note: string; source: string }> = {
  CA: {
    rate: 0.1023,
    note: "California's flat rate for bonuses and stock options is 10.23% (other supplemental pay 6.6%).",
    source: "https://edd.ca.gov/siteassets/files/pdf_pub_ctr/de231ps.pdf",
  },
  NY: {
    rate: 0.117,
    note: "New York's supplemental withholding rate for 2026 is 11.70% (NYC/Yonkers withholding not included).",
    source: "https://www.tax.ny.gov/pdf/publications/withholding/nys50_t_nys.pdf",
  },
};

export type FederalMethod = "flat" | "aggregate";

export interface BonusInput {
  bonus: number;
  salary: number; // annual regular wages
  payPeriodsPerYear: number; // 52, 26, 24, 12
  status: FilingStatus;
  stateCode: string;
  method: FederalMethod;
  ytdWages: number; // wages already paid this year before the bonus (for SS cap / Medicare surtax)
  ytdSupplemental: number; // bonuses already paid this year (for the $1M rule)
}

export interface BonusResult {
  bonus: number;
  federal: number;
  federalFlatPart: number; // part withheld at 22% or aggregate
  federalMandatoryPart: number; // part over $1M at 37%
  socialSecurity: number;
  medicare: number;
  state: number;
  statePayroll: number; // SDI / paid-leave style employee payroll taxes on the bonus
  statePayrollNames: string[];
  stateMode: "supplemental" | "estimate" | "none";
  stateRate: number; // effective state % on the bonus
  stateNote: string;
  stateSource: string;
  totalWithheld: number;
  net: number;
  effectiveRate: number;
  // What the bonus really adds to your federal income tax bill for the year (estimate)
  federalTaxOnBonus: number;
  federalDifference: number; // withheld − real tax (positive = likely refund)
  marginalFederal: number;
  flatVsAggregate: { flat: number; aggregate: number };
}

/** Federal withholding on one payment using the 2026 annual percentage method. */
function periodWithholding(periodWages: number, periods: number, status: FilingStatus): number {
  const annual = periodWages * periods;
  return bracketTax(Math.max(0, annual - FEDERAL_2026.stdDeduction[status]), FEDERAL_2026[status]) / periods;
}

function marginal(income: number, status: FilingStatus): number {
  let rate = 0;
  for (const b of FEDERAL_2026[status]) if (income > b.over) rate = b.rate;
  return rate;
}

export function calcBonusTax(input: BonusInput): BonusResult {
  const bonus = clamp(input.bonus, 0, 1_000_000_000);
  const salary = clamp(input.salary, 0, 1_000_000_000);
  const periods = [52, 26, 24, 12].includes(input.payPeriodsPerYear) ? input.payPeriodsPerYear : 26;
  const status = input.status;
  const ytdWages = clamp(input.ytdWages, 0, 1_000_000_000);
  const ytdSupp = clamp(input.ytdSupplemental, 0, 1_000_000_000);

  // ---- Federal income tax withholding ----
  // Part of this bonus that pushes year-to-date supplemental wages over $1M -> 37% (no choice)
  const underMillion = Math.max(0, Math.min(bonus, MANDATORY_THRESHOLD - ytdSupp));
  const overMillion = bonus - underMillion;
  const regular = salary / periods;
  const flatPart = underMillion * FLAT_RATE;
  const aggregatePart = Math.max(0, periodWithholding(regular + underMillion, periods, status) - periodWithholding(regular, periods, status));
  const mandatoryPart = overMillion * MANDATORY_RATE;
  const federalFlatPart = input.method === "aggregate" ? aggregatePart : flatPart;
  const federal = federalFlatPart + mandatoryPart;

  // ---- FICA ----
  const ss = FEDERAL_2026.socialSecurity;
  const ssRoom = Math.max(0, ss.wageBase - ytdWages);
  const socialSecurity = Math.min(bonus, ssRoom) * ss.rate;
  const m = FEDERAL_2026.medicare;
  const overThreshold = Math.max(0, ytdWages + bonus - Math.max(ADDL_MEDICARE_WITHHOLDING_THRESHOLD, ytdWages));
  const medicare = bonus * m.rate + overThreshold * m.additionalRate;

  // ---- State ----
  const st = getState(input.stateCode);
  let state = 0;
  let stateMode: BonusResult["stateMode"] = "none";
  let stateNote = `${st.name} has no state income tax on wages.`;
  let stateSource = st.source;
  const supp = SUPPLEMENTAL_STATE_RATES[st.code];
  if (supp) {
    state = bonus * supp.rate;
    stateMode = "supplemental";
    stateNote = supp.note;
    stateSource = supp.source;
  } else if (st.type !== "none") {
    // Estimate: extra state income tax the bonus adds on top of the salary (our 2026 state engine)
    const base = { payPeriodsPerYear: periods, status, stateCode: st.code, retirementPercent: 0, otherPretaxAnnual: 0 };
    state = Math.max(0, calcPaycheck({ ...base, grossAnnual: salary + bonus }).stateTax - calcPaycheck({ ...base, grossAnnual: salary }).stateTax);
    stateMode = "estimate";
    stateNote = `Estimate: the extra ${st.name} income tax the bonus adds at your salary. Your employer's actual ${st.code} bonus withholding method may differ.`;
  }

  // State payroll taxes (e.g. CA SDI, NJ/NY/WA/MA paid leave) also apply to bonus pay
  // Wage caps concern money already paid this year, not the projected annual salary.
  const statePayroll = st.payroll.reduce((total, p) => {
    const room = Math.max(0, (p.wageCap ?? Infinity) - ytdWages);
    return total + Math.min(bonus, room) * p.rate;
  }, 0);

  const totalWithheld = federal + socialSecurity + medicare + state + statePayroll;

  // ---- Real federal income tax on the bonus (year-end view, standard deduction only) ----
  const std = FEDERAL_2026.stdDeduction[status];
  const taxWithout = bracketTax(Math.max(0, salary - std), FEDERAL_2026[status]);
  const taxWith = bracketTax(Math.max(0, salary + bonus - std), FEDERAL_2026[status]);
  const federalTaxOnBonus = taxWith - taxWithout;

  return {
    bonus,
    federal,
    federalFlatPart,
    federalMandatoryPart: mandatoryPart,
    socialSecurity,
    medicare,
    state,
    statePayroll,
    statePayrollNames: st.payroll.map((p) => p.name),
    stateMode,
    stateRate: bonus > 0 ? state / bonus : 0,
    stateNote,
    stateSource,
    totalWithheld,
    net: Math.max(0, bonus - totalWithheld),
    effectiveRate: bonus > 0 ? totalWithheld / bonus : 0,
    federalTaxOnBonus,
    federalDifference: federal - federalTaxOnBonus,
    marginalFederal: marginal(Math.max(0, salary + bonus - std), status),
    flatVsAggregate: { flat: flatPart + mandatoryPart, aggregate: aggregatePart + mandatoryPart },
  };
}
