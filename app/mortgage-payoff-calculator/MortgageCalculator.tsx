"use client";

import { useMemo, useState } from "react";
import { calcMortgage, usd, usd0, duration, monthsFromNow } from "@/lib/calc";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField } from "@/components/calc/Fields";
import { ResultHero, Stat, Notice, CountUp } from "@/components/calc/Results";
import LineChart, { shortMoney } from "@/components/calc/LineChart";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle, useCelebrate } from "@/components/calc/CalcShell";

const DEFAULTS = { b: "300000", r: "6.5", y: "30", x: "200", a: "0", o: "0" };

export default function MortgageCalculator() {
  const state = useToolState("mortgage-payoff-calculator", DEFAULTS);
  const v = state.values;
  const [showTable, setShowTable] = useState(false);

  const res = useMemo(
    () =>
      calcMortgage({
        principal: n(v.b),
        annualRatePercent: n(v.r),
        yearsLeft: n(v.y, 30),
        extraMonthly: n(v.x),
        extraYearly: n(v.a),
        oneTime: n(v.o),
      }),
    [v]
  );

  const hasExtra = n(v.x) + n(v.a) + n(v.o) > 0;
  const ok = Number.isFinite(res.withExtra.months);
  useCelebrate(ok && res.monthsSaved >= 12, state.touched);

  return (
    <CalcShell
      summary={{ label: "Mortgage-free by", value: !ok ? "Never at this payment" : res.withExtra.months === 0 ? "Paid off today" : monthsFromNow(res.withExtra.months) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your loan</PanelTitle>
          <NumberField label="Remaining balance" prefix="$" value={v.b} onChange={(x) => state.set("b", x)} />
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Interest rate" suffix="%" value={v.r} onChange={(x) => state.set("r", x)} step={0.125} />
            <NumberField label="Years left" suffix="yrs" value={v.y} onChange={(x) => state.set("y", x)} />
          </div>
          <PanelTitle>Pay it off faster</PanelTitle>
          <NumberField
            label="Extra every month"
            prefix="$"
            value={v.x}
            onChange={(x) => state.set("x", x)}
            slider={{ min: 0, max: 2000, step: 25 }}
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Extra once a year" prefix="$" value={v.a} onChange={(x) => state.set("a", x)} hint="Bonus or tax refund" />
            <NumberField label="Lump sum today" prefix="$" value={v.o} onChange={(x) => state.set("o", x)} />
          </div>
        </>
      }
      results={
        <>
          {!ok ? (
            <Notice>Your payment doesn&apos;t cover the monthly interest, so this loan would never be paid off. Check the rate and balance.</Notice>
          ) : (
            <ResultHero
              eyebrow="You'll own your home in"
              sub={
                hasExtra && res.monthsSaved > 0 ? (
                  <>
                    That&apos;s <strong>{duration(res.monthsSaved)} sooner</strong> and{" "}
                    <strong>{usd0(res.interestSaved)} less interest</strong> than paying the minimum.
                  </>
                ) : (
                  <>Add an extra payment to see how much sooner you could be mortgage-free.</>
                )
              }
            >
              {res.withExtra.months === 0 ? "Paid off today 🎉" : monthsFromNow(res.withExtra.months)}
            </ResultHero>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Monthly P&I" value={usd(res.monthlyPayment)} note={hasExtra ? `+ ${usd0(n(v.x))} extra` : undefined} />
            <Stat label="Interest saved" accent value={<CountUp value={Math.max(0, res.interestSaved)} format={usd0} />} />
            <Stat label="Time saved" accent value={duration(Math.max(0, res.monthsSaved))} />
            <Stat label="Total interest" value={usd0(res.withExtra.totalInterest)} note={`vs ${usd0(res.base.totalInterest)}`} />
          </div>

          {ok && (
            <div className="rounded-2xl border border-line p-4">
              <div className="mb-2 text-sm font-semibold text-ink">Loan balance over time</div>
              <LineChart
                ariaLabel="Mortgage balance over time with and without extra payments"
                formatX={(m) => `Yr ${Math.round(m / 12)}`}
                formatY={(y) => shortMoney(y)}
                series={[
                  { name: "Current plan", color: "#97a89e", points: res.base.balances, dashed: true },
                  { name: "With extra payments", color: "#2a6a44", points: res.withExtra.balances, area: true },
                ]}
              />
            </div>
          )}

          <ToolActions
            state={state}
            shareText={ok ? `I could be mortgage-free by ${monthsFromNow(res.withExtra.months)} 🏠` : undefined}
            csv={() => ({
              filename: "mortgage-payoff-schedule.csv",
              rows: [
                ["Year", "Interest paid", "Principal paid", "Balance"],
                ...res.withExtra.yearly.map((r) => [r.year, r.interest.toFixed(2), r.principal.toFixed(2), r.balance.toFixed(2)]),
              ],
            })}
          />

          {ok && res.withExtra.yearly.length > 0 && (
            <div>
              <button type="button" onClick={() => setShowTable((s) => !s)} className="text-sm font-semibold text-ivy-600 hover:underline dark:text-ivy-400">
                {showTable ? "Hide" : "Show"} year-by-year schedule
              </button>
              {showTable && (
                <div className="mt-3 max-h-80 overflow-auto rounded-2xl border border-line">
                  <table className="w-full text-sm tabular-nums">
                    <thead className="sticky top-0 bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2 text-right">Interest</th>
                        <th className="px-3 py-2 text-right">Principal</th>
                        <th className="px-3 py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {res.withExtra.yearly.map((r) => (
                        <tr key={r.year}>
                          <td className="px-3 py-1.5">{r.year}</td>
                          <td className="px-3 py-1.5 text-right">{usd0(r.interest)}</td>
                          <td className="px-3 py-1.5 text-right">{usd0(r.principal)}</td>
                          <td className="px-3 py-1.5 text-right font-medium">{usd0(r.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      }
    />
  );
}
