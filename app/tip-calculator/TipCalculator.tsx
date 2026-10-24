"use client";

import { useMemo } from "react";
import { calcTip, usd } from "@/lib/calc";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, Toggle } from "@/components/calc/Fields";
import { ResultHero, BreakdownTable } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

const DEFAULTS = { b: "86.40", t: "18", p: "2", r: "0" };
const QUICK = [10, 15, 18, 20, 22, 25];
const ALLOWED = { r: ["0", "1"] };

export default function TipCalculator() {
  const state = useToolState("tip-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const people = Math.max(1, Math.round(n(v.p, 1)));

  const res = useMemo(
    () => calcTip({ bill: n(v.b), tipPercent: n(v.t), people, roundUp: v.r === "1" }),
    [v, people]
  );

  return (
    <CalcShell
      summary={{ label: people > 1 ? "Each person pays" : "Total to pay", value: usd(people > 1 ? res.perPerson : res.total) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <NumberField label="Bill amount" prefix="$" value={v.b} onChange={(x) => state.set("b", x)} />
          <div>
            <PanelTitle>Tip</PanelTitle>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => state.set("t", String(q))}
                  className={`rounded-xl border py-2 text-sm font-semibold transition ${
                    n(v.t) === q ? "border-ivy-600 bg-ivy-600 text-white" : "border-line bg-surface text-ink hover:border-ivy-400"
                  }`}
                >
                  {q}%
                </button>
              ))}
            </div>
          </div>
          <NumberField label="Custom tip" suffix="%" value={v.t} onChange={(x) => state.set("t", x)} />
          <div>
            <span className="label-field">Split between</span>
            <div className="flex items-center gap-3">
              <button type="button" className="btn-ghost h-11 w-11 p-0 text-lg" onClick={() => state.set("p", String(Math.max(1, people - 1)))} aria-label="One fewer person">
                −
              </button>
              <span className="min-w-[4rem] text-center text-2xl font-bold tabular-nums text-ink">{people}</span>
              <button type="button" className="btn-ghost h-11 w-11 p-0 text-lg" onClick={() => state.set("p", String(Math.min(100, people + 1)))} aria-label="One more person">
                +
              </button>
              <span className="text-sm text-muted">{people === 1 ? "person" : "people"}</span>
            </div>
          </div>
          <Toggle label="Round up each share" hint="Easier for cash; the extra goes to the tip" checked={v.r === "1"} onChange={(x) => state.set("r", x ? "1" : "0")} />
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow={people > 1 ? "Each person pays" : "Total to pay"}
            sub={
              <>
                Includes a <strong>{usd(res.tip)}</strong> tip ({n(v.b) > 0 ? ((res.tip / n(v.b)) * 100).toFixed(1) : "0"}% of the bill).
              </>
            }
          >
            {usd(people > 1 ? res.perPerson : res.total)}
          </ResultHero>
          <BreakdownTable
            rows={[
              { label: "Bill", value: usd(n(v.b)) },
              { label: "Tip", value: usd(res.tip) },
              { label: "Total", value: usd(res.total), strong: true },
              ...(people > 1
                ? [
                    { label: "Tip per person", value: usd(res.tipPerPerson) },
                    { label: "Total per person", value: usd(res.perPerson), strong: true },
                  ]
                : []),
            ]}
          />
          <ToolActions state={state} />
        </>
      }
    />
  );
}
