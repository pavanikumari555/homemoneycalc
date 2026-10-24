"use client";

import { useEffect, useRef, useState } from "react";
import { fireConfetti } from "./Confetti";

// Two-panel calculator frame: inputs on the left, live results on the right
// (stacked on mobile). Har calculator isi frame me baithta hai.
export function CalcShell({
  inputs,
  results,
  top,
  summary,
}: {
  inputs: React.ReactNode;
  results: React.ReactNode;
  top?: React.ReactNode; // e.g. WelcomeBack banner
  // One-line live result for the phone "peek bar" (shown while editing inputs)
  summary?: { label: string; value: React.ReactNode };
}) {
  const inputsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [peek, setPeek] = useState(false);

  // Phone pe results inputs ke neeche hote hain. Jab user inputs badal raha ho aur
  // result screen pe na dikhe, neeche ek chhoti patti me live result dikhao.
  const hasSummary = Boolean(summary);
  useEffect(() => {
    if (!hasSummary || !inputsRef.current || !resultsRef.current) return;
    const seen = { inputs: false, results: false };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === inputsRef.current) seen.inputs = e.isIntersecting;
        if (e.target === resultsRef.current) seen.results = e.isIntersecting;
      }
      setPeek(seen.inputs && !seen.results);
    });
    io.observe(inputsRef.current);
    io.observe(resultsRef.current);
    return () => io.disconnect();
  }, [hasSummary]);

  return (
    <div className="rounded-3xl border border-line bg-surface p-3 shadow-lift sm:p-4">
      {top}
      <div className="grid gap-4 lg:grid-cols-12">
        <div ref={inputsRef} className="min-w-0 rounded-2xl bg-surface-2/60 p-4 sm:p-5 lg:col-span-5">
          <div className="space-y-5">{inputs}</div>
        </div>
        <div ref={resultsRef} className="min-w-0 scroll-mt-20 space-y-5 p-1 sm:p-2 lg:col-span-7">
          {results}
        </div>
      </div>

      {summary && (
        <button
          type="button"
          onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          aria-hidden={!peek}
          tabIndex={peek ? 0 : -1}
          className={`no-print fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-2xl bg-ivy-700 px-4 py-3 text-left text-white shadow-lift transition duration-300 lg:hidden ${
            peek ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
          }`}
        >
          <span className="min-w-0">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-white/75">{summary.label}</span>
            <span className="block truncate text-lg font-extrabold tabular-nums">{summary.value}</span>
          </span>
          <span className="shrink-0 rounded-xl bg-white/15 px-3 py-1.5 text-sm font-semibold">Details ↓</span>
        </button>
      )}
    </div>
  );
}

/** Small section title inside panels. */
export function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{children}</h2>;
}

/**
 * Fire confetti once per page view, the first time `when` becomes true after the
 * user has actually edited something (never on page load = not annoying).
 */
export function useCelebrate(when: boolean, touched: boolean) {
  const done = useRef(false);
  useEffect(() => {
    if (!touched || !when || done.current) return;
    const id = window.setTimeout(() => {
      done.current = true;
      fireConfetti();
    }, 700);
    return () => window.clearTimeout(id);
  }, [when, touched]);
}
