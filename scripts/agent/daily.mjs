// ============================================================================
// DAILY SEO AGENT — GitHub Actions roz chalata hai (.github/workflows/seo-daily.yml).
// 1. Data laata hai (Search Console, GA4, PageSpeed) + site ki technical jaanch
// 2. Opportunities nikalta hai (position 8-30 keywords, roadmap deadlines) + growth ideas
//    (CTR title tests, refresh, seasonal alerts, keyword gap, outreach drafts, Pinterest/Shorts)
// 3. Claude se Hinglish summary + aaj ke kaam
// 4. data/reports/YYYY-MM-DD.json likhta hai -> admin panel (/admin/) me dikhta hai
// Local run: npm run build && node scripts/agent/daily.mjs
// ============================================================================
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { searchConsole, analytics, pageSpeed } from "./google.mjs";
import { auditSite } from "./audit.mjs";
import { summarize } from "./summarize.mjs";
import { bingWebmaster } from "./bing.mjs";
import { growthIdeas, readTools } from "./ideas.mjs";
import { roadmapSummary } from "./roadmap.mjs";
import { adsenseReadiness, actionPlan } from "./advisor.mjs";
import { qualityChecks } from "./quality.mjs";
import { liveChecks } from "./live.mjs";
import { securityChecks } from "./security.mjs";
import { observeSources } from "./research.mjs";
import { proposalQueue } from "./proposals.mjs";
import { evaluateExperiments } from "./experiments.mjs";
import { edgeAnalytics } from "./cloudflare.mjs";

const SITE_URL = "https://homemoneycalc.com";
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

  const [gsc, ga4, psi, bing, edge] = await Promise.all([
    safely("Search Console", () => searchConsole({ saJson: env.GOOGLE_SA_JSON, site: env.GSC_SITE || "sc-domain:homemoneycalc.com" }), notes),
    safely("GA4", () => analytics({ saJson: env.GOOGLE_SA_JSON, propertyId: env.GA4_PROPERTY_ID }), notes),
    safely(
      "PageSpeed",
      () => pageSpeed({ apiKey: env.PSI_API_KEY, urls: [`${SITE_URL}/`, `${SITE_URL}/paycheck-calculator/`, `${SITE_URL}/mortgage-payoff-calculator/`] }),
      notes
    ),
    safely("Bing Webmaster", () => bingWebmaster({ apiKey: env.BING_WEBMASTER_KEY, site: env.BING_SITE || `${SITE_URL}/` }), notes),
    edgeAnalytics({ token: env.CLOUDFLARE_ANALYTICS_TOKEN, zoneId: env.CLOUDFLARE_ZONE_ID, today }),
  ]);
  const health = auditSite("out", SITE_URL);
  const quality = qualityChecks();
  const liveHealth = (await Promise.all([liveChecks(SITE_URL), securityChecks()])).flat();
  const business = readJson("data/business.json", { readiness: { sessions28d: 1000, googleClicks28d: 200, activeSearchDays: 14, searchLandingPages: 3 } });
  const revenue = readJson("data/revenue.json", { goalMonthly: 5000 });

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
  const { live, planned, overdue, dueSoon } = roadmapSummary(roadmap.tools, readTools(), today);
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
    sources: { gsc: Boolean(gsc.connected), ga4: Boolean(ga4.connected), psi: Boolean(psi.connected), bing: Boolean(bing.connected), cloudflare: Boolean(edge.connected), ai: false },
    edge,
    measurement: { ga4: "Optional consenting/unblocked visitor sample; not all traffic", search: "Search Console reported clicks/impressions; independent of analytics consent", edge: "Aggregate HTTP requests, not human visitors or ad impressions" },
    kpis,
    trend: gsc.daily ?? [],
    topQueries: (gsc.topQueries ?? []).slice(0, 15),
    topPages: (gsc.topPages ?? []).slice(0, 15).map((p) => ({ ...p, page: p.page.replace(SITE_URL, "") || "/" })),
    opportunities,
    lowCtr,
    bing: bing.connected ? { totals: bing.totals, topQueries: bing.topQueries } : null,
    ideas: (() => {
      try {
        return growthIdeas({ gsc, siteUrl: SITE_URL, siteName: "HomeMoney Calc", today });
      } catch (e) {
        notes.push(`Growth ideas failed: ${String(e.message ?? e).slice(0, 200)}`);
        return null;
      }
    })(),
    speed: psi.results ?? [],
    health: health.ran ? { ran: true, pageCount: health.pageCount, errors: health.errors, warnings: health.warnings, issues: health.issues, coverage: health.coverage } : { ran: false, pageCount: 0, errors: null, warnings: null, issues: [], note: health.reason },
    quality,
    liveChecks: liveHealth,
    business: { goalMonthly: revenue.goalMonthly, goalIsEstimate: true, waitForTrafficBeforeAdsense: true },
    roadmap: { live, planned, overdue, dueSoon },
    growth: { week, thisWeek },
    // Earning goals: AdSense, affiliates, templates and sponsors (docs/MONETIZATION.md).
    // metric = which number the admin panel compares.
    milestones: {
      first100: { target: 100, metric: "revenueMonth", label: "First $100 month (affiliates + templates)" },
      k1: { target: 1000, metric: "revenueMonth", label: "$1,000 month" },
      goal: { target: revenue.goalMonthly, metric: "revenueMonth", label: "Adjustable monthly goal (estimate, not a ceiling)" },
    },
    previousDate: previous?.date ?? null,
    notes,
  };
  report.adsenseReadiness = adsenseReadiness(report, business, today);
  report.actions = actionPlan(report, business, today);

  // Research is bounded, cached weekly, robots-aware, and read-only.
  report.research = await observeSources(readJson("data/research-sources.json", { sources: [] }), readJson("data/research-observations.json", { observations: [] }));
  writeFileSync("data/research-observations.json", `${JSON.stringify(report.research, null, 2)}\n`);
  const decisions = readJson("data/agent-decisions.json", { decisions: [] });
  const queue = proposalQueue(report, readTools(), readJson("data/agent-proposals.json", { proposals: [] }), today, decisions);
  writeFileSync("data/agent-proposals.json", `${JSON.stringify(queue, null, 2)}\n`);
  report.approvals = { pending: queue.proposals.filter((p) => !decisions.decisions.some((d) => d.id === p.id)).length, automaticPublication: false };
  report.experiments = evaluateExperiments(decisions, report, today);
  report.actions = actionPlan(report, business, today);

  const ai = await safely("AI summary", () => summarize(report), notes);
  report.ai = ai && !ai.error ? ai : null;
  report.sources.ai = Boolean(report.ai && report.ai.by !== "rules");

  writeFileSync(`${REPORTS}/${today}.json`, JSON.stringify(report, null, 2) + "\n");
  console.log(`✓ Report written: ${REPORTS}/${today}.json`);
  console.log(`  ${report.ai?.headline ?? ""}`);
  if (notes.length) console.log(`  Notes:\n  - ${notes.join("\n  - ")}`);

  // Optional: short Telegram ping (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && report.ai) {
    const text = `📊 HomeMoney Calc ${today}\n${report.ai.headline}\n\n${report.ai.youDo.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;
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
