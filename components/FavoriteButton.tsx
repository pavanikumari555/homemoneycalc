"use client";

import { getFavorites, toggleFavorite, useStorageValue, NONE } from "@/lib/useToolState";

// "Pin to My Money" star on every tool page. Pinned tools show first on the
// home page and the My Money dashboard — ek click me wapas aane ka raasta.
export default function FavoriteButton({ slug }: { slug: string }) {
  const on = useStorageValue(getFavorites, NONE).includes(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={on}
      className={`no-print inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
        on
          ? "border-sun-300 bg-sun-100 text-sun-600 dark:border-sun-600/50 dark:bg-sun-600/15 dark:text-sun-300"
          : "border-line bg-surface text-muted hover:border-sun-300 hover:text-sun-600"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z" strokeLinejoin="round" />
      </svg>
      {on ? "Pinned to My Money" : "Pin this calculator"}
    </button>
  );
}
