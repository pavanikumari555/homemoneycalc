"use client";

import { useState } from "react";
import Icon from "../Icon";
import type { ToolState, ToolValues } from "@/lib/useToolState";

// ============================================================================
// TOOL ACTIONS — Share link, Save plan, Print/PDF, CSV download + "Welcome back".
// Ye features user ko site yaad dilate hain aur wapas laate hain.
// ============================================================================

interface ToolActionsProps<T extends ToolValues> {
  state: ToolState<T>;
  // Optional CSV export (e.g. amortization schedule)
  csv?: () => { filename: string; rows: (string | number)[][] };
  shareText?: string; // used by native share sheet on phones
}

export function ToolActions<T extends ToolValues>({ state, csv, shareText }: ToolActionsProps<T>) {
  const [copied, setCopied] = useState(false);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  async function share() {
    const url = state.shareUrl();
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: document.title, text: shareText, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // user cancelled share sheet / clipboard blocked - fall back to prompt
      window.prompt("Copy this link:", url);
    }
  }

  function downloadCsv() {
    if (!csv) return;
    const { filename, rows } = csv();
    const body = rows
      .map((r) => r.map((c) => (typeof c === "string" && /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(","))
      .join("\n");
    const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function confirmSave() {
    state.saveScenario(name, shareText);
    setName("");
    setNaming(false);
  }

  return (
    <div className="no-print">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={share} className="btn-ghost">
          <Icon name={copied ? "check" : "share"} className="h-4 w-4" />
          {copied ? "Link copied!" : "Share result"}
        </button>
        <button type="button" onClick={() => setNaming((v) => !v)} className="btn-ghost">
          <Icon name="bookmark" className="h-4 w-4" />
          Save this plan
        </button>
        <button type="button" onClick={() => window.print()} className="btn-ghost">
          <Icon name="printer" className="h-4 w-4" />
          Print / PDF
        </button>
        {csv && (
          <button type="button" onClick={downloadCsv} className="btn-ghost">
            <Icon name="download" className="h-4 w-4" />
            CSV
          </button>
        )}
      </div>

      {naming && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            confirmSave();
          }}
        >
          <input
            autoFocus
            className="input-field max-w-xs"
            placeholder="Name it, e.g. “Pay $300 extra”"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="btn-primary py-2">
            Save
          </button>
        </form>
      )}

      {state.saved.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
            <span>Your saved plans (on this device)</span>
            <a href="/my-money/" className="normal-case tracking-normal text-ivy-600 hover:underline dark:text-ivy-400">See all in My Money →</a>
          </div>
          <ul className="flex flex-wrap gap-2">
            {state.saved.map((s) => (
              <li key={s.id} className="flex items-center overflow-hidden rounded-full border border-line bg-surface text-sm">
                <button type="button" onClick={() => state.loadScenario(s.id)} className="px-3 py-1.5 font-medium text-ink hover:text-ivy-600">
                  {s.name}
                </button>
                <button
                  type="button"
                  onClick={() => state.removeScenario(s.id)}
                  className="border-l border-line px-2 py-1.5 text-muted hover:text-red-500"
                  aria-label={`Delete ${s.name}`}
                >
                  <Icon name="x" className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
          {/* 2+ plans: ek nazar me compare ("15 saal vs 30 saal") — decide karne ke liye log wapas aate hain */}
          {state.saved.filter((s) => s.summary).length >= 2 && (
            <details className="mt-3 rounded-xl border border-line bg-surface p-3 text-sm">
              <summary className="cursor-pointer font-semibold text-ink">Compare saved plans</summary>
              <table className="mt-2 w-full text-left">
                <tbody className="divide-y divide-line">
                  {state.saved
                    .filter((s) => s.summary)
                    .map((s) => (
                      <tr key={s.id}>
                        <td className="py-1.5 pr-3 font-medium text-ink">{s.name}</td>
                        <td className="py-1.5 text-muted">{s.summary}</td>
                        <td className="py-1.5 pl-3 text-right">
                          <button type="button" onClick={() => state.loadScenario(s.id)} className="text-xs font-semibold text-ivy-600 hover:underline dark:text-ivy-400">
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

/** Shown when inputs were restored from last visit or opened from a share link. */
export function WelcomeBack<T extends ToolValues>({ state }: { state: ToolState<T> }) {
  if (state.origin === "default" || state.touched) return null;
  return (
    <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ivy-200 bg-ivy-50 px-4 py-2.5 text-sm text-ivy-800 dark:border-ivy-800 dark:bg-ivy-900/30 dark:text-ivy-200">
      <span>
        {state.origin === "restored"
          ? "👋 Welcome back — we kept your numbers from last time (only on this device)."
          : "🔗 You're viewing numbers someone shared with you. Change anything to make it yours."}
      </span>
      <button type="button" onClick={state.reset} className="font-semibold underline underline-offset-2">
        Start fresh
      </button>
    </div>
  );
}
