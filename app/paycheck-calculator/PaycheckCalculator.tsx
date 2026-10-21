"use client";

import { useMemo, useState } from "react";
import { calcPaycheck, usd, num } from "@/lib/calc";

// Interactive UI for the paycheck calculator. Client component (needs state).
// All math happens here in the browser — nothing sent to any server.
export default function PaycheckCalculator() {
  const [gross, setGross] = useState("65000");
  const [periods, setPeriods] = useState("24"); // semi-monthly default
  const [single, setSingle] = useState(true);
  const [stateTax, setStateTax] = useState("5");
  const [pretax, setPretax] = useState("0");

  // Recompute only when inputs change (useMemo = small perf win)
  const result = useMemo(
    () =>
      calcPaycheck({
        grossAnnual: parseFloat(gross) || 0,
        payPeriodsPerYear: parseInt(periods) || 12,
        filingSingle: single,
        stateTaxPercent: parseFloat(stateTax) || 0,
        pretaxDeductionsAnnual: parseFloat(pretax) || 0,
      }),
    [gross, periods, single, stateTax, pretax]
  );

  const periodLabel =
    periods === "12" ? "month" :
    periods === "24" ? "semi-monthly paycheck" :
    periods === "26" ? "biweekly paycheck" :
    periods === "52" ? "weekly paycheck" : "period";

  return (
    <div className="card">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label-field" htmlFor="gross">Gross annual salary ($)</label>
          <input
            id="gross" type="number" inputMode="decimal" min="0"
            className="input-field" value={gross}
            onChange={(e) => setGross(e.target.value)}
          />
        </div>

        <div>
          <label className="label-field" htmlFor="periods">Pay frequency</label>
          <select
            id="periods" className="input-field" value={periods}
            onChange={(e) => setPeriods(e.target.value)}
          >
            <option value="12">Monthly (12/yr)</option>
            <option value="24">Semi-monthly (24/yr)</option>
            <option value="26">Biweekly (26/yr)</option>
            <option value="52">Weekly (52/yr)</option>
          </select>
        </div>

        <div>
          <label className="label-field" htmlFor="filing">Filing status</label>
          <select
            id="filing" className="input-field" value={single ? "single" : "married"}
            onChange={(e) => setSingle(e.target.value === "single")}
          >
            <option value="single">Single</option>
            <option value="married">Married filing jointly</option>
          </select>
        </div>

        <div>
          <label className="label-field" htmlFor="state">State income tax (%)</label>
          <input
            id="state" type="number" inputMode="decimal" min="0" max="20" step="0.1"
            className="input-field" value={stateTax}
            onChange={(e) => setStateTax(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label-field" htmlFor="pretax">
            Pre-tax deductions per year ($) — 401(k), health premiums, etc.
          </label>
          <input
            id="pretax" type="number" inputMode="decimal" min="0"
            className="input-field" value={pretax}
            onChange={(e) => setPretax(e.target.value)}
          />
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 rounded-xl bg-ivy-50 p-5">
        <div className="text-sm text-slate-600">Estimated take-home pay</div>
        <div className="mt-1 text-3xl font-extrabold text-ivy-700">
          {usd(result.netPerPeriod)}{" "}
          <span className="text-base font-medium text-slate-500">/ {periodLabel}</span>
        </div>
        <div className="mt-1 text-sm text-slate-600">
          {usd(result.netAnnual)} per year · effective tax rate{" "}
          {num(result.effectiveTaxRate * 100, 1)}%
        </div>
      </div>

      {/* Breakdown table */}
      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            <Row label="Gross annual salary" value={usd(parseFloat(gross) || 0)} />
            <Row label="Federal income tax" value={`- ${usd(result.federalTaxAnnual)}`} />
            <Row label="Social Security (6.2%)" value={`- ${usd(result.socialSecurityAnnual)}`} />
            <Row label="Medicare (1.45%)" value={`- ${usd(result.medicareAnnual)}`} />
            <Row label="State income tax" value={`- ${usd(result.stateTaxAnnual)}`} />
            <Row label="Pre-tax deductions" value={`- ${usd(parseFloat(pretax) || 0)}`} />
            <Row label="Net annual take-home" value={usd(result.netAnnual)} bold />
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Estimate only, using 2024 federal brackets and FICA rates. Actual withholding
        depends on your W-4, local taxes, and other factors.
      </p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className={bold ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-700"}>
      <td className="px-4 py-2.5">{label}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{value}</td>
    </tr>
  );
}
