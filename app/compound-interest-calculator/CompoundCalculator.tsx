"use client";

import { useMemo } from "react";
import { calcCompoundInterest, money, CURRENCIES, num } from "@/lib/calc";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, SelectField } from "@/components/calc/Fields";
import { ResultHero, Stat, SplitBar, CountUp } from "@/components/calc/Results";
import LineChart, { shortMoney } from "@/components/calc/LineChart";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle, useCelebrate } from "@/components/calc/CalcShell";

const DEFAULTS = { cur: "USD", p: "10000", m: "300", r: "7", y: "20", c: "12", g: "0" };
const ALLOWED = { cur: CURRENCIES.map((c) => c.code), c: ["1", "4", "12", "365"] };

const COMPOUNDING = [
  { value: "1", label: "Yearly" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
  { value: "365", label: "Daily" },
];

export default function CompoundCalculator() {
  const state = useToolState("compound-interest-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const cur = CURRENCIES.find((c) => c.code === v.cur) ?? CURRENCIES[0];
  const fmt = (x: number) => money(x, cur.code, 0);

  const res = useMemo(
    () =>
      calcCompoundInterest({
        principal: n(v.p),
        monthlyContribution: n(v.m),
        annualRatePercent: n(v.r),
        years: n(v.y, 10),
        compoundsPerYear: n(v.c, 12),
        annualIncreasePercent: n(v.g),
      }),
    [v]
  );

  const growthShare = res.futureValue > 0 ? res.totalInterest / res.futureValue : 0;
  useCelebrate(res.futureValue >= 1_000_000, state.touched);

  return (
    <CalcShell
      summary={{ label: `In ${num(n(v.y, 10), 0)} years`, value: fmt(res.futureValue) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <SelectField label="Currency" value={v.cur} onChange={(x) => state.set("cur", x)} options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))} />
          <PanelTitle>Your savings</PanelTitle>
          <NumberField label="Starting amount" prefix={cur.symbol} value={v.p} onChange={(x) => state.set("p", x)} />
          <NumberField label="Monthly deposit" prefix={cur.symbol} value={v.m} onChange={(x) => state.set("m", x)} slider={{ min: 0, max: 3000, step: 50 }} />
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Yearly return" suffix="%" value={v.r} onChange={(x) => state.set("r", x)} step={0.1} />
            <NumberField label="Years" suffix="yrs" value={v.y} onChange={(x) => state.set("y", x)} slider={{ min: 1, max: 50, step: 1 }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Compounding" value={v.c} onChange={(x) => state.set("c", x)} options={COMPOUNDING} />
            <NumberField label="Raise deposit yearly" suffix="%" value={v.g} onChange={(x) => state.set("g", x)} hint="e.g. 3% with pay rises" />
          </div>
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow={`In ${num(n(v.y, 10), 0)} years you'll have`}
            sub={
              <>
                You put in <strong>{fmt(res.totalContributions)}</strong>. Compound interest adds{" "}
                <strong>{fmt(res.totalInterest)}</strong> — {Math.round(growthShare * 100)}% of the final balance is growth.
              </>
            }
          >
            <CountUp value={res.futureValue} format={fmt} />
          </ResultHero>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="You deposit" value={fmt(res.totalContributions)} />
            <Stat label="Interest earned" accent value={fmt(res.totalInterest)} />
            <Stat label="Money doubles every" value={Number.isFinite(res.doublingYears) ? `${num(res.doublingYears, 1)} yrs` : "—"} />
          </div>

          <div className="rounded-2xl border border-line p-4">
            <div className="mb-2 text-sm font-semibold text-ink">Growth over time</div>
            <LineChart
              ariaLabel="Savings balance versus total deposits over time"
              formatX={(x) => `Yr ${Math.round(x)}`}
              formatY={(y) => shortMoney(y, cur.symbol)}
              series={[
                { name: "Total balance", color: "#2a6a44", area: true, points: res.yearly.map((p) => ({ x: p.x, y: p.balance })) },
                { name: "Your deposits", color: "#f7b733", points: res.yearly.map((p) => ({ x: p.x, y: p.contributed })) },
              ]}
            />
          </div>

          <div className="rounded-2xl border border-line p-4">
            <SplitBar
              parts={[
                { label: "Starting amount", value: n(v.p), color: "#8bc09e" },
                { label: "Deposits", value: res.totalContributions - n(v.p), color: "#f7b733" },
                { label: "Interest", value: res.totalInterest, color: "#2a6a44" },
              ]}
            />
          </div>

          <ToolActions
            state={state}
            shareText={`My savings could grow to ${fmt(res.futureValue)} 🌱`}
            csv={() => ({
              filename: "compound-interest-growth.csv",
              rows: [["Year", "Balance", "Total deposits", "Interest earned"], ...res.yearly.map((p) => [p.x, p.balance.toFixed(2), p.contributed.toFixed(2), (p.balance - p.contributed).toFixed(2)])],
            })}
          />
        </>
      }
    />
  );
}
