import Link from "next/link";
import { CATEGORY_LABELS, ToolCategory, toolsIn } from "@/lib/site";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import QuickSearch from "./QuickSearch";
import MyMoneyLink from "./MyMoneyLink";

const categories = Object.keys(CATEGORY_LABELS) as ToolCategory[];
// Menu stays tidy however many tools we add: top N per category + "All calculators".
const MENU_PER_CATEGORY = 5;

// Sticky header. Calculators menu native <details> se bana (no JS = fast);
// sirf theme toggle client-side hai.
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/95">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="HomeMoney Calc home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 text-sm font-medium sm:gap-2">
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-xl px-3 py-2 text-muted transition hover:bg-surface hover:text-ink marker:content-none [&::-webkit-details-marker]:hidden">
              <Icon name="menu" className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Calculators</span>
              <svg viewBox="0 0 20 20" className="hidden h-4 w-4 transition group-open:rotate-180 sm:block" fill="currentColor" aria-hidden="true">
                <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 w-[min(92vw,640px)] rounded-2xl border border-line bg-surface p-4 shadow-lift sm:-right-24">
              <div className="grid gap-4 sm:grid-cols-2">
                {categories.map((cat) => (
                  <div key={cat}>
                    <div className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      {CATEGORY_LABELS[cat]}
                    </div>
                    <ul>
                      {toolsIn(cat).slice(0, MENU_PER_CATEGORY).map((t) => (
                        <li key={t.slug}>
                          <Link
                            href={`/${t.slug}/`}
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
              <Link href="/calculators/" className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2 text-sm font-semibold text-ivy-700 hover:bg-ivy-50 dark:text-ivy-300 dark:hover:bg-ivy-900/30">
                See all calculators <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </details>
          <Link href="/methodology/" className="hidden rounded-xl px-3 py-2 text-muted transition hover:bg-surface hover:text-ink xl:block">
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
