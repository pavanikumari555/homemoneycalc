"use client";

import { useEffect, useState } from "react";
import { usd0 } from "@/lib/calc";
import { downloadIcs, firstOfNextMonth } from "@/lib/ics";
import { STORAGE_EVENT } from "@/lib/useToolState";

// ============================================================================
// MONTHLY CHECK-IN — "plan banao, har mahine balance daalo, dekho aage ho ya peeche".
// Ye habit loop user ko har mahine wapas laata hai (debt/mortgage/credit card tools).
// Sab browser (localStorage) me — koi account/server nahi. Calendar reminder .ics se.
// ============================================================================

interface Entry {
  date: string; // YYYY-MM-DD
  balance: number;
}

interface Tracking {
  start: string; // plan start date
  plan: number[]; // planned balance by month (index = months since start)
  entries: Entry[];
}

const KEY = (tool: string) => `hmc:checkin:${tool}`;
const today = () => new Date().toISOString().slice(0, 10);

function read(tool: string): Tracking | null {
  try {
    const t = JSON.parse(localStorage.getItem(KEY(tool)) ?? "null") as Tracking | null;
    if (!t || typeof t.start !== "string" || !Array.isArray(t.plan) || !Array.isArray(t.entries)) return null;
    return { ...t, entries: t.entries.filter((e) => typeof e?.date === "string" && Number.isFinite(e?.balance)) };
  } catch {
    return null;
  }
}

function write(tool: string, t: Tracking | null) {
  try {
    if (t) localStorage.setItem(KEY(tool), JSON.stringify(t));
    else localStorage.removeItem(KEY(tool));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // storage blocked — feature bas yaad nahi rakhega
  }
}

const monthsBetween = (a: string, b: string) => {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.max(0, (by - ay) * 12 + (bm - am) - (bd < ad ? 1 : 0));
};

/** Consecutive calendar months (ending with the latest entry) that have at least one check-in. */
function streak(entries: Entry[]): number {
  const months = new Set(entries.map((e) => e.date.slice(0, 7)));
  const latest = [...months].sort().pop();
  if (!latest) return 0;
  let [y, m] = latest.split("-").map(Number);
  let n = 0;
  while (months.has(`${y}-${String(m).padStart(2, "0")}`)) {
    n++;
    m--;
    if (m === 0) {
      m = 12;
      y--;
    }
  }
  return n;
}

interface CheckInProps {
  tool: string;
  label: string; // e.g. "mortgage balance"
  plan: { x: number; y: number }[]; // current plan's balance by month (from the calculator)
  url: string; // tool page path for the calendar reminder
}

export function CheckIn({ tool, label, plan, url }: CheckInProps) {
  const [t, setT] = useState<Tracking | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const sync = () => setT(read(tool));
    sync();
    window.addEventListener(STORAGE_EVENT, sync);
    return () => window.removeEventListener(STORAGE_EVENT, sync);
  }, [tool]);

  const canStart = plan.length > 1 && Number.isFinite(plan[plan.length - 1]?.y);

  function start() {
    // Plan ka snapshot save — baad me inputs badle tab bhi comparison isi plan se
    const snapshot = plan.slice(0, 601).map((p) => Math.round(p.y));
    const first = Math.round(plan[0]?.y ?? 0);
    write(tool, { start: today(), plan: snapshot, entries: [{ date: today(), balance: first }] });
  }

  function add() {
    const balance = Number(value.replace(/[$,\s]/g, ""));
    if (!t || !Number.isFinite(balance) || balance < 0) return;
    const d = today();
    write(tool, { ...t, entries: [...t.entries.filter((e) => e.date !== d), { date: d, balance }].sort((a, b) => a.date.localeCompare(b.date)) });
    setValue("");
  }

  function remind() {
    downloadIcs(`${tool}-check-in.ics`, [
      {
        uid: `checkin-${tool}`,
        title: `Money check-in: update your ${label}`,
        date: firstOfNextMonth(),
        monthly: true,
        description: `Open HomeMoney Calc and enter today's ${label} to see if you're ahead of your plan.`,
        url: `https://homemoneycalc.com${url}`,
      },
    ]);
  }

  if (!t) {
    return (
      <div className="no-print mt-6 rounded-2xl border border-dashed border-ivy-300 bg-ivy-50/60 p-4 text-sm dark:border-ivy-700 dark:bg-ivy-900/20">
        <div className="font-semibold text-ink">📅 Track this plan month by month</div>
        <p className="mt-1 text-muted">
          Save this plan, then come back each month and type your real {label}. We&apos;ll show if you&apos;re ahead or behind — stored only
          in this browser.
        </p>
        <button type="button" onClick={start} disabled={!canStart} className="btn-primary mt-3 py-1.5 text-sm disabled:opacity-50">
          Start tracking this plan
        </button>
      </div>
    );
  }

  const latest = t.entries[t.entries.length - 1];
  const m = monthsBetween(t.start, latest.date);
  const expected = t.plan[Math.min(m, t.plan.length - 1)] ?? 0;
  const diff = expected - latest.balance; // positive = ahead (owe less than planned)
  const s = streak(t.entries);

  return (
    <div className="no-print mt-6 rounded-2xl border border-line bg-surface p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-ink">📅 Your monthly check-in</div>
        <div className="text-xs text-muted">
          Tracking since {t.start}
          {s > 1 ? ` · 🔥 ${s}-month streak` : ""}
        </div>
      </div>
      {m > 0 ? (
        <p className={`mt-2 rounded-xl px-3 py-2 ${diff >= 0 ? "bg-ivy-50 text-ivy-800 dark:bg-ivy-900/30 dark:text-ivy-200" : "bg-sun-100/70 text-[#6b4300] dark:bg-sun-600/10 dark:text-sun-300"}`}>
          {diff >= 0
            ? `You're ${usd0(diff)} ahead of plan 🎉 (plan said ${usd0(expected)} by now).`
            : `You're ${usd0(-diff)} behind plan (plan said ${usd0(expected)}). A small extra payment this month closes the gap.`}
        </p>
      ) : (
        <p className="mt-2 text-muted">Plan saved. Come back next month and enter your new {label}.</p>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="flex-1">
          <span className="text-xs text-muted">Today&apos;s {label}</span>
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={usd0(latest.balance)}
            className="mt-1 w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-ink"
          />
        </label>
        <button type="button" onClick={add} className="btn-primary py-2 text-sm">
          Save check-in
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={remind} className="btn-ghost py-1.5">
          🔔 Add monthly reminder to my calendar
        </button>
        <button
          type="button"
          onClick={() => window.confirm("Stop tracking and delete these check-ins from this browser?") && write(tool, null)}
          className="btn-ghost py-1.5 text-muted"
        >
          Stop tracking
        </button>
      </div>
      {t.entries.length > 1 && (
        <ul className="mt-3 divide-y divide-line text-xs text-muted">
          {t.entries
            .slice(-6)
            .reverse()
            .map((e) => (
              <li key={e.date} className="flex justify-between py-1">
                <span>{e.date}</span>
                <span className="tabular-nums text-ink">{usd0(e.balance)}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

/** Tax-date reminders (.ics) — paycheck + tax tools ke neeche. */
export function TaxDatesButton({ events }: { events: Parameters<typeof downloadIcs>[1] }) {
  return (
    <button type="button" onClick={() => downloadIcs("tax-dates.ics", events)} className="btn-ghost py-1.5 text-xs">
      🔔 Add tax deadlines to my calendar
    </button>
  );
}
