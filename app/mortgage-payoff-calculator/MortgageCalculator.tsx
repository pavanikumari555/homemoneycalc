"use client";

import { useMemo, useState } from "react";
import { calcMortgage, usd, num } from "@/lib/calc";

export default function MortgageCalculator() {
  const [principal, setPrincipal] = useState("300000");
  const [rate, setRate] = useState("6.5");
  const [term, setTerm] = useState("30");
  const [extra, setExtra] = useState("200");

  const result = useMemo(
    () =>
      calcMortgage({
        principal: parseFloat(principal) || 0,
        annualRatePercent: parseFloat(rate) || 0,
        termYears: parseFloat(term) || 30,
        extraMonthly: parseFloat(extra) || 0,
      }),
    [principal, rate, term, extra]
  );

  const yearsSaved = Math.floor(result.monthsSaved / 12);
  const monthsRem = result.monthsSaved % 12;

  return (
    <div className="card">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label-field" htmlFor="principal">Loan balance ($)</label>
          <input id="principal" type="number" inputMode="decimal" min="0"
            className="input-field" value={principal}
            onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div>
          <label className="label-field" htmlFor="rate">Interest rate (%)</label>
          <input id="rate" type="number" inputMode="decimal" min="0" max="30" step="0.01"
            className="input-field" value={rate}
            onChange={(e) => setRate(e.target.value)} />
        </div>
        <div>
          <label className="label-field" htmlFor="term">Loan term (years)</label>
          <input id="term" type="number" inputMode="decimal" min="1" max="50"
            className="input-field" value={term}
            onChange={(e) => setTerm(e.target.value)} />
        </div>
        <div>
          <label className="label-field" htmlFor="extra">Extra monthly payment ($)</label>
          <input id="extra" type="number" inputMode="decimal" min="0"
            className="input-field" value={extra}
            onChange={(e) => setExtra(e.target.value)} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-ivy-50 p-5">
          <div className="text-sm text-slate-600">Time saved</div>
          <div className="mt-1 text-2xl font-extrabold text-ivy-700">
            {yearsSaved > 0 ? `${yearsSaved} yr ` : ""}{monthsRem} mo
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Paid off in {num(result.payoffYearsWithExtra, 1)} years
          </div>
        </div>
        <div className="rounded-xl bg-ivy-50 p-5">
          <div className="text-sm text-slate-600">Interest saved</div>
          <div className="mt-1 text-2xl font-extrabold text-ivy-700">
            {Number.isFinite(result.interestSaved) ? usd(result.interestSaved) : "—"}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            over the life of the loan
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            <Row label="Base monthly payment (P&I)" value={usd(result.monthlyPayment)} />
            <Row label="With your extra payment" value={usd(result.monthlyPayment + (parseFloat(extra) || 0))} />
            <Row label="Total interest — no extra" value={Number.isFinite(result.totalInterestBase) ? usd(result.totalInterestBase) : "—"} />
            <Row label="Total interest — with extra" value={Number.isFinite(result.totalInterestWithExtra) ? usd(result.totalInterestWithExtra) : "—"} />
            <Row label="Interest saved" value={Number.isFinite(result.interestSaved) ? usd(result.interestSaved) : "—"} bold />
          </tbody>
        </table>
      </div>
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
