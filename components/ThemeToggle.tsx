"use client";

import { useSyncExternalStore } from "react";
import Icon from "./Icon";

// Dark/light toggle. Choice localStorage me save hota hai; pehli baar system
// setting follow karta hai. Flash rokne wala script layout.tsx ke <head> me hai.
// Asli source of truth <html class="dark"> hai — usi ko "store" ki tarah padhte hain.

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("hmc-theme", next ? "dark" : "light");
    } catch {
      // storage blocked (private mode) - toggle still works for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:text-ink"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon name={dark ? "sun" : "moon"} className="h-[18px] w-[18px]" />
    </button>
  );
}

// Runs before paint (inlined in <head>) so the page never flashes the wrong theme.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('hmc-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;
