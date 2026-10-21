"use client";

import { useState } from "react";
import { percentOf, whatPercent, percentChange, num } from "@/lib/calc";

export default function PercentageCalculator() {
  // Three independent mini-calculators (the three most-searched percentage questions)
  const [p1a, setP1a] = useState("20");
  const [p1b, setP1b] = useState("150");

  const [p2a, setP2a] = useState("30");
  const [p2b, setP2b] = useState("150");

  const [p3a, setP3a] = useState("100");
  const [p3b, setP3b] = useState("125");

  const r1 = percentOf(parseFloat(p1a) || 0, parseFloat(p1b) || 0);
  const r2 = whatPercent(parseFloat(p2a) || 0, parseFloat(p2b) || 0);
  const r3 = percentChange(parseFloat(p3a) || 0, parseFloat(p3b) || 0);

  return (
    <div className="space-y-5">
      <div className="card">
        <h3 className="mb-3 font-semibold text-slate-900">What is X% of Y?</h3>
        <div className="flex flex-wrap items-center gap-2 text-slate-700">
          <span>What is</span>
          <input type="number" inputMode="decimal" className="input-field w-24" value={p1a}
            onChange={(e) => setP1a(e.target.value)} aria-label="Percentage" />
          <span>% of</span>
          <input type="number" inputMode="decimal" className="input-field w-32" value={p1b}
            onChange={(e) => setP1b(e.target.value)} aria-label="Value" />
          <span>?</span>
        </div>
        <div className="mt-4 rounded-lg bg-ivy-50 p-4 text-xl font-bold text-ivy-700">
          = {num(r1)}
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold text-slate-900">X is what percent of Y?</h3>
        <div className="flex flex-wrap items-center gap-2 text-slate-700">
          <input type="number" inputMode="decimal" className="input-field w-28" value={p2a}
            onChange={(e) => setP2a(e.target.value)} aria-label="Part" />
          <span>is what percent of</span>
          <input type="number" inputMode="decimal" className="input-field w-32" value={p2b}
            onChange={(e) => setP2b(e.target.value)} aria-label="Whole" />
          <span>?</span>
        </div>
        <div className="mt-4 rounded-lg bg-ivy-50 p-4 text-xl font-bold text-ivy-700">
          = {num(r2)}%
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold text-slate-900">Percentage change from X to Y</h3>
        <div className="flex flex-wrap items-center gap-2 text-slate-700">
          <span>From</span>
          <input type="number" inputMode="decimal" className="input-field w-28" value={p3a}
            onChange={(e) => setP3a(e.target.value)} aria-label="Old value" />
          <span>to</span>
          <input type="number" inputMode="decimal" className="input-field w-28" value={p3b}
            onChange={(e) => setP3b(e.target.value)} aria-label="New value" />
        </div>
        <div className="mt-4 rounded-lg bg-ivy-50 p-4 text-xl font-bold text-ivy-700">
          = {r3 >= 0 ? "+" : ""}{num(r3)}%{" "}
          <span className="text-sm font-medium text-slate-500">
            ({r3 >= 0 ? "increase" : "decrease"})
          </span>
        </div>
      </div>
    </div>
  );
}
