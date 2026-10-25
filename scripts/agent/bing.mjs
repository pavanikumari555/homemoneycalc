// ============================================================================
// BING WEBMASTER DATA — free API key (Bing Webmaster → Settings → API access).
// Bing + DuckDuckGo + ChatGPT search ka traffic yahin se dikhta hai.
// Key nahi to { connected: false } — agent crash nahi karta. Setup: docs/SETUP-AGENT.md
// ============================================================================
const API = "https://ssl.bing.com/webmaster/api.svc/json";

// Bing dates "/Date(1729814400000-0700)/" format me aati hain
const toDate = (s) => new Date(Number(/\d{10,}/.exec(String(s))?.[0] ?? 0));

async function call(method, { apiKey, site }) {
  const url = `${API}/${method}?siteUrl=${encodeURIComponent(site)}&apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Bing ${method} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).d ?? [];
}

/** Last 28 days clicks/impressions + top queries from Bing Webmaster Tools. */
export async function bingWebmaster({ apiKey, site }) {
  if (!apiKey || !site) return { connected: false };
  const since = Date.now() - 28 * 86_400_000;
  const [traffic, queries] = await Promise.all([call("GetRankAndTrafficStats", { apiKey, site }), call("GetQueryStats", { apiKey, site })]);

  const recent = traffic.filter((r) => toDate(r.Date).getTime() >= since);
  const totals = recent.reduce((a, r) => ({ clicks: a.clicks + (r.Clicks ?? 0), impressions: a.impressions + (r.Impressions ?? 0) }), { clicks: 0, impressions: 0 });

  const byQuery = new Map();
  for (const r of queries.filter((q) => toDate(q.Date).getTime() >= since)) {
    const q = byQuery.get(r.Query) ?? { query: r.Query, clicks: 0, impressions: 0, position: r.AvgImpressionPosition ?? 0 };
    q.clicks += r.Clicks ?? 0;
    q.impressions += r.Impressions ?? 0;
    byQuery.set(r.Query, q);
  }
  return {
    connected: true,
    totals,
    topQueries: [...byQuery.values()].sort((a, b) => b.impressions - a.impressions).slice(0, 15),
  };
}
