const fs = require("node:fs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const ts = require("typescript");

// Run the real TypeScript math with Node's test runner, without another runtime dependency.
require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};

const { calcPaycheck } = require("../lib/paycheck.ts");
const { calcBonusTax } = require("../lib/tools/bonus-tax-calculator.ts");
const { calcMortgage, calcCompoundInterest, calcDebtPayoff, calcAge, parseDate } = require("../lib/calc.ts");

const paycheck = {
  grossAnnual: 100_000, payPeriodsPerYear: 26, status: "single",
  stateCode: "NJ", retirementPercent: 0, otherPretaxAnnual: 0,
};
const bonus = {
  bonus: 10_000, salary: 200_000, payPeriodsPerYear: 26, status: "single",
  stateCode: "NJ", method: "flat", ytdWages: 0, ytdSupplemental: 0,
};
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.005, `${actual} != ${expected}`);

test("NJ excludes traditional 401(k) deferrals from state wages; PA does not", () => {
  const before = calcPaycheck(paycheck);
  const after = calcPaycheck({ ...paycheck, retirementPercent: 10 });
  // Both wage amounts remain in NJ's 6.37% bracket: $10,000 x 6.37%.
  near(before.stateTax - after.stateTax, 637);
  near(before.socialSecurity, after.socialSecurity);
  const pa = { ...paycheck, stateCode: "PA" };
  near(calcPaycheck(pa).stateTax, calcPaycheck({ ...pa, retirementPercent: 10 }).stateTax);
});

test("NJ HSA contributions still receive no state exclusion", () => {
  near(calcPaycheck(paycheck).stateTax,
    calcPaycheck({ ...paycheck, otherPretaxAnnual: 4_000, hsaAnnual: 4_000 }).stateTax);
});

test("bonus state payroll caps use wages already paid, not full-year salary", () => {
  // NJ UI/WF/SWF .425%, TDI .19%, FLI .23%; all caps have room at the start of the year.
  near(calcBonusTax(bonus).statePayroll, 84.5);
  near(calcBonusTax({ ...bonus, salary: 30_000, ytdWages: 200_000 }).statePayroll, 0);
  // $4,800 UI room and full $10,000 TDI/FLI room at $40,000 YTD.
  near(calcBonusTax({ ...bonus, ytdWages: 40_000 }).statePayroll, 62.4);
});

test("bonus Social Security cap and supplemental million-dollar threshold", () => {
  const r = calcBonusTax({ ...bonus, stateCode: "TX", ytdWages: 180_000, ytdSupplemental: 995_000 });
  near(r.socialSecurity, 279);
  near(r.federal, 2_950);
});

test("Social Security caps apply per spouse, not once per household", () => {
  const r = calcPaycheck({ ...paycheck, stateCode: "TX", grossAnnual: 300_000, status: "married", spouseWages: 150_000 });
  near(r.socialSecurity, 18_600);
});

test("zero-interest mortgage pays off in the requested term and extra payments shorten it", () => {
  const r = calcMortgage({ principal: 120_000, annualRatePercent: 0, yearsLeft: 10, extraMonthly: 1_000, extraYearly: 0, oneTime: 0 });
  near(r.monthlyPayment, 1_000);
  assert.equal(r.base.months, 120);
  assert.equal(r.withExtra.months, 60);
  near(r.interestSaved, 0);
});

test("compound interest agrees with the closed form for monthly end-of-period deposits", () => {
  const r = calcCompoundInterest({ principal: 10_000, monthlyContribution: 300, annualRatePercent: 6, years: 10, compoundsPerYear: 12, annualIncreasePercent: 0 });
  const growth = (1 + .06 / 12) ** 120;
  near(r.futureValue, 10_000 * growth + 300 * (growth - 1) / (.06 / 12));
});

test("debt payoff rolls freed minimum payments into the next debt", () => {
  const r = calcDebtPayoff([
    { name: "Small", balance: 100, annualRatePercent: 0, minPayment: 100 },
    { name: "Large", balance: 300, annualRatePercent: 0, minPayment: 100 },
  ], 0);
  assert.equal(r.snowball.months, 2);
  assert.equal(r.minimumOnly.months, 3);
});

test("age calculation rejects impossible dates and handles leap-day birthdays", () => {
  assert.equal(parseDate("2026-02-31"), null);
  const r = calcAge(new Date(2000, 1, 29), new Date(2026, 1, 28));
  assert.equal(r.years, 26);
  assert.equal(r.daysToBirthday, 0);
});
