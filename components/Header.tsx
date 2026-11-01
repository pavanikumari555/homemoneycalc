"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORY_LABELS, ToolCategory, toolsIn } from "@/lib/site";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import QuickSearch from "./QuickSearch";
import MyMoneyLink from "./MyMoneyLink";

const categories = Object.keys(CATEGORY_LABELS) as ToolCategory[];
const MENU_PER_CATEGORY = 5;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="HomeMoney Calc home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 text-sm font-medium sm:gap-2">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-haspopup="true"
              className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-muted transition hover:bg-surface hover:text-ink focus:outline-none"
            >
              <Icon name="menu" className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Calculators</span>
              <svg
                viewBox="0 0 20 20"
                className={`hidden h-4 w-4 transition-transform duration-200 sm:block ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </svg>
            </button>

            {isOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/20 sm:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
            )}

            {isOpen && (
              <div
                role="menu"
                className="fixed left-3 right-3 top-16 z-50 max-h-[82vh] overflow-y-auto rounded-2xl border border-line bg-surface p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[600px] sm:max-h-none sm:overflow-visible sm:p-6 sm:shadow-lift"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {categories.map((cat) => (
                    <div key={cat}>
                      <div className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted">
                        {CATEGORY_LABELS[cat]}
                      </div>
                      <ul>
                        {toolsIn(cat)
                          .slice(0, MENU_PER_CATEGORY)
                          .map((t) => (
                            <li key={t.slug}>
                              <Link
                                href={`/${t.slug}/`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-ink transition hover:bg-surface-2"
                              >
                                <span className="grid h-7 w-7 place-items-center rounded-lg bg-ivy-50 text-ivy-700 dark:bg-ivy-900/50 dark:text-ivy-300">
                                  <Icon name={t.icon} className="h-4 w-4" />
                                </span>
                                {t.shortTitle}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <Link
                  href="/calculators/"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2 text-sm font-semibold text-ivy-700 hover:bg-ivy-50 dark:text-ivy-300 dark:hover:bg-ivy-900/30"
                >
                  See all calculators <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/methodology/"
            className="hidden rounded-xl px-3 py-2 text-muted transition hover:bg-surface hover:text-ink xl:block"
          >
            How we calculate
          </Link>

          <MyMoneyLink />
          <QuickSearch />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
