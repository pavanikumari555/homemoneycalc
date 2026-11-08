"use client";

import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { TOOLS } from "@/lib/site";
import { searchTools } from "@/lib/tool-search";
import Icon from "./Icon";

// Command palette: press "/" (or Ctrl/⌘+K) anywhere, type, Enter. Power users
// isse har din wapas aate hain — RapidTables jaisa speed.
export default function QuickSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null); // where focus goes back after closing
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, select, [contenteditable=true]");
      if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        openPalette();
      } else if (e.key === "Escape" && input.current) {
        closePalette();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fresh search box every time the palette opens
  function openPalette() {
    // Repeated Ctrl+K must keep the original return-focus target.
    if (input.current) { input.current.focus(); return; }
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQ("");
    setActive(0);
    setOpen(true);
  }

  function closePalette() {
    setOpen(false);
    window.setTimeout(() => returnFocus.current?.focus?.(), 0);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => input.current?.focus(), 10);
    return () => { document.body.style.overflow = previous; window.clearTimeout(timer); };
  }, [open]);

  const results = useMemo(() => searchTools(TOOLS, q), [q]);

  useEffect(() => {
    if (open && results[active]) {
      document.getElementById(`quick-search-${results[active].slug}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active, results]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/${slug}/`);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-sm text-muted transition hover:border-ivy-400 hover:text-ink lg:w-auto lg:px-3"
        aria-label="Search calculators"
      >
        <Icon name="search" className="h-4 w-4" />
        <span className="hidden lg:inline">Search</span>
        <kbd className="hidden rounded border border-line bg-surface-2 px-1.5 font-mono text-[11px] lg:inline">/</kbd>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm" onClick={closePalette}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search calculators"
            className="flex max-h-[76dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              e.preventDefault();
              const controls = e.currentTarget.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button");
              const index = Array.from(controls).indexOf(document.activeElement as HTMLInputElement | HTMLButtonElement);
              controls[(index + (e.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
            }}
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3">
              <Icon name="search" className="h-5 w-5 text-muted" />
              <input
                ref={input}
                role="combobox"
                aria-expanded="true"
                aria-controls="quick-search-list"
                aria-autocomplete="list"
                aria-activedescendant={results[active] ? `quick-search-${results[active].slug}` : undefined}
                aria-label="Find a calculator"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter" && results[active]) {
                    go(results[active].slug);
                  }
                }}
                placeholder="Find a calculator…"
                className="w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
              />
              <button type="button" onClick={closePalette} aria-label="Close search" className="rounded-lg p-2 text-sm text-muted hover:bg-surface-2">Close</button>
            </div>
            <ul id="quick-search-list" role="listbox" aria-label="Calculators" className="min-h-0 max-h-[50vh] overflow-auto p-2">
              {results.length ? (
                results.map((t, i) => (
                  <li
                    key={t.slug}
                    id={`quick-search-${t.slug}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(t.slug)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left ${i === active ? "bg-surface-2" : ""}`}
                  >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ivy-50 text-ivy-700 dark:bg-ivy-900/40 dark:text-ivy-300">
                        <Icon name={t.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink">{t.title}</span>
                        <span className="block truncate text-xs text-muted">{t.blurb}</span>
                      </span>
                  </li>
                ))
              ) : (
                <li role="option" aria-selected="false" aria-disabled="true" className="px-3 py-4 text-sm text-muted">No match yet — try another word.</li>
              )}
            </ul>
          </div>
        </div>, document.body
      )}
    </>
  );
}
