import Link from "next/link";
import type { Metadata } from "next";
import { TOOLS, CATEGORY_LABELS, ToolCategory, toolsIn } from "@/lib/site";
import ToolCard from "@/components/ToolCard";
import { buildMetadata } from "@/lib/seo";
import { SiteSchema } from "@/components/StructuredData";
import Icon, { AnyIcon } from "@/components/Icon";
import ToolSearch from "@/components/ToolSearch";
import RecentTools from "@/components/RecentTools";
import HeroDemo from "@/components/home/HeroDemo";

export const metadata: Metadata = buildMetadata({
  title: "Free Money Calculators: Paycheck, Mortgage & Debt",
  description:
    "Free US money calculators with charts and plain-English answers: take-home pay in all 50 states, mortgage payoff, debt snowball, car loans and more.",
  path: "/",
  keywords: ["financial calculators", "paycheck calculator", "mortgage payoff calculator", "debt payoff calculator", "credit card payoff calculator"],
});

const categories = Object.keys(CATEGORY_LABELS) as ToolCategory[];
// Home stays the same size however many tools we add; the rest live on /calculators/.
const HOME_PER_CATEGORY = 6;

const POPULAR = ["paycheck-calculator", "mortgage-payoff-calculator", "debt-payoff-calculator", "credit-card-payoff-calculator"];

const TRUST = ["100% free", "No sign-up", "Numbers stay on your device", "2026 tax data"];

const STEPS: { icon: AnyIcon; title: string; text: string }[] = [
  { icon: "search", title: "Pick a calculator", text: "Paycheck, mortgage, debt, savings… search or browse below." },
  { icon: "wallet", title: "Type your numbers", text: "Results update instantly as you type — no “calculate” button." },
  { icon: "chart", title: "See your plan", text: "A clear answer, a chart and the exact date — in plain English." },
];

const FEATURES: { icon: AnyIcon; title: string; text: string; demo: React.ReactNode }[] = [
  {
    icon: "chart",
    title: "Charts, not just numbers",
    text: "See how your balance falls or your savings grow, year by year.",
    demo: (
      <svg viewBox="0 0 120 44" className="h-11 w-full" aria-hidden="true">
        <path d="M2 6 C30 10 50 22 70 32 S105 41 118 42" fill="none" stroke="#97a89e" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M2 6 C25 14 45 30 62 42" fill="none" stroke="#2a6a44" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    icon: "spark",
    title: "Your date, in plain English",
    text: "“Debt-free by March 2029 — $8,412 less interest.” Easy to remember.",
    demo: <div className="rounded-lg bg-ivy-600 px-3 py-2 text-sm font-bold text-white">Debt-free: March 2029 🎉</div>,
  },
  {
    icon: "share",
    title: "Share with one link",
    text: "Send your exact numbers to a partner — the link opens with them filled in.",
    demo: <div className="truncate rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-xs text-muted">homemoneycalc.com/debt-payoff…?x=250</div>,
  },
  {
    icon: "bookmark",
    title: "Save & compare plans",
    text: "Save “Pay $300 extra” and “Pay $500 extra” and flip between them.",
    demo: (
      <div className="flex gap-1.5">
        <span className="rounded-full border border-ivy-300 bg-ivy-50 px-2.5 py-1 text-xs font-semibold text-ivy-700 dark:border-ivy-700 dark:bg-ivy-900/40 dark:text-ivy-300">+$300/mo</span>
        <span className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted">+$500/mo</span>
      </div>
    ),
  },
  {
    icon: "printer",
    title: "Print or download",
    text: "Print a clean summary, save it as PDF, or download the schedule as CSV.",
    demo: (
      <div className="flex gap-1.5 text-xs font-semibold text-muted">
        <span className="rounded-md border border-line px-2 py-1">PDF</span>
        <span className="rounded-md border border-line px-2 py-1">CSV</span>
        <span className="rounded-md border border-line px-2 py-1">Print</span>
      </div>
    ),
  },
  {
    icon: "shield",
    title: "Private by design",
    text: "Everything runs in your browser. We never see what you type.",
    demo: (
      <div className="flex items-center gap-2 text-xs font-semibold text-ivy-700 dark:text-ivy-300">
        <Icon name="check" className="h-4 w-4" /> No account · No data sent
      </div>
    ),
  },
];

const STATS = [
  { value: `${TOOLS.length}`, label: "free calculators" },
  { value: "51", label: "state tax systems (50 + DC)" },
  { value: "0", label: "sign-ups needed" },
  { value: "100%", label: "runs in your browser" },
];

export default function HomePage() {
  return (
    <>
      <SiteSchema />

      {/* HERO — headline + search on the left, live demo on the right */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {/* Soft glow via radial gradients — looks like a blur but costs nothing to paint */}
          <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_20%_0%,rgb(185_219_195/0.55),transparent_70%),radial-gradient(35%_40%_at_95%_25%,rgb(255_244_214/0.8),transparent_70%)] dark:bg-[radial-gradient(60%_55%_at_20%_0%,rgb(29_68_48/0.35),transparent_70%),radial-gradient(35%_40%_at_95%_25%,rgb(196_124_0/0.08),transparent_70%)]" />
        </div>
        <div className="container-page grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-semibold text-muted shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ivy-500" /> Updated for the 2026 tax year
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Free money calculators that show you{" "}
              <span className="bg-gradient-to-r from-ivy-600 to-ivy-400 bg-clip-text text-transparent dark:from-ivy-300 dark:to-sun-300">
                the whole picture
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Find your real take-home pay, the date you&apos;ll be debt-free, or how much an extra payment saves — with a chart and
              a plain-English answer in seconds.
            </p>

            <div className="mt-7 max-w-xl">
              <ToolSearch />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Popular:</span>
              {POPULAR.map((slug) => {
                const t = TOOLS.find((x) => x.slug === slug)!;
                return (
                  <Link key={slug} href={`/${slug}/`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 font-medium text-ink shadow-sm transition hover:border-ivy-400 hover:text-ivy-700 dark:hover:text-ivy-300">
                    <Icon name={t.icon} className="h-4 w-4 text-ivy-600 dark:text-ivy-400" />
                    {t.shortTitle}
                  </Link>
                );
              })}
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-ink/80">
              {TRUST.map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-ivy-100 text-ivy-700 dark:bg-ivy-900/50 dark:text-ivy-300">
                    <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <RecentTools />
          </div>

          <HeroDemo />
        </div>
      </section>

      {/* HOW IT WORKS — 3 steps */}
      <section className="border-y border-line bg-surface" aria-labelledby="how-heading">
        <div className="container-page py-12">
          <h2 id="how-heading" className="text-center text-sm font-semibold uppercase tracking-wider text-muted">
            How it works
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-4 sm:flex-col sm:items-center sm:text-center">
                {i < STEPS.length - 1 && (
                  <span aria-hidden="true" className="absolute left-[calc(50%+40px)] top-7 hidden h-px w-[calc(100%-80px)] border-t-2 border-dashed border-line sm:block" />
                )}
                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ivy-50 text-ivy-700 dark:bg-ivy-900/40 dark:text-ivy-300">
                  <Icon name={s.icon} className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ivy-600 text-xs font-bold text-white">{i + 1}</span>
                </span>
                <div>
                  <h3 className="font-bold text-ink">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="container-page">
        {/* TOOLS — each card shows a real example result */}
        <section id="all-tools" aria-labelledby="tools-heading" className="mt-16">
          <div className="max-w-2xl">
            <h2 id="tools-heading" className="text-3xl font-extrabold tracking-tight text-ink">
              Pick your calculator
            </h2>
            <p className="mt-2 text-muted">Every card shows a real example of the answer you&apos;ll get.</p>
          </div>

          <div className="mt-8 space-y-10">
            {categories.map((cat) => {
              const tools = toolsIn(cat);
              if (!tools.length) return null;
              return (
                <div key={cat}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">{CATEGORY_LABELS[cat]}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.slice(0, HOME_PER_CATEGORY).map((t) => (
                      <ToolCard key={t.slug} tool={t} />
                    ))}
                  </div>
                  {tools.length > HOME_PER_CATEGORY && (
                    <Link href={`/calculators/#${cat}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ivy-600 hover:underline dark:text-ivy-400">
                      See all {tools.length} {CATEGORY_LABELS[cat].toLowerCase()} calculators <Icon name="arrow" className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* WHAT YOU GET — feature showcase with mini visuals */}
        <section className="mt-24" aria-labelledby="features-heading">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="features-heading" className="text-3xl font-extrabold tracking-tight text-ink">
              Every calculator comes with
            </h2>
            <p className="mt-2 text-muted">The things other calculator sites leave out.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
                <div className="flex h-14 items-center">{f.demo}</div>
                <div className="mt-4 flex items-center gap-2">
                  <Icon name={f.icon} className="h-5 w-5 text-ivy-600 dark:text-ivy-400" />
                  <h3 className="font-bold text-ink">{f.title}</h3>
                </div>
                <p className="mt-1.5 text-sm text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STATS BAND */}
        <section className="mt-20 overflow-hidden rounded-3xl bg-gradient-to-br from-ivy-700 via-ivy-800 to-ivy-950 px-6 py-10 text-white shadow-lift sm:px-10" aria-label="HomeMoney Calc in numbers">
          <div className="grid gap-8 text-center sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-extrabold tracking-tight">{s.value}</div>
                <div className="mt-1 text-sm text-white/75">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <p className="text-lg font-semibold">Ready to see your numbers?</p>
            <Link href="/paycheck-calculator/" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-ivy-800 shadow-sm transition hover:bg-ivy-50">
              Start with your paycheck <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* SEO content - real, useful text (not thin) */}
        <section className="prose-content mt-20">
          <h2>Calculators that explain the answer</h2>
          <p>
            Most calculators give you one number and leave you to work out what it means. HomeMoney Calc shows the whole picture: when
            you&apos;ll be debt-free, how much interest an extra payment saves, where every dollar of your paycheck goes. Results update
            as you type, and you can drag a slider to try &ldquo;what if I paid $100 more?&rdquo; in a second.
          </p>
          <p>
            Every tool runs entirely in your browser, so the numbers you enter never leave your device. If you come back later on
            the same device, your last numbers are waiting for you. Save several plans, print a summary, or share a link that opens
            with your exact figures.
          </p>
          <h2>How we keep the numbers right</h2>
          <p>
            Our loan tools use the standard amortization formula lenders use, run month by month. The paycheck calculator applies
            the 2026 federal brackets, Social Security and Medicare rules and each state&apos;s published income tax rates. Every page
            lists its sources and assumptions, and our <Link href="/methodology/">methodology</Link> explains the math in plain
            English.
          </p>
          <p>
            Results are estimates for planning and learning — not financial advice. For decisions that matter, confirm with your
            lender, employer or a qualified professional. See our <Link href="/disclaimer/">disclaimer</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
