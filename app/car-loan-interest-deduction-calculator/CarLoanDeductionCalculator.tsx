"use client";

import { useMemo } from "react";
import { usd, usd0 } from "@/lib/calc";
import { calcCarLoanDeduction, CAR_PHASE_OUT_START, type CarLoanStatus } from "@/lib/tools/car-loan-interest-deduction-calculator";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, SelectField, Segmented } from "@/components/calc/Fields";
import { ResultHero, Stat, BreakdownTable, Notice } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

// DEFAULTS module level pe (har render pe naya object na bane)
const DEFAULTS = { a: "40000", r: "7", m: "60", pm: "1", py: "2026", ty: "2026", g: "85000", s: "single" };

const TERMS = [36, 48, 60, 72, 84].map((t) => ({ value: String(t), label: `${t} months (${t / 12} yrs)` }));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((label, i) => ({ value: String(i + 1), label }));
const YEARS = ["2025", "2026", "2027", "2028"].map((y) => ({ value: y, label: y }));
const STATUS = [
  { value: "single", label: "Single / HoH / MFS" },
  { value: "mfj", label: "Married jointly" },
];
const ALLOWED = { m: TERMS.map((t) => t.value), pm: MONTHS.map((x) => x.value), py: YEARS.map((y) => y.value), ty: YEARS.map((y) => y.value), s: ["single", "mfj"] };

export default function CarLoanDeductionCalculator() {
  const state = useToolState("car-loan-interest-deduction-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const status = (v.s === "mfj" ? "mfj" : "single") as CarLoanStatus;

  const res = useMemo(
    () =>
      calcCarLoanDeduction({
        loanAmount: n(v.a),
        annualRatePercent: n(v.r),
        termMonths: n(v.m, 60),
        purchaseMonth: n(v.pm, 1),
        purchaseYear: n(v.py, 2026),
        taxYear: n(v.ty, 2026),
        magi: n(v.g),
        status,
      }),
    [v, status]
  );

  const taxYear = n(v.ty, 2026);
  const threshold = CAR_PHASE_OUT_START[status];
  const beforePurchase = n(v.ty, 2026) < n(v.py, 2026);

  return (
    <CalcShell
      summary={{ label: `${taxYear} deduction`, value: usd0(res.deduction) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your car loan</PanelTitle>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Amount financed" prefix="$" value={v.a} onChange={(x) => state.set("a", x)} />
            <NumberField label="Interest rate (APR)" suffix="%" value={v.r} onChange={(x) => state.set("r", x)} step={0.1} />
          </div>
          <SelectField label="Loan length" value={v.m} onChange={(x) => state.set("m", x)} options={TERMS} />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Purchase month" value={v.pm} onChange={(x) => state.set("pm", x)} options={MONTHS} />
            <SelectField label="Purchase year" value={v.py} onChange={(x) => state.set("py", x)} options={YEARS} />
          </div>
          <PanelTitle>Your tax return</PanelTitle>
          <SelectField
            label="Tax year to estimate"
            value={v.ty}
            onChange={(x) => state.set("ty", x)}
            options={YEARS}
            hint="The deduction exists only for tax years 2025 through 2028."
          />
          <Segmented label="Filing status" value={status} onChange={(x) => state.set("s", x)} options={STATUS} />
          <NumberField
            label="Modified AGI (MAGI)"
            prefix="$"
            value={v.g}
            onChange={(x) => state.set("g", x)}
            hint="For most people this is your AGI (Form 1040, line 11)."
          />
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow={`Your ${taxYear} car loan interest deduction`}
            sub={
              <>
                You&apos;d pay about <strong>{usd0(res.interestInYear)}</strong> of interest in {taxYear} ({res.paymentsInYear} payments). At a{" "}
                {Math.round(res.marginalRate * 100)}% federal bracket that saves roughly <strong>{usd0(res.taxSaved)}</strong> in income tax.
              </>
            }
          >
            {usd0(res.deduction)}
          </ResultHero>

          {res.purchaseTooEarly && <Notice>Loans taken out before January 1, 2025 don&apos;t qualify.</Notice>}
          {beforePurchase && !res.purchaseTooEarly && <Notice tone="info">The tax year is before you bought the car, so there&apos;s no interest yet.</Notice>}
          {res.reduction > 0 && (
            <Notice>
              Your MAGI is over {usd0(threshold)}, so the deduction shrinks by $200 for each $1,000 (or part of $1,000) above it. Above{" "}
              {usd0(res.fullyPhasedOutAbove)} this year&apos;s deduction is $0.
            </Notice>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Monthly payment" value={usd(res.monthlyPayment)} />
            <Stat label={`Interest in ${taxYear}`} value={usd0(res.interestInYear)} note="Up to $10,000 counts" />
            <Stat label="Phase-out cut" value={usd0(res.reduction)} />
            <Stat label="Federal tax saved" accent value={usd0(res.taxSaved)} note="Estimate, 2026 brackets" />
          </div>

          <BreakdownTable
            rows={[
              { label: `Interest paid in ${taxYear}`, value: usd(res.interestInYear) },
              { label: "After $10,000 cap", value: usd(res.capped) },
              { label: `Phase-out (MAGI over ${usd0(threshold)})`, value: `− ${usd(res.reduction)}` },
              { label: "Deduction (Schedule 1-A, line 30)", value: usd(res.deduction), strong: true },
            ]}
          />

          <div className="rounded-2xl border border-line p-4">
            <div className="mb-1 text-sm font-semibold text-ink">Year by year (2025–2028)</div>
            <p className="mb-3 text-xs text-muted">Assumes the same MAGI each year. Interest falls as you pay the loan down.</p>
            <table className="w-full text-sm tabular-nums">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="pb-2">Tax year</th>
                  <th className="pb-2 text-right">Interest paid</th>
                  <th className="pb-2 text-right">Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {res.years.map((y) => (
                  <tr
                    key={y.year}
                    onClick={() => state.set("ty", String(y.year))}
                    className={`cursor-pointer transition hover:bg-surface-2 ${y.year === taxYear ? "font-semibold text-ivy-700 dark:text-ivy-300" : "text-ink/80"}`}
                  >
                    <td className="py-2">{y.year}</td>
                    <td className="py-2 text-right">{usd0(y.interest)}</td>
                    <td className="py-2 text-right">{usd0(y.deduction)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">
              Total over the four years: <strong>{usd0(res.totalDeduction)}</strong> of deductions. The law ends after 2028.
            </p>
          </div>

          <ToolActions state={state} shareText={`My ${taxYear} car loan interest deduction: ${usd0(res.deduction)}`} />
        </>
      }
    />
  );
}
