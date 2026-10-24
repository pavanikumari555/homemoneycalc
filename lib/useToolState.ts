"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// TOOL STATE HOOK — har calculator ka "memory"
// 1. URL me inputs save (?b=300000&r=6.5) -> share link khud ban jaata hai
// 2. Browser (localStorage) me last inputs -> wapas aao to "Welcome back"
// 3. Saved scenarios -> user apne plans naam se save kar sakta hai
// Sab browser me hi, koi server/account nahi.
// ============================================================================

export type ToolValues = Record<string, string>;

export interface Scenario<T extends ToolValues> {
  id: string;
  name: string;
  values: T;
  savedAt: number;
  summary?: string; // headline result at save time, shown on My Money
}

const LAST_KEY = (tool: string) => `calcivy:last:${tool}`;
const SAVED_KEY = (tool: string) => `calcivy:saved:${tool}`;
const RECENT_KEY = "calcivy:recent";
const FAV_KEY = "calcivy:favorites";
export const STORAGE_EVENT = "calcivy:storage"; // fired so header/dashboard update live
const MAX_SAVED = 8;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // storage full or blocked - tool still works, just won't remember
  }
}

/** Only keep keys we know about, as strings (never trust URL/storage shape). */
function sanitize<T extends ToolValues>(defaults: T, incoming: Record<string, unknown>): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(defaults)) {
    const v = incoming[key];
    if (typeof v === "string" && v.length <= 200) (out as ToolValues)[key] = v;
  }
  return out;
}

/** Remember which tools this visitor used recently (home page shows them). */
function markRecent(tool: string) {
  const list = readJson<string[]>(RECENT_KEY) ?? [];
  writeJson(RECENT_KEY, [tool, ...list.filter((t) => t !== tool)].slice(0, 4));
}

export function getRecentTools(): string[] {
  return readJson<string[]>(RECENT_KEY) ?? [];
}

/** Pinned ("favorite") tools, shown first on My Money and the home page. */
export function getFavorites(): string[] {
  return readJson<string[]>(FAV_KEY) ?? [];
}

export function toggleFavorite(tool: string): boolean {
  const list = getFavorites();
  const on = !list.includes(tool);
  writeJson(FAV_KEY, on ? [tool, ...list] : list.filter((t) => t !== tool));
  return on;
}

/** Every saved plan across all tools (for the My Money dashboard). */
export function getAllSaved(tools: string[]): { tool: string; plan: Scenario<ToolValues> }[] {
  return tools
    .flatMap((tool) => (readJson<Scenario<ToolValues>[]>(SAVED_KEY(tool)) ?? []).map((plan) => ({ tool, plan })))
    .sort((a, b) => b.plan.savedAt - a.plan.savedAt);
}

export function deleteSaved(tool: string, id: string) {
  const list = readJson<Scenario<ToolValues>[]>(SAVED_KEY(tool)) ?? [];
  writeJson(SAVED_KEY(tool), list.filter((p) => p.id !== id));
}

/** Link that reopens a saved plan with its exact numbers. */
export function planUrl(tool: string, values: ToolValues): string {
  return `/${tool}/?${new URLSearchParams(values).toString()}`;
}

export function useToolState<T extends ToolValues>(tool: string, defaults: T) {
  const [values, setValues] = useState<T>(defaults);
  // "shared" = opened from someone's link, "restored" = our own last session
  const [origin, setOrigin] = useState<"default" | "shared" | "restored">("default");
  const [saved, setSaved] = useState<Scenario<T>[]>([]);
  // Becomes true after the first user edit (used to time celebrations etc.)
  const [touched, setTouched] = useState(false);
  const ready = useRef(false);

  // Load once on mount: URL params win, then last session, else defaults.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = sanitize(defaults, Object.fromEntries(params.entries()));
    if (Object.keys(fromUrl).length > 0) {
      setValues({ ...defaults, ...fromUrl });
      setOrigin("shared");
    } else {
      const last = readJson<Record<string, unknown>>(LAST_KEY(tool));
      if (last) {
        const restored = sanitize(defaults, last);
        if (Object.keys(restored).length > 0) {
          setValues({ ...defaults, ...restored });
          setOrigin("restored");
        }
      }
    }
    setSaved(readJson<Scenario<T>[]>(SAVED_KEY(tool)) ?? []);
    markRecent(tool);
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool]);

  // Persist to URL + storage (debounced so typing stays smooth).
  useEffect(() => {
    if (!ready.current || !touched) return;
    const id = window.setTimeout(() => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(values)) {
        if (v !== defaults[k]) params.set(k, v);
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
      writeJson(LAST_KEY(tool), values);
    }, 400);
    return () => window.clearTimeout(id);
  }, [values, touched, tool, defaults]);

  const set = useCallback((key: keyof T, value: string) => {
    setTouched(true);
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setMany = useCallback((patch: Partial<T>) => {
    setTouched(true);
    setValues((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setTouched(true);
    setValues(defaults);
    setOrigin("default");
  }, [defaults]);

  const shareUrl = useCallback(() => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(values)) params.set(k, v);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [values]);

  const saveScenario = useCallback(
    (name: string, summary?: string) => {
      const entry: Scenario<T> = {
        id: Math.random().toString(36).slice(2, 9),
        name: name.trim().slice(0, 40) || `Plan ${saved.length + 1}`,
        values,
        savedAt: Date.now(),
        summary: summary?.slice(0, 120),
      };
      const next = [entry, ...saved].slice(0, MAX_SAVED);
      setSaved(next);
      writeJson(SAVED_KEY(tool), next);
    },
    [saved, values, tool]
  );

  const removeScenario = useCallback(
    (id: string) => {
      const next = saved.filter((s) => s.id !== id);
      setSaved(next);
      writeJson(SAVED_KEY(tool), next);
    },
    [saved, tool]
  );

  const loadScenario = useCallback(
    (id: string) => {
      const s = saved.find((x) => x.id === id);
      if (s) setMany({ ...defaults, ...sanitize(defaults, s.values) });
    },
    [saved, setMany, defaults]
  );

  return {
    values,
    set,
    setMany,
    reset,
    origin,
    touched,
    shareUrl,
    saved,
    saveScenario,
    removeScenario,
    loadScenario,
  };
}

export type ToolState<T extends ToolValues> = ReturnType<typeof useToolState<T>>;

/** Parse a numeric input string safely ("1,200" -> 1200, "" -> fallback). */
export function n(value: string | undefined, fallback = 0): number {
  if (value == null) return fallback;
  const parsed = parseFloat(value.replace(/[,\s$]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}
