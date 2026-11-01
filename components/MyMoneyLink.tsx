"use client";

import Link from "next/link";
import { TOOLS } from "@/lib/site";
import { getAllSaved, getFavorites, useStorageValue } from "@/lib/useToolState";

const SLUGS = TOOLS.map((t) => t.slug);
const readCount = () => getFavorites().length + getAllSaved(SLUGS).length;

// Header link to the personal dashboard, with a live count of saved items.
export default function MyMoneyLink() {
  const count = useStorageValue(readCount, 0);

  return (
    <Link
      href="/my-money/"
      aria-label={count > 0 ? `My Money (${count} saved)` : "My Money"}
      className="relative flex items-center gap-1.5 rounded-xl px-2 py-2 text-muted transition hover:bg-surface hover:text-ink sm:px-3"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z" strokeLinejoin="round" />
      </svg>
      <span className="hidden sm:inline">My Money</span>
      {count > 0 && (
        <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-ivy-600 px-1 text-[11px] font-bold text-white">{count}</span>
      )}
    </Link>
  );
}
