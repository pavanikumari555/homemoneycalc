"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TOOLS } from "@/lib/site";
import { getAllSaved, getFavorites, STORAGE_EVENT } from "@/lib/useToolState";

// Header link to the personal dashboard, with a live count of saved items.
export default function MyMoneyLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getFavorites().length + getAllSaved(TOOLS.map((t) => t.slug)).length);
    update();
    window.addEventListener(STORAGE_EVENT, update);
    return () => window.removeEventListener(STORAGE_EVENT, update);
  }, []);

  return (
    <Link
      href="/my-money/"
      className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-muted transition hover:bg-surface hover:text-ink"
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
