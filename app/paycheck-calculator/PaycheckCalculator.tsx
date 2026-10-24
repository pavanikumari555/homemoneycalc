"use client";

import { useMemo, useState } from "react";
import { usd, usd0 } from "@/lib/calc";
import { calcPaycheck, compareStates, FilingStatus } from "@/lib/paycheck";
import { STATES } from "@/lib/tax2026";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, SelectField, Segmented } from "@/components/calc/Fields";
import { ResultHero, SplitBar, CountUp } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

const DEFAULTS = { g: "75000", st: "CA", f: "single", pp: "26", k: "5", o: "1800" };

const PERIODS = [
  { value: "52", label: "Weekly (52 a year)" },
  { value: "26", label: "Every two weeks (26)" },
  { value: "24", label: "Twice a month (24)" },
  { value: "12", label: "Monthly (12)" },
];

const COLORS = {
  net: "#2a6a44",
  federal: "#f7b733",
  state: "#e89b0c",
  ss: "#8bc09e",
  medicare: "#b9dbc3",
  payroll: "#c47c00",
  retirement: "#5aa074",
  other: "#97a89e",
};

export default function PaycheckCalculator() {
  const state = useToolState("paycheck-calculator", DEFAULTS);
  const v = state.values;
  const [view, setView] = useState<"period" | "year">("period");
  const [showAll, setShowAll] = useState(false);

  const input = useMemo(
    () => ({
      grossAnnual: n(v.g),
      payPeriodsPerYear: n(v.pp, 26),
      status: (v.f === "married" ? "married" : "single") as FilingStatus,
      stateCode: v.st,
      retirementPercent: n(v.k),
      otherPretaxAnnual: n(v.o),
    }),
    [v]
  );
  const res = useMemo(() => calcPaycheck(input), [input]);
  const ranking = useMemo(() => compareStates(input), [input]);

  const periods = n(v.pp, 26);
  const div = view === "period" ? periods : 1;
  const per = (x: number) => usd(x / div);
  const myRank = ranking.findIndex((r) => r.code === res.state.code) + 1;
  const best = ranking[0];

  const rows = [
    { label: "Federal income tax", value: res.federalTax, color: COLORS.federal },
    { label: `${res.state.name} income tax`, value: res.stateTax, color: COLORS.state },
    { label: "Social Security (6.2%)", value: res.socialSecurity, color: COLORS.ss },
    { label: "Medicare", value: res.medicare, color: COLORS.medicare },
    ...res.statePayroll.map((p) => ({ label: p.name, value: p.amount, color: COLORS.payroll })),
    { label: "401(k) / retirement", value: res.retirement, color: COLORS.retirement },
    { label: "Health & other pre-tax", value: res.otherPretax, color: COLORS.other },
  ].filter((r) => r.value > 0.004);

  return (
    <CalcShell
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your pay</PanelTitle>
          <NumberField label="Annual salary (gross)" prefix="$" value={v.g} onChange={(x) => state.set("g", x)} slider={{ min: 15000, max: 300000, step: 1000 }} />
          <SelectField
            label="State you work in"
            value={v.st}
            onChange={(x) => state.set("st", x)}
            options={STATES.map((s) => ({ value: s.code, label: `${s.name}${s.type === "none" ? " (no income tax)" : ""}` }))}
          />
          <Segmented
            label="Filing status"
            value={v.f === "married" ? "married" : "single"}
            onChange={(x) => state.set("f", x)}
            options={[
              { value: "single", label: "Single" },
              { value: "married", label: "Married, jointly" },
            ]}
          />
          <SelectField label="How often you're paid" value={v.pp} onChange={(x) => state.set("pp", x)} options={PERIODS} />
          <PanelTitle>Pre-tax deductions</PanelTitle>
          <NumberField label="401(k) contribution" suffix="% of pay" value={v.k} onChange={(x) => state.set("k", x)} slider={{ min: 0, max: 30, step: 1 }} />
          <NumberField label="Health, dental & other pre-tax" prefix="$" suffix="/yr" value={v.o} onChange={(x) => state.set("o", x)} hint="Your share of premiums, HSA/FSA" />
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow={view === "period" ? `Take-home per paycheck (${periods}×/yr)` : "Take-home per year"}
            sub={
              <>
                That&apos;s <strong>{usd0(res.net)}</strong> a year — <strong>{Math.round((res.net / (res.gross || 1)) * 100)}%</strong> of your
                salary. Your taxes total {(res.effectiveRate * 100).toFixed(1)}% and your federal bracket is {Math.round(res.marginalFederal * 100)}%.
              </>
            }
          >
            <CountUp value={res.net / div} format={usd} />
          </ResultHero>

          <div className="flex items-center justify-between gap-3">
            <Segmented
              value={view}
              onChange={(x) => setView(x as "period" | "year")}
              options={[
                { value: "period", label: "Per paycheck" },
                { value: "year", label: "Per year" },
              ]}
            />
          </div>

          <div className="rounded-2xl border border-line p-4">
            <div className="mb-3 text-sm font-semibold text-ink">Where your paycheck goes</div>
            <SplitBar parts={[{ label: "Take-home", value: res.net, color: COLORS.net }, ...rows]} />
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <table className="w-full text-sm tabular-nums">
                <tbody className="divide-y divide-line">
                  <tr className="text-ink/80">
                    <td className="px-4 py-2.5">Gross pay</td>
                    <td className="px-4 py-2.5 text-right">{per(res.gross)}</td>
                  </tr>
                  {rows.map((r) => (
                    <tr key={r.label} className="text-ink/80">
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                          {r.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">−{per(r.value)}</td>
                    </tr>
                  ))}
                  <tr className="bg-ivy-50 font-semibold text-ivy-800 dark:bg-ivy-900/30 dark:text-ivy-200">
                    <td className="px-4 py-2.5">Take-home pay</td>
                    <td className="px-4 py-2.5 text-right">{per(res.net)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {res.state.notes && (
            <details className="group rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm">
              <summary className="cursor-pointer list-none font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                What&apos;s included for {res.state.name} <span className="text-muted group-open:hidden">(tap to see)</span>
              </summary>
              <p className="mt-2 text-ink/80">
                {res.state.notes}{" "}
                <a href={res.state.source} target="_blank" rel="noopener noreferrer" className="link">
                  Official source
                </a>
              </p>
            </details>
          )}

          <div className="rounded-2xl border border-line p-4">
            <div className="mb-1 text-sm font-semibold text-ink">Same salary, other states</div>
            <p className="mb-3 text-xs text-muted">
              {res.state.name} ranks <strong className="text-ink">#{myRank} of {ranking.length}</strong> for take-home pay on this salary.
              {best && best.code !== res.state.code && <> In {best.name} you&apos;d keep {usd0(best.net - res.net)} more a year.</>}
            </p>
            <ol className="space-y-1.5">
              {(showAll ? ranking : ranking.slice(0, 5)).map((r, i) => {
                const width = (r.net / (ranking[0]?.net || 1)) * 100;
                const mine = r.code === res.state.code;
                return (
                  <li key={r.code}>
                    <button type="button" onClick={() => state.set("st", r.code)} className="group flex w-full items-center gap-3 text-left text-sm">
                      <span className="w-6 text-right text-xs text-muted">{showAll ? i + 1 : ranking.indexOf(r) + 1}</span>
                      <span className={`flex-1 truncate sm:w-28 sm:flex-none ${mine ? "font-bold text-ivy-700 dark:text-ivy-300" : "text-ink/80 group-hover:text-ink"}`}>{r.name}</span>
                      <span className="relative hidden h-2 flex-1 overflow-hidden rounded-full bg-surface-2 sm:block">
                        <span className={`absolute inset-y-0 left-0 rounded-full ${mine ? "bg-ivy-600" : "bg-ivy-300 dark:bg-ivy-700"}`} style={{ width: `${width}%` }} />
                      </span>
                      <span className="w-20 text-right tabular-nums text-ink">{usd0(r.net)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {!showAll && myRank > 5 && (
              <div className="mt-1.5 flex items-center gap-3 text-sm">
                <span className="w-6 text-right text-xs text-muted">{myRank}</span>
                <span className="flex-1 truncate font-bold sm:w-28 sm:flex-none text-ivy-700 dark:text-ivy-300">{res.state.name}</span>
                <span className="flex-1" />
                <span className="w-20 text-right tabular-nums text-ink">{usd0(res.net)}</span>
              </div>
            )}
            <button type="button" onClick={() => setShowAll((s) => !s)} className="mt-3 text-sm font-semibold text-ivy-600 hover:underline dark:text-ivy-400">
              {showAll ? "Show top 5" : "Show all states"}
            </button>
          </div>

          <ToolActions state={state} shareText={`My take-home pay in ${res.state.name}: ${usd0(res.net)}/yr`} />
        </>
      }
    />
  );
}
