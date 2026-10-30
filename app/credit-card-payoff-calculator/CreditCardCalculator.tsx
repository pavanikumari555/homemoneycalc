"use client";

import { useMemo } from "react";
import { calcCreditCard, usd, usd0, duration, monthsFromNow } from "@/lib/calc";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, Segmented } from "@/components/calc/Fields";
import { ResultHero, Stat, Notice } from "@/components/calc/Results";
import LineChart, { shortMoney } from "@/components/calc/LineChart";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CheckIn } from "@/components/calc/CheckIn";
import { CalcShell, PanelTitle, useCelebrate } from "@/components/calc/CalcShell";

const DEFAULTS = { b: "6000", apr: "22.9", mode: "payment", p: "250", g: "24" };
const ALLOWED = { mode: ["payment", "goal"] };

export default function CreditCardCalculator() {
  const state = useToolState("credit-card-payoff-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const mode = v.mode === "goal" ? "goal" : "payment";

  const res = useMemo(
    () =>
      calcCreditCard({
        balance: n(v.b, NaN),
        aprPercent: n(v.apr, NaN),
        mode,
        monthlyPayment: n(v.p, NaN),
        goalMonths: n(v.g, NaN),
      }),
    [v, mode]
  );

  const ok = Number.isFinite(res.plan.months);
  const firstInterest = (n(v.b, NaN) * n(v.apr, NaN)) / 100 / 12;
  useCelebrate(ok && res.interestSavedVsMinimum > 500, state.touched);

  return (
    <CalcShell
      summary={{ label: mode === "payment" ? "Paid off in" : "Pay each month", value: res.inputError ? "Check inputs" : !ok ? "Not repaid at this payment" : mode === "payment" ? duration(res.plan.months) : usd(res.payment) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your card</PanelTitle>
          <NumberField label="Card balance" prefix="$" value={v.b} onChange={(x) => state.set("b", x)} />
          <NumberField label="APR (interest rate)" suffix="%" value={v.apr} onChange={(x) => state.set("apr", x)} step={0.1} hint="Find it on your statement" />
          <Segmented
            label="I want to know…"
            value={mode}
            onChange={(x) => state.set("mode", x)}
            options={[
              { value: "payment", label: "How long it takes" },
              { value: "goal", label: "What to pay" },
            ]}
          />
          {mode === "payment" ? (
            <NumberField label="Monthly payment" prefix="$" value={v.p} onChange={(x) => state.set("p", x)} slider={{ min: 25, max: 2000, step: 25 }} />
          ) : (
            <NumberField label="Debt-free in" suffix="months" min={1} max={600} step={1} value={v.g} onChange={(x) => state.set("g", x)} slider={{ min: 3, max: 60, step: 1 }} />
          )}
        </>
      }
      results={
        <>
          {res.inputError ? <Notice>{res.inputError}</Notice> : !ok ? (
            <Notice>
              This payment does not repay the balance within the 100-year calculation limit. First-month interest is about {usd(firstInterest)}. Check your numbers or increase the monthly payment.
            </Notice>
          ) : mode === "payment" ? (
            <ResultHero
              eyebrow="Card paid off in"
              sub={
                <>
                  That&apos;s <strong>{monthsFromNow(res.plan.months)}</strong>, costing <strong>{usd0(res.plan.totalInterest)}</strong> in
                  interest.
                </>
              }
            >
              {duration(res.plan.months)}
            </ResultHero>
          ) : (
            <ResultHero
              eyebrow={`Pay this every month for ${Math.round(n(v.g, 24))} months`}
              sub={
                <>
                  You&apos;ll be debt-free by <strong>{monthsFromNow(res.plan.months)}</strong> and pay <strong>{usd0(res.plan.totalInterest)}</strong> in
                  interest.
                </>
              }
            >
              {usd(res.payment)}
            </ResultHero>
          )}

          {!res.inputError && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Monthly payment" value={usd0(res.payment)} />
            <Stat label="Total interest" value={ok ? usd0(res.plan.totalInterest) : "—"} />
            <Stat
              label="Minimums only"
              value={Number.isFinite(res.minimumPlan.months) ? duration(res.minimumPlan.months) : "never"}
              note={Number.isFinite(res.minimumPlan.totalInterest) ? `${usd0(res.minimumPlan.totalInterest)} interest` : undefined}
            />
            <Stat label="You save vs minimums" accent value={ok && res.interestSavedVsMinimum > 0 ? usd0(res.interestSavedVsMinimum) : "—"} />
          </div>}

          {ok && (
            <div className="rounded-2xl border border-line p-4">
              <div className="mb-2 text-sm font-semibold text-ink">Your plan vs. paying the minimum</div>
              <LineChart
                ariaLabel="Credit card balance over time with your payment compared with minimum payments"
                formatX={(m) => (m < 24 ? `${Math.round(m)} mo` : `Yr ${Math.round(m / 12)}`)}
                formatY={(y) => shortMoney(y)}
                series={[
                  { name: "Minimum payments", color: "#97a89e", points: res.minimumPlan.balances, dashed: true },
                  { name: "Your plan", color: "#2a6a44", points: res.plan.balances, area: true },
                ]}
              />
              <p className="mt-2 text-xs text-muted">Minimum payment modeled as 1% of balance + interest, at least $25 — a common issuer formula.</p>
            </div>
          )}

          <ToolActions state={state} shareText={ok ? `My card will be paid off by ${monthsFromNow(res.plan.months)} 💳` : undefined} />
          {ok && <CheckIn tool="credit-card-payoff-calculator" label="card balance" plan={res.plan.balances} url="/credit-card-payoff-calculator/" />}
        </>
      }
    />
  );
}
