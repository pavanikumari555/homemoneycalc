"use client";

import { useEffect, useRef } from "react";
import { fireConfetti } from "./Confetti";

// Two-panel calculator frame: inputs on the left, live results on the right
// (stacked on mobile). Har calculator isi frame me baithta hai.
export function CalcShell({
  inputs,
  results,
  top,
}: {
  inputs: React.ReactNode;
  results: React.ReactNode;
  top?: React.ReactNode; // e.g. WelcomeBack banner
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-3 shadow-lift sm:p-4">
      {top}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="min-w-0 rounded-2xl bg-surface-2/60 p-4 sm:p-5 lg:col-span-5">
          <div className="space-y-5">{inputs}</div>
        </div>
        <div className="min-w-0 space-y-5 p-1 sm:p-2 lg:col-span-7">{results}</div>
      </div>
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
