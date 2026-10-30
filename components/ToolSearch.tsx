"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { TOOLS } from "@/lib/site";
import { searchTools } from "@/lib/tool-search";
import Icon from "./Icon";

// Home page search: type "car", "salary", "debt"... and jump straight to a tool.
// Matching words come from each tool's `keywords` in lib/site.ts.

export default function ToolSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const matches = useMemo(() => q.trim() ? searchTools(TOOLS, q, 6) : [], [q]);

  return (
    <div className="relative text-left">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (matches[0]) router.push(`/${matches[0].slug}/`);
        }}
      >
        <label htmlFor="tool-search" className="sr-only">
          Search calculators
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lift focus-within:border-ivy-500 focus-within:ring-4 focus-within:ring-ivy-500/15">
          <Icon name="search" className="h-5 w-5 text-muted" />
          <input
            id="tool-search"
            type="search"
            autoComplete="off"
            placeholder="Search: salary, car loan, debt…"
            className="w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </form>
      {q.trim() && (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
          {matches.length ? (
            matches.map((t) => (
              <li key={t.slug}>
                <Link href={`/${t.slug}/`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-ivy-50 text-ivy-700 dark:bg-ivy-900/40 dark:text-ivy-300">
                    <Icon name={t.icon} className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{t.title}</span>
                    <span className="block text-xs text-muted">{t.blurb}</span>
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-muted">No calculator for that yet — browse them all below.</li>
          )}
        </ul>
      )}
    </div>
  );
}
