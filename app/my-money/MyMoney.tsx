"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TOOLS, getTool, Tool } from "@/lib/site";
import { getAllSaved, getFavorites, getRecentTools, deleteSaved, planUrl, toggleFavorite, STORAGE_EVENT, ToolValues, Scenario } from "@/lib/useToolState";
import Icon from "@/components/Icon";

// Personal dashboard: pinned tools + every saved plan + recently used — sab ek
// jagah, sirf is browser me. Isse log page ko bookmark karke baar baar aate hain.
export default function MyMoney() {
  const [favs, setFavs] = useState<Tool[]>([]);
  const [recent, setRecent] = useState<Tool[]>([]);
  const [plans, setPlans] = useState<{ tool: string; plan: Scenario<ToolValues> }[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    const toTools = (slugs: string[]) => slugs.map(getTool).filter((t): t is Tool => Boolean(t));
    setFavs(toTools(getFavorites()));
    setRecent(toTools(getRecentTools()));
    setPlans(getAllSaved(TOOLS.map((t) => t.slug)));
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(STORAGE_EVENT, load);
    return () => window.removeEventListener(STORAGE_EVENT, load);
  }, [load]);

  if (!ready) return <div className="h-64" />;

  const empty = !favs.length && !plans.length && !recent.length;

  return (
    <div className="space-y-10">
      {empty && (
        <div className="rounded-3xl border border-dashed border-ivy-300 bg-ivy-50/60 p-8 text-center dark:border-ivy-700 dark:bg-ivy-900/20">
          <div className="text-4xl">🌱</div>
          <h2 className="mt-3 text-xl font-bold text-ink">Your money dashboard is empty — for now</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Open any calculator, then tap <strong>⭐ Pin this calculator</strong> or <strong>Save this plan</strong>. Everything you save
            shows up here, on this device only. Bookmark this page to find your plans anytime.
          </p>
          <Link href="/calculators/" className="btn-primary mt-5">
            Browse calculators <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      )}

      {favs.length > 0 && (
        <section aria-labelledby="pinned-heading">
          <h2 id="pinned-heading" className="mb-3 text-lg font-bold text-ink">
            ⭐ Pinned calculators
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {favs.map((t) => (
              <div key={t.slug} className="group relative rounded-2xl border border-line bg-surface p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <Link href={`/${t.slug}/`} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-ivy-600 text-white">
                    <Icon name={t.icon} />
                  </span>
                  <span className="font-semibold text-ink">{t.shortTitle}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => toggleFavorite(t.slug)}
                  className="absolute right-2 top-2 rounded-md p-1 text-muted opacity-0 transition hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Unpin ${t.shortTitle}`}
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {plans.length > 0 && (
        <section aria-labelledby="plans-heading">
          <h2 id="plans-heading" className="mb-3 text-lg font-bold text-ink">
            Your saved plans <span className="text-sm font-normal text-muted">({plans.length})</span>
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {plans.map(({ tool, plan }) => {
              const t = getTool(tool);
              if (!t) return null;
              return (
                <li key={`${tool}-${plan.id}`} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ivy-50 text-ivy-700 dark:bg-ivy-900/40 dark:text-ivy-300">
                    <Icon name={t.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted">{t.shortTitle}</div>
                    <div className="truncate font-semibold text-ink">{plan.name}</div>
                    {plan.summary && <div className="mt-0.5 text-sm text-ivy-700 dark:text-ivy-300">{plan.summary}</div>}
                    <div className="mt-1 text-xs text-muted">Saved {new Date(plan.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Link href={planUrl(tool, plan.values)} className="text-sm font-semibold text-ivy-600 hover:underline dark:text-ivy-400">
                      Open →
                    </Link>
                    <button type="button" onClick={() => deleteSaved(tool, plan.id)} className="text-xs text-muted hover:text-red-500">
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {recent.length > 0 && (
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="mb-3 text-lg font-bold text-ink">
            Recently used
          </h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((t) => (
              <Link key={t.slug} href={`/${t.slug}/`} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:border-ivy-400">
                <Icon name={t.icon} className="h-4 w-4 text-ivy-600" />
                {t.shortTitle}
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-muted">
        🔒 Everything here lives only in this browser. We never receive it. Clearing your browser data removes it.
      </p>
    </div>
  );
}
