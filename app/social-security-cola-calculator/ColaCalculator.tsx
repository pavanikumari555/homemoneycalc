"use client";

import { useMemo } from "react";
import { usd, usd0 } from "@/lib/calc";
import { calcCola, COLA_2027_PERCENT, PART_B_2026 } from "@/lib/tools/social-security-cola-calculator";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, Toggle } from "@/components/calc/Fields";
import { ResultHero, Stat, BreakdownTable, Notice } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

const DEFAULTS = { b: "2000", c: String(COLA_2027_PERCENT), p0: String(PART_B_2026), p1: String(PART_B_2026), h: "1" };
const ALLOWED = { h: ["0", "1"] };

export default function ColaCalculator() {
  const state = useToolState("social-security-cola-calculator", DEFAULTS, ALLOWED);
  const v = state.values;

  const res = useMemo(
    () =>
      calcCola({
        benefit: n(v.b),
        colaPercent: n(v.c, COLA_2027_PERCENT),
        partBNow: n(v.p0),
        partBNext: n(v.p1),
        holdHarmless: v.h === "1",
      }),
    [v]
  );

  const cola = n(v.c, COLA_2027_PERCENT);

  return (
    <CalcShell
      summary={{ label: "New 2027 benefit", value: usd(res.newBenefit) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your benefit now</PanelTitle>
          <NumberField
            label="Monthly benefit before deductions"
            prefix="$"
            value={v.b}
            onChange={(x) => state.set("b", x)}
            hint="Your 2026 amount before Medicare or tax withholding is taken out (shown on your COLA notice or my Social Security)."
          />
          <NumberField
            label="2027 COLA"
            suffix="%"
            value={v.c}
            onChange={(x) => state.set("c", x)}
            step={0.1}
            hint={`SSA's official 2027 COLA is ${COLA_2027_PERCENT}%. Change it to test other years.`}
          />
          <PanelTitle>Medicare Part B</PanelTitle>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="2026 premium taken out" prefix="$" value={v.p0} onChange={(x) => state.set("p0", x)} step={0.1} />
            <NumberField label="2027 premium" prefix="$" value={v.p1} onChange={(x) => state.set("p1", x)} step={0.1} />
          </div>
          <p className="-mt-2 text-xs text-muted">
            Enter 0 if Part B isn&apos;t deducted from your check. CMS hadn&apos;t announced the 2027 premium when this page was written — the
            default is the 2026 standard premium of ${PART_B_2026.toFixed(2)}. Update it once CMS publishes the 2027 figure.
          </p>
          <Toggle
            label="Part B came out of my Social Security check in both years"
            hint="Turns on the hold-harmless rule: your Part B increase can't be bigger than your COLA raise."
            checked={v.h === "1"}
            onChange={(x) => state.set("h", x ? "1" : "0")}
          />
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow="Your 2027 monthly benefit"
            sub={
              <>
                A {cola}% COLA adds <strong>{usd(res.raiseMonthly)}</strong> a month ({usd0(res.raiseYearly)} a year). Your deposit goes from{" "}
                {usd0(res.netNow)} to <strong>{usd0(res.netNext)}</strong>.
              </>
            }
          >
            {usd(res.newBenefit)}
          </ResultHero>

          {res.holdHarmlessApplied && (
            <Notice tone="info">
              Hold harmless applies: your Part B premium rises only {usd(res.partBCharged - n(v.p0))}, so your deposit doesn&apos;t go down.
            </Notice>
          )}
          {!res.holdHarmlessApplied && res.partBEatsPercent > 0 && (
            <Notice>
              The higher Part B premium takes about {Math.round(res.partBEatsPercent)}% of your raise.
            </Notice>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Raise per month" value={usd(res.raiseMonthly)} />
            <Stat label="Raise per year" value={usd0(res.raiseYearly)} />
            <Stat label="Deposit change" value={`${res.netChangeMonthly >= 0 ? "+" : "−"}${usd0(Math.abs(res.netChangeMonthly))}`} note="Per month, after Part B" />
            <Stat label="Real raise to you" accent value={`${res.effectiveRaisePercent.toFixed(1)}%`} note="Change in your deposit" />
          </div>

          <BreakdownTable
            rows={[
              { label: "2026 benefit before deductions", value: usd(n(v.b)) },
              { label: `+ ${cola}% COLA (rounded down to the dime)`, value: usd(res.raiseMonthly) },
              { label: "2027 benefit before deductions", value: usd(res.newBenefit), strong: true },
              { label: "− 2027 Part B premium", value: usd(res.partBCharged) },
              { label: "2027 deposit (rounded down to the dollar)", value: usd0(res.netNext), strong: true },
            ]}
          />

          <p className="text-xs text-muted">
            SSA applies the COLA to your primary insurance amount, then any early- or delayed-claiming adjustment, so your official
            figure can differ from this estimate by a dollar or two. Tax withholding and Part D premiums are not included.
          </p>

          <ToolActions state={state} shareText={`My 2027 Social Security COLA raise: ${usd(res.raiseMonthly)}/mo`} />
        </>
      }
    />
  );
}
