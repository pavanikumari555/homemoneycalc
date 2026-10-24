// ============================================================================
// DAILY SEO AGENT — GitHub Actions roz chalata hai (.github/workflows/seo-daily.yml).
// 1. Data laata hai (Search Console, GA4, PageSpeed) + site ki technical jaanch
// 2. Opportunities nikalta hai (position 8-30 keywords, roadmap deadlines)
// 3. Claude se Hinglish summary + aaj ke kaam
// 4. data/reports/YYYY-MM-DD.json likhta hai -> admin panel (/admin/) me dikhta hai
// Local run: npm run build && node scripts/agent/daily.mjs
// ============================================================================
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { searchConsole, analytics, pageSpeed } from "./google.mjs";
import { auditSite } from "./audit.mjs";
import { summarize } from "./summarize.mjs";

const SITE_URL = "https://calcivy.com";
const REPORTS = "data/reports";
const today = new Date().toISOString().slice(0, 10);
const env = process.env;

const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback);
const pct = (now, before) => (before > 0 ? Math.round(((now - before) / before) * 100) : null);

async function safely(name, fn, notes) {
  try {
    return await fn();
  } catch (e) {
    notes.push(`${name} failed: ${String(e.message ?? e).slice(0, 200)}`);
    return { connected: false, error: true };
  }
}

async function main() {
  const notes = [];
  mkdirSync(REPORTS, { recursive: true });

  const [gsc, ga4, psi] = await Promise.all([
    safely("Search Console", () => searchConsole({ saJson: env.GOOGLE_SA_JSON, site: env.GSC_SITE || "sc-domain:calcivy.com" }), notes),
    safely("GA4", () => analytics({ saJson: env.GOOGLE_SA_JSON, propertyId: env.GA4_PROPERTY_ID }), notes),
    safely(
      "PageSpeed",
      () => pageSpeed({ apiKey: env.PSI_API_KEY, urls: [`${SITE_URL}/`, `${SITE_URL}/paycheck-calculator/`, `${SITE_URL}/mortgage-payoff-calculator/`] }),
      notes
    ),
  ]);
  const health = auditSite("out", SITE_URL);

  // --- Opportunities: queries on page 1-3 with real impressions (best ROI for a new site)
  const opportunities = (gsc.queryPage ?? [])
    .filter((r) => r.position >= 8 && r.position <= 30 && r.impressions >= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15)
    .map((r) => ({
      query: r.query,
      page: r.page.replace(SITE_URL, ""),
      position: r.position,
      impressions: r.impressions,
      clicks: r.clicks,
      action: r.position < 15 ? "Title/intro me keyword clear karo + FAQ add karo" : "Section add karo jo is sawaal ka seedha jawab de",
    }));
  // Pages with impressions but almost no clicks = title/description not compelling
  const lowCtr = (gsc.topPages ?? [])
    .filter((p) => p.impressions >= 200 && p.ctr < 0.01)
    .map((p) => ({ page: p.page.replace(SITE_URL, ""), impressions: p.impressions, ctr: p.ctr }));

  // --- Roadmap + growth checklist
  const roadmap = readJson("data/roadmap.json", { tools: [] });
  const planned = roadmap.tools.filter((t) => t.status !== "live");
  const overdue = planned.filter((t) => t.targetDate < today && t.status === "planned");
  const dueSoon = planned.filter((t) => t.targetDate >= today).slice(0, 3);
  const growth = readJson("data/growth-tasks.json", { tasks: [] });
  const launch = env.SITE_LAUNCH_DATE; // YYYY-MM-DD the site went live (week 1)
  const week = launch ? Math.max(1, Math.floor((Date.parse(today) - Date.parse(launch)) / (7 * 86_400_000)) + 1) : 1;
  const thisWeek = growth.tasks.filter((t) => !t.done && t.week <= week).slice(0, 5);

  // --- Previous report for trend lines
  const previousFiles = readdirSync(REPORTS).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f !== `${today}.json`).sort();
  const previous = previousFiles.length ? readJson(`${REPORTS}/${previousFiles[previousFiles.length - 1]}`, null) : null;

  const kpis = {
    clicks: gsc.totals?.clicks ?? null,
    impressions: gsc.totals?.impressions ?? null,
    ctr: gsc.totals?.ctr ?? null,
    position: gsc.totals?.position ?? null,
    clicksChange: gsc.connected ? pct(gsc.totals.clicks, gsc.previous.clicks) : null,
    impressionsChange: gsc.connected ? pct(gsc.totals.impressions, gsc.previous.impressions) : null,
    sessions: ga4.current?.sessions ?? null,
    sessionsChange: ga4.connected ? pct(ga4.current.sessions, ga4.previous.sessions) : null,
    usShare: ga4.connected && ga4.current.sessions ? Math.round((ga4.current.usSessions / ga4.current.sessions) * 100) : null,
    pageviews: ga4.current?.views ?? null,
  };

  const report = {
    date: today,
    generatedAt: new Date().toISOString(),
    sources: { gsc: Boolean(gsc.connected), ga4: Boolean(ga4.connected), psi: Boolean(psi.connected), ai: false },
    kpis,
    trend: gsc.daily ?? [],
    topQueries: (gsc.topQueries ?? []).slice(0, 15),
    topPages: (gsc.topPages ?? []).slice(0, 15).map((p) => ({ ...p, page: p.page.replace(SITE_URL, "") || "/" })),
    opportunities,
    lowCtr,
    speed: psi.results ?? [],
    health: health.ran ? { pageCount: health.pageCount, errors: health.errors, warnings: health.warnings, issues: health.issues } : { pageCount: 0, errors: 0, warnings: 0, issues: [], note: health.reason },
    roadmap: { live: roadmap.tools.length - planned.length, planned: planned.length, overdue, dueSoon },
    growth: { week, thisWeek },
    // Earning goals (Google ad networks are closed to the owner — see docs/MONETIZATION.md).
    // metric = which number the admin panel compares.
    milestones: {
      first100: { target: 100, metric: "revenueMonth", label: "First $100 month (affiliates + templates)" },
      k1: { target: 1000, metric: "revenueMonth", label: "$1,000 month" },
      goal: { target: 5000, metric: "revenueMonth", label: "$5,000 month (goal)" },
    },
    previousDate: previous?.date ?? null,
    notes,
  };

  const ai = await safely("AI summary", () => summarize(report), notes);
  report.ai = ai && !ai.error ? ai : null;
  report.sources.ai = Boolean(report.ai && report.ai.by !== "rules");

  writeFileSync(`${REPORTS}/${today}.json`, JSON.stringify(report, null, 2) + "\n");
  console.log(`✓ Report written: ${REPORTS}/${today}.json`);
  console.log(`  ${report.ai?.headline ?? ""}`);
  if (notes.length) console.log(`  Notes:\n  - ${notes.join("\n  - ")}`);

  // Optional: short Telegram ping (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && report.ai) {
    const text = `📊 CalcIvy ${today}\n${report.ai.headline}\n\n${report.ai.youDo.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    }).catch(() => {});
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
