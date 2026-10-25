import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SITE, TOOLS, QUEUED_TOOLS, BUILD_DATE } from "@/lib/site";
import AdminTrend from "./AdminTrend";
import { GrowthIdeas, SeoRoutine } from "./Growth";

// ============================================================================
// ADMIN PANEL — owner ka roz ka dashboard. Simple rakha hai: upar "aaj kya karna hai",
// phir launch checklist, publish calendar, traffic, kamai, hafte ka kaam.
// Baaki technical cheezein neeche "Aur detail" me band. Build time pe data/ se banta hai:
//   data/reports/*.json (daily agent) · data/priorities.json · data/offers.json
//   data/roadmap.json · data/growth-tasks.json · data/revenue.json
// PRIVATE: Cloudflare Access se lock (docs/SETUP-AGENT.md, Step 6).
// ============================================================================

export const metadata: Metadata = {
  title: "Admin — HomeMoney Calc",
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
const niceDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const daysUntil = (d: string) => Math.round((Date.parse(`${d}T00:00:00Z`) - Date.parse(`${BUILD_DATE}T00:00:00Z`)) / 86_400_000);

/** Ek section: emoji title + ek line "ye kya hai" — taaki bina technical jaankari ke samajh aaye. */
function Section({ title, hint, children, className = "" }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {hint && <p className="mb-3 mt-0.5 text-sm text-muted">{hint}</p>}
      {children}
    </section>
  );
}

function Kpi({ label, value, delta, hint }: { label: string; value: string; delta?: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-4">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{value}</div>
      <div className="mt-0.5 text-xs text-muted">
        {delta} {hint}
      </div>
    </div>
  );
}

const Tick = ({ on }: { on: boolean }) => (
  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold ${on ? "bg-ivy-500 text-white" : "border border-line text-muted"}`}>{on ? "✓" : ""}</span>
);

const STATUS: Record<string, { label: string; cls: string }> = {
  done: { label: "Ho gaya", cls: "bg-ivy-100 text-ivy-700 dark:bg-ivy-900/40 dark:text-ivy-300" },
  doing: { label: "Chal raha", cls: "bg-sun-100 text-sun-700" },
  you: { label: "Aapka kaam", cls: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300" },
  todo: { label: "Baad me", cls: "bg-surface-2 text-muted" },
};

export default function AdminPage() {
  // Public site build me admin bilkul nahi banta (data leak nahi ho sakta).
  // Sirf alag, Cloudflare Access se locked "admin" Pages project BUILD_ADMIN=1 ke saath ise banata hai.
  if (process.env.NODE_ENV === "production" && process.env.BUILD_ADMIN !== "1") notFound();
  const reports = loadReports();
  const r = reports[reports.length - 1];
  const roadmap = read("roadmap.json", { tools: [] });
  const growth = read("growth-tasks.json", { tasks: [] });
  const revenue = read("revenue.json", { goalMonthly: 5000, months: [] });
  const priorities = read("priorities.json", { items: [] });
  const offers: Json[] = read("offers.json", { offers: [] }).offers;
  const security: Json[] = read("security-checklist.json", { items: [] }).items;
  const issueUrl = SITE.repo
    ? `${SITE.repo}/issues/new?labels=owner-request&title=${encodeURIComponent("Problem: ")}&body=${encodeURIComponent("@claude\n\nKya problem hai (page link + kya dikh raha hai):\n")}`
    : "";

  const ideas = r?.ideas;
  const lastRevenue = revenue.months[revenue.months.length - 1];
  const revenuePct = lastRevenue ? Math.min(100, Math.round((lastRevenue.total / revenue.goalMonthly) * 100)) : 0;
  const liveOffers = offers.filter((o) => /^https:\/\//.test(o.url));
  const recent = TOOLS.filter((t) => daysUntil(t.added) >= -30 && daysUntil(t.added) <= 0).sort((a, b) => b.added.localeCompare(a.added));

  // Launch checklist — jo cheezein code khud check kar sakta hai, wo apne aap tick hoti hain
  const launch: { task: string; done: boolean; where: string }[] = [
    { task: "GitHub repo (private) + lib/site.ts me repo link", done: Boolean(SITE.repo), where: "Claude ko GitHub account do" },
    { task: "Domain HomeMoneyCalc.com + Cloudflare Pages par site live", done: Boolean(r?.sources?.gsc), where: "Namecheap → Cloudflare (docs/SETUP-AGENT.md)" },
    { task: "Google Search Console connect + sitemap submit", done: Boolean(r?.sources?.gsc), where: "search.google.com/search-console" },
    { task: "Bing Webmaster connect (API key)", done: Boolean(r?.sources?.bing), where: "bing.com/webmasters → Settings → API access" },
    { task: "Google Analytics (GA4) connect", done: Boolean(r?.sources?.ga4), where: "analytics.google.com" },
    { task: "AI summary key (free Gemini ya Groq)", done: Boolean(r?.sources?.ai), where: "aistudio.google.com → GitHub secret GEMINI_API_KEY" },
    { task: "Pehla affiliate/template link data/offers.json me", done: liveOffers.length > 0, where: "Impact / CJ / Payhip approval ke baad" },
  ];
  const launchDone = launch.filter((l) => l.done).length;

  // "Aaj kya karna hai" — max 3, sabse zaroori pehle
  const todayTasks: string[] = (r?.ai?.youDo ?? []).slice(0, 3);
  if (!todayTasks.length) todayTasks.push(...launch.filter((l) => !l.done).slice(0, 3).map((l) => `${l.task} — ${l.where}`));

  return (
    <div className="container-page max-w-5xl py-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Owner dashboard · private</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Namaste 👋</h1>
          <p className="mt-1 text-sm text-muted">
            {r ? `Aaj ki report: ${niceDate(r.date)}` : "Abhi report nahi — site live hone ke baad roz subah 8 baje aayegi."} · {TOOLS.length} tools live
            {QUEUED_TOOLS.length ? ` · ${QUEUED_TOOLS.length} queue me` : ""}
          </p>
        </div>
        {issueUrl ? (
          <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="btn-primary py-2 text-sm">
            Kuch galat dikha? Claude ko batao
          </a>
        ) : null}
      </div>

      {/* 1. AAJ KYA KARNA HAI */}
      <section className="mt-6 rounded-3xl bg-gradient-to-br from-ivy-600 to-ivy-900 p-6 text-white shadow-lift">
        <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Aaj aapka kaam</div>
        {r?.ai?.headline && <h2 className="mt-1 text-xl font-extrabold">{r.ai.headline}</h2>}
        <ol className="mt-3 space-y-2">
          {todayTasks.map((t, i) => (
            <li key={t} className="flex gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-ivy-800">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        {r?.ai?.risks?.length > 0 && (
          <div className="mt-3 rounded-xl bg-red-500/25 p-3 text-sm">
            <strong>⚠ Dhyan do:</strong> {r.ai.risks.join(" · ")}
          </div>
        )}
        {r?.ai?.summary && <p className="mt-3 text-sm text-white/80">{r.ai.summary}</p>}
      </section>

      {/* 2. LAUNCH CHECKLIST (sab ho jaaye to gayab) */}
      {launchDone < launch.length && (
        <Section title={`🚀 Launch checklist — ${launchDone}/${launch.length}`} hint="Site live karne ke ek-baar wale kaam. Har step ki detail docs/SETUP-AGENT.md me. Jo ho jaata hai wo apne aap tick ho jaata hai." className="mt-6">
          <ul className="space-y-2 text-sm">
            {launch.map((l) => (
              <li key={l.task} className="flex items-start gap-3">
                <Tick on={l.done} />
                <span className={l.done ? "text-muted line-through" : "text-ink"}>
                  {l.task} <span className="text-xs text-muted">· {l.where}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 3. PUBLISH CALENDAR */}
      <Section
        title="📅 Publish calendar"
        hint="Naye tools pehle se taiyaar hain. Date aate hi roz subah apne aap live ho jaate hain (aur Bing ko khabar). Aapko kuch nahi karna — rokna ya date badalni ho to Claude ko bolo."
        className="mt-6"
      >
        {QUEUED_TOOLS.length ? (
          <ul className="divide-y divide-line text-sm">
            {QUEUED_TOOLS.map((t) => {
              const d = daysUntil(t.added);
              return (
                <li key={t.slug} className="flex items-center justify-between gap-3 py-2">
                  <span className="font-medium text-ink">{t.title}</span>
                  <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
                    {niceDate(t.added)} · {d === 1 ? "kal" : `${d} din me`}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Queue khaali hai — agla tool Claude se banwao (roadmap: data/roadmap.json).</p>
        )}
        {recent.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            Pichhle 30 din me live: {recent.map((t) => `${t.shortTitle} (${niceDate(t.added)})`).join(", ")}. Search Console → URL Inspection → &quot;Request indexing&quot; ek baar kar do.
          </p>
        )}
      </Section>

      {/* 4. TRAFFIC */}
      <Section title="📈 Traffic (pichhle 28 din)" hint="Google se kitne log aaye. Naye site pe pehle 3–6 mahine dheere badhta hai — ye normal hai." className="mt-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="Google clicks" value={fmt(r?.kpis?.clicks)} delta={change(r?.kpis?.clicksChange)} />
          <Kpi label="Google pe dikhe (impressions)" value={fmt(r?.kpis?.impressions)} delta={change(r?.kpis?.impressionsChange)} />
          <Kpi label="Average position" value={fmt(r?.kpis?.position, 1)} hint="kam = behtar" />
          <Kpi label="Bing clicks" value={fmt(r?.bing?.totals?.clicks)} />
        </div>
        <div className="mt-4">
          {r?.trend?.length ? <AdminTrend points={r.trend} /> : <p className="text-sm text-muted">Search Console connect hone ke baad yahan roz ka graph aayega.</p>}
        </div>
      </Section>

      {/* 5. KAMAI */}
      <Section title="💰 Kamai" hint="Affiliate + templates se. Har mahine ka total data/revenue.json me daalo ya Claude ko bata do." className="mt-6">
        <div className="text-3xl font-extrabold text-ink">
          ${fmt(lastRevenue?.total)} <span className="text-base font-medium text-muted">/ ${fmt(revenue.goalMonthly)} har mahine ka goal</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gradient-to-r from-ivy-500 to-sun-400" style={{ width: `${revenuePct}%` }} />
        </div>
        <div className="mt-4 text-sm font-semibold text-ink">
          Offer links: {liveOffers.length}/{offers.length} chalu
        </div>
        <ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
          {offers.map((o) => (
            <li key={o.id} className="flex items-start gap-2">
              <Tick on={/^https:\/\//.test(o.url)} />
              <span className="text-ink">
                {o.name} <span className="text-xs text-muted">· {o.network}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">Link milte hi Claude ko bhejo (ya data/offers.json me &quot;url&quot; bharo) — box sirf tab dikhta hai jab link ho.</p>
      </Section>

      {/* 6. HAFTE KA KAAM */}
      <SeoRoutine />

      {/* 7. SECURITY */}
      <Section
        title={`🔒 Security — ${security.filter((x) => x.done).length}/${security.length}`}
        hint="Site static hai (koi login/database nahi), isliye hack ka asli raasta sirf aapke accounts hain. 'Aapka kaam' wale khud karo — password ya code kabhi kisi ko (Claude ko bhi) mat dena."
        className="mt-6"
      >
        <ul className="space-y-2 text-sm">
          {security.map((x) => (
            <li key={x.task} className="flex items-start gap-3">
              <Tick on={x.done} />
              <span className="flex-1">
                <span className={x.done ? "text-muted line-through" : "text-ink"}>{x.task}</span>
                <span className="block text-xs text-muted">{x.why}</span>
              </span>
              {!x.done && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${x.who === "you" ? STATUS.you.cls : STATUS.doing.cls}`}>
                  {x.who === "you" ? "Aapka kaam" : "Claude karega"}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* 8. BADA PLAN */}
      <Section title="🗺️ Bada plan (priority order)" hint="Poori site ka plan — kya ho gaya, kya chal raha hai, kya aapke haath me hai." className="mt-6">
        <ol className="space-y-2 text-sm">
          {priorities.items.map((p: Json) => (
            <li key={p.n} className="flex items-start gap-3">
              <span className="w-5 shrink-0 text-right font-bold text-muted">{p.n}</span>
              <span className="flex-1">
                <span className="text-ink">{p.task}</span>
                <span className="block text-xs text-muted">{p.why}</span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[p.status]?.cls ?? ""}`}>{STATUS[p.status]?.label ?? p.status}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 9. AUR DETAIL — technical, zaroorat ho tab kholo */}
      <details className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <summary className="cursor-pointer text-lg font-bold text-ink">🔍 Aur detail (SEO ideas, keywords, site health) — zaroorat ho tab kholo</summary>

        {ideas && <GrowthIdeas ideas={ideas} bing={r?.bing} />}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section title="Page 2–3 wale keywords" hint="Thoda sudhaar ke page 1 pe aa sakte hain.">
            {r?.opportunities?.length ? (
              <ul className="divide-y divide-line text-sm">
                {r.opportunities.map((o: Json) => (
                  <li key={o.query + o.page} className="py-1.5">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-ink">{o.query}</span>
                      <span className="tabular-nums text-muted">#{o.position.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-muted">
                      {o.page} · {o.action}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Search Console ke kuch hafte ke data ke baad.</p>
            )}
          </Section>

          <Section title="Top keywords (Google)">
            {r?.topQueries?.length ? (
              <ul className="divide-y divide-line text-sm">
                {r.topQueries.slice(0, 12).map((q: Json) => (
                  <li key={q.query} className="flex justify-between gap-3 py-1.5">
                    <span className="truncate text-ink">{q.query}</span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {fmt(q.clicks)} clicks · #{q.position.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Abhi data nahi.</p>
            )}
          </Section>

          <Section title={`Site health — ${r?.health?.errors ?? 0} errors, ${r?.health?.warnings ?? 0} warnings`} hint="Technical galtiyan (broken link, lamba title…). Claude theek karta hai.">
            {r?.health?.issues?.length ? (
              <ul className="max-h-72 space-y-1.5 overflow-auto text-sm">
                {r.health.issues.map((i: Json, n: number) => (
                  <li key={n} className="flex gap-2">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i.severity === "error" ? "bg-red-500" : "bg-sun-400"}`} />
                    <span>
                      <span className="font-mono text-xs text-muted">{i.route}</span> — {i.message}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{r?.health?.note ?? (r ? "Koi problem nahi 🎉" : "Daily agent ke saath chalega.")}</p>
            )}
          </Section>

          <Section title="Speed (mobile)">
            {r?.speed?.length ? (
              <ul className="divide-y divide-line text-sm">
                {r.speed.map((s: Json) => (
                  <li key={s.url} className="flex justify-between gap-3 py-1.5">
                    <span className="truncate text-ink">{s.url.replace(SITE.url, "") || "/"}</span>
                    <span className="shrink-0 tabular-nums text-muted">{s.error ? s.error : `${s.score}/100`}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">PSI_API_KEY lagane ke baad.</p>
            )}
          </Section>

          <Section title={`Growth checklist — week ${r?.growth?.week ?? 1}`}>
            <ul className="max-h-80 space-y-2 overflow-auto pr-1 text-sm">
              {[...growth.tasks.filter((t: Json) => !t.done), ...growth.tasks.filter((t: Json) => t.done)].map((t: Json) => (
                <li key={t.task} className="flex items-start gap-2">
                  <Tick on={t.done} />
                  <span className={t.done ? "text-muted line-through" : "text-ink"}>
                    <span className="mr-1 text-xs text-muted">W{t.week}</span>
                    {t.task}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={`Tool roadmap — ${roadmap.tools.filter((t: Json) => t.status !== "live").length} planned`} hint="Kaunsa tool kab (data/roadmap.json).">
            <ul className="max-h-80 divide-y divide-line overflow-auto text-sm">
              {roadmap.tools
                .filter((t: Json) => t.status !== "live")
                .map((t: Json) => (
                  <li key={t.slug} className="flex justify-between gap-3 py-1.5">
                    <span className="text-ink">{t.title}</span>
                    <span className="shrink-0 text-xs text-muted">{t.targetDate}</span>
                  </li>
                ))}
            </ul>
          </Section>
        </div>

        {r?.notes?.length > 0 && (
          <Section title="Agent notes" className="mt-6">
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
              {r.notes.map((n: string) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </Section>
        )}
        <p className="mt-4 text-xs text-muted">
          Reports: {reports.length} · Summary by {r?.ai?.by === "rules" ? "built-in rules (free Gemini key lagao to AI summary)" : (r?.ai?.by ?? "—")}
        </p>
      </details>
    </div>
  );
}
