"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usd, usd0 } from "@/lib/calc";
import { calcOvertimeDeduction, type DeductionStatus, type OvertimeMode } from "@/lib/tools/no-tax-on-overtime-calculator";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, Segmented, SelectField } from "@/components/calc/Fields";
import { ResultHero, BreakdownTable, Notice, Stat } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

// m = mode, r = hourly rate, h = OT hours/week, w = weeks, x = multiplier,
// t = total OT pay, p = premium (code TT), i = MAGI, f = filing status
const DEFAULTS = { m: "hours", r: "25", h: "5", w: "50", x: "1.5", t: "15000", p: "5000", i: "70000", f: "single", y: "2026" };
const ALLOWED = { m: ["hours", "total", "premium"], x: ["1.5", "2"], f: ["single", "hoh", "mfj", "mfs"], y: ["2025", "2026"] };

export default function OvertimeDeductionCalculator() {
  const state = useToolState("no-tax-on-overtime-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const mode = (ALLOWED.m.includes(v.m) ? v.m : "hours") as OvertimeMode;
  const status = (ALLOWED.f.includes(v.f) ? v.f : "single") as DeductionStatus;
  const multiplier = v.x === "2" ? 2 : 1.5;
  const taxYear = v.y === "2025" ? 2025 : 2026;

  const res = useMemo(
    () =>
      calcOvertimeDeduction({
        mode,
        hourlyRate: n(v.r),
        overtimeHoursPerWeek: n(v.h),
        weeks: n(v.w),
        multiplier,
        totalOvertimePay: n(v.t),
        premium: n(v.p),
        magi: n(v.i),
        status,
        taxYear,
      }),
    [v, mode, status, multiplier, taxYear]
  );

  return (
    <CalcShell
      summary={{ label: "Federal tax saved", value: usd0(res.taxSaved) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your overtime</PanelTitle>
          <SelectField label="Tax year" value={v.y} onChange={(x) => state.set("y", x)} options={[{value:"2026",label:"2026"},{value:"2025",label:"2025"}]} />
          <SelectField
            label="What do you know?"
            value={mode}
            onChange={(x) => state.set("m", x)}
            options={[
              { value: "hours", label: "My hourly rate and overtime hours" },
              { value: "total", label: "My total overtime pay (pay stubs)" },
              { value: "premium", label: taxYear === 2026 ? "The premium amount (W-2 box 12, code TT)" : "My qualified premium amount (2025 records)" },
            ]}
          />
          {mode === "hours" && (
            <>
              <NumberField label="Regular hourly rate" prefix="$" suffix="/hr" min={0} value={v.r} onChange={(x) => state.set("r", x)} />
              <NumberField
                label="Overtime hours per week"
                suffix="hrs"
                min={0}
                max={128}
                value={v.h}
                onChange={(x) => state.set("h", x)}
                slider={{ min: 0, max: 30, step: 1 }}
                hint="Only hours over 40 in a workweek count under federal law (FLSA)."
              />
              <NumberField label="Weeks a year with overtime" suffix="wks" min={0} max={52} value={v.w} onChange={(x) => state.set("w", x)} />
            </>
          )}
          {mode === "total" && (
            <NumberField
              label="Total overtime pay for the year"
              prefix="$"
              value={v.t}
              onChange={(x) => state.set("t", x)}
              hint="All overtime dollars, including the straight-time part."
            />
          )}
          {mode !== "premium" && (
            <Segmented
              label="Overtime paid at"
              value={v.x === "2" ? "2" : "1.5"}
              onChange={(x) => state.set("x", x)}
              options={[
                { value: "1.5", label: "Time and a half" },
                { value: "2", label: "Double time" },
              ]}
            />
          )}
          {mode === "premium" && (
            <NumberField
              label="Qualified overtime (premium portion)"
              prefix="$"
              value={v.p}
              onChange={(x) => state.set("p", x)}
              hint={taxYear === 2026 ? "Use the employer-reported amount. Missing or understated code TT needs a corrected Form W-2c." : "Use qualified premium from your 2025 records under IRS Notice 2025-69. Code TT was not required for 2025."}
            />
          )}

          <PanelTitle>Your return</PanelTitle>
          <SelectField
            label="Filing status"
            value={status}
            onChange={(x) => state.set("f", x)}
            options={[
              { value: "single", label: "Single" },
              { value: "hoh", label: "Head of household" },
              { value: "mfj", label: "Married, jointly" },
              { value: "mfs", label: "Married, separately" },
            ]}
          />
          <NumberField
            label="Modified adjusted gross income (MAGI)"
            prefix="$"
            value={v.i}
            onChange={(x) => state.set("i", x)}
            slider={{ min: 0, max: 400000, step: 1000 }}
            hint="For most people this is the AGI on Form 1040 line 11 — including your overtime."
          />
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow="Estimated federal income tax saved"
            sub={
              res.eligible ? (
                <>
                  A <strong>{usd0(res.deduction)}</strong> deduction using {taxYear} brackets (top rate {Math.round(res.marginalRate * 100)}%). Social Security and
                  Medicare are still taken out of your overtime.
                </>
              ) : (
                <>Married couples must file a joint return to claim this deduction.</>
              )
            }
          >
            {usd0(res.taxSaved)}
          </ResultHero>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Your deduction" value={usd0(res.deduction)} note="Schedule 1-A, Part III" accent />
            <Stat
              label="Gone completely at"
              value={res.capped > 0 ? `${usd0(res.fullyPhasedOutAt)} MAGI` : "—"}
              note={status === "mfj" ? "Phase-out starts at $300,000" : "Phase-out starts at $150,000"}
            />
          </div>

          <BreakdownTable
            rows={[
              ...(mode !== "premium" ? [{ label: "Total overtime pay", value: usd(res.totalOvertimePay) }] : []),
              { label: "Qualified overtime (the “half”)", value: usd(res.qualifiedOvertime) },
              { label: `Capped at ${usd0(res.cap)}`, value: usd(res.capped) },
              { label: "Income phase-out", value: res.reduction > 0 ? `−${usd(res.reduction)}` : usd(0) },
              { label: "Overtime deduction", value: usd(res.deduction), strong: true },
              { label: "Federal income tax saved", value: usd(res.taxSaved), strong: true },
            ]}
          />

          <Notice tone="info">This assumes FLSA-required overtime and a valid Social Security number. {taxYear === 2026 ? "Hours and pay-stub modes are planning estimates. For a 2026 claim, use employer-reported qualified overtime; request Form W-2c if code TT is missing or wrong. Pay stubs alone do not replace that reporting." : "For 2025, IRS Notice 2025-69 permits reasonable methods using pay records when qualified overtime was not separately reported."}</Notice>

          {status === "mfs" && <Notice>Married filing separately can&apos;t claim the overtime deduction. Switch to “Married, jointly” to compare.</Notice>}
          {res.eligible && res.reduction > 0 && (
            <Notice>
              Your income is over the phase-out start, so the deduction shrinks by $100 for every full $1,000 of MAGI above it.
            </Notice>
          )}
          {res.eligible && res.qualifiedOvertime > res.cap && (
            <Notice tone="info">Only {usd0(res.cap)} of qualified overtime can be deducted per return each year.</Notice>
          )}
          <p className="text-xs text-muted">
            Tax savings use {taxYear} ordinary-income brackets and the basic standard deduction. Itemizing, age/blindness additions, dependents, credits and other deductions are not modeled. The deduction law covers 2025–2028; 2027–2028 tax savings are not estimated here. Payroll taxes still apply, but the amount depends on wages, wage caps and other income. State income tax may still apply. Want
            your gross overtime pay first? Try the <Link href="/overtime-calculator/" className="link">overtime calculator</Link>.
          </p>

          <ToolActions state={state} shareText={`My no-tax-on-overtime deduction: ${usd0(res.deduction)} (saves about ${usd0(res.taxSaved)})`} />
        </>
      }
    />
  );
}
