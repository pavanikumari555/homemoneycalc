"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

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

const LAST_KEY = (tool: string) => `hmc:last:${tool}`;
const SAVED_KEY = (tool: string) => `hmc:saved:${tool}`;
const RECENT_KEY = "hmc:recent";
const FAV_KEY = "hmc:favorites";
export const STORAGE_EVENT = "hmc:storage"; // fired so header/dashboard update live
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

/** Allowed values for "choice" fields (state, filing status, loan term...). */
export type AllowedValues<T extends ToolValues> = Partial<Record<keyof T, readonly string[]>>;

/** Only keep keys we know about, as strings, and only allowed choices (never trust URL/storage). */
function sanitize<T extends ToolValues>(defaults: T, incoming: unknown, allowed?: AllowedValues<T>): Partial<T> {
  const out: Partial<T> = {};
  if (!incoming || typeof incoming !== "object") return out;
  for (const key of Object.keys(defaults)) {
    const v = (incoming as Record<string, unknown>)[key];
    if (typeof v !== "string" || v.length > 200) continue;
    const choices = allowed?.[key as keyof T];
    if (choices && !choices.includes(v)) continue; // e.g. ?st=ZZ or ?pp=0 -> keep the default
    (out as ToolValues)[key] = v;
  }
  return out;
}

/** Read a stored list, dropping anything that isn't the expected shape (corrupt storage can't crash pages). */
function readList<V>(key: string, isItem: (x: unknown) => x is V): V[] {
  const raw = readJson<unknown>(key);
  return Array.isArray(raw) ? raw.filter(isItem) : [];
}

const isString = (x: unknown): x is string => typeof x === "string";
const isScenario = (x: unknown): x is Scenario<ToolValues> => {
  const s = x as Scenario<ToolValues>;
  return !!s && typeof s === "object" && typeof s.id === "string" && typeof s.name === "string" &&
    typeof s.savedAt === "number" && !!s.values && typeof s.values === "object";
};

/** Remember which tools this visitor used recently (home page shows them). */
function markRecent(tool: string) {
  const list = readList(RECENT_KEY, isString);
  writeJson(RECENT_KEY, [tool, ...list.filter((t) => t !== tool)].slice(0, 4));
}

export function getRecentTools(): string[] {
  return readList(RECENT_KEY, isString);
}

/** Pinned ("favorite") tools, shown first on My Money and the home page. */
export function getFavorites(): string[] {
  return readList(FAV_KEY, isString);
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
    .flatMap((tool) => readList(SAVED_KEY(tool), isScenario).map((plan) => ({ tool, plan })))
    .sort((a, b) => b.plan.savedAt - a.plan.savedAt);
}

export function deleteSaved(tool: string, id: string) {
  const list = readList(SAVED_KEY(tool), isScenario);
  writeJson(SAVED_KEY(tool), list.filter((p) => p.id !== id));
}

/** Link that reopens a saved plan with its exact numbers. */
export function planUrl(tool: string, values: ToolValues): string {
  return `/${tool}/?${new URLSearchParams(values).toString()}`;
}

/** `defaults` and `allowed` must be module-level constants (stable references). */
export function useToolState<T extends ToolValues>(tool: string, defaults: T, allowed?: AllowedValues<T>) {
  const [values, setValues] = useState<T>(defaults);
  // "shared" = opened from someone's link, "restored" = our own last session
  const [origin, setOrigin] = useState<"default" | "shared" | "restored">("default");
  const [saved, setSaved] = useState<Scenario<T>[]>([]);
  // Becomes true after the first user edit (used to time celebrations etc.)
  const [touched, setTouched] = useState(false);
  const ready = useRef(false);

  // Load once on mount: URL params win, then last session, else defaults.
  // Static page ka HTML defaults se banta hai; browser me aane ke baad hi URL/storage
  // padh sakte hain - isliye ye ek baar ka hydration setState jaan-boojh ke effect me hai.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = sanitize(defaults, Object.fromEntries(params.entries()), allowed);
    if (Object.keys(fromUrl).length > 0) {
      setValues({ ...defaults, ...fromUrl });
      setOrigin("shared");
    } else {
      const last = readJson<unknown>(LAST_KEY(tool));
      if (last) {
        const restored = sanitize(defaults, last, allowed);
        if (Object.keys(restored).length > 0) {
          setValues({ ...defaults, ...restored });
          setOrigin("restored");
        }
      }
    }
    setSaved(readList(SAVED_KEY(tool), isScenario) as Scenario<T>[]);
    markRecent(tool);
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    // Embed widget (/embed/x/) se share karo to bhi asli tool page ka link bane
    const path = window.location.pathname.replace(/^\/embed\//, "/");
    return `${window.location.origin}${path}?${params.toString()}`;
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
      const current = readList(SAVED_KEY(tool), isScenario) as Scenario<T>[]; // other tabs may have saved too
      const next = [entry, ...current].slice(0, MAX_SAVED);
      setSaved(next);
      writeJson(SAVED_KEY(tool), next);
    },
    [saved.length, values, tool]
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
      if (s) setMany({ ...defaults, ...sanitize(defaults, s.values, allowed) });
    },
    [saved, setMany, defaults, allowed]
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

// ---- Read browser-only values safely (React's external-store pattern) ----
// Server/static HTML gets `fallback`; the browser gets the live value and
// re-renders whenever our storage changes (any tab or component).

function subscribeStorage(onChange: () => void) {
  window.addEventListener(STORAGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(STORAGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** `read` and `fallback` must be stable (module-level), e.g. useStorageValue(getFavorites, NONE). */
export function useStorageValue<V>(read: () => V, fallback: V): V {
  const cache = useRef<{ key: string; value: V } | null>(null);
  const getSnapshot = useCallback(() => {
    const value = read();
    const key = JSON.stringify(value);
    if (cache.current?.key !== key) cache.current = { key, value };
    return cache.current.value;
  }, [read]);
  return useSyncExternalStore(subscribeStorage, getSnapshot, () => fallback);
}

const noopSubscribe = () => () => {};

/** false in static HTML, true once running in the browser (no extra render tricks). */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export const NONE: string[] = [];

/** Parse a numeric input string safely ("1,200" -> 1200, "" -> fallback). */
export function n(value: string | undefined, fallback = 0): number {
  if (value == null) return fallback;
  const parsed = parseFloat(value.replace(/[,\s$]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}
