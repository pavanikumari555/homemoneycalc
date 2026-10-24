"use client";

import { useId } from "react";

// ============================================================================
// FORM FIELDS — saare calculators yahi inputs use karte hain (consistent look).
// ============================================================================

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string; // e.g. "$"
  suffix?: string; // e.g. "%", "yrs"
  hint?: string;
  // Optional slider under the input for quick "what-if" play
  slider?: { min: number; max: number; step: number };
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({ label, value, onChange, prefix, suffix, hint, slider, min, max, step }: NumberFieldProps) {
  const id = useId();
  const numeric = parseFloat(value);
  return (
    <div>
      <label htmlFor={id} className="label-field">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">{prefix}</span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className={`input-field ${prefix ? "pl-7" : ""} ${suffix ? "pr-12" : ""}`}
          value={value}
          min={min}
          max={max}
          step={step ?? "any"}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">{suffix}</span>
        )}
      </div>
      {slider && (
        <input
          type="range"
          className="slider mt-3"
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={Number.isFinite(numeric) ? Math.min(Math.max(numeric, slider.min), slider.max) : slider.min}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} slider`}
        />
      )}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}

export function SelectField({ label, value, onChange, options, hint }: SelectFieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label-field">
        {label}
      </label>
      <select id={id} className="input-field cursor-pointer" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

interface SegmentedProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

/** Pill-style toggle group (e.g. Single / Married, Snowball / Avalanche). */
export function Segmented({ label, value, onChange, options }: SegmentedProps) {
  return (
    <div>
      {label && <span className="label-field">{label}</span>}
      <div role="radiogroup" aria-label={label} className="flex rounded-xl border border-line bg-surface-2 p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                active ? "bg-surface text-ivy-700 shadow-sm dark:text-ivy-300" : "text-muted hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}

export function Toggle({ label, checked, onChange, hint }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-ivy-600" : "bg-line"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
      <span>
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}
