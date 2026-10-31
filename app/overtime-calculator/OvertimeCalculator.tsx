"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usd, usd0, num } from "@/lib/calc";
import { calcOvertime } from "@/lib/tools/overtime-calculator";
import { STATES } from "@/lib/tax2026";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, Segmented, SelectField } from "@/components/calc/Fields";
import { ResultHero, BreakdownTable, Stat } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

// r = hourly rate, h = hours/week, x = multiplier, w = weeks/year, f = filing status, st = state
const DEFAULTS = { r: "22", h: "48", x: "1.5", w: "52", f: "single", st: "TX" };
const ALLOWED = { x: ["1.5", "2"], f: ["single", "married"], st: STATES.map((s) => s.code) };

export default function OvertimeCalculator() {
  const state = useToolState("overtime-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const multiplier = v.x === "2" ? 2 : 1.5;
  const status = v.f === "married" ? "married" : "single";

  const res = useMemo(
    () => calcOvertime({ hourlyRate: n(v.r), hoursPerWeek: n(v.h), multiplier, weeks: n(v.w, 52), status, stateCode: v.st }),
    [v, multiplier, status]
  );
  const stateName = STATES.find((s) => s.code === v.st)?.name ?? "your state";

  return (
    <CalcShell
      summary={{ label: "Overtime pay per week", value: usd(res.overtimePay) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your week</PanelTitle>
          <NumberField label="Regular hourly rate" prefix="$" suffix="/hr" value={v.r} onChange={(x) => state.set("r", x)} slider={{ min: 7.25, max: 100, step: 0.25 }} />
          <NumberField
            label="Total hours worked in the week"
            suffix="hrs"
            value={v.h}
            onChange={(x) => state.set("h", x)}
            slider={{ min: 0, max: 80, step: 1 }}
            hint="Hours over 40 in one workweek are overtime under federal law."
          />
          <Segmented
            label="Overtime rate"
            value={v.x === "2" ? "2" : "1.5"}
            onChange={(x) => state.set("x", x)}
            options={[
              { value: "1.5", label: "Time and a half (1.5×)" },
              { value: "2", label: "Double time (2×)" },
            ]}
          />
          <NumberField label="Weeks a year you work this schedule" suffix="wks" value={v.w} onChange={(x) => state.set("w", x)} />

          <PanelTitle>Rough after-tax view</PanelTitle>
          <Segmented
            label="Filing status"
            value={status}
            onChange={(x) => state.set("f", x)}
            options={[
              { value: "single", label: "Single" },
              { value: "married", label: "Married, jointly" },
            ]}
          />
          <SelectField
            label="State you work in"
            value={v.st}
            onChange={(x) => state.set("st", x)}
            options={STATES.map((s) => ({ value: s.code, label: s.name }))}
          />
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow="Overtime pay per week"
            sub={
              res.overtimeHours > 0 ? (
                <>
                  {num(res.overtimeHours)} overtime hours at <strong>{usd(res.overtimeRate)}</strong>/hr. Your total for the week is{" "}
                  <strong>{usd(res.weeklyGross)}</strong> before tax.
                </>
              ) : (
                <>No overtime yet — federal overtime starts after 40 hours in a workweek.</>
              )
            }
          >
            {usd(res.overtimePay)}
          </ResultHero>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Overtime per year" value={usd0(res.annualOvertime)} note={`${num(Math.min(Math.max(n(v.w, 52), 0), 52))} weeks`} accent />
            <Stat
              label="Overtime you keep (est.)"
              value={`${usd0(res.overtimeTakeHomeWeekly)}/wk`}
              note={res.annualOvertime > 0 ? `About ${Math.round(res.overtimeKeptPercent)}% after tax in ${stateName}` : "After federal, FICA and state tax"}
            />
          </div>

          <BreakdownTable
            rows={[
              { label: `Regular pay (${num(res.regularHours)} hrs × ${usd(n(v.r))})`, value: usd(res.regularPay) },
              { label: `Overtime pay (${num(res.overtimeHours)} hrs × ${usd(res.overtimeRate)})`, value: usd(res.overtimePay) },
              { label: "Gross pay per week", value: usd(res.weeklyGross), strong: true },
              { label: "Gross pay per year", value: usd0(res.annualGross) },
              { label: "Overtime premium per year (the “half”)", value: usd0(res.annualPremium) },
            ]}
          />

          <p className="text-sm text-ink/80">
            The {usd0(res.annualPremium)} premium is the part that may be deductible under the federal no-tax-on-overtime rule (tax years
            2025–2028).
          </p>
          <p className="text-xs text-muted">
            After-tax figures use 2026 federal brackets, the standard deduction, Social Security, Medicare and {stateName} tax, with no
            401(k) or other deductions. They don&apos;t include the overtime deduction, which you claim on your tax return.
          </p>

          <ToolActions state={state} shareText={`My overtime: ${usd(res.overtimePay)} a week, ${usd0(res.annualOvertime)} a year`} />
        </>
      }
    />
  );
}
