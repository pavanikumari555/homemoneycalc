"use client";

import { useMemo, useState } from "react";
import { calcDebtPayoff, usd, Debt } from "@/lib/calc";

interface DebtRow {
  name: string;
  balance: string;
  rate: string;
  min: string;
}

const initialDebts: DebtRow[] = [
  { name: "Credit Card", balance: "5000", rate: "22", min: "150" },
  { name: "Car Loan", balance: "12000", rate: "7", min: "300" },
  { name: "Student Loan", balance: "18000", rate: "5", min: "200" },
];

export default function DebtCalculator() {
  const [debts, setDebts] = useState<DebtRow[]>(initialDebts);
  const [extra, setExtra] = useState("200");

  const parsed: Debt[] = debts.map((d) => ({
    name: d.name,
    balance: parseFloat(d.balance) || 0,
    annualRatePercent: parseFloat(d.rate) || 0,
    minPayment: parseFloat(d.min) || 0,
  }));

  const result = useMemo(
    () => calcDebtPayoff(parsed, parseFloat(extra) || 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(debts), extra]
  );

  function updateDebt(i: number, field: keyof DebtRow, value: string) {
    setDebts((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
  }
  function addDebt() {
    setDebts((prev) => [...prev, { name: `Debt ${prev.length + 1}`, balance: "1000", rate: "15", min: "50" }]);
  }
  function removeDebt(i: number) {
    setDebts((prev) => prev.filter((_, idx) => idx !== i));
  }

  const monthsToYears = (m: number) => `${Math.floor(m / 12)} yr ${m % 12} mo`;

  return (
    <div className="card">
      {/* Debt rows */}
      <div className="space-y-3">
        {debts.map((d, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 rounded-lg bg-slate-50 p-3">
            <div className="col-span-12 sm:col-span-4">
              <label className="label-field text-xs">Name</label>
              <input className="input-field" value={d.name}
                onChange={(e) => updateDebt(i, "name", e.target.value)} />
            </div>
            <div className="col-span-4 sm:col-span-3">
              <label className="label-field text-xs">Balance ($)</label>
              <input type="number" inputMode="decimal" min="0" className="input-field" value={d.balance}
                onChange={(e) => updateDebt(i, "balance", e.target.value)} />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <label className="label-field text-xs">Rate (%)</label>
              <input type="number" inputMode="decimal" min="0" className="input-field" value={d.rate}
                onChange={(e) => updateDebt(i, "rate", e.target.value)} />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <label className="label-field text-xs">Min ($)</label>
              <input type="number" inputMode="decimal" min="0" className="input-field" value={d.min}
                onChange={(e) => updateDebt(i, "min", e.target.value)} />
            </div>
            <div className="col-span-12 flex items-end sm:col-span-1">
              <button
                type="button"
                onClick={() => removeDebt(i)}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-500 hover:border-red-300 hover:text-red-600"
                aria-label={`Remove ${d.name}`}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <button type="button" onClick={addDebt}
          className="rounded-lg border border-ivy-300 px-4 py-2 text-sm font-medium text-ivy-700 hover:bg-ivy-50">
          + Add debt
        </button>
        <div>
          <label className="label-field" htmlFor="extra">Extra monthly payment ($)</label>
          <input id="extra" type="number" inputMode="decimal" min="0"
            className="input-field w-40" value={extra}
            onChange={(e) => setExtra(e.target.value)} />
        </div>
      </div>

      {/* Results: two strategies side by side */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StrategyCard
          title="Avalanche"
          subtitle="Highest interest rate first"
          months={result.avalanche.months}
          interest={result.avalanche.totalInterest}
          best={result.betterByInterest === "avalanche"}
          monthsToYears={monthsToYears}
        />
        <StrategyCard
          title="Snowball"
          subtitle="Smallest balance first"
          months={result.snowball.months}
          interest={result.snowball.totalInterest}
          best={result.betterByInterest === "snowball"}
          monthsToYears={monthsToYears}
        />
      </div>

      {result.betterByInterest !== "tie" && (
        <p className="mt-4 rounded-lg bg-ivy-50 p-4 text-sm text-slate-700">
          <strong className="capitalize">{result.betterByInterest}</strong> saves you about{" "}
          <strong>{usd(result.interestDifference)}</strong> more in interest. Snowball can still be
          worth it if quick wins keep you motivated.
        </p>
      )}
    </div>
  );
}

function StrategyCard({
  title, subtitle, months, interest, best, monthsToYears,
}: {
  title: string; subtitle: string; months: number; interest: number; best: boolean;
  monthsToYears: (m: number) => string;
}) {
  return (
    <div className={`rounded-xl p-5 ${best ? "bg-ivy-100 ring-2 ring-ivy-400" : "bg-slate-50"}`}>
      <div className="flex items-center justify-between">
        <div className="font-bold text-slate-900">{title}</div>
        {best && <span className="rounded-full bg-ivy-600 px-2 py-0.5 text-xs font-semibold text-white">Saves most</span>}
      </div>
      <div className="text-xs text-slate-500">{subtitle}</div>
      <div className="mt-3 text-sm text-slate-600">Debt-free in</div>
      <div className="text-2xl font-extrabold text-ivy-700">{monthsToYears(months)}</div>
      <div className="mt-2 text-sm text-slate-600">
        Total interest: <strong>{Number.isFinite(interest) ? usd(interest) : "—"}</strong>
      </div>
    </div>
  );
}
