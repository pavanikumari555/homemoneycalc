// Sources and simplifications documented per entry. Estimates only.
//
// Tax-year 2026 federal and state parameters for a salary-earner take-home pay
// estimate. Researched October 2026. Itemized deductions, dependents, credits
// other than the flat personal credits listed, phase-outs, and local/city taxes
// are NOT modeled; see each entry's `notes`. Bracket thresholds are taxable
// income after the state standard deduction and personal exemption.

export interface Bracket { over: number; rate: number } // rate (decimal) applies to taxable income above `over`; first bracket over: 0
export interface PayrollTax { name: string; rate: number; wageCap?: number } // employee-paid state payroll taxes e.g. CA SDI, NJ SDI/FLI, NY PFL, WA PFML, MA PFML, etc.
export interface StateTax {
  code: string;            // "CA"
  name: string;            // "California"
  type: "none" | "flat" | "progressive";
  taxYear: number;         // 2026, or 2025 if 2026 not yet published
  single: Bracket[];       // [] for "none"; for flat use [{over:0, rate}]
  married: Bracket[];      // married filing jointly
  stdDeduction: { single: number; married: number };      // 0 if none
  personalExemption: { single: number; married: number }; // deduction-style exemption amount, 0 if none
  personalCredit: { single: number; married: number };    // flat nonrefundable credit $, 0 if none
  payroll: PayrollTax[];
  notes: string;           // key simplifications (e.g. "Local/city taxes not included", "WA taxes only capital gains", "Federal tax deduction ignored")
  source: string;          // official URL
}

/** Social Security wage base for 2026; most state PFML programs cap at this. */
const SS_WAGE_BASE_2026 = 184_500;

const br = (rows: Array<[number, number]>): Bracket[] => rows.map(([over, rate]) => ({ over, rate }));
const ZERO = { single: 0, married: 0 };

/** Federal standard deduction 2026 (used by states that start from federal taxable income). */
const FED_STD = { single: 16_100, married: 32_200 };

export const FEDERAL_2026: {
  taxYear: number;
  single: Bracket[]; married: Bracket[];
  stdDeduction: { single: number; married: number };
  socialSecurity: { rate: number; wageBase: number };
  medicare: { rate: number; additionalRate: number; additionalThreshold: { single: number; married: number } };
  sources: string[];
} = {
  taxYear: 2026,
  // Rev. Proc. 2025-32. OBBBA (P.L. 119-21, July 2025) made the TCJA rates permanent
  // and raised the standard deduction ($15,750/$31,500 for 2025, then indexed).
  // OBBBA's new tip/overtime/senior/car-loan deductions are not modeled.
  single: br([
    [0, 0.10], [12_400, 0.12], [50_400, 0.22], [105_700, 0.24],
    [201_775, 0.32], [256_225, 0.35], [640_600, 0.37],
  ]),
  married: br([
    [0, 0.10], [24_800, 0.12], [100_800, 0.22], [211_400, 0.24],
    [403_550, 0.32], [512_450, 0.35], [768_700, 0.37],
  ]),
  stdDeduction: { single: 16_100, married: 32_200 },
  socialSecurity: { rate: 0.062, wageBase: SS_WAGE_BASE_2026 },
  medicare: { rate: 0.0145, additionalRate: 0.009, additionalThreshold: { single: 200_000, married: 250_000 } },
  sources: [
    "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf",
    "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill",
    "https://www.ssa.gov/oact/cola/cbb.html",
    "https://www.irs.gov/taxtopics/tc560",
  ],
};

export const STATES: StateTax[] = [
  {
    code: "AL", name: "Alabama", type: "progressive", taxYear: 2026,
    single: br([[0, 0.02], [500, 0.04], [3_000, 0.05]]),
    married: br([[0, 0.02], [1_000, 0.04], [6_000, 0.05]]),
    stdDeduction: { single: 3_000, married: 8_500 },
    personalExemption: { single: 1_500, married: 3_000 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Std deduction shown is the maximum; it phases down with AGI (to $2,500/$5,000). Alabama's deduction for federal income tax paid is ignored (overstates AL tax). Local occupational taxes (e.g. Birmingham 1%) not included.",
    source: "https://www.revenue.alabama.gov/individual-corporate/taxes-administered-by-individual-corporate-income-tax/",
  },
  {
    code: "AK", name: "Alaska", type: "none", taxYear: 2026,
    single: [], married: [],
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [{ name: "AK Unemployment Insurance (employee)", rate: 0.005, wageCap: 54_200 }],
    notes: "No individual income tax. Employees pay 0.5% UI on the first $54,200 (2026).",
    source: "https://labor.alaska.gov/estax/2026-experience-rates.html",
  },
  {
    code: "AZ", name: "Arizona", type: "flat", taxYear: 2026,
    single: br([[0, 0.025]]), married: br([[0, 0.025]]),
    stdDeduction: { single: 15_750, married: 31_500 },
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Std deduction per HB 4168 (signed June 2026, OBBBA conformity); ADOR may inflation-index it slightly higher for 2026. Dependent credits not modeled. Arizona withholding is a % of gross chosen on Form A-4, so actual withholding can differ from liability.",
    source: "https://azdor.gov/individuals",
  },
  {
    code: "AR", name: "Arkansas", type: "progressive", taxYear: 2026,
    single: br([[0, 0], [5_600, 0.02], [11_200, 0.03], [16_000, 0.034], [26_400, 0.037]]),
    married: br([[0, 0], [5_600, 0.02], [11_200, 0.03], [16_000, 0.034], [26_400, 0.037]]),
    stdDeduction: { single: 2_470, married: 4_940 },
    personalExemption: ZERO,
    personalCredit: { single: 29, married: 58 },
    payroll: [],
    notes: "Top rate cut 3.9% -> 3.7% retroactive to 1/1/2026 (Act 1/Act 2 of 2026 special session). Uses the table for net income <= ~$94,700; above ~$97,600 a 2%/3.7% table applies (about $290 more tax). Same brackets for joint filers.",
    source: "https://www.dfa.arkansas.gov/office/taxes/income-tax-administration/",
  },
  {
    code: "CA", name: "California", type: "progressive", taxYear: 2025,
    single: br([
      [0, 0.01], [11_079, 0.02], [26_264, 0.04], [41_452, 0.06], [57_542, 0.08],
      [72_724, 0.093], [371_479, 0.103], [445_771, 0.113], [742_953, 0.123], [1_000_000, 0.133],
    ]),
    married: br([
      [0, 0.01], [22_158, 0.02], [52_528, 0.04], [82_904, 0.06], [115_084, 0.08],
      [145_448, 0.093], [742_958, 0.103], [891_542, 0.113], [1_000_000, 0.123], [1_485_906, 0.133],
    ]),
    stdDeduction: { single: 5_706, married: 11_412 },
    personalExemption: ZERO,
    personalCredit: { single: 153, married: 306 },
    payroll: [{ name: "CA SDI (incl. PFL)", rate: 0.013 }],
    notes: "Uses 2025 indexed brackets, standard deduction and exemption credit. Updated 2026 FTB indexing has not been independently verified in this calculator; this state income-tax result is an estimate using older parameters. Top brackets include the 1% Mental Health Services Tax over $1M. Exemption credit phases out at high AGI. SDI 1.3% for 2026 with no wage cap.",
    source: "https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf",
  },
  {
    code: "CO", name: "Colorado", type: "flat", taxYear: 2026,
    single: br([[0, 0.044]]), married: br([[0, 0.044]]),
    stdDeduction: FED_STD,
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [{ name: "CO FAMLI (employee 50%)", rate: 0.0044, wageCap: SS_WAGE_BASE_2026 }],
    notes: "Starts from federal taxable income, so the federal standard deduction applies. Possible TABOR temporary rate reduction not modeled. Local occupational privilege taxes (Denver, Aurora, etc.) not included.",
    source: "https://tax.colorado.gov/individual-income-tax",
  },
  {
    code: "CT", name: "Connecticut", type: "progressive", taxYear: 2026,
    single: br([[0, 0.02], [10_000, 0.045], [50_000, 0.055], [100_000, 0.06], [200_000, 0.065], [250_000, 0.069], [500_000, 0.0699]]),
    married: br([[0, 0.02], [20_000, 0.045], [100_000, 0.055], [200_000, 0.06], [400_000, 0.065], [500_000, 0.069], [1_000_000, 0.0699]]),
    stdDeduction: ZERO,
    personalExemption: { single: 15_000, married: 24_000 },
    personalCredit: ZERO,
    payroll: [{ name: "CT Paid Leave", rate: 0.005, wageCap: SS_WAGE_BASE_2026 }],
    notes: "Personal exemption phase-out ($1,000 per $1,000 over $30,000 single / $48,000 joint) is modeled. Personal tax credit, 2% bracket phase-out and benefit recapture are not, so tax can be slightly off at some incomes.",
    source: "https://portal.ct.gov/drs/individuals/individual-income-tax-portal",
  },
  {
    code: "DE", name: "Delaware", type: "progressive", taxYear: 2026,
    single: br([[0, 0], [2_000, 0.022], [5_000, 0.039], [10_000, 0.048], [20_000, 0.052], [25_000, 0.0555], [60_000, 0.066]]),
    married: br([[0, 0], [2_000, 0.022], [5_000, 0.039], [10_000, 0.048], [20_000, 0.052], [25_000, 0.0555], [60_000, 0.066]]),
    stdDeduction: { single: 3_250, married: 6_500 },
    personalExemption: ZERO,
    personalCredit: { single: 110, married: 220 },
    payroll: [{ name: "DE Paid Leave (employee up to 50%)", rate: 0.004, wageCap: SS_WAGE_BASE_2026 }],
    notes: "Same brackets for joint filers (spouses may also file separately on one return). Paid Leave total 0.8% (25+ employees); employer may deduct up to half. Wilmington 1.25% city wage tax not included.",
    source: "https://revenue.delaware.gov/",
  },
  {
    code: "DC", name: "District of Columbia", type: "progressive", taxYear: 2026,
    single: br([[0, 0.04], [10_000, 0.06], [40_000, 0.065], [60_000, 0.085], [250_000, 0.0925], [500_000, 0.0975], [1_000_000, 0.1075]]),
    married: br([[0, 0.04], [10_000, 0.06], [40_000, 0.065], [60_000, 0.085], [250_000, 0.0925], [500_000, 0.0975], [1_000_000, 0.1075]]),
    stdDeduction: FED_STD,
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Std deduction follows the federal amount. Same brackets for all filing statuses. DC Paid Family Leave is employer-funded.",
    source: "https://otr.cfo.dc.gov/page/dc-individual-and-fiduciary-income-tax-rates",
  },
  {
    code: "FL", name: "Florida", type: "none", taxYear: 2026,
    single: [], married: [],
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "No individual income tax.",
    source: "https://floridarevenue.com/taxes/taxesfees/Pages/default.aspx",
  },
  {
    code: "GA", name: "Georgia", type: "flat", taxYear: 2026,
    single: br([[0, 0.0499]]), married: br([[0, 0.0499]]),
    stdDeduction: { single: 15_000, married: 30_000 },
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "HB 463 (signed May 2026): rate 5.19% -> 4.99% and std deduction raised to $15,000/$30,000, retroactive to 1/1/2026. Temporary $1,750 tips/overtime exclusion and dependent exemptions not modeled.",
    source: "https://dor.georgia.gov/taxes/individual-taxes",
  },
  {
    code: "HI", name: "Hawaii", type: "progressive", taxYear: 2026,
    single: br([
      [0, 0.014], [9_600, 0.032], [14_400, 0.055], [19_200, 0.064], [24_000, 0.068], [36_000, 0.072],
      [48_000, 0.076], [125_000, 0.079], [175_000, 0.0825], [225_000, 0.09], [275_000, 0.10], [325_000, 0.11],
    ]),
    married: br([
      [0, 0.014], [19_200, 0.032], [28_800, 0.055], [38_400, 0.064], [48_000, 0.068], [72_000, 0.072],
      [96_000, 0.076], [250_000, 0.079], [350_000, 0.0825], [450_000, 0.09], [550_000, 0.10], [650_000, 0.11],
    ]),
    stdDeduction: { single: 8_000, married: 16_000 },
    personalExemption: { single: 1_144, married: 2_288 },
    personalCredit: ZERO,
    payroll: [{ name: "HI TDI (employee max 0.5%)", rate: 0.005, wageCap: 78_011 }],
    notes: "Act 46 (2024): 2026 std deduction $8,000/$16,000; brackets same as 2025. New 13% top bracket (Act 24/SB 3125) starts in 2027, not 2026. TDI capped at $7.50/week (weekly wage base $1,500.21); employer may pay more.",
    source: "https://files.hawaii.gov/tax/news/announce/ann24-03.pdf",
  },
  {
    code: "ID", name: "Idaho", type: "progressive", taxYear: 2026,
    single: br([[0, 0], [4_811, 0.053]]),
    married: br([[0, 0], [9_622, 0.053]]),
    stdDeduction: FED_STD,
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Flat 5.3% above a 0% band (HB 40, 2025). Uses the federal standard deduction. Grocery credit not modeled.",
    source: "https://tax.idaho.gov/taxes/income-tax/individual-income/",
  },
  {
    code: "IL", name: "Illinois", type: "flat", taxYear: 2026,
    single: br([[0, 0.0495]]), married: br([[0, 0.0495]]),
    stdDeduction: ZERO,
    personalExemption: { single: 2_925, married: 5_850 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Exemption not allowed when AGI exceeds $250,000 single / $500,000 joint (not modeled).",
    source: "https://tax.illinois.gov/research/taxrates/income.html",
  },
  {
    code: "IN", name: "Indiana", type: "flat", taxYear: 2026,
    single: br([[0, 0.0295]]), married: br([[0, 0.0295]]),
    stdDeduction: ZERO,
    personalExemption: { single: 1_000, married: 2_000 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Rate 3.0% -> 2.95% for 2026. Every Indiana county also charges a county income tax (set by your county of residence on Jan 1). We could not load DOR's 2026 county table to verify a default, so enter your county's rate from Departmental Notice #1 (in.gov/dor/files/dn01.pdf); until you do, county tax is NOT included.",
    source: "https://www.in.gov/dor/individual-income-taxes/",
  },
  {
    code: "IA", name: "Iowa", type: "flat", taxYear: 2026,
    single: br([[0, 0.038]]), married: br([[0, 0.038]]),
    stdDeduction: FED_STD,
    personalExemption: ZERO,
    personalCredit: { single: 40, married: 80 },
    payroll: [],
    notes: "Starts from federal taxable income, so the federal standard deduction applies. School district surtaxes not included.",
    source: "https://revenue.iowa.gov/taxes/tax-guidance/individual-income-tax",
  },
  {
    code: "KS", name: "Kansas", type: "progressive", taxYear: 2026,
    single: br([[0, 0.052], [23_000, 0.0558]]),
    married: br([[0, 0.052], [46_000, 0.0558]]),
    stdDeduction: { single: 3_605, married: 8_240 },
    personalExemption: { single: 9_160, married: 18_320 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Two-bracket system from SB 1 (2024).",
    source: "https://www.ksrevenue.gov/perstaxtypesii.html",
  },
  {
    code: "KY", name: "Kentucky", type: "flat", taxYear: 2026,
    single: br([[0, 0.035]]), married: br([[0, 0.035]]),
    stdDeduction: { single: 3_360, married: 3_360 },
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Rate 4% -> 3.5% for 2026 (HB 1, 2025). Married couples filing separately on a combined return each get $3,360 (not modeled). Local occupational license taxes (e.g. Louisville, Lexington) not included.",
    source: "https://revenue.ky.gov/Individual/Individual-Income-Tax/Pages/default.aspx",
  },
  {
    code: "LA", name: "Louisiana", type: "flat", taxYear: 2026,
    single: br([[0, 0.03]]), married: br([[0, 0.03]]),
    stdDeduction: { single: 12_875, married: 25_750 },
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Flat 3% since 2025; std deduction inflation-indexed for 2026.",
    source: "https://revenue.louisiana.gov/individuals/",
  },
  {
    code: "ME", name: "Maine", type: "progressive", taxYear: 2026,
    single: br([[0, 0.058], [27_400, 0.0675], [64_850, 0.0715], [1_000_000, 0.0915]]),
    married: br([[0, 0.058], [54_850, 0.0675], [129_750, 0.0715], [1_500_000, 0.0915]]),
    stdDeduction: { single: 15_300, married: 30_600 },
    personalExemption: { single: 5_300, married: 10_600 },
    personalCredit: ZERO,
    payroll: [{ name: "ME Paid Family & Medical Leave (employee 50%)", rate: 0.005, wageCap: SS_WAGE_BASE_2026 }],
    notes: "Top bracket is the 2% surcharge enacted by LD 2212 (retroactive to 1/1/2026). Std deduction and exemption phase out at high incomes (not modeled).",
    source: "https://www.maine.gov/revenue/tax-return-forms/individual-income-tax-2026",
  },
  {
    code: "MD", name: "Maryland", type: "progressive", taxYear: 2026,
    single: br([
      [0, 0.02], [1_000, 0.03], [2_000, 0.04], [3_000, 0.0475], [100_000, 0.05],
      [125_000, 0.0525], [150_000, 0.055], [250_000, 0.0575], [500_000, 0.0625], [1_000_000, 0.065],
    ]),
    married: br([
      [0, 0.02], [1_000, 0.03], [2_000, 0.04], [3_000, 0.0475], [150_000, 0.05],
      [175_000, 0.0525], [225_000, 0.055], [300_000, 0.0575], [600_000, 0.0625], [1_200_000, 0.065],
    ]),
    stdDeduction: { single: 3_350, married: 6_700 },
    personalExemption: { single: 3_200, married: 6_400 },
    personalCredit: ZERO,
    payroll: [],
    notes: "County/Baltimore City local income tax (2.25%-3.30% of MD taxable income, set by where you live) IS included: pick your county, or we use 3.20% (the rate most counties charge in 2026). Exemption phases out above $100k/$150k AGI (not modeled). FAMLI employee contributions start 2027.",
    source: "https://www.marylandtaxes.gov/individual/income/tax-info/tax-rates.php",
  },
  {
    code: "MA", name: "Massachusetts", type: "progressive", taxYear: 2026,
    single: br([[0, 0.05], [1_107_750, 0.09]]),
    married: br([[0, 0.05], [1_107_750, 0.09]]),
    stdDeduction: ZERO,
    personalExemption: { single: 4_400, married: 8_800 },
    personalCredit: ZERO,
    payroll: [{ name: "MA PFML (employee: 0.28% medical + 0.18% family)", rate: 0.0046, wageCap: SS_WAGE_BASE_2026 }],
    notes: "5% flat plus 4% surtax on income over $1,107,750 (same threshold for joint returns). Some deductions (e.g. FICA/retirement contributions up to $2,000) not modeled.",
    source: "https://www.mass.gov/info-details/massachusetts-tax-rates",
  },
  {
    code: "MI", name: "Michigan", type: "flat", taxYear: 2026,
    single: br([[0, 0.0425]]), married: br([[0, 0.0425]]),
    stdDeduction: ZERO,
    personalExemption: { single: 5_900, married: 11_800 },
    personalCredit: ZERO,
    payroll: [],
    notes: "City income taxes (Detroit 2.4%, Grand Rapids 1.5%, others ~1%) not included.",
    source: "https://www.michigan.gov/taxes/business-taxes/withholding/calendar-year-tax-information",
  },
  {
    code: "MN", name: "Minnesota", type: "progressive", taxYear: 2026,
    single: br([[0, 0.0535], [33_310, 0.068], [109_430, 0.0785], [203_150, 0.0985]]),
    married: br([[0, 0.0535], [48_700, 0.068], [193_480, 0.0785], [337_930, 0.0985]]),
    stdDeduction: { single: 15_300, married: 30_600 },
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [{ name: "MN Paid Leave (employee up to 50%)", rate: 0.0044, wageCap: SS_WAGE_BASE_2026 }],
    notes: "Std deduction phases down at high AGI (not modeled). Paid Leave premiums began 1/1/2026 (0.88% total; employer may deduct up to half).",
    source: "https://www.revenue.state.mn.us/press-release/2025-12-16/minnesota-income-tax-brackets-standard-deduction-and-dependent-exemption",
  },
  {
    code: "MS", name: "Mississippi", type: "progressive", taxYear: 2026,
    single: br([[0, 0], [10_000, 0.04]]),
    married: br([[0, 0], [10_000, 0.04]]),
    stdDeduction: { single: 2_300, married: 4_600 },
    personalExemption: { single: 6_000, married: 12_000 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Rate 4.4% -> 4.0% for 2026 (HB 1, 2025); first $10,000 taxed at 0%.",
    source: "https://www.dor.ms.gov/individual",
  },
  {
    code: "MO", name: "Missouri", type: "progressive", taxYear: 2026,
    single: br([[0, 0], [1_348, 0.02], [2_696, 0.025], [4_044, 0.03], [5_392, 0.035], [6_740, 0.04], [8_088, 0.045], [9_436, 0.047]]),
    married: br([[0, 0], [1_348, 0.02], [2_696, 0.025], [4_044, 0.03], [5_392, 0.035], [6_740, 0.04], [8_088, 0.045], [9_436, 0.047]]),
    stdDeduction: FED_STD,
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Uses the federal standard deduction; same brackets for all statuses. Limited federal income tax deduction ignored. Kansas City and St. Louis 1% earnings taxes not included.",
    source: "https://dor.mo.gov/taxation/individual/tax-types/income/",
  },
  {
    code: "MT", name: "Montana", type: "progressive", taxYear: 2026,
    single: br([[0, 0.047], [47_500, 0.0565]]),
    married: br([[0, 0.047], [95_000, 0.0565]]),
    stdDeduction: FED_STD,
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Top rate 5.9% -> 5.65% and wider 4.7% bracket for 2026 (HB 337). Starts from federal taxable income.",
    source: "https://revenue.mt.gov/taxes/individual-income-tax",
  },
  {
    code: "NE", name: "Nebraska", type: "progressive", taxYear: 2026,
    single: br([[0, 0.0246], [4_130, 0.0351], [24_760, 0.0455]]),
    married: br([[0, 0.0246], [8_250, 0.0351], [49_530, 0.0455]]),
    stdDeduction: { single: 8_850, married: 17_700 },
    personalExemption: ZERO,
    personalCredit: { single: 176, married: 352 },
    payroll: [],
    notes: "Top rate 5.2% -> 4.55% for 2026 (LB 754).",
    source: "https://revenue.nebraska.gov/individuals",
  },
  {
    code: "NV", name: "Nevada", type: "none", taxYear: 2026,
    single: [], married: [],
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "No individual income tax.",
    source: "https://tax.nv.gov/",
  },
  {
    code: "NH", name: "New Hampshire", type: "none", taxYear: 2026,
    single: [], married: [],
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "No tax on wages; the interest & dividends tax was repealed starting 2025.",
    source: "https://www.revenue.nh.gov/",
  },
  {
    code: "NJ", name: "New Jersey", type: "progressive", taxYear: 2026,
    single: br([[0, 0.014], [20_000, 0.0175], [35_000, 0.035], [40_000, 0.0553], [75_000, 0.0637], [500_000, 0.0897], [1_000_000, 0.1075]]),
    married: br([[0, 0.014], [20_000, 0.0175], [50_000, 0.0245], [70_000, 0.035], [80_000, 0.0553], [150_000, 0.0637], [500_000, 0.0897], [1_000_000, 0.1075]]),
    stdDeduction: ZERO,
    personalExemption: { single: 1_000, married: 2_000 },
    personalCredit: ZERO,
    payroll: [
      { name: "NJ UI/WF/SWF (employee)", rate: 0.00425, wageCap: 44_800 },
      { name: "NJ TDI", rate: 0.0019, wageCap: 171_100 },
      { name: "NJ FLI", rate: 0.0023, wageCap: 171_100 },
    ],
    notes: "No standard deduction. Traditional 401(k) contributions reduce NJ taxable wages; other retirement plans such as 403(b) can differ. HSA contributions remain taxable. Newark payroll tax is employer-paid.",
    source: "https://www.nj.gov/treasury/taxation/taxtables.shtml",
  },
  {
    code: "NM", name: "New Mexico", type: "progressive", taxYear: 2026,
    single: br([[0, 0.015], [5_500, 0.032], [16_500, 0.043], [33_500, 0.047], [66_500, 0.049], [210_000, 0.059]]),
    married: br([[0, 0.015], [8_000, 0.032], [25_000, 0.043], [50_000, 0.047], [100_000, 0.049], [315_000, 0.059]]),
    stdDeduction: FED_STD,
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Brackets restructured by HB 252 (2024). Uses the federal standard deduction.",
    source: "https://www.tax.newmexico.gov/individuals/personal-income-tax-information-overview/",
  },
  {
    code: "NY", name: "New York", type: "progressive", taxYear: 2026,
    single: br([
      [0, 0.039], [8_500, 0.044], [11_700, 0.0515], [13_900, 0.054], [80_650, 0.059],
      [215_400, 0.0685], [1_077_550, 0.0965], [5_000_000, 0.103], [25_000_000, 0.109],
    ]),
    married: br([
      [0, 0.039], [17_150, 0.044], [23_600, 0.0515], [27_900, 0.054], [161_550, 0.059],
      [323_200, 0.0685], [2_155_350, 0.0965], [5_000_000, 0.103], [25_000_000, 0.109],
    ]),
    stdDeduction: { single: 8_000, married: 16_050 },
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [
      { name: "NY SDI (0.5%, max $0.60/week)", rate: 0.005, wageCap: 6_240 },
      { name: "NY Paid Family Leave", rate: 0.00432, wageCap: 95_347.22 },
    ],
    notes: "Lower five rates cut for 2026 (Ch. 59 of 2025, Part A). Recapture of lower-bracket benefits for AGI over $107,650 not modeled. NYC (3.078%-3.876%) and Yonkers resident surcharge NOT included.",
    source: "https://www.tax.ny.gov/bus/wt/rate.htm",
  },
  {
    code: "NC", name: "North Carolina", type: "flat", taxYear: 2026,
    single: br([[0, 0.0399]]), married: br([[0, 0.0399]]),
    stdDeduction: { single: 12_750, married: 25_500 },
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Rate 4.25% -> 3.99% for 2026 (final step of the scheduled phase-down).",
    source: "https://www.ncdor.gov/taxes-forms/individual-income-tax",
  },
  {
    code: "ND", name: "North Dakota", type: "progressive", taxYear: 2026,
    single: br([[0, 0], [48_475, 0.0195], [244_825, 0.025]]),
    married: br([[0, 0], [80_975, 0.0195], [298_075, 0.025]]),
    stdDeduction: FED_STD,
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Starts from federal taxable income; 0% bracket on the first portion.",
    source: "https://www.tax.nd.gov/individual",
  },
  {
    code: "OH", name: "Ohio", type: "progressive", taxYear: 2026,
    single: br([[0, 0], [26_050, 0.0275]]),
    married: br([[0, 0], [26_050, 0.0275]]),
    stdDeduction: ZERO,
    personalExemption: { single: 2_400, married: 4_800 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Flat 2.75% above $26,050 from 2026 (HB 96). Exemption shown is for MAGI <= $40k ($2,150 for $40k-$80k, $1,900 above). Municipal income taxes (~1%-2.5%) and school district taxes NOT included.",
    source: "https://tax.ohio.gov/individual",
  },
  {
    code: "OK", name: "Oklahoma", type: "progressive", taxYear: 2026,
    single: br([[0, 0], [3_750, 0.025], [4_900, 0.035], [7_200, 0.045]]),
    married: br([[0, 0], [7_500, 0.025], [9_800, 0.035], [14_400, 0.045]]),
    stdDeduction: { single: 6_350, married: 12_700 },
    personalExemption: { single: 1_000, married: 2_000 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Brackets consolidated and top rate 4.75% -> 4.5% for 2026 (HB 2764).",
    source: "https://oklahoma.gov/tax/individuals/income-tax.html",
  },
  {
    code: "OR", name: "Oregon", type: "progressive", taxYear: 2026,
    single: br([[0, 0.0475], [4_550, 0.0675], [11_400, 0.0875], [125_000, 0.099]]),
    married: br([[0, 0.0475], [9_100, 0.0675], [22_800, 0.0875], [250_000, 0.099]]),
    stdDeduction: { single: 2_910, married: 5_820 },
    personalExemption: ZERO,
    personalCredit: { single: 263, married: 526 },
    payroll: [
      { name: "OR Paid Leave (employee 60%)", rate: 0.006, wageCap: SS_WAGE_BASE_2026 },
      { name: "OR Statewide Transit Tax", rate: 0.001 },
    ],
    notes: "Federal income tax subtraction (up to $8,750, phased out at higher incomes) ignored, which overstates OR tax. Exemption credit disallowed above $100k/$200k AGI (not modeled). Portland Metro SHS and Multnomah PFA local taxes not included.",
    source: "https://www.oregon.gov/dor/forms/FormsPubs/withholding-tax-formulas_206-436_2026.pdf",
  },
  {
    code: "PA", name: "Pennsylvania", type: "flat", taxYear: 2026,
    single: br([[0, 0.0307]]), married: br([[0, 0.0307]]),
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [{ name: "PA Unemployment Comp (employee)", rate: 0.0007 }],
    notes: "No standard deduction or exemption. 401(k) contributions are taxed by PA (modeled). Local Earned Income Tax (typically ~1%+), Philadelphia wage tax (~3.7%) and Local Services Tax NOT included.",
    source: "https://www.revenue.pa.gov/TaxTypes/PIT/Pages/default.aspx",
  },
  {
    code: "RI", name: "Rhode Island", type: "progressive", taxYear: 2026,
    single: br([[0, 0.0375], [82_050, 0.0475], [186_450, 0.0599]]),
    married: br([[0, 0.0375], [82_050, 0.0475], [186_450, 0.0599]]),
    stdDeduction: { single: 11_200, married: 22_400 },
    personalExemption: { single: 5_250, married: 10_500 },
    personalCredit: ZERO,
    payroll: [{ name: "RI TDI/TCI", rate: 0.011, wageCap: 100_000 }],
    notes: "Same brackets for all filing statuses. Std deduction and exemptions phase out at high AGI (not modeled).",
    source: "https://tax.ri.gov/",
  },
  {
    code: "SC", name: "South Carolina", type: "progressive", taxYear: 2026,
    single: br([[0, 0.0199], [30_000, 0.0521]]),
    married: br([[0, 0.0199], [30_000, 0.0521]]),
    stdDeduction: { single: 15_000, married: 30_000 },
    personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "Act 110 of 2026: two brackets (1.99%/5.21%). The Income Adjusted Deduction ($15,000/$30,000) phases out between AGI $40k-$95k single / $80k-$190k joint and is included. State credits, dependents and other income adjustments are not modeled. Payroll withholding may differ from annual liability.",
    source: "https://dor.sc.gov/sites/dor/files/policies/IL26-20.pdf",
  },
  {
    code: "SD", name: "South Dakota", type: "none", taxYear: 2026,
    single: [], married: [],
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "No individual income tax.",
    source: "https://dor.sd.gov/",
  },
  {
    code: "TN", name: "Tennessee", type: "none", taxYear: 2026,
    single: [], married: [],
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "No tax on wages (Hall tax repealed 2021).",
    source: "https://www.tn.gov/revenue.html",
  },
  {
    code: "TX", name: "Texas", type: "none", taxYear: 2026,
    single: [], married: [],
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "No individual income tax.",
    source: "https://comptroller.texas.gov/taxes/",
  },
  {
    code: "UT", name: "Utah", type: "flat", taxYear: 2026,
    single: br([[0, 0.0445]]), married: br([[0, 0.0445]]),
    stdDeduction: ZERO, personalExemption: ZERO,
    personalCredit: { single: 966, married: 1_932 },
    payroll: [],
    notes: "2026 rate 4.45%. The 6% standard-deduction credit is reduced by 1.3% of income over $18,696 single / $37,392 joint. These annual-return phase-out bases are derived from the statutory CPI formula and official BLS CPI-U data; they are not the smaller payroll withholding allowances. Dependents and other credits are not modeled. Reviewed October 31, 2026.",
    source: "https://le.utah.gov/xcode/Title59/Chapter10/C59-10-S1018_2026050620260506.pdf",
  },
  {
    code: "VT", name: "Vermont", type: "progressive", taxYear: 2026,
    single: br([[0, 0.0335], [49_400, 0.066], [119_700, 0.076], [249_700, 0.0875]]),
    married: br([[0, 0.0335], [82_500, 0.066], [199_450, 0.076], [304_000, 0.0875]]),
    stdDeduction: { single: 7_650, married: 15_300 },
    personalExemption: { single: 5_300, married: 10_600 },
    personalCredit: ZERO,
    payroll: [{ name: "VT Child Care Contribution (employee up to 25%)", rate: 0.0011 }],
    notes: "Child Care Contribution is 0.44% of wages; employers may withhold up to 0.11% from employees.",
    source: "https://tax.vermont.gov/individuals/personal-income-tax",
  },
  {
    code: "VA", name: "Virginia", type: "progressive", taxYear: 2026,
    single: br([[0, 0.02], [3_000, 0.03], [5_000, 0.05], [17_000, 0.0575]]),
    married: br([[0, 0.02], [3_000, 0.03], [5_000, 0.05], [17_000, 0.0575]]),
    stdDeduction: { single: 8_750, married: 17_500 },
    personalExemption: { single: 930, married: 1_860 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Same brackets for all filing statuses.",
    source: "https://www.tax.virginia.gov/individual-income-tax",
  },
  {
    code: "WA", name: "Washington", type: "none", taxYear: 2026,
    single: [], married: [],
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [
      { name: "WA Paid Family & Medical Leave (employee 71.43% of 1.13%)", rate: 0.00807, wageCap: SS_WAGE_BASE_2026 },
      { name: "WA Cares (long-term care)", rate: 0.0058 },
    ],
    notes: "No tax on wages. WA taxes only long-term capital gains (7%; 9% on gains over $1M). New 9.9% tax on income over $1M (SB 6346) starts 2028. WA Cares exemptions possible.",
    source: "https://esd.wa.gov/",
  },
  {
    code: "WV", name: "West Virginia", type: "progressive", taxYear: 2026,
    single: br([[0, 0.0211], [10_000, 0.0281], [25_000, 0.0316], [40_000, 0.0422], [60_000, 0.0458]]),
    married: br([[0, 0.0211], [10_000, 0.0281], [25_000, 0.0316], [40_000, 0.0422], [60_000, 0.0458]]),
    stdDeduction: ZERO,
    personalExemption: { single: 2_000, married: 4_000 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Rates cut ~5% retroactive to 1/1/2026 (SB 392); same brackets for single and joint. City service fees (e.g. Charleston) not included.",
    source: "https://tax.wv.gov/Individuals/Pages/Individuals.aspx",
  },
  {
    code: "WI", name: "Wisconsin", type: "progressive", taxYear: 2026,
    single: br([[0, 0.035], [15_110, 0.044], [51_950, 0.053], [332_720, 0.0765]]),
    married: br([[0, 0.035], [20_150, 0.044], [69_260, 0.053], [443_630, 0.0765]]),
    stdDeduction: { single: 13_960, married: 25_840 },
    personalExemption: { single: 700, married: 1_400 },
    personalCredit: ZERO,
    payroll: [],
    notes: "Sliding-scale std deduction is modeled: the maximum shrinks by 12% of income over $20,120 (single, gone at ~$136,453) or 19.778% over $29,040 (joint, gone at ~$159,690), per WI DOR's 2026 Form 1-ES / WT-4A tables. Uses wages after pre-tax deductions as Wisconsin income.",
    source: "https://www.revenue.wi.gov/TaxForms2026/2026-Form1-ES-Inst.pdf",
  },
  {
    code: "WY", name: "Wyoming", type: "none", taxYear: 2026,
    single: [], married: [],
    stdDeduction: ZERO, personalExemption: ZERO, personalCredit: ZERO,
    payroll: [],
    notes: "No individual income tax.",
    source: "https://revenue.wyo.gov/",
  },
];

// ============================================================================
// LOCAL (county/city) INCOME TAX — 2026
// Maryland + Indiana: har resident ko county tax dena padta hai, isliye model kiya.
// PA / OH / NY(NYC): city/school district pe depend karta hai -> sirf note dikhate hain.
// ============================================================================

/** One county option: brackets apply to the same taxable income as the state tax. */
export interface LocalTaxOption { code: string; name: string; single: Bracket[]; married: Bracket[] }

export interface LocalIncomeTax {
  stateCode: string;
  label: string;            // "Maryland county tax"
  defaultCode: string | null; // option used when the user picks nothing; null = no verified default (warn instead)
  options: LocalTaxOption[];
  note: string;
  source: string;
}

const flatLocal = (code: string, name: string, pct: number): LocalTaxOption => ({
  code, name, single: br([[0, pct / 100]]), married: br([[0, pct / 100]]),
});

export const LOCAL_INCOME_TAX: Record<string, LocalIncomeTax> = {
  MD: {
    stateCode: "MD",
    label: "Maryland county tax",
    defaultCode: "typical",
    // Comptroller of Maryland, Central Payroll Bureau memo "2026 Maryland State and Local
    // Income Tax Withholding Information" (Feb 4, 2026), Attachment 1. Allegany 3.03 -> 3.20,
    // Kent 3.20 -> 3.30 for 2026. Anne Arundel and Frederick are graduated (marginal) rates.
    options: [
      flatLocal("typical", "Not sure (3.20%, most common)", 3.2),
      flatLocal("AL", "Allegany County", 3.2),
      {
        code: "AA", name: "Anne Arundel County",
        single: br([[0, 0.027], [50_000, 0.0294], [400_000, 0.032]]),
        married: br([[0, 0.027], [75_000, 0.0294], [480_000, 0.032]]),
      },
      flatLocal("BA", "Baltimore County", 3.2),
      flatLocal("BC", "Baltimore City", 3.2),
      flatLocal("CV", "Calvert County", 3.2),
      flatLocal("CR", "Caroline County", 3.2),
      flatLocal("CL", "Carroll County", 3.03),
      flatLocal("CE", "Cecil County", 2.74),
      flatLocal("CH", "Charles County", 3.03),
      flatLocal("DR", "Dorchester County", 3.3),
      {
        code: "FR", name: "Frederick County",
        single: br([[0, 0.0225], [25_000, 0.0275], [50_000, 0.0296], [150_000, 0.032]]),
        married: br([[0, 0.0225], [25_000, 0.0275], [100_000, 0.0296], [250_000, 0.032]]),
      },
      flatLocal("GR", "Garrett County", 2.65),
      flatLocal("HF", "Harford County", 3.06),
      flatLocal("HW", "Howard County", 3.2),
      flatLocal("KT", "Kent County", 3.3),
      flatLocal("MG", "Montgomery County", 3.2),
      flatLocal("PG", "Prince George's County", 3.2),
      flatLocal("QA", "Queen Anne's County", 3.2),
      flatLocal("SM", "St. Mary's County", 3.2),
      flatLocal("SS", "Somerset County", 3.2),
      flatLocal("TA", "Talbot County", 2.4),
      flatLocal("WA", "Washington County", 2.95),
      flatLocal("WI", "Wicomico County", 3.2),
      flatLocal("WO", "Worcester County", 2.25),
    ],
    note: "Maryland counties and Baltimore City tax your Maryland taxable income at 2.25%-3.30%, based on where you live.",
    source: "https://www.marylandcomptroller.gov/content/dam/mdcomp/md/state-payroll/memos/2026/2026-maryland-state-and-local-withholding-information.pdf",
  },
  IN: {
    stateCode: "IN",
    label: "Indiana county tax",
    defaultCode: null, // DOR's 2026 county table could not be verified -> user enters their rate
    options: [],
    note: "Every Indiana county charges an income tax based on the county you lived in on January 1. Rates differ a lot by county; find yours in DOR Departmental Notice #1.",
    source: "https://www.in.gov/dor/files/dn01.pdf",
  },
};

/** States where city/school-district income taxes are common but depend on your address (shown as a note, not modeled). */
export const LOCAL_TAX_NOTES: Record<string, string> = {
  PA: "Most Pennsylvania cities, boroughs and school districts charge a local Earned Income Tax, and Philadelphia's wage tax is much higher. These depend on your address and are not included above.",
  OH: "Most Ohio cities and villages, and many school districts, charge their own income tax. These depend on where you live and work and are not included above.",
  NY: "If you live in New York City or Yonkers, city income tax is extra and is not included above.",
};
