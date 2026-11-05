"use client";

import { useMemo, useState } from "react";
import { calcMortgage, usd, usd0, duration, monthsFromNow } from "@/lib/calc";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, SelectField } from "@/components/calc/Fields";
import { ResultHero, Stat, Notice, CountUp } from "@/components/calc/Results";
import LineChart, { shortMoney } from "@/components/calc/LineChart";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CheckIn } from "@/components/calc/CheckIn";
import { CalcShell, PanelTitle, useCelebrate } from "@/components/calc/CalcShell";

const DEFAULTS = { b: "300000", r: "6.5", y: "30", x: "200", a: "0", o: "0" };

export default function MortgageCalculator() {
  const state = useToolState("mortgage-payoff-calculator", DEFAULTS);
  const v = state.values;
  const [schedulePeriod, setSchedulePeriod] = useState("yearly");
  const [schedulePlan, setSchedulePlan] = useState("with-extra");

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

  const withExtra = schedulePlan === "with-extra";
  const monthly = schedulePeriod === "monthly";
  const monthlyRows = withExtra ? res.monthly.withExtra : res.monthly.base;
  const yearlyRows = withExtra ? res.withExtra.yearly : res.base.yearly;
  const scheduleHeaders = monthly
    ? ["Month", "Payment", "Total principal", "Extra principal", "Interest", "Balance"]
    : ["Year", "Interest paid", "Principal paid", "Balance"];
  const scheduleRows = monthly
    ? monthlyRows.map((row) => [row.month, row.payment, row.principal, row.extraPrincipal, row.interest, row.balance])
    : yearlyRows.map((row) => [row.year, row.interest, row.principal, row.balance]);

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
            csv={ok ? () => ({
              filename: monthly ? `mortgage-payoff-${schedulePlan}-monthly.csv` : withExtra
                ? "mortgage-payoff-schedule.csv"
                : "mortgage-payoff-regular-yearly.csv",
              rows: [
                scheduleHeaders,
                ...scheduleRows.map(([period, ...amounts]) => [period, ...amounts.map((amount) => amount.toFixed(2))]),
              ],
            }) : undefined}
          />
          {ok && <CheckIn tool="mortgage-payoff-calculator" label="mortgage balance" plan={res.withExtra.balances} url="/mortgage-payoff-calculator/" />}

          {ok && (res.monthly.withExtra.length > 0 || res.monthly.base.length > 0) && (
            <details className="rounded-2xl border border-line p-4">
              <summary className="cursor-pointer text-sm font-semibold text-ink">Amortization schedule</summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <SelectField label="Payment plan" value={schedulePlan} onChange={setSchedulePlan} options={[
                  { value: "with-extra", label: "With extra payments" },
                  { value: "regular", label: "Regular payments" },
                ]} />
                <SelectField label="Schedule frequency" value={schedulePeriod} onChange={setSchedulePeriod} options={[
                  { value: "yearly", label: "Year by year" },
                  { value: "monthly", label: "Month by month" },
                ]} />
              </div>
              <p className="mt-3 text-xs text-muted">
                CSV uses the selected plan and frequency. Payments cover principal and interest only. Total principal includes any extra principal.
                {withExtra && monthlyRows[0]?.month === 0 && " The upfront lump sum is listed as month 0 in the monthly schedule."}
              </p>
              {scheduleRows.length > 0 ? (
                <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-line" tabIndex={0} role="region" aria-label="Mortgage amortization schedule">
                  <table className="w-full whitespace-nowrap text-sm tabular-nums">
                    <thead className="sticky top-0 bg-surface-2 text-xs uppercase tracking-wide text-muted">
                      <tr>
                        {scheduleHeaders.map((header, index) => (
                          <th key={header} scope="col" className={`px-3 py-2 ${index === 0 ? "text-left" : "text-right"}`}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {scheduleRows.map(([period, ...amounts]) => (
                        <tr key={period}>
                          <th scope="row" className="px-3 py-1.5 text-left font-normal">{period}</th>
                          {amounts.map((amount, index) => (
                            <td key={scheduleHeaders[index + 1]} className="px-3 py-1.5 text-right">{usd(amount)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="mt-3 text-sm text-muted">This plan has no remaining scheduled payments.</p>}
            </details>
          )}
        </>
      }
    />
  );
}
