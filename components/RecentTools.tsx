"use client";

import Link from "next/link";
import { getRecentTools, useStorageValue, NONE } from "@/lib/useToolState";
import { getTool, Tool } from "@/lib/site";
import Icon from "./Icon";

// "Continue where you left off" chips for returning visitors (browser memory only).
export default function RecentTools() {
  const tools = useStorageValue(getRecentTools, NONE)
    .map((slug) => getTool(slug))
    .filter((t): t is Tool => Boolean(t));

  if (!tools.length) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted">Welcome back — continue:</span>
      {tools.map((t) => (
        <Link key={t.slug} href={`/${t.slug}/`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 font-medium text-ink shadow-sm hover:border-ivy-400">
          <Icon name={t.icon} className="h-4 w-4 text-ivy-600" />
          {t.shortTitle}
        </Link>
      ))}
    </div>
  );
}
