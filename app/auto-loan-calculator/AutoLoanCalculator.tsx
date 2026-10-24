"use client";

import { useMemo } from "react";
import { calcAutoLoan, usd, usd0 } from "@/lib/calc";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, SelectField, Toggle } from "@/components/calc/Fields";
import { ResultHero, Stat, SplitBar, Notice } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";

const DEFAULTS = { p: "35000", d: "3000", t: "8000", o: "2000", tax: "6.5", f: "600", r: "7.2", m: "60", c: "1" };

const TERMS = [24, 36, 48, 60, 72, 84].map((t) => ({ value: String(t), label: `${t} months (${t / 12} yrs)` }));
const ALLOWED = { m: TERMS.map((t) => t.value), c: ["0", "1"] };

export default function AutoLoanCalculator() {
  const state = useToolState("auto-loan-calculator", DEFAULTS, ALLOWED);
  const v = state.values;

  const res = useMemo(
    () =>
      calcAutoLoan({
        vehiclePrice: n(v.p),
        downPayment: n(v.d),
        tradeInValue: n(v.t),
        amountOwedOnTrade: n(v.o),
        salesTaxPercent: n(v.tax),
        fees: n(v.f),
        annualRatePercent: n(v.r),
        termMonths: n(v.m, 60),
        taxCreditOnTradeIn: v.c === "1",
      }),
    [v]
  );

  const term = n(v.m, 60);
  const cheapest = res.byTerm[0];

  return (
    <CalcShell
      summary={{ label: "Monthly payment", value: usd(res.monthlyPayment) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>The car</PanelTitle>
          <NumberField label="Vehicle price" prefix="$" value={v.p} onChange={(x) => state.set("p", x)} />
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Down payment" prefix="$" value={v.d} onChange={(x) => state.set("d", x)} />
            <NumberField label="Dealer & title fees" prefix="$" value={v.f} onChange={(x) => state.set("f", x)} />
          </div>
          <PanelTitle>Your trade-in</PanelTitle>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Trade-in value" prefix="$" value={v.t} onChange={(x) => state.set("t", x)} />
            <NumberField label="Still owed on it" prefix="$" value={v.o} onChange={(x) => state.set("o", x)} />
          </div>
          <PanelTitle>The loan</PanelTitle>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Interest rate (APR)" suffix="%" value={v.r} onChange={(x) => state.set("r", x)} step={0.1} />
            <NumberField label="Sales tax" suffix="%" value={v.tax} onChange={(x) => state.set("tax", x)} step={0.25} />
          </div>
          <SelectField label="Loan length" value={v.m} onChange={(x) => state.set("m", x)} options={TERMS} />
          <Toggle
            label="My state taxes price minus trade-in"
            hint="Most states do. A few, such as California, tax the full price — check your state's DMV."
            checked={v.c === "1"}
            onChange={(x) => state.set("c", x ? "1" : "0")}
          />
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow="Your monthly payment"
            sub={
              <>
                For {term} months on {usd0(res.loanAmount)} borrowed. You&apos;ll pay <strong>{usd0(res.totalInterest)}</strong> in
                interest.
              </>
            }
          >
            {usd(res.monthlyPayment)}
          </ResultHero>

          {res.netTradeIn < 0 && (
            <Notice>
              You owe {usd0(-res.netTradeIn)} more on your trade-in than it&apos;s worth. That negative equity is added to your new loan.
            </Notice>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Amount financed" value={usd0(res.loanAmount)} />
            <Stat label="Sales tax" value={usd0(res.salesTax)} note={v.c === "1" && n(v.t) > 0 ? `Saved ${usd0(Math.min(n(v.t), n(v.p)) * n(v.tax) / 100)} with trade-in` : undefined} />
            <Stat label="Net trade-in" value={usd0(res.netTradeIn)} />
            <Stat label="Total cost" accent value={usd0(res.totalCostOfVehicle)} note="Down + trade + all payments" />
          </div>

          <div className="rounded-2xl border border-line p-4">
            <div className="mb-3 text-sm font-semibold text-ink">Where the money goes</div>
            <SplitBar
              parts={[
                { label: "Car price", value: n(v.p), color: "#2a6a44" },
                { label: "Interest", value: res.totalInterest, color: "#f7b733" },
                { label: "Sales tax", value: res.salesTax, color: "#8bc09e" },
                { label: "Fees", value: n(v.f), color: "#97a89e" },
              ]}
            />
          </div>

          <div className="rounded-2xl border border-line p-4">
            <div className="mb-1 text-sm font-semibold text-ink">Shorter vs longer loans</div>
            <p className="mb-3 text-xs text-muted">Lower payments cost more in the end. Tap a row to switch.</p>
            <table className="w-full text-sm tabular-nums">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="pb-2">Length</th>
                  <th className="pb-2 text-right">Monthly</th>
                  <th className="pb-2 text-right">Interest</th>
                  <th className="pb-2 text-right">vs 36 mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {res.byTerm.map((r) => (
                  <tr
                    key={r.term}
                    onClick={() => state.set("m", String(r.term))}
                    className={`cursor-pointer transition hover:bg-surface-2 ${r.term === term ? "font-semibold text-ivy-700 dark:text-ivy-300" : "text-ink/80"}`}
                  >
                    <td className="py-2">{r.term} mo</td>
                    <td className="py-2 text-right">{usd0(r.payment)}</td>
                    <td className="py-2 text-right">{usd0(r.interest)}</td>
                    <td className="py-2 text-right text-muted">{r.term === 36 ? "—" : `+${usd0(r.interest - cheapest.interest)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ToolActions state={state} shareText={`My car payment: ${usd(res.monthlyPayment)}/mo`} />
        </>
      }
    />
  );
}
