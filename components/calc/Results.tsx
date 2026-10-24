"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================================
// RESULT DISPLAY — "wow" headline card, animated numbers, stat tiles, rows.
// ============================================================================

/** Animates a number from its previous value to the new one (feels alive). */
export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    const end = Number.isFinite(value) ? value : 0;
    if (start === end) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    const dur = reduce ? 0 : 550;
    let raf = 0;
    const tick = (t: number) => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = start + (end - start) * eased;
      setShown(cur);
      from.current = cur;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Background tabs pause animation frames — make sure the real number still shows
    const fallback = window.setTimeout(() => {
      cancelAnimationFrame(raf);
      setShown(end);
      from.current = end;
    }, dur + 150);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [value]);

  return <>{format(shown)}</>;
}

interface ResultHeroProps {
  eyebrow: string; // small label above, e.g. "Your take-home pay"
  children: React.ReactNode; // the big number / headline
  sub?: React.ReactNode; // one-line plain-English explanation
  tone?: "ivy" | "sun";
}

/** The big headline result. Designed to be screenshot-worthy. */
export function ResultHero({ eyebrow, children, sub, tone = "ivy" }: ResultHeroProps) {
  const bg =
    tone === "ivy"
      ? "from-ivy-600 via-ivy-700 to-ivy-900"
      : "from-sun-500 via-sun-600 to-[#8a4b00]";
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bg} p-6 text-white shadow-lift sm:p-7`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_100%_0%,rgb(255_255_255/0.14),transparent_70%),radial-gradient(30%_50%_at_15%_110%,rgb(255_209_102/0.18),transparent_70%)]" />
      <div className="relative">
        <div className="text-sm font-medium uppercase tracking-wider text-white/75">{eyebrow}</div>
        <div className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl" aria-live="polite">
          {children}
        </div>
        {sub && <div className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/90">{sub}</div>}
      </div>
    </div>
  );
}

/** Small stat tile used in grids under the hero. */
export function Stat({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-ivy-200 bg-ivy-50 dark:border-ivy-800 dark:bg-ivy-900/30" : "border-line bg-surface"}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 text-xl font-bold tabular-nums ${accent ? "text-ivy-700 dark:text-ivy-300" : "text-ink"}`}>{value}</div>
      {note && <div className="mt-0.5 text-xs text-muted">{note}</div>}
    </div>
  );
}

/** Two-column key/value table for detailed breakdowns. */
export function BreakdownTable({ rows }: { rows: { label: string; value: string; strong?: boolean; color?: string }[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.label} className={r.strong ? "bg-surface-2 font-semibold text-ink" : "text-ink/80"}>
              <td className="px-4 py-2.5">
                <span className="flex items-center gap-2">
                  {r.color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />}
                  {r.label}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Horizontal stacked bar showing how a whole splits into parts (e.g. paycheck). */
export function SplitBar({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0) || 1;
  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-surface-2">
        {parts.map((p) =>
          p.value > 0 ? (
            <div
              key={p.label}
              className="h-full transition-all duration-500"
              style={{ width: `${(p.value / total) * 100}%`, background: p.color }}
              title={`${p.label}: ${((p.value / total) * 100).toFixed(1)}%`}
            />
          ) : null
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
            {p.label} <span className="font-semibold text-ink">{((Math.max(0, p.value) / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Friendly inline notice (warnings like "payment doesn't cover interest"). */
export function Notice({ tone = "warn", children }: { tone?: "warn" | "info" | "good"; children: React.ReactNode }) {
  const styles = {
    warn: "border-sun-300 bg-sun-100 text-[#6b4300] dark:border-sun-600/50 dark:bg-sun-600/10 dark:text-sun-300",
    info: "border-line bg-surface-2 text-ink/80",
    good: "border-ivy-200 bg-ivy-50 text-ivy-800 dark:border-ivy-800 dark:bg-ivy-900/30 dark:text-ivy-200",
  }[tone];
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
