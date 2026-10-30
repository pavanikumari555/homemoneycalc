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
  const resolved = outputText.replace(/require\(["']@\/([^"']+)["']\)/g, (_, specifier) => "require(" + JSON.stringify(require("node:path").resolve(__dirname, "..", specifier)) + ")");
  module._compile(resolved, filename);
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


const { calcCreditCard, amortize } = require("../lib/calc.ts");
const { encodeDebtRows, decodeDebtRows, MAX_DEBT_STATE_LENGTH } = require("../lib/debt-state.ts");
const { sanitizeToolValues } = require("../lib/tool-state-values.ts");
const { searchTools } = require("../lib/tool-search.ts");
const { TOOLS } = require("../lib/site.ts");

test("temporary first-year debt growth can still repay after priorities change", () => {
  const r = calcDebtPayoff([
    { name: "High APR", balance: 10000, annualRatePercent: 60, minPayment: 100 },
    { name: "Lower APR", balance: 1000, annualRatePercent: 12, minPayment: 1 },
  ], 404).avalanche;
  assert.equal(r.months, 105);
  near(r.totalInterest, 41650.051158721646);
  assert.equal(r.timeline.at(-1).y, 0);
});

test("annual extra payments are considered before declaring a loan unpayable", () => {
  const r=amortize({principal:1200,annualRatePercent:12,payment:0,extraYearly:2000});
  assert.equal(r.months,12);
  near(r.totalInterest,1200*(1.01**12-1));
  assert.equal(r.balances.at(-1).y,0);
});

test("payoff on the final permitted month is not mistaken for a simulation timeout", () => {
  assert.equal(amortize({principal:1200,annualRatePercent:0,payment:1}).months,1200);
  assert.equal(calcDebtPayoff([{name:"Long",balance:1200,annualRatePercent:0,minPayment:1}],0).avalanche.months,1200);
  assert.equal(calcDebtPayoff([{name:"Unpaid",balance:1200,annualRatePercent:12,minPayment:0}],0).avalanche.months,Infinity);
});

test("invalid card goals never turn silently into a different repayment duration", () => {
  for(const goalMonths of [0,-1,.5,601,NaN,Infinity]) {
    const r=calcCreditCard({balance:1200,aprPercent:0,mode:"goal",monthlyPayment:0,goalMonths});
    assert.match(r.inputError,/whole number/);
    assert.ok(Number.isNaN(r.plan.months));
  }
  const valid=calcCreditCard({balance:1200,aprPercent:0,mode:"goal",monthlyPayment:0,goalMonths:12});
  assert.equal(valid.inputError,undefined); near(valid.payment,100); assert.equal(valid.plan.months,12);
});

test("card inputs reject invalid balances and APR rather than hiding a clamp", () => {
  const base={balance:1200,aprPercent:0,mode:"payment",monthlyPayment:100,goalMonths:12};
  for(const patch of [{balance:-1},{balance:NaN},{aprPercent:81},{aprPercent:-1},{monthlyPayment:NaN}]) {
    assert.ok(calcCreditCard({...base,...patch}).inputError);
  }
});

test("all 15 debt rows survive shared URLs, stored sessions and saved plans", () => {
  const rows=Array.from({length:15},(_,i)=>({name:"Debt "+i+" & long name",balance:String(1234+i),rate:"17.25",min:"42.50"}));
  const d=encodeDebtRows(rows);
  assert.ok(d.length>200 && d.length<MAX_DEBT_STATE_LENGTH);
  const defaults={d:"Default~100~5~10",x:"250",s:"avalanche"};
  const allowed={s:["snowball","avalanche"]};
  const rules={d:{maxLength:MAX_DEBT_STATE_LENGTH,valid:s=>decodeDebtRows(s)!==null}};
  const values={d,x:"404",s:"snowball"};
  for(const source of [Object.fromEntries(new URLSearchParams(new URLSearchParams(values).toString())),JSON.parse(JSON.stringify(values))]) {
    const clean=sanitizeToolValues(defaults,source,allowed,rules);
    assert.deepEqual(clean.rejected,[]);
    assert.deepEqual(decodeDebtRows(clean.values.d),rows);
    assert.equal(clean.values.x,"404");
  }
});

test("invalid shared fields are reported, not silently accepted or truncated", () => {
  const defaults={d:"Default~100~5~10",x:"250",s:"avalanche"};
  const rules={d:{maxLength:MAX_DEBT_STATE_LENGTH,valid:s=>decodeDebtRows(s)!==null}};
  for(const d of ["broken",Array(16).fill("A~1~2~3").join("|"),"A~NaN~2~3","A".repeat(5000)]) {
    const result=sanitizeToolValues(defaults,{d,s:"invalid",unknown:"ignored"},{s:["avalanche"]},rules);
    assert.deepEqual(result.rejected,["d","s"]);
    assert.deepEqual(result.values,{});
  }
  assert.equal(sanitizeToolValues({x:"1"},{x:"9".repeat(201)}).rejected[0],"x");
});

test("homepage and global search match multiword queries and letters s consistently", () => {
  for(const query of ["car loan"," CAR   LOAN ","car\tloan"]) assert.ok(searchTools(TOOLS,query).some(t=>t.slug==="auto-loan-calculator"));
  assert.ok(searchTools(TOOLS,"salary").some(t=>t.slug==="salary-to-hourly-calculator"));
  assert.equal(searchTools(TOOLS,"a completely unknown calculator phrase").length,0);
  assert.equal(searchTools(TOOLS,"").length,Math.min(8,TOOLS.length));
});


test("fractional-year mortgage and savings plans use their actual month count", () => {
  const mortgage=calcMortgage({principal:1200,annualRatePercent:0,yearsLeft:.5,extraMonthly:0,extraYearly:0,oneTime:0});
  near(mortgage.monthlyPayment,200); assert.equal(mortgage.base.months,6);
  const savings=calcCompoundInterest({principal:1200,monthlyContribution:100,annualRatePercent:0,years:.5,compoundsPerYear:12,annualIncreasePercent:0});
  near(savings.futureValue,1800); assert.equal(savings.yearly.at(-1).x,.5);
});

test("gift lists restore beyond 200 characters and numeric input keeps its meaning", () => {
  const {encodeGiftRows,cleanGiftAmount,validGiftState,MAX_GIFT_STATE_LENGTH}=require("../lib/gift-state.ts");
  const g=encodeGiftRows(Array.from({length:10},()=>({name:"Long name 12",amount:"9999999.99"})));
  assert.ok(g.length>200);
  const result=sanitizeToolValues({g:""},{g},undefined,{g:{maxLength:MAX_GIFT_STATE_LENGTH,valid:validGiftState}});
  assert.deepEqual(result.rejected,[]); assert.equal(result.values.g,g);
  assert.equal(cleanGiftAmount("1e3"),"1000"); assert.equal(cleanGiftAmount("-12"),"0");
  assert.equal(cleanGiftAmount("1234.56"),"1234.56"); assert.equal(validGiftState("A~not-a-number"),false);
});

test("IRS Schedule 1-A rounds tips/overtime phaseouts down and car-interest phaseouts up", () => {
  // Final IRS 2025 Schedule 1-A lines 11,19,28; do not share the wrong rounding helper.
  const {applyCapAndPhaseOut}=require("../lib/tools/no-tax-on-overtime-calculator.ts");
  const {carLoanPhaseOut}=require("../lib/tools/car-loan-interest-deduction-calculator.ts");
  assert.equal(applyCapAndPhaseOut(1000,12500,150001,150000).deduction,1000);
  assert.equal(applyCapAndPhaseOut(1000,12500,151000,150000).deduction,900);
  assert.equal(carLoanPhaseOut(1000,100001,"single").deduction,800);
});

test("remaining calculator engines retain their normal examples and eligibility boundaries", () => {
  const c=require("../lib/calc.ts");
  near(c.calcAutoLoan({vehiclePrice:12000,downPayment:0,tradeInValue:0,amountOwedOnTrade:0,salesTaxPercent:0,fees:0,annualRatePercent:0,termMonths:12,taxCreditOnTradeIn:false}).monthlyPayment,1000);
  near(c.calcSalary({mode:"salary",amount:65000,hoursPerWeek:40,weeksPerYear:52,overtimeHoursPerWeek:0}).hourly,31.25);
  near(c.calcTip({bill:86.4,tipPercent:20,people:3,roundUp:false}).perPerson,34.56);
  near(c.percentOf(20,150),30); assert.ok(Number.isNaN(c.whatPercent(10,0)));
  const {calcOvertime}=require("../lib/tools/overtime-calculator.ts");
  const overtime=calcOvertime({hourlyRate:25,hoursPerWeek:50,multiplier:1.5,weeks:52,status:"single",stateCode:"TX"});
  near(overtime.weeklyGross,1375); near(overtime.premiumPerWeek,125);
  const {calcOvertimeDeduction}=require("../lib/tools/no-tax-on-overtime-calculator.ts");
  near(calcOvertimeDeduction({mode:"premium",premium:5000,magi:75000,status:"single"}).deduction,5000);
  const {calcTipsDeduction}=require("../lib/tools/no-tax-on-tips-calculator.ts");
  near(calcTipsDeduction({tips:10000,listedOccupation:true,selfEmployed:true,netProfit:5000,magi:75000,status:"single"}).deduction,5000);
  near(calcTipsDeduction({tips:10000,listedOccupation:false,selfEmployed:false,magi:75000,status:"single"}).deduction,0);
  const {calcSeniorDeduction}=require("../lib/tools/senior-deduction-calculator.ts");
  near(calcSeniorDeduction({status:"mfj",magi:150000,you65:true,spouse65:true}).total,12000);
  const {calcCola}=require("../lib/tools/social-security-cola-calculator.ts");
  near(calcCola({benefit:1000,colaPercent:3.6,partBNow:0,partBNext:0,holdHarmless:false}).newBenefit,1036);
  const {calcHsa}=require("../lib/tools/hsa-calculator.ts");
  const hsa=calcHsa({year:2026,coverage:"self",age55:false,yourContribution:4000,employerContribution:500,viaPayroll:true,income:75000,status:"single",stateCode:"CA",startBalance:0,years:0,returnPercent:0});
  near(hsa.excess,100); near(hsa.stateSaved,0); assert.ok(hsa.federalSaved>0);
  const {calcHolidayBudget}=require("../lib/tools/holiday-budget-calculator.ts");
  const holiday=calcHolidayBudget({gifts:[{name:"A",amount:100}],travel:200,food:100,decorations:50,other:0,budget:500,alreadySaved:100,today:new Date(2026,9,30),target:new Date(2026,11,25),paychecksPerYear:26});
  near(holiday.total,450); near(holiday.stillToSave,350);
});
