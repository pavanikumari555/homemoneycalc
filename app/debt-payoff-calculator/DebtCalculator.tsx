"use client";

import { useMemo } from "react";
import { calcDebtPayoff, usd0, duration, monthsFromNow, Debt, DebtStrategyResult } from "@/lib/calc";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, Segmented } from "@/components/calc/Fields";
import { ResultHero, Notice } from "@/components/calc/Results";
import LineChart, { shortMoney } from "@/components/calc/LineChart";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle, useCelebrate } from "@/components/calc/CalcShell";
import Icon from "@/components/Icon";

// Debts are stored in one URL param: "name~balance~rate~min|name~..." so the
// whole plan fits in a share link.
interface Row {
  name: string;
  balance: string;
  rate: string;
  min: string;
}

const encode = (rows: Row[]) =>
  rows.map((r) => [r.name.replace(/[~|]/g, " "), r.balance, r.rate, r.min].join("~")).join("|");

function decode(s: string): Row[] {
  const rows = s
    .split("|")
    .map((part) => part.split("~"))
    .filter((p) => p.length === 4)
    .slice(0, 15)
    .map(([name, balance, rate, min]) => ({ name: name.slice(0, 30), balance, rate, min }));
  return rows.length ? rows : decode(DEFAULTS.d);
}

const DEFAULTS = {
  d: "Credit card~6500~24~180|Car loan~14000~7.5~320|Store card~1200~29~40|Student loan~18000~5.5~210",
  x: "250",
  s: "avalanche",
};

export default function DebtCalculator() {
  const state = useToolState("debt-payoff-calculator", DEFAULTS);
  const v = state.values;
  const rows = useMemo(() => decode(v.d), [v.d]);
  const setRows = (next: Row[]) => state.set("d", encode(next));
  const update = (i: number, field: keyof Row, value: string) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const res = useMemo(() => {
    const debts: Debt[] = rows.map((r) => ({
      name: r.name,
      balance: n(r.balance),
      annualRatePercent: n(r.rate),
      minPayment: n(r.min),
    }));
    return calcDebtPayoff(debts, n(v.x));
  }, [rows, v.x]);

  const strategy = v.s === "snowball" ? "snowball" : "avalanche";
  const chosen: DebtStrategyResult = res[strategy];
  const other: DebtStrategyResult = res[strategy === "snowball" ? "avalanche" : "snowball"];
  const ok = Number.isFinite(chosen.months);
  const minOk = Number.isFinite(res.minimumOnly.months);
  const monthsSaved = minOk ? res.minimumOnly.months - chosen.months : NaN;
  const interestSaved = minOk ? res.minimumOnly.totalInterest - chosen.totalInterest : NaN;

  useCelebrate(ok && n(v.x) > 0, state.touched);

  return (
    <CalcShell
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Your debts</PanelTitle>
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-center gap-2">
                  <input
                    className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none"
                    value={r.name}
                    maxLength={30}
                    onChange={(e) => update(i, "name", e.target.value)}
                    aria-label={`Debt ${i + 1} name`}
                  />
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
                      className="rounded-md p-1 text-muted hover:text-red-500"
                      aria-label={`Remove ${r.name}`}
                    >
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <MiniField label="Balance" prefix="$" value={r.balance} onChange={(x) => update(i, "balance", x)} />
                  <MiniField label="APR" suffix="%" value={r.rate} onChange={(x) => update(i, "rate", x)} />
                  <MiniField label="Min/mo" prefix="$" value={r.min} onChange={(x) => update(i, "min", x)} />
                </div>
              </div>
            ))}
          </div>
          {rows.length < 15 && (
            <button
              type="button"
              onClick={() => setRows([...rows, { name: `Debt ${rows.length + 1}`, balance: "2000", rate: "18", min: "60" }])}
              className="btn-ghost w-full"
            >
              + Add a debt
            </button>
          )}
          <NumberField
            label="Extra you can pay each month"
            prefix="$"
            value={v.x}
            onChange={(x) => state.set("x", x)}
            slider={{ min: 0, max: 2000, step: 25 }}
            hint={`Total monthly budget: ${usd0(res.monthlyBudget)} (all minimums + extra)`}
          />
          <Segmented
            label="Method"
            value={strategy}
            onChange={(x) => state.set("s", x)}
            options={[
              { value: "avalanche", label: "Avalanche (highest rate)" },
              { value: "snowball", label: "Snowball (smallest balance)" },
            ]}
          />
        </>
      }
      results={
        <>
          {!ok ? (
            <Notice>
              Your monthly budget doesn&apos;t cover the interest on these debts, so the balance would keep growing. Try a bigger extra
              payment.
            </Notice>
          ) : (
            <ResultHero
              eyebrow={`Debt-free date (${strategy})`}
              sub={
                Number.isFinite(monthsSaved) && monthsSaved > 0 ? (
                  <>
                    <strong>{duration(monthsSaved)} sooner</strong> and <strong>{usd0(interestSaved)} less interest</strong> than
                    paying only the minimums.
                  </>
                ) : !minOk ? (
                  <>Paying only the minimums would never clear these debts — your plan does it in {duration(chosen.months)}.</>
                ) : (
                  <>Add an extra monthly amount to see how much sooner you could be free.</>
                )
              }
            >
              {monthsFromNow(chosen.months)}
            </ResultHero>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <MethodCard title="Avalanche" active={strategy === "avalanche"} result={res.avalanche} best={res.avalanche.totalInterest <= res.snowball.totalInterest} onPick={() => state.set("s", "avalanche")} />
            <MethodCard title="Snowball" active={strategy === "snowball"} result={res.snowball} best={res.snowball.totalInterest < res.avalanche.totalInterest} onPick={() => state.set("s", "snowball")} />
          </div>
          {ok && Number.isFinite(other.totalInterest) && Math.abs(other.totalInterest - chosen.totalInterest) > 1 && (
            <p className="text-sm text-muted">
              {chosen.totalInterest < other.totalInterest
                ? `${strategy === "avalanche" ? "Avalanche" : "Snowball"} saves ${usd0(other.totalInterest - chosen.totalInterest)} in interest versus the other method.`
                : `The other method would save ${usd0(chosen.totalInterest - other.totalInterest)} in interest — but snowball's quick wins help many people stick with it.`}
            </p>
          )}

          {ok && (
            <div className="rounded-2xl border border-line p-4">
              <div className="mb-2 text-sm font-semibold text-ink">Total debt over time</div>
              <LineChart
                ariaLabel="Total debt balance over time by payoff method"
                formatX={(m) => (m < 24 ? `${Math.round(m)} mo` : `Yr ${Math.round(m / 12)}`)}
                formatY={(y) => shortMoney(y)}
                series={[
                  ...(minOk ? [{ name: "Minimums only", color: "#97a89e", points: res.minimumOnly.timeline, dashed: true }] : []),
                  { name: strategy === "avalanche" ? "Snowball" : "Avalanche", color: "#f7b733", points: other.timeline },
                  { name: strategy === "avalanche" ? "Avalanche" : "Snowball", color: "#2a6a44", points: chosen.timeline, area: true },
                ]}
              />
            </div>
          )}

          {ok && chosen.payoffOrder.length > 0 && (
            <div className="rounded-2xl border border-line p-4">
              <div className="mb-3 text-sm font-semibold text-ink">Your milestones</div>
              <ol className="relative space-y-3 border-l-2 border-ivy-200 pl-5 dark:border-ivy-800">
                {chosen.payoffOrder.map((p, i) => (
                  <li key={`${p.name}-${i}`} className="relative">
                    <span className="absolute -left-[27px] top-0.5 grid h-5 w-5 place-items-center rounded-full bg-ivy-600 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="text-sm font-semibold text-ink">{p.name} paid off</div>
                    <div className="text-xs text-muted">
                      {monthsFromNow(p.month)} · month {p.month}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <ToolActions state={state} shareText={ok ? `My debt-free date: ${monthsFromNow(chosen.months)} 🎉` : undefined} />
        </>
      }
    />
  );
}

function MiniField({ label, value, onChange, prefix, suffix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted">{label}</span>
      <span className="relative block">
        {prefix && <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs text-muted">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          className={`input-field px-2 py-1.5 text-sm ${prefix ? "pl-5" : ""} ${suffix ? "pr-6" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted">{suffix}</span>}
      </span>
    </label>
  );
}

function MethodCard({ title, result, active, best, onPick }: { title: string; result: DebtStrategyResult; active: boolean; best: boolean; onPick: () => void }) {
  const ok = Number.isFinite(result.months);
  return (
    <button
      type="button"
      onClick={onPick}
      className={`rounded-2xl border p-4 text-left transition ${active ? "border-ivy-500 bg-ivy-50 ring-2 ring-ivy-500/20 dark:bg-ivy-900/30" : "border-line bg-surface hover:border-ivy-300"}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink">{title}</span>
        {best && ok && <span className="rounded-full bg-sun-100 px-2 py-0.5 text-[11px] font-semibold text-sun-600 dark:bg-sun-600/15 dark:text-sun-300">Least interest</span>}
      </div>
      <div className="mt-2 text-sm text-muted">
        {ok ? (
          <>
            Done in <span className="font-semibold text-ink">{duration(result.months)}</span>
            <br />
            Interest <span className="font-semibold text-ink">{usd0(result.totalInterest)}</span>
          </>
        ) : (
          "Never pays off"
        )}
      </div>
    </button>
  );
}
