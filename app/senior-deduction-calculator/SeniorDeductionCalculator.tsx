"use client";

import { useMemo } from "react";
import { usd0 } from "@/lib/calc";
import { calcSeniorDeduction, SENIOR_PHASE_OUT_START, type SeniorStatus } from "@/lib/tools/senior-deduction-calculator";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, Segmented, Toggle } from "@/components/calc/Fields";
import { ResultHero, Stat, BreakdownTable, Notice } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

const DEFAULTS = { s: "mfj", g: "170000", y: "1", p: "1" };

const STATUS = [
  { value: "single", label: "Single / HoH" },
  { value: "mfj", label: "Married jointly" },
  { value: "mfs", label: "Married separately" },
];
const ALLOWED = { s: ["single", "mfj", "mfs"], y: ["0", "1"], p: ["0", "1"] };

export default function SeniorDeductionCalculator() {
  const state = useToolState("senior-deduction-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const status = (["single", "mfj", "mfs"].includes(v.s) ? v.s : "single") as SeniorStatus;

  const res = useMemo(
    () => calcSeniorDeduction({ status, magi: n(v.g), you65: v.y === "1", spouse65: v.p === "1" }),
    [v, status]
  );

  const threshold = status === "mfj" ? SENIOR_PHASE_OUT_START.mfj : SENIOR_PHASE_OUT_START.single;

  return (
    <CalcShell
      summary={{ label: "Senior deduction", value: usd0(res.total) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your return</PanelTitle>
          <Segmented label="Filing status" value={status} onChange={(x) => state.set("s", x)} options={STATUS} />
          <NumberField
            label="Modified AGI (MAGI)"
            prefix="$"
            value={v.g}
            onChange={(x) => state.set("g", x)}
            hint="For most people this is AGI (Form 1040, line 11). Include taxable Social Security, IRA and pension income."
          />
          <PanelTitle>Who is 65 or older?</PanelTitle>
          <Toggle
            label="I'm 65 or older by December 31"
            hint="You also need a valid Social Security number."
            checked={v.y === "1"}
            onChange={(x) => state.set("y", x ? "1" : "0")}
          />
          {status === "mfj" && (
            <Toggle
              label="My spouse is 65 or older by December 31"
              hint="Each spouse who qualifies gets their own $6,000."
              checked={v.p === "1"}
              onChange={(x) => state.set("p", x ? "1" : "0")}
            />
          )}
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow="Your enhanced senior deduction"
            sub={
              res.total > 0 ? (
                <>
                  {res.qualifyingPeople === 2 ? "Two people" : "One person"} × {usd0(res.perPerson)}. At a {Math.round(res.marginalRate * 100)}%
                  federal bracket that saves about <strong>{usd0(res.taxSaved)}</strong> in income tax.
                </>
              ) : (
                <>No senior deduction with these answers.</>
              )
            }
          >
            {usd0(res.total)}
          </ResultHero>

          {res.mfsBlocked && <Notice>Married couples must file jointly to claim this deduction. Married filing separately gets $0.</Notice>}
          {!res.mfsBlocked && res.qualifyingPeople === 0 && (
            <Notice tone="info">Nobody on the return is 65 or older, so the deduction doesn&apos;t apply.</Notice>
          )}
          {res.qualifyingPeople > 0 && res.cutPerPerson > 0 && (
            <Notice>
              MAGI over {usd0(threshold)} cuts each person&apos;s $6,000 by 6% of the excess ({usd0(res.cutPerPerson)} each). It reaches $0 at{" "}
              {usd0(res.fullyPhasedOutAt)}.
            </Notice>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Per person" value={usd0(res.mfsBlocked ? 0 : res.perPerson)} />
            <Stat label="People who qualify" value={String(res.qualifyingPeople)} />
            <Stat label="Regular 65+ add-on" value={usd0(res.regularAddOn)} note="2026, on top" />
            <Stat label="Federal tax saved" accent value={usd0(res.taxSaved)} note="Estimate, 2026 brackets" />
          </div>

          <BreakdownTable
            rows={[
              { label: "Base amount per person", value: "$6,000" },
              { label: `6% of MAGI over ${usd0(threshold)}`, value: `− ${usd0(res.cutPerPerson)}` },
              { label: "Per-person deduction (Schedule 1-A, line 35)", value: usd0(res.mfsBlocked ? 0 : res.perPerson) },
              { label: "× people who qualify", value: String(res.qualifyingPeople) },
              { label: "Enhanced deduction for seniors (line 37)", value: usd0(res.total), strong: true },
            ]}
          />

          <ToolActions state={state} shareText={`My senior deduction: ${usd0(res.total)}`} />
        </>
      }
    />
  );
}
