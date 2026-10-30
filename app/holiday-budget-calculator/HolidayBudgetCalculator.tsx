"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { usd, usd0, parseDate } from "@/lib/calc";
import { calcHolidayBudget, nextChristmas } from "@/lib/tools/holiday-budget-calculator";
import { useToolState, n } from "@/lib/useToolState";
import { NumberField, SelectField } from "@/components/calc/Fields";
import { ResultHero, Stat, BreakdownTable, SplitBar, Notice, CountUp } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle } from "@/components/calc/CalcShell";
import Icon from "@/components/Icon";

// Gift list ek hi URL param me: "name~amount|name~amount" (share link me poori list).
// This field has its own bounded length allowance, so all ten rows can restore.
interface Row {
  name: string;
  amount: string;
}
const MAX_ROWS = 10;
const MAX_NAME = 12;

const DEFAULTS = {
  g: "Mom~100|Dad~100|Partner~200|Kid 1~150|Kid 2~150|Friends~100",
  tr: "300",
  fd: "250",
  dc: "75",
  ot: "50",
  bud: "1500",
  sv: "0",
  dt: "", // "" = next December 25
  pp: "26",
};
const ALLOWED = { pp: ["52", "26", "24", "12"] };
const PAY = [
  { value: "52", label: "Weekly" },
  { value: "26", label: "Every 2 weeks" },
  { value: "24", label: "Twice a month" },
  { value: "12", label: "Monthly" },
];
const COLORS = ["#2a6a44", "#f7b733", "#8bc09e", "#e08a00", "#97a89e"];

import { cleanGiftName as clean, cleanGiftAmount as cleanAmount, encodeGiftRows as encode, validGiftState, MAX_GIFT_STATE_LENGTH } from "@/lib/gift-state";
const RULES = { g: { maxLength: MAX_GIFT_STATE_LENGTH, valid: validGiftState } };

function decode(s: string): Row[] {
  if (!s) return [];
  return s
    .split("|")
    .map((p) => p.split("~"))
    .filter((p) => p.length === 2)
    .slice(0, MAX_ROWS)
    .map(([name, amount]) => ({ name: clean(name), amount: cleanAmount(amount) }));
}

const noopSubscribe = () => () => {};
function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function HolidayBudgetCalculator() {
  const state = useToolState("holiday-budget-calculator", DEFAULTS, ALLOWED, RULES);
  const v = state.values;
  // "today" sirf browser me pata hota hai (static page pehle build hota hai)
  const todayStr = useSyncExternalStore(noopSubscribe, isoToday, () => "");
  const today = parseDate(todayStr);
  const target = parseDate(v.dt) ?? (today ? nextChristmas(today) : null);

  const rows = useMemo(() => decode(v.g), [v.g]);
  const setRows = (next: Row[]) => state.set("g", encode(next));
  const update = (i: number, field: keyof Row, value: string) => setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const res = useMemo(
    () =>
      calcHolidayBudget({
        gifts: rows.map((r) => ({ name: r.name, amount: n(r.amount) })),
        travel: n(v.tr),
        food: n(v.fd),
        decorations: n(v.dc),
        other: n(v.ot),
        budget: n(v.bud),
        alreadySaved: n(v.sv),
        today: today ?? new Date(2026, 10, 1),
        target: target ?? new Date(2026, 11, 25),
        paychecksPerYear: n(v.pp, 26),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, v, todayStr]
  );

  const ready = Boolean(today && target);
  const targetLabel = target ? target.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  return (
    <CalcShell
      summary={{ label: "Holiday total", value: usd0(res.total) }}
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <PanelTitle>Gifts</PanelTitle>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="input-field min-w-0 flex-1"
                  value={r.name}
                  maxLength={MAX_NAME}
                  placeholder="Name"
                  onChange={(e) => update(i, "name", e.target.value)}
                  aria-label={`Gift ${i + 1} person`}
                />
                <div className="relative w-28 shrink-0">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    className="input-field pl-7"
                    value={r.amount}
                    onChange={(e) => update(i, "amount", e.target.value)}
                    aria-label={`Gift amount for ${r.name || `person ${i + 1}`}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
                  className="rounded-md p-1 text-muted hover:text-red-500"
                  aria-label={`Remove ${r.name || `person ${i + 1}`}`}
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            ))}
            {rows.length === 0 && <p className="text-sm text-muted">No gifts yet — add a person below.</p>}
          </div>
          {rows.length < MAX_ROWS ? (
            <button type="button" onClick={() => setRows([...rows, { name: "", amount: "50" }])} className="btn-ghost w-full">
              + Add a person
            </button>
          ) : (
            <p className="text-xs text-muted">Up to {MAX_ROWS} rows — group the rest (e.g. &quot;Coworkers&quot;) into one line.</p>
          )}

          <PanelTitle>Everything else</PanelTitle>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Travel" prefix="$" value={v.tr} onChange={(x) => state.set("tr", x)} />
            <NumberField label="Food & hosting" prefix="$" value={v.fd} onChange={(x) => state.set("fd", x)} />
            <NumberField label="Decorations" prefix="$" value={v.dc} onChange={(x) => state.set("dc", x)} />
            <NumberField label="Other" prefix="$" value={v.ot} onChange={(x) => state.set("ot", x)} hint="Cards, wrapping, shipping" />
          </div>

          <PanelTitle>Your plan</PanelTitle>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Total budget" prefix="$" value={v.bud} onChange={(x) => state.set("bud", x)} hint="0 = no limit" />
            <NumberField label="Already saved" prefix="$" value={v.sv} onChange={(x) => state.set("sv", x)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hb-date" className="label-field">
                Money needed by
              </label>
              <input
                id="hb-date"
                type="date"
                className="input-field"
                value={v.dt || (target ? iso(target) : "")}
                min={todayStr || undefined}
                onChange={(e) => state.set("dt", e.target.value)}
              />
            </div>
            <SelectField label="You're paid" value={v.pp} onChange={(x) => state.set("pp", x)} options={PAY} />
          </div>
        </>
      }
      results={
        <>
          <ResultHero
            eyebrow="Your holiday spending"
            tone={res.overBudget > 0 ? "sun" : "ivy"}
            sub={
              res.total === 0 ? (
                <>Add gifts and other costs to build your plan.</>
              ) : res.overBudget > 0 ? (
                <>
                  That&apos;s <strong>{usd0(res.overBudget)} over</strong> your {usd0(n(v.bud))} budget. Trim a few gifts or extras below.
                </>
              ) : n(v.bud) > 0 ? (
                <>
                  <strong>{usd0(res.underBudget)} under</strong> your {usd0(n(v.bud))} budget. Nice.
                </>
              ) : (
                <>Set a budget to see whether your plan fits.</>
              )
            }
          >
            <CountUp value={res.total} format={usd0} />
          </ResultHero>

          {ready && res.stillToSave > 0 && res.daysLeft > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Save per paycheck" accent value={usd(res.perPaycheck)} note={`${res.paychecksLeft} paydays`} />
              <Stat label="Save per week" value={usd(res.perWeek)} note={`${res.weeksLeft} weeks`} />
              <Stat label="Per day" value={usd(res.perDay)} note={`${res.daysLeft} days to ${targetLabel}`} />
            </div>
          )}
          {ready && res.stillToSave > 0 && res.daysLeft === 0 && (
            <Notice>
              Your date is today or has passed, so you&apos;d need the full {usd0(res.stillToSave)} now. Pick a later date to spread it out.
            </Notice>
          )}
          {res.total > 0 && res.stillToSave === 0 && <Notice tone="good">You&apos;ve already saved enough to cover the whole plan.</Notice>}

          {res.total > 0 && (
            <div className="rounded-2xl border border-line p-4">
              <SplitBar parts={res.categories.map((c, i) => ({ ...c, color: COLORS[i] }))} />
            </div>
          )}

          <BreakdownTable
            rows={[
              {
                label: `Gifts (${res.giftCount} ${res.giftCount === 1 ? "person" : "people"}${res.giftCount ? `, avg ${usd0(res.averageGift)}` : ""})`,
                value: usd(res.giftsTotal),
              },
              { label: "Travel, food, decor & other", value: usd(res.extrasTotal) },
              { label: "Total", value: usd(res.total), strong: true },
              { label: "Already saved", value: `−${usd(Math.min(n(v.sv) > 0 ? n(v.sv) : 0, res.total))}` },
              { label: "Still to save", value: usd(res.stillToSave), strong: true },
            ]}
          />

          {res.stillToSave > 0 && (
            <p className="text-sm text-muted">
              Tip: putting the gap on a credit card at around 22% APR can cost far more than it looks. If you already carry a balance, see
              how fast you can clear it with the{" "}
              <Link href="/credit-card-payoff-calculator/" className="link">
                credit card payoff calculator
              </Link>
              .
            </p>
          )}

          <ToolActions
            state={state}
            shareText={`Our holiday plan: ${usd0(res.total)} total`}
            csv={() => ({
              filename: "holiday-budget.csv",
              rows: [
                ["Item", "Amount"],
                ...rows.map((r, i) => [r.name || `Gift ${i + 1}`, n(r.amount).toFixed(2)]),
                ...res.categories.slice(1).map((c) => [c.label, c.value.toFixed(2)]),
                ["Total", res.total.toFixed(2)],
              ],
            })}
          />
        </>
      }
    />
  );
}
