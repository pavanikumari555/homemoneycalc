"use client";

import { useMemo } from "react";
import { usd, usd0 } from "@/lib/calc";
import { calcTipsDeduction } from "@/lib/tools/no-tax-on-tips-calculator";
import type { DeductionStatus } from "@/lib/tools/no-tax-on-overtime-calculator";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, Segmented, Toggle } from "@/components/calc/Fields";
import { ResultHero, BreakdownTable, Notice, Stat } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

// t = tips, o = listed occupation, s = self-employed, p = net profit, i = MAGI, f = filing status
const DEFAULTS = { t: "18000", o: "1", s: "0", p: "20000", i: "48000", f: "single" };
const ALLOWED = { o: ["0", "1"], s: ["0", "1"], f: ["single", "mfj", "mfs"] };

export default function TipsDeductionCalculator() {
  const state = useToolState("no-tax-on-tips-calculator", DEFAULTS, ALLOWED);
  const v = state.values;
  const status = (ALLOWED.f.includes(v.f) ? v.f : "single") as DeductionStatus;
  const selfEmployed = v.s === "1";

  const res = useMemo(
    () =>
      calcTipsDeduction({
        tips: n(v.t),
        listedOccupation: v.o !== "0",
        selfEmployed,
        netProfit: n(v.p),
        magi: n(v.i),
        status,
      }),
    [v, status, selfEmployed]
  );

  return (
    <CalcShell
      summary={{ label: "Federal tax saved", value: usd0(res.taxSaved) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your tips</PanelTitle>
          <NumberField
            label="Tips received this year"
            prefix="$"
            value={v.t}
            onChange={(x) => state.set("t", x)}
            slider={{ min: 0, max: 60000, step: 500 }}
            hint="Cash and card tips reported on your W-2 (box 7, or box 12 code TP from 2026), 1099s or Form 4137. Not mandatory service charges."
          />
          <Toggle
            label="My job is on the IRS tipped-occupations list"
            hint="e.g. servers, bartenders, hair stylists, delivery drivers — see IRS.gov/TippedOccupations"
            checked={v.o !== "0"}
            onChange={(x) => state.set("o", x ? "1" : "0")}
          />
          <Toggle
            label="I'm self-employed (1099 / gig work)"
            hint="Your deduction can't be more than the net profit of that business"
            checked={selfEmployed}
            onChange={(x) => state.set("s", x ? "1" : "0")}
          />
          {selfEmployed && (
            <NumberField label="Net profit from that business" prefix="$" value={v.p} onChange={(x) => state.set("p", x)} hint="Schedule C profit, before this deduction" />
          )}

          <PanelTitle>Your return</PanelTitle>
          <Segmented
            label="Filing status"
            value={status}
            onChange={(x) => state.set("f", x)}
            options={[
              { value: "single", label: "Single / HoH" },
              { value: "mfj", label: "Married, jointly" },
              { value: "mfs", label: "Married, separately" },
            ]}
          />
          <NumberField
            label="Modified adjusted gross income (MAGI)"
            prefix="$"
            value={v.i}
            onChange={(x) => state.set("i", x)}
            slider={{ min: 0, max: 450000, step: 1000 }}
            hint="For most people this is the AGI on Form 1040 line 11 — including your tips."
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
                  A <strong>{usd0(res.deduction)}</strong> deduction at your {Math.round(res.marginalRate * 100)}% bracket. Social Security and
                  Medicare still apply to your tips.
                </>
              ) : res.reason === "mfs" ? (
                <>Married couples must file a joint return to claim this deduction.</>
              ) : (
                <>Only tips earned in an occupation on the IRS list qualify.</>
              )
            }
          >
            {usd0(res.taxSaved)}
          </ResultHero>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Your deduction" value={usd0(res.deduction)} note="Schedule 1-A, Part II" accent />
            <Stat
              label="Gone completely at"
              value={res.capped > 0 ? `${usd0(res.fullyPhasedOutAt)} MAGI` : "—"}
              note={status === "mfj" ? "Phase-out starts at $300,000" : "Phase-out starts at $150,000"}
            />
          </div>

          <BreakdownTable
            rows={[
              { label: "Tips entered", value: usd(Math.max(0, n(v.t))) },
              ...(selfEmployed ? [{ label: "Limited to net profit", value: usd(res.qualifiedTips) }] : []),
              { label: "Capped at $25,000", value: usd(res.capped) },
              { label: "Income phase-out", value: res.reduction > 0 ? `−${usd(res.reduction)}` : usd(0) },
              { label: "Tips deduction", value: usd(res.deduction), strong: true },
              { label: "Federal income tax saved", value: usd(res.taxSaved), strong: true },
              ...(!selfEmployed ? [{ label: "Social Security + Medicare still due (about)", value: usd(res.ficaOnTips) }] : []),
            ]}
          />

          {res.reason === "mfs" && <Notice>Married filing separately can&apos;t claim the tips deduction. Switch to “Married, jointly” to compare.</Notice>}
          {res.reason === "occupation" && (
            <Notice>Tips from jobs that aren&apos;t on the Treasury list of customarily tipped occupations don&apos;t qualify.</Notice>
          )}
          {res.eligible && res.limitedByProfit && (
            <Notice tone="info">Your deduction is limited to the {usd0(res.qualifiedTips)} net profit of the business where you earned the tips.</Notice>
          )}
          {res.eligible && res.reduction > 0 && (
            <Notice>Your income is over the phase-out start, so the deduction shrinks by $100 for every full $1,000 of MAGI above it.</Notice>
          )}
          <p className="text-xs text-muted">
            Estimate for tax years 2025–2028 using 2026 federal brackets and the standard deduction. State income tax may still apply.
          </p>

          <ToolActions state={state} shareText={`My no-tax-on-tips deduction: ${usd0(res.deduction)} (saves about ${usd0(res.taxSaved)})`} />
        </>
      }
    />
  );
}
