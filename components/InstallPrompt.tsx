"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

// "Add to home screen" nudge — sirf 2nd visit ke baad aur jab browser install
// allow kare. Ek baar "Not now" bola to 30 din tak dobara nahi dikhega.
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
}

const VISITS = "calcivy:visits";
const SNOOZE = "calcivy:install-snooze";

export default function InstallPrompt() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);

  useEffect(() => {
    let visits = 0;
    try {
      if (!sessionStorage.getItem("calcivy:counted")) {
        visits = Number(localStorage.getItem(VISITS) ?? 0) + 1;
        localStorage.setItem(VISITS, String(visits));
        sessionStorage.setItem("calcivy:counted", "1");
      } else {
        visits = Number(localStorage.getItem(VISITS) ?? 0);
      }
      const snoozedUntil = Number(localStorage.getItem(SNOOZE) ?? 0);
      if (visits < 2 || Date.now() < snoozedUntil) return;
    } catch {
      return;
    }
    // The event is captured early by an inline script in layout.tsx
    const take = () => {
      const e = (window as unknown as { __installEvent?: InstallEvent }).__installEvent;
      if (e) setEvt(e);
    };
    take();
    window.addEventListener("calcivy:installable", take);
    return () => window.removeEventListener("calcivy:installable", take);
  }, []);

  if (!evt) return null;

  function dismiss() {
    try {
      localStorage.setItem(SNOOZE, String(Date.now() + 30 * 86_400_000));
    } catch {
      // ignore
    }
    setEvt(null);
  }

  return (
    <div className="no-print fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-lift sm:bottom-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ivy-600 text-white">
        <Icon name="bolt" className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <div className="font-semibold text-ink">Keep CalcIvy one tap away</div>
        <div className="text-muted">Install it — works offline, opens like an app.</div>
      </div>
      <button
        type="button"
        className="btn-primary px-3 py-1.5 text-sm"
        onClick={async () => {
          await evt.prompt();
          setEvt(null);
        }}
      >
        Install
      </button>
      <button type="button" onClick={dismiss} className="p-1 text-muted hover:text-ink" aria-label="Not now">
        <Icon name="x" className="h-4 w-4" />
      </button>
    </div>
  );
}
