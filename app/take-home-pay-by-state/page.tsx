import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { calcPaycheck } from "@/lib/paycheck";
import { STATES, FEDERAL_2026 } from "@/lib/tax2026";
import { usd0 } from "@/lib/calc";
import { SITE } from "@/lib/site";

// ============================================================================
// DATA STUDY: take-home pay in every state (linkable asset / backlink magnet).
// Numbers build time pe paycheck engine se calculate hote hain — tax data update
// karo, ye page khud update ho jaata hai. Journalists isi table ko cite karte hain.
// ============================================================================

const SALARIES = [50_000, 75_000, 100_000, 150_000];
const UPDATED = "2026-10-24";

export const metadata: Metadata = buildMetadata({
  title: "Take-Home Pay by State 2026: $50k, $75k, $100k, $150k",
  description:
    "How much of a $50k, $75k, $100k or $150k salary you actually keep in each of the 50 states and DC in 2026, after federal, state and payroll taxes.",
  path: "/take-home-pay-by-state/",
});

function netFor(code: string, gross: number) {
  return calcPaycheck({ grossAnnual: gross, payPeriodsPerYear: 26, status: "single", stateCode: code, retirementPercent: 0, otherPretaxAnnual: 0 }).net;
}

const rows = STATES.map((s) => ({ code: s.code, name: s.name, type: s.type, nets: SALARIES.map((g) => netFor(s.code, g)) })).sort(
  (a, b) => b.nets[1] - a.nets[1] || a.name.localeCompare(b.name)
);
const best = rows[0];
const worst = rows[rows.length - 1];
const noTax = rows.filter((r) => r.type === "none").map((r) => r.name);
const gap75 = best.nets[1] - worst.nets[1];

export default function Page() {
  return (
    <div className="container-page py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "Take-home pay by US state, 2026",
            description: "Estimated annual take-home pay for single filers at four salary levels in all 50 states and DC, 2026 tax year.",
            url: `${SITE.url}/take-home-pay-by-state/`,
            dateModified: UPDATED,
            creator: { "@type": "Organization", name: SITE.name, url: SITE.url },
            license: "https://creativecommons.org/licenses/by/4.0/",
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-ivy-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/paycheck-calculator/" className="hover:text-ivy-600">Paycheck</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Take-home pay by state</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Take-home pay by state, 2026</h1>
      <p className="mt-2 max-w-3xl text-lg text-muted">
        The same salary buys a very different paycheck depending on where you work. Here&apos;s what a single filer keeps in every
        state after federal, state and payroll taxes.
      </p>
      <p className="mt-2 text-xs text-muted">
        Updated {new Date(`${UPDATED}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Free to cite with a
        link to this page (CC BY 4.0)
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-ivy-600 to-ivy-800 p-5 text-white shadow-lift">
          <div className="text-xs font-medium uppercase tracking-wider text-white/75">Keeps the most on $75k</div>
          <div className="mt-1 text-2xl font-extrabold">{best.name}</div>
          <div className="text-white/90">{usd0(best.nets[1])} a year</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Keeps the least on $75k</div>
          <div className="mt-1 text-2xl font-extrabold text-ink">{worst.name}</div>
          <div className="text-muted">{usd0(worst.nets[1])} a year</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Gap on the same $75k</div>
          <div className="mt-1 text-2xl font-extrabold text-sun-600 dark:text-sun-300">{usd0(gap75)}</div>
          <div className="text-muted">≈ {usd0(gap75 / 12)} a month</div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm tabular-nums">
          <caption className="px-4 pt-4 text-left text-sm text-muted">
            Annual take-home pay, single filer, standard deduction, no pre-tax deductions. Sorted by the $75,000 column.
          </caption>
          <thead className="text-left text-xs uppercase tracking-wide text-muted">
            <tr className="border-b border-line">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">State</th>
              {SALARIES.map((g) => (
                <th key={g} className="px-4 py-3 text-right">
                  {usd0(g)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={r.code} className="hover:bg-surface-2">
                <td className="px-4 py-2 text-muted">{i + 1}</td>
                <td className="px-4 py-2 font-medium text-ink">
                  {r.name}
                  {r.type === "none" && <span className="ml-2 rounded-full bg-ivy-50 px-2 py-0.5 text-[10px] font-semibold text-ivy-700 dark:bg-ivy-900/40 dark:text-ivy-300">no income tax</span>}
                </td>
                {r.nets.map((n, j) => (
                  <td key={j} className={`px-4 py-2 text-right ${j === 1 ? "font-semibold text-ink" : "text-ink/80"}`}>
                    {usd0(n)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link href="/paycheck-calculator/" className="btn-primary">
          Calculate your own take-home pay →
        </Link>
      </div>

      <article className="prose-content mt-12">
        <h2>What we found</h2>
        <ul>
          <li>
            Workers in the {noTax.length} states without a wage income tax ({noTax.join(", ")}) keep the most, though a few still
            have employee payroll programs such as paid family leave.
          </li>
          <li>
            On a $75,000 salary, the difference between the best and worst state is about <strong>{usd0(gap75)} a year</strong>.
          </li>
          <li>The gap widens at higher salaries, because states with graduated brackets tax each extra dollar at a higher rate.</li>
        </ul>

        <h2>How we calculated this</h2>
        <p>
          Each figure is gross salary minus 2026 federal income tax (standard deduction of {usd0(FEDERAL_2026.stdDeduction.single)}{" "}
          for single filers), Social Security (6.2% up to {usd0(FEDERAL_2026.socialSecurity.wageBase)}), Medicare (1.45%), the
          state&apos;s income tax using its published brackets, deductions and credits, and employee-paid state payroll taxes such as
          disability and paid-leave insurance. Local and city income taxes are not included, which matters most in Maryland, New
          York City, Pennsylvania, Ohio and Michigan cities. Full details are on our <Link href="/methodology/">methodology page</Link>.
        </p>

        <h2>Using this data</h2>
        <p>
          Journalists, teachers and bloggers are welcome to use these figures. Please credit &ldquo;CalcIvy&rdquo; with a link to this
          page. Need a different salary or filing status? Use the <Link href="/paycheck-calculator/">paycheck calculator</Link> and
          its &ldquo;Same salary, other states&rdquo; ranking.
        </p>
      </article>
    </div>
  );
}
