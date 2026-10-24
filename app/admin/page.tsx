import type { Metadata } from "next";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SITE, TOOLS } from "@/lib/site";
import AdminTrend from "./AdminTrend";

// ============================================================================
// ADMIN PANEL — owner ka roz ka dashboard. Build time pe data/ folder se banta hai:
//   data/reports/*.json  (daily agent ki reports)
//   data/roadmap.json    (kaunsa tool kab)
//   data/growth-tasks.json, data/revenue.json
// PRIVATE: Cloudflare Access se lock karo (docs/SETUP-AGENT.md, Step 6). Search
// engines ke liye noindex + robots disallow bhi laga hai.
// ============================================================================

export const metadata: Metadata = {
  title: "Admin — CalcIvy",
  robots: { index: false, follow: false },
};

// Report JSON is written by our own agent script (scripts/agent/daily.mjs), so it's typed loosely here.
type Json = any;

const DATA = join(process.cwd(), "data");
const read = (file: string, fallback: Json) => {
  const p = join(DATA, file);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback;
};

function loadReports(): Json[] {
  const dir = join(DATA, "reports");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
}

const fmt = (n: number | null | undefined, digits = 0) =>
  n == null ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: digits });
const change = (n: number | null | undefined) =>
  n == null ? null : <span className={n >= 0 ? "text-ivy-600" : "text-red-500"}>{n >= 0 ? "▲" : "▼"} {Math.abs(n)}%</span>;

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Kpi({ label, value, delta, hint }: { label: string; value: string; delta?: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{value}</div>
      <div className="mt-0.5 text-xs text-muted">
        {delta} {hint}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const reports = loadReports();
  const r = reports[reports.length - 1];
  const roadmap = read("roadmap.json", { tools: [] });
  const growth = read("growth-tasks.json", { tasks: [] });
  const revenue = read("revenue.json", { goalMonthly: 5000, months: [] });
  // Opens a GitHub issue that mentions @claude -> .github/workflows/owner-request.yml fixes it in a PR
  const issueUrl = SITE.repo
    ? `${SITE.repo}/issues/new?labels=owner-request&title=${encodeURIComponent("Problem: ")}&body=${encodeURIComponent("@claude\n\nKya problem hai (page link + kya dikh raha hai):\n")}`
    : "";

  const planned = roadmap.tools.filter((t: Json) => t.status !== "live");
  const today = r?.date ?? new Date().toISOString().slice(0, 10);
  const lastRevenue = revenue.months[revenue.months.length - 1];
  const revenuePct = lastRevenue ? Math.min(100, Math.round((lastRevenue.total / revenue.goalMonthly) * 100)) : 0;
  const sessions = r?.kpis?.sessions ?? 0;

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Owner dashboard · private</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">CalcIvy Admin</h1>
          <p className="mt-1 text-sm text-muted">
            {r ? `Latest report: ${r.date} · ${reports.length} report(s) so far` : "No report yet — the daily agent writes the first one after setup."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {issueUrl ? (
            <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="btn-primary py-2">
              Report a problem to Claude
            </a>
          ) : (
            <span className="rounded-xl border border-dashed border-line px-3 py-2 text-muted">Set SITE.repo in lib/site.ts to enable “Report a problem”</span>
          )}
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="btn-ghost">Search Console</a>
          <a href="https://adsense.google.com" target="_blank" rel="noopener noreferrer" className="btn-ghost">AdSense</a>
        </div>
      </div>

      {/* TODAY */}
      {r?.ai && (
        <section className="mt-6 rounded-3xl bg-gradient-to-br from-ivy-600 to-ivy-900 p-6 text-white shadow-lift">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Aaj ki report · {r.date}</div>
          <h2 className="mt-1 text-2xl font-extrabold">{r.ai.headline}</h2>
          <p className="mt-2 max-w-3xl text-white/90">{r.ai.summary}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm font-bold">✅ Aapke aaj ke kaam</div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-white/90">
                {r.ai.youDo.map((t: string) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm font-bold">🤖 Agent aage karega</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/90">
                {(r.ai.agentNext.length ? r.ai.agentNext : ["Weekly agent next roadmap tool ka draft PR banayega"]).map((t: string) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              {r.ai.risks?.length > 0 && (
                <div className="mt-3 rounded-xl bg-red-500/20 p-3 text-sm">
                  <strong>⚠ Dhyan do:</strong> {r.ai.risks.join(" · ")}
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-white/60">Summary by {r.ai.by === "rules" ? "built-in rules (add ANTHROPIC_API_KEY for AI summaries)" : r.ai.by}</div>
        </section>
      )}

      {/* DATA SOURCES */}
      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {[
          ["Search Console", r?.sources?.gsc],
          ["Google Analytics", r?.sources?.ga4],
          ["PageSpeed", r?.sources?.psi],
          ["AI summary", r?.sources?.ai],
        ].map(([name, on]) => (
          <span key={String(name)} className={`rounded-full border px-3 py-1 font-semibold ${on ? "border-ivy-300 bg-ivy-50 text-ivy-700 dark:border-ivy-700 dark:bg-ivy-900/30 dark:text-ivy-300" : "border-line text-muted"}`}>
            {on ? "●" : "○"} {name} {on ? "connected" : "not connected"}
          </span>
        ))}
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Google clicks (28d)" value={fmt(r?.kpis?.clicks)} delta={change(r?.kpis?.clicksChange)} hint="vs previous 28d" />
        <Kpi label="Impressions (28d)" value={fmt(r?.kpis?.impressions)} delta={change(r?.kpis?.impressionsChange)} />
        <Kpi label="Avg position" value={fmt(r?.kpis?.position, 1)} hint="lower is better" />
        <Kpi label="Sessions (28d)" value={fmt(r?.kpis?.sessions)} delta={change(r?.kpis?.sessionsChange)} hint={r?.kpis?.usShare != null ? `${r.kpis.usShare}% from US` : ""} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Google clicks — daily" className="lg:col-span-2">
          {r?.trend?.length ? <AdminTrend points={r.trend} /> : <p className="text-sm text-muted">Connect Search Console to see the daily trend.</p>}
        </Card>

        <Card title="Earnings goal">
          <div className="text-3xl font-extrabold text-ink">
            ${fmt(lastRevenue?.total)} <span className="text-base font-medium text-muted">/ ${fmt(revenue.goalMonthly)} a month</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-gradient-to-r from-ivy-500 to-sun-400" style={{ width: `${revenuePct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">{lastRevenue ? `${lastRevenue.month}: ads $${fmt(lastRevenue.ads)}, affiliate $${fmt(lastRevenue.affiliate)}` : "Add monthly earnings in data/revenue.json (or tell Claude)."}</p>
          <div className="mt-4 space-y-2">
            {r?.milestones &&
              Object.values(r.milestones).map((m: Json) => {
                const p = Math.min(100, Math.round((sessions / m.target) * 100));
                return (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs text-muted">
                      <span>{m.label}</span>
                      <span>{p}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-ivy-500" style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Ranking opportunities (position 8–30)">
          {r?.opportunities?.length ? (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="pb-2">Keyword</th>
                  <th className="pb-2 text-right">Pos</th>
                  <th className="pb-2 text-right">Impr.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {r.opportunities.map((o: Json) => (
                  <tr key={o.query + o.page}>
                    <td className="py-1.5 pr-2">
                      <div className="font-medium text-ink">{o.query}</div>
                      <div className="text-xs text-muted">{o.page} · {o.action}</div>
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{o.position.toFixed(1)}</td>
                    <td className="py-1.5 text-right tabular-nums">{fmt(o.impressions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted">Appears once Search Console has a few weeks of data.</p>
          )}
        </Card>

        <Card title="Top keywords (28d)">
          {r?.topQueries?.length ? (
            <ul className="divide-y divide-line text-sm">
              {r.topQueries.slice(0, 12).map((q: Json) => (
                <li key={q.query} className="flex justify-between gap-3 py-1.5">
                  <span className="truncate text-ink">{q.query}</span>
                  <span className="shrink-0 tabular-nums text-muted">{fmt(q.clicks)} clicks · #{q.position.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No keyword data yet.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title={`Tool roadmap — ${roadmap.tools.length - planned.length} live, ${planned.length} planned`}>
          <ul className="divide-y divide-line text-sm">
            {planned.slice(0, 12).map((t: Json) => {
              const late = t.status === "planned" && t.targetDate < today;
              return (
                <li key={t.slug} className="flex items-start justify-between gap-3 py-2">
                  <div>
                    <div className="font-medium text-ink">
                      {t.title} <span className="text-xs text-muted">· wave {t.wave}</span>
                    </div>
                    <div className="text-xs text-muted">“{t.primaryKeyword}” · {t.volume} · {t.difficulty}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      t.status === "drafted" ? "bg-sun-100 text-sun-600" : late ? "bg-red-100 text-red-600" : "bg-surface-2 text-muted"
                    }`}
                  >
                    {t.status === "drafted" ? "draft PR" : late ? `late · ${t.targetDate}` : t.targetDate}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted">Full list: data/roadmap.json · live tools: {TOOLS.length}</p>
        </Card>

        <Card title={`Growth checklist — week ${r?.growth?.week ?? 1}`}>
          <ul className="space-y-2 text-sm">
            {growth.tasks.slice(0, 14).map((t: Json) => (
              <li key={t.task} className="flex items-start gap-2">
                <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${t.done ? "border-ivy-500 bg-ivy-500 text-white" : "border-line"}`}>{t.done ? "✓" : ""}</span>
                <span className={t.done ? "text-muted line-through" : "text-ink"}>
                  <span className="mr-1 text-xs text-muted">W{t.week}</span>
                  {t.url ? (
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {t.task}
                    </a>
                  ) : (
                    t.task
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title={`Site health — ${r?.health?.errors ?? 0} errors, ${r?.health?.warnings ?? 0} warnings`}>
          {r?.health?.issues?.length ? (
            <ul className="max-h-72 space-y-1.5 overflow-auto text-sm">
              {r.health.issues.map((i: Json, n: number) => (
                <li key={n} className="flex gap-2">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${i.severity === "error" ? "bg-red-500" : "bg-sun-400"}`} />
                  <span>
                    <span className="font-mono text-xs text-muted">{i.route}</span> — {i.message}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{r?.health?.note ?? (r ? "No problems found 🎉" : "Runs with the daily agent.")}</p>
          )}
        </Card>

        <Card title="Speed (mobile, PageSpeed)">
          {r?.speed?.length ? (
            <ul className="divide-y divide-line text-sm">
              {r.speed.map((s: Json) => (
                <li key={s.url} className="flex justify-between gap-3 py-1.5">
                  <span className="truncate text-ink">{s.url.replace(SITE.url, "") || "/"}</span>
                  <span className="shrink-0 tabular-nums text-muted">{s.error ? s.error : `${s.score}/100 · LCP ${s.lcp} · CLS ${s.cls}`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Add PSI_API_KEY to see real speed scores.</p>
          )}
        </Card>
      </div>

      {r?.notes?.length > 0 && (
        <Card title="Agent notes" className="mt-6">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {r.notes.map((n: string) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Report history" className="mt-6">
        <div className="flex flex-wrap gap-2 text-xs">
          {reports
            .slice(-30)
            .reverse()
            .map((rep) => (
              <span key={rep.date} className="rounded-full border border-line px-2.5 py-1 text-muted" title={rep.ai?.headline}>
                {rep.date}
              </span>
            ))}
          {!reports.length && <span className="text-muted">None yet.</span>}
        </div>
      </Card>
    </div>
  );
}
