"use client";

import { useMemo, useSyncExternalStore } from "react";
import { calcAge, parseDate, num } from "@/lib/calc";
import { useToolState } from "@/lib/useToolState";
import { ResultHero, Stat, Notice } from "@/components/calc/Results";
import { ToolActions, WelcomeBack } from "@/components/calc/ToolActions";
import { CalcShell, PanelTitle, useCelebrate } from "@/components/calc/CalcShell";

const DEFAULTS = { dob: "1995-06-15", on: "" }; // on = "" means today

const noopSubscribe = () => () => {};

function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AgeCalculator() {
  const state = useToolState("age-calculator", DEFAULTS);
  const v = state.values;
  // "today" is only known in the browser (static page is built earlier)
  const today = useSyncExternalStore(noopSubscribe, isoToday, () => "");
  const asOfStr = v.on || today;

  const res = useMemo(() => {
    const birth = parseDate(v.dob);
    const asOf = parseDate(asOfStr);
    return birth && asOf ? calcAge(birth, asOf) : null;
  }, [v.dob, asOfStr]);

  const isBirthday = res?.daysToBirthday === 0;
  useCelebrate(Boolean(isBirthday), state.touched);

  return (
    <CalcShell
      top={<WelcomeBack state={state} />}
      inputs={
        <>
          <div>
            <label htmlFor="dob" className="label-field">
              Date of birth
            </label>
            <input id="dob" type="date" className="input-field" value={v.dob} max={asOfStr || undefined} onChange={(e) => state.set("dob", e.target.value)} />
          </div>
          <div>
            <label htmlFor="on" className="label-field">
              Age on this date
            </label>
            <input id="on" type="date" className="input-field" value={asOfStr} onChange={(e) => state.set("on", e.target.value === today ? "" : e.target.value)} />
            <p className="mt-1.5 text-xs text-muted">Leave as today, or pick any past or future date.</p>
          </div>
          {res && (
            <div className="rounded-xl border border-line bg-surface p-4">
              <PanelTitle>Fun facts</PanelTitle>
              <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
                <li>
                  You were born on a <strong>{res.bornWeekday}</strong>.
                </li>
                <li>
                  You&apos;ve lived about <strong>{num(res.totalDays * 24, 0)}</strong> hours.
                </li>
                <li>
                  Your heart has beaten roughly <strong>{num(res.totalDays * 24 * 60 * 75 / 1e9, 2)} billion</strong> times (at ~75 bpm).
                </li>
                <li>
                  {res.totalDays < 10000 ? "You'll turn" : "You turned"} <strong>10,000 days</strong> old on{" "}
                  <strong>{milestone(v.dob, 10000)}</strong>.
                </li>
              </ul>
            </div>
          )}
        </>
      }
      results={
        !res ? (
          <Notice>{asOfStr ? "The birth date needs to be on or before the date you're measuring to." : "Pick a date of birth."}</Notice>
        ) : (
          <>
            <ResultHero eyebrow="Your age" sub={<>{num(res.totalMonths, 0)} months, or {num(res.totalWeeks, 0)} weeks and {res.totalDays % 7} days.</>}>
              {res.years} <span className="text-2xl font-bold text-white/80">yrs</span> {res.months}{" "}
              <span className="text-2xl font-bold text-white/80">mo</span> {res.days} <span className="text-2xl font-bold text-white/80">days</span>
            </ResultHero>

            <div className={`rounded-2xl border p-5 ${isBirthday ? "border-sun-300 bg-sun-100 dark:bg-sun-600/10" : "border-line bg-surface"}`}>
              {isBirthday ? (
                <div className="text-lg font-bold text-ink">🎂 Happy birthday! You&apos;re {res.years} today.</div>
              ) : (
                <>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted">Next birthday</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tabular-nums text-ivy-700 dark:text-ivy-300">{res.daysToBirthday}</span>
                    <span className="text-muted">days to go</span>
                  </div>
                  <div className="mt-1 text-sm text-ink/80">
                    You&apos;ll turn <strong>{res.nextAge}</strong> on{" "}
                    {res.nextBirthday.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}.
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-ivy-500 to-sun-400" style={{ width: `${((365 - res.daysToBirthday) / 365) * 100}%` }} />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total days" value={num(res.totalDays, 0)} />
              <Stat label="Total weeks" value={num(res.totalWeeks, 0)} />
              <Stat label="Total months" value={num(res.totalMonths, 0)} />
            </div>

            <ToolActions state={state} />
          </>
        )
      }
    />
  );
}

/** Date when someone born on `dob` reaches `days` days old. */
function milestone(dob: string, days: number) {
  const b = parseDate(dob);
  if (!b) return "—";
  const d = new Date(b.getFullYear(), b.getMonth(), b.getDate() + days);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
