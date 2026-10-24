"use client";

import { percentOf, whatPercent, percentChange, num } from "@/lib/calc";
import { useToolState, n } from "@/lib/useToolState";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";

// Five common percentage questions, each live. All inputs share one state so a
// single share link captures everything.
const DEFAULTS = { a1: "20", b1: "150", a2: "30", b2: "150", a3: "80", b3: "100", a4: "50", b4: "15", a5: "200", b5: "25" };

function fmt(x: number, digits = 4) {
  return Number.isFinite(x) ? num(x, digits) : "—";
}

export default function PercentageCalculator() {
  const state = useToolState("percentage-calculator", DEFAULTS);
  const v = state.values;
  const set = (k: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) => state.set(k, e.target.value);

  const r1 = percentOf(n(v.a1), n(v.b1));
  const r2 = whatPercent(n(v.a2), n(v.b2));
  const r3 = percentChange(n(v.a3), n(v.b3));
  const r4 = n(v.a4) * (1 + n(v.b4) / 100);
  const r5 = n(v.a5) * (1 - n(v.b5) / 100);

  return (
    <div className="rounded-3xl border border-line bg-surface p-3 shadow-lift sm:p-4">
      <WelcomeBack state={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <Card title="What is X% of Y?" result={fmt(r1)} working={`${v.a1}% × ${v.b1} = ${fmt(r1)}`}>
          What is <Inline value={v.a1} onChange={set("a1")} suffix="%" /> of <Inline value={v.b1} onChange={set("b1")} />?
        </Card>
        <Card title="X is what percent of Y?" result={`${fmt(r2)}%`} working={`${v.a2} ÷ ${v.b2} × 100 = ${fmt(r2)}%`}>
          <Inline value={v.a2} onChange={set("a2")} /> is what % of <Inline value={v.b2} onChange={set("b2")} />?
        </Card>
        <Card
          title="Percentage change"
          result={`${Number.isFinite(r3) && r3 > 0 ? "+" : ""}${fmt(r3)}%`}
          tone={Number.isFinite(r3) ? (r3 >= 0 ? "up" : "down") : undefined}
          working={`(${v.b3} − ${v.a3}) ÷ |${v.a3}| × 100`}
        >
          From <Inline value={v.a3} onChange={set("a3")} /> to <Inline value={v.b3} onChange={set("b3")} />
        </Card>
        <Card title="Increase by a percent" result={fmt(r4)} working={`${v.a4} × (1 + ${v.b4}/100)`} tone="up">
          <Inline value={v.a4} onChange={set("a4")} /> increased by <Inline value={v.b4} onChange={set("b4")} suffix="%" />
        </Card>
        <Card title="Decrease by a percent (discounts)" result={fmt(r5)} working={`${v.a5} × (1 − ${v.b5}/100) · you save ${fmt(n(v.a5) - r5)}`} tone="down">
          <Inline value={v.a5} onChange={set("a5")} /> minus <Inline value={v.b5} onChange={set("b5")} suffix="%" />
        </Card>
        <div className="flex items-center rounded-2xl bg-surface-2/60 p-5">
          <ToolActions state={state} />
        </div>
      </div>
    </div>
  );
}

function Inline({ value, onChange, suffix }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; suffix?: string }) {
  return (
    <span className="relative inline-block align-middle">
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        className={`input-field inline-block w-24 px-2 py-1 text-center font-semibold ${suffix ? "pr-6" : ""}`}
      />
      {suffix && <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-muted">{suffix}</span>}
    </span>
  );
}

function Card({
  title,
  children,
  result,
  working,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  result: string;
  working: string;
  tone?: "up" | "down";
}) {
  const color = tone === "down" ? "text-sun-600 dark:text-sun-300" : "text-ivy-700 dark:text-ivy-300";
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-ink">{children}</div>
      <div className={`mt-4 text-3xl font-extrabold tabular-nums ${color}`} aria-live="polite">
        {result}
      </div>
      <div className="mt-1 text-xs text-muted">{working}</div>
    </section>
  );
}
