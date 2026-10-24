// ============================================================================
// GOOGLE DATA (Search Console, GA4, PageSpeed) — free APIs, service account se.
// Har function credentials na hone pe { connected: false } lautata hai, crash nahi.
// Setup: docs/SETUP-AGENT.md
// ============================================================================
import { createSign } from "node:crypto";

const SCOPES = "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly";

/** Exchange a service-account JSON key for a short-lived OAuth access token (JWT bearer flow). */
async function accessToken(saJson) {
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email,
    scope: SCOPES,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
  });
  if (!res.ok) throw new Error(`Google auth failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);

async function gscQuery(token, site, body) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Search Console ${res.status}: ${await res.text()}`);
  return (await res.json()).rows ?? [];
}

/**
 * Search Console: last 28 days totals, previous 28 days (for change %), daily trend,
 * top queries/pages, and query+page rows used to find ranking opportunities.
 * GSC data runs ~2-3 days behind, so windows end 3 days ago.
 */
export async function searchConsole({ saJson, site }) {
  if (!saJson || !site) return { connected: false };
  const token = await accessToken(saJson);
  const end = daysAgo(3);
  const start = daysAgo(30);
  const prevEnd = daysAgo(31);
  const prevStart = daysAgo(58);
  const range = { startDate: iso(start), endDate: iso(end) };

  const [totals] = await gscQuery(token, site, { ...range });
  const [prev] = await gscQuery(token, site, { startDate: iso(prevStart), endDate: iso(prevEnd) });
  const daily = await gscQuery(token, site, { ...range, dimensions: ["date"] });
  const queries = await gscQuery(token, site, { ...range, dimensions: ["query"], rowLimit: 25 });
  const pages = await gscQuery(token, site, { ...range, dimensions: ["page"], rowLimit: 25 });
  const queryPage = await gscQuery(token, site, { ...range, dimensions: ["query", "page"], rowLimit: 500 });

  const pick = (r) => ({ clicks: r?.clicks ?? 0, impressions: r?.impressions ?? 0, ctr: r?.ctr ?? 0, position: r?.position ?? 0 });
  return {
    connected: true,
    range,
    totals: pick(totals),
    previous: pick(prev),
    daily: daily.map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
    topQueries: queries.map((r) => ({ query: r.keys[0], ...pick(r) })),
    topPages: pages.map((r) => ({ page: r.keys[0], ...pick(r) })),
    queryPage: queryPage.map((r) => ({ query: r.keys[0], page: r.keys[1], ...pick(r) })),
  };
}

/** GA4: sessions, users, views for the last 28 days vs previous 28, plus share of US traffic. */
export async function analytics({ saJson, propertyId }) {
  if (!saJson || !propertyId) return { connected: false };
  const token = await accessToken(saJson);
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      dateRanges: [
        { startDate: "28daysAgo", endDate: "yesterday", name: "current" },
        { startDate: "56daysAgo", endDate: "29daysAgo", name: "previous" },
      ],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }],
      limit: 250,
    }),
  });
  if (!res.ok) throw new Error(`GA4 ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const sum = { current: { sessions: 0, users: 0, views: 0, usSessions: 0 }, previous: { sessions: 0, users: 0, views: 0, usSessions: 0 } };
  for (const row of data.rows ?? []) {
    const country = row.dimensionValues[0].value;
    const period = row.dimensionValues[1]?.value === "previous" ? "previous" : "current";
    const [s, u, v] = row.metricValues.map((m) => Number(m.value));
    sum[period].sessions += s;
    sum[period].users += u;
    sum[period].views += v;
    if (country === "United States") sum[period].usSessions += s;
  }
  return { connected: true, ...sum };
}

/** PageSpeed Insights (mobile) for a few key pages: performance score + Core Web Vitals lab data. */
export async function pageSpeed({ apiKey, urls }) {
  if (!apiKey) return { connected: false };
  const results = [];
  for (const url of urls) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${apiKey}`
      );
      if (!res.ok) throw new Error(String(res.status));
      const lh = (await res.json()).lighthouseResult;
      results.push({
        url,
        score: Math.round((lh.categories.performance.score ?? 0) * 100),
        lcp: lh.audits["largest-contentful-paint"]?.displayValue,
        cls: lh.audits["cumulative-layout-shift"]?.displayValue,
        tbt: lh.audits["total-blocking-time"]?.displayValue,
      });
    } catch (e) {
      results.push({ url, error: String(e.message ?? e) });
    }
  }
  return { connected: true, results };
}
