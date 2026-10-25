"use client";

import { useMemo } from "react";
import { usd, usd0 } from "@/lib/calc";
import { STATES } from "@/lib/tax2026";
import { calcBonusTax } from "@/lib/tools/bonus-tax-calculator";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, SelectField, Segmented } from "@/components/calc/Fields";
import { ResultHero, BreakdownTable, SplitBar, Notice, CountUp } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

const DEFAULTS = {
  b: "5000",
  s: "75000",
  pp: "26",
  fs: "single",
  st: "TX",
  m: "flat",
  ytd: "0",
  ys: "0",
};
const ALLOWED = {
  pp: ["52", "26", "24", "12"],
  fs: ["single", "married"],
  st: STATES.map((s) => s.code),
  m: ["flat", "aggregate"],
};
const STATE_OPTIONS = STATES.map((s) => ({ value: s.code, label: s.name }));
const PERIODS = [
  { value: "52", label: "Weekly" },
  { value: "26", label: "Every 2 weeks" },
  { value: "24", label: "Twice a month" },
  { value: "12", label: "Monthly" },
];
const pct = (x: number) => `${Number((x * 100).toFixed(2))}%`; // 0.22 -> "22%", 0.1023 -> "10.23%"

export default function BonusCalculator() {
  const state = useToolState("bonus-tax-calculator", DEFAULTS, ALLOWED);
  const v = state.values;

  const res = useMemo(
    () =>
      calcBonusTax({
        bonus: n(v.b),
        salary: n(v.s),
        payPeriodsPerYear: n(v.pp, 26),
        status: v.fs === "married" ? "married" : "single",
        stateCode: v.st,
        method: v.m === "aggregate" ? "aggregate" : "flat",
        ytdWages: n(v.ytd),
        ytdSupplemental: n(v.ys),
      }),
    [v]
  );

  const stateLabel =
    res.stateMode === "supplemental"
      ? `${v.st} supplemental rate (${pct(res.stateRate)})`
      : res.stateMode === "estimate"
        ? `${v.st} income tax (estimate)`
        : `${v.st} state tax`;

  return (
    <CalcShell
      summary={{ label: "Bonus after taxes", value: usd(res.net) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your bonus</PanelTitle>
          <NumberField label="Bonus amount (gross)" prefix="$" value={v.b} onChange={(x) => state.set("b", x)} slider={{ min: 0, max: 50000, step: 500 }} />
          <Segmented
            label="Federal withholding method"
            value={v.m}
            onChange={(x) => state.set("m", x)}
            options={[
              { value: "flat", label: "Flat 22%" },
              { value: "aggregate", label: "Aggregate" },
            ]}
          />
          <p className="-mt-3 text-xs text-muted">
            Flat: bonus paid separately. Aggregate: bonus added to a regular paycheck. Ask payroll which they use.
          </p>
          <SelectField label="State" value={v.st} onChange={(x) => state.set("st", x)} options={STATE_OPTIONS} />

          <PanelTitle>Your regular pay</PanelTitle>
          <NumberField label="Annual salary" prefix="$" value={v.s} onChange={(x) => state.set("s", x)} />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Paid" value={v.pp} onChange={(x) => state.set("pp", x)} options={PERIODS} />
            <SelectField
              label="W-4 filing status"
              value={v.fs}
              onChange={(x) => state.set("fs", x)}
              options={[
                { value: "single", label: "Single" },
                { value: "married", label: "Married jointly" },
              ]}
            />
          </div>
          <NumberField
            label="Wages already paid this year"
            prefix="$"
            value={v.ytd}
            onChange={(x) => state.set("ytd", x)}
            hint="Before this bonus. Used for the $184,500 Social Security cap and the 0.9% Medicare surtax over $200,000."
          />
          <NumberField
            label="Other bonuses already paid this year"
            prefix="$"
            value={v.ys}
            onChange={(x) => state.set("ys", x)}
            hint="Only matters near $1 million: bonus pay above that is withheld at 37%."
          />
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow="Your bonus after withholding"
            sub={
              n(v.b) > 0 ? (
                <>
                  About <strong>{pct(res.effectiveRate)}</strong> of your {usd0(res.bonus)} bonus is withheld. That&apos;s withholding, not
                  your final tax — the real bill is settled on your tax return.
                </>
              ) : (
                <>Enter a bonus amount to see what lands in your account.</>
              )
            }
          >
            <CountUp value={res.net} format={usd} />
          </ResultHero>

          <BreakdownTable
            rows={[
              { label: "Gross bonus", value: usd(res.bonus) },
              {
                label: v.m === "aggregate" ? "Federal income tax (aggregate method)" : "Federal income tax (22% flat)",
                value: `−${usd(res.federalFlatPart)}`,
                color: "#2a6a44",
              },
              ...(res.federalMandatoryPart > 0
                ? [{ label: "Federal 37% on bonus pay over $1M", value: `−${usd(res.federalMandatoryPart)}`, color: "#1d4a30" }]
                : []),
              { label: "Social Security (6.2%)", value: `−${usd(res.socialSecurity)}`, color: "#f7b733" },
              { label: "Medicare (1.45% + 0.9% over $200k)", value: `−${usd(res.medicare)}`, color: "#e08a00" },
              { label: stateLabel, value: `−${usd(res.state)}`, color: "#8bc09e" },
              ...(res.statePayroll > 0
                ? [{ label: res.statePayrollNames.join(" + "), value: `−${usd(res.statePayroll)}`, color: "#b7d8c3" }]
                : []),
              { label: "Take-home bonus", value: usd(res.net), strong: true },
            ]}
          />

          {res.bonus > 0 && (
            <div className="rounded-2xl border border-line p-4">
              <SplitBar
                parts={[
                  { label: "You keep", value: res.net, color: "#2a6a44" },
                  { label: "Federal", value: res.federal, color: "#1d4a30" },
                  { label: "FICA", value: res.socialSecurity + res.medicare, color: "#f7b733" },
                  { label: "State", value: res.state + res.statePayroll, color: "#8bc09e" },
                ]}
              />
            </div>
          )}

          {res.bonus > 0 && (
            <Notice tone="info">
              <strong>Withholding vs. real tax:</strong> added to your {usd0(n(v.s))} salary, this bonus raises your 2026 federal income tax by
              about <strong>{usd0(res.federalTaxOnBonus)}</strong> (your top bracket is {pct(res.marginalFederal)}).{" "}
              {Math.abs(res.federalDifference) < 1
                ? "Withholding matches that closely."
                : res.federalDifference > 0
                  ? `About ${usd0(res.federalDifference)} more than that is being withheld — likely back as a refund.`
                  : `About ${usd0(-res.federalDifference)} less is withheld than you'll owe — expect a smaller refund or a balance due.`}{" "}
              Flat method: {usd0(res.flatVsAggregate.flat)} · aggregate method: {usd0(res.flatVsAggregate.aggregate)}.
            </Notice>
          )}

          {res.stateMode !== "none" && (
            <p className="text-xs text-muted">
              {res.stateNote}{" "}
              <a href={res.stateSource} target="_blank" rel="noopener noreferrer" className="link">
                Source
              </a>
            </p>
          )}

          <ToolActions state={state} shareText={`My ${usd0(res.bonus)} bonus nets ${usd0(res.net)} after withholding`} />
        </>
      }
    />
  );
}
