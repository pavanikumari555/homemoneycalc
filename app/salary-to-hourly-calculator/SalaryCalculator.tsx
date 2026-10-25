"use client";

import { useMemo } from "react";
import { calcSalary, usd, usd0 } from "@/lib/calc";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, Segmented } from "@/components/calc/Fields";
import { ResultHero, BreakdownTable, Notice } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";
import Link from "next/link";

const DEFAULTS = { mode: "salary", amt: "65000", h: "40", w: "52", ot: "0" };
const ALLOWED = { mode: ["salary", "hourly"] };

export default function SalaryCalculator() {
  const state = useToolState("salary-to-hourly-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const mode = v.mode === "hourly" ? "hourly" : "salary";

  const res = useMemo(
    () =>
      calcSalary({
        mode,
        amount: n(v.amt),
        hoursPerWeek: n(v.h, 40),
        weeksPerYear: n(v.w, 52),
        overtimeHoursPerWeek: n(v.ot),
      }),
    [v, mode]
  );
  // 0 / empty hours ya weeks -> rate bematlab hoga, isliye number ki jagah message
  const invalid = res.hoursInvalid || res.weeksInvalid;
  const headline = invalid ? "—" : mode === "salary" ? usd(res.hourly) : usd0(res.annual);

  return (
    <CalcShell
      summary={{ label: mode === "salary" ? "Hourly rate" : "Yearly salary", value: headline }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <Segmented
            label="I know my…"
            value={mode}
            onChange={(x) => state.setMany({ mode: x, amt: x === "hourly" ? "25" : "65000" })}
            options={[
              { value: "salary", label: "Yearly salary" },
              { value: "hourly", label: "Hourly wage" },
            ]}
          />
          <NumberField
            label={mode === "salary" ? "Annual salary" : "Hourly wage"}
            prefix="$"
            value={v.amt}
            onChange={(x) => state.set("amt", x)}
            slider={mode === "salary" ? { min: 20000, max: 250000, step: 1000 } : { min: 7, max: 150, step: 0.5 }}
          />
          <PanelTitle>Your schedule</PanelTitle>
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Hours per week"
              value={v.h}
              onChange={(x) => state.set("h", x)}
              hint={res.hoursInvalid ? "Enter 1 to 120 hours." : undefined}
            />
            <NumberField
              label="Paid weeks per year"
              value={v.w}
              onChange={(x) => state.set("w", x)}
              hint={res.weeksInvalid ? "Enter 1 to 52 weeks." : "52 if vacation is paid"}
            />
          </div>
          {mode === "hourly" && (
            <NumberField label="Overtime hours per week" value={v.ot} onChange={(x) => state.set("ot", x)} hint="Paid at 1.5× your hourly rate" />
          )}
        </>
      }
      results={
        <>
          {invalid && (
            <Notice>
              {res.hoursInvalid && <>Hours per week must be between 1 and 120. </>}
              {res.weeksInvalid && <>Paid weeks per year must be between 1 and 52. </>}
              Fix that and your {mode === "salary" ? "hourly rate" : "yearly pay"} will show here.
            </Notice>
          )}
          <ResultHero
            eyebrow={mode === "salary" ? "Your hourly rate" : "Your yearly salary"}
            sub={
              invalid ? (
                <>Waiting for a valid schedule.</>
              ) : mode === "salary" ? (
                <>
                  {usd0(n(v.amt))} a year at {v.h || 0} hours a week works out to <strong>{usd(res.hourly)} an hour</strong> before tax.
                </>
              ) : (
                <>
                  {usd(n(v.amt))} an hour{n(v.ot) > 0 ? ` plus ${v.ot} overtime hours` : ""} adds up to{" "}
                  <strong>{usd0(res.annual)} a year</strong> before tax.
                </>
              )
            }
          >
            {headline}
          </ResultHero>

          {!invalid && (
            <BreakdownTable
              rows={[
                { label: "Hourly", value: usd(res.hourly) },
                { label: "Daily (5-day week)", value: usd(res.daily) },
                { label: "Weekly", value: usd(res.weekly) },
                { label: "Every two weeks (biweekly)", value: usd(res.biweekly) },
                { label: "Twice a month (semimonthly)", value: usd(res.semimonthly) },
                { label: "Monthly", value: usd(res.monthly) },
                { label: "Yearly", value: usd(res.annual), strong: true },
              ]}
            />
          )}

          <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink/80">
            These are gross (pre-tax) figures. See what actually lands in your bank account with the{" "}
            <Link href={`/paycheck-calculator/?g=${Math.round(res.annual)}`} className="link">
              take-home paycheck calculator →
            </Link>
          </p>

          <ToolActions state={state} />
        </>
      }
    />
  );
}
