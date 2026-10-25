"use client";

import { useMemo } from "react";
import { usd0, num } from "@/lib/calc";
import { STATES } from "@/lib/tax2026";
import { calcHsa, HSA_LIMITS, type HsaYear } from "@/lib/tools/hsa-calculator";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, SelectField, Segmented, Toggle } from "@/components/calc/Fields";
import { ResultHero, Stat, BreakdownTable, Notice, CountUp } from "@/components/calc/Results";
import LineChart, { shortMoney } from "@/components/calc/LineChart";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

// Short keys = short share links. Defaults module level pe (stable reference).
const DEFAULTS = {
  yr: "2026",
  cov: "self",
  a55: "0",
  you: "3400",
  emp: "1000",
  pay: "1",
  inc: "75000",
  fs: "single",
  st: "TX",
  bal: "0",
  y: "20",
  r: "6",
};
const ALLOWED = {
  yr: ["2026", "2027"],
  cov: ["self", "family"],
  a55: ["0", "1"],
  pay: ["0", "1"],
  fs: ["single", "married"],
  st: STATES.map((s) => s.code),
};
const STATE_OPTIONS = STATES.map((s) => ({ value: s.code, label: s.name }));

export default function HsaCalculator() {
  const state = useToolState("hsa-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const year = (v.yr === "2027" ? 2027 : 2026) as HsaYear;
  const L = HSA_LIMITS[year];

  const res = useMemo(
    () =>
      calcHsa({
        year,
        coverage: v.cov === "family" ? "family" : "self",
        age55: v.a55 === "1",
        yourContribution: n(v.you),
        employerContribution: n(v.emp),
        viaPayroll: v.pay === "1",
        income: n(v.inc),
        status: v.fs === "married" ? "married" : "single",
        stateCode: v.st,
        startBalance: n(v.bal),
        years: n(v.y, 20),
        returnPercent: n(v.r),
      }),
    [v, year]
  );

  const years = Math.max(0, Math.min(60, Math.round(n(v.y, 20))));
  const maxYours = Math.max(0, res.limit - Math.max(0, n(v.emp)));

  return (
    <CalcShell
      summary={{ label: "Taxes you save this year", value: usd0(res.totalSaved) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your HSA</PanelTitle>
          <Segmented
            label="Tax year"
            value={v.yr}
            onChange={(x) => state.set("yr", x)}
            options={[
              { value: "2026", label: "2026" },
              { value: "2027", label: "2027" },
            ]}
          />
          <Segmented
            label="HDHP coverage"
            value={v.cov}
            onChange={(x) => state.set("cov", x)}
            options={[
              { value: "self", label: `Self-only (${usd0(L.self)})` },
              { value: "family", label: `Family (${usd0(L.family)})` },
            ]}
          />
          <Toggle
            label="I'm 55 or older"
            hint={`Adds a ${usd0(L.catchUp)} catch-up contribution (you must be 55 by Dec 31).`}
            checked={v.a55 === "1"}
            onChange={(x) => state.set("a55", x ? "1" : "0")}
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="You put in (per year)" prefix="$" value={v.you} onChange={(x) => state.set("you", x)} />
            <NumberField label="Employer puts in" prefix="$" value={v.emp} onChange={(x) => state.set("emp", x)} />
          </div>
          <button type="button" className="btn-ghost w-full" onClick={() => state.set("you", String(maxYours))}>
            Max it out ({usd0(maxYours)} from you)
          </button>
          <Toggle
            label="Contribute through payroll"
            hint="Via your employer's cafeteria plan, contributions also skip Social Security and Medicare tax."
            checked={v.pay === "1"}
            onChange={(x) => state.set("pay", x ? "1" : "0")}
          />

          <PanelTitle>Your taxes</PanelTitle>
          <NumberField label="Annual wages" prefix="$" value={v.inc} onChange={(x) => state.set("inc", x)} />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Filing status"
              value={v.fs}
              onChange={(x) => state.set("fs", x)}
              options={[
                { value: "single", label: "Single" },
                { value: "married", label: "Married jointly" },
              ]}
            />
            <SelectField label="State" value={v.st} onChange={(x) => state.set("st", x)} options={STATE_OPTIONS} />
          </div>

          <PanelTitle>Growth (optional)</PanelTitle>
          <NumberField label="Current HSA balance" prefix="$" value={v.bal} onChange={(x) => state.set("bal", x)} />
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Years invested" suffix="yrs" value={v.y} onChange={(x) => state.set("y", x)} slider={{ min: 1, max: 40, step: 1 }} />
            <NumberField label="Assumed return" suffix="%" value={v.r} onChange={(x) => state.set("r", x)} step={0.1} hint="Not guaranteed" />
          </div>
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow={`Taxes you save in ${year}`}
            sub={
              res.countedContribution > 0 ? (
                <>
                  Putting in <strong>{usd0(res.countedContribution)}</strong> really costs you about{" "}
                  <strong>{usd0(res.effectiveCost)}</strong> — the rest is tax you no longer pay.
                </>
              ) : (
                <>Enter what you plan to contribute to see your tax savings.</>
              )
            }
          >
            <CountUp value={res.totalSaved} format={usd0} />
          </ResultHero>

          {res.excess > 0 && (
            <Notice>
              You and your employer are <strong>{usd0(res.excess)}</strong> over the {year} limit of {usd0(res.limit)}. Excess
              contributions face a 6% excise tax each year they stay in the account unless you withdraw them (and their earnings) before
              your tax deadline.
            </Notice>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Stat label={`${year} limit`} value={usd0(res.limit)} note={v.a55 === "1" ? "incl. catch-up" : undefined} />
            <Stat label="Room left" accent value={usd0(res.roomLeft)} />
            <Stat label="Per paycheck" value={usd0(res.perPaycheck26)} note="26 paychecks" />
          </div>

          <BreakdownTable
            rows={[
              { label: "Federal income tax saved", value: usd0(res.federalSaved) },
              {
                label: res.ficaSaved > 0 ? "Social Security + Medicare saved" : "Social Security + Medicare (direct deposits don't save these)",
                value: usd0(res.ficaSaved),
              },
              {
                label: res.stateDeductible ? "State income tax saved" : `State tax saved (${v.st} taxes HSA contributions)`,
                value: usd0(res.stateSaved),
              },
              { label: "Total tax saved", value: usd0(res.totalSaved), strong: true },
            ]}
          />

          {!res.stateDeductible && (
            <Notice tone="info">
              {v.st === "CA" ? "California" : "New Jersey"} doesn&apos;t follow the federal HSA rules, so your contributions (and the
              account&apos;s earnings) are still taxed by the state.
            </Notice>
          )}

          {years > 0 && (res.futureValue > 0 || n(v.bal) > 0) && (
            <div className="rounded-2xl border border-line p-4">
              <div className="mb-1 text-sm font-semibold text-ink">
                In {num(years, 0)} years your HSA could hold {usd0(res.futureValue)}
              </div>
              <p className="mb-3 text-xs text-muted">
                {usd0(Math.min(res.totalContribution, res.limit))}/yr deposited monthly at {num(n(v.r), 1)}% a year, limit held flat, no
                withdrawals. Growth: {usd0(res.growth)}.
              </p>
              <LineChart
                ariaLabel="Projected HSA balance versus total deposits over time"
                formatX={(x) => `Yr ${Math.round(x)}`}
                formatY={(y) => shortMoney(y)}
                series={[
                  { name: "HSA balance", color: "#2a6a44", area: true, points: res.yearly.map((p) => ({ x: p.x, y: p.balance })) },
                  { name: "Deposits", color: "#f7b733", points: res.yearly.map((p) => ({ x: p.x, y: p.contributed })) },
                ]}
              />
            </div>
          )}

          <p className="text-xs text-muted">
            Only for people covered by an HSA-eligible high-deductible health plan ({year}: deductible at least {usd0(L.minDeductible.self)}{" "}
            self-only / {usd0(L.minDeductible.family)} family) with no other disqualifying coverage. Estimate based on 2026 tax brackets and
            the standard deduction.
          </p>

          <ToolActions
            state={state}
            shareText={`My HSA saves me about ${usd0(res.totalSaved)} in taxes this year`}
            csv={() => ({
              filename: "hsa-growth.csv",
              rows: [["Year", "Balance", "Total deposits"], ...res.yearly.map((p) => [p.x, p.balance.toFixed(2), p.contributed.toFixed(2)])],
            })}
          />
        </>
      }
    />
  );
}
