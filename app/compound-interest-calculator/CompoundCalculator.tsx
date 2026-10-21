"use client";

import { useMemo, useState } from "react";
import { calcCompoundInterest, money, CURRENCIES } from "@/lib/calc";

export default function CompoundCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [monthly, setMonthly] = useState("300");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("20");
  const [freq, setFreq] = useState("12");
  const [currency, setCurrency] = useState("USD"); // user-selectable currency

  const result = useMemo(
    () =>
      calcCompoundInterest({
        principal: parseFloat(principal) || 0,
        monthlyContribution: parseFloat(monthly) || 0,
        annualRatePercent: parseFloat(rate) || 0,
        years: parseFloat(years) || 0,
        compoundsPerYear: parseInt(freq) || 12,
      }),
    [principal, monthly, rate, years, freq]
  );

  // Helper so every amount uses the chosen currency
  const fmt = (n: number) => money(n, currency);

  // For a lightweight bar "chart" without any library
  const maxBal = result.yearlyBalances.length
    ? result.yearlyBalances[result.yearlyBalances.length - 1].balance
    : 1;

  return (
    <div className="card">
      {/* Currency selector — math is identical worldwide, this only changes the symbol */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="currency">
          Currency:
        </label>
        <select
          id="currency"
          className="input-field w-auto"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500">
          Compound interest math is the same in every country — pick your currency.
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="principal" label="Starting amount" value={principal} set={setPrincipal} />
        <Field id="monthly" label="Monthly contribution" value={monthly} set={setMonthly} />
        <Field id="rate" label="Annual return rate (%)" value={rate} set={setRate} step="0.1" />
        <Field id="years" label="Years to grow" value={years} set={setYears} />
        <div className="md:col-span-2">
          <label className="label-field" htmlFor="freq">Compounding frequency</label>
          <select id="freq" className="input-field" value={freq} onChange={(e) => setFreq(e.target.value)}>
            <option value="1">Annually</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
            <option value="365">Daily</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Future value" value={fmt(result.futureValue)} highlight />
        <Stat label="You contributed" value={fmt(result.totalContributions)} />
        <Stat label="Interest earned" value={fmt(result.totalInterest)} />
      </div>

      {/* Simple year-by-year bar chart (pure CSS, no library = lightweight) */}
      {result.yearlyBalances.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-medium text-slate-700">Balance growth by year</div>
          <div className="flex h-40 items-end gap-1">
            {result.yearlyBalances.map((y) => (
              <div key={y.year} className="flex flex-1 flex-col items-center" title={`Year ${y.year}: ${fmt(y.balance)}`}>
                <div
                  className="w-full rounded-t bg-ivy-500"
                  style={{ height: `${Math.max(2, (y.balance / maxBal) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Year 1</span>
            <span>Year {result.yearlyBalances.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ id, label, value, set, step }: {
  id: string; label: string; value: string; set: (v: string) => void; step?: string;
}) {
  return (
    <div>
      <label className="label-field" htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="decimal" min="0" step={step}
        className="input-field" value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-5 ${highlight ? "bg-ivy-100" : "bg-slate-50"}`}>
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`mt-1 text-xl font-extrabold ${highlight ? "text-ivy-700" : "text-slate-800"}`}>
        {value}
      </div>
    </div>
  );
}
