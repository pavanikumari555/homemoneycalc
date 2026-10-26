// Existing edge statistics only: no browser beacon, cookie, fingerprint or visitor identifiers.
// These counters include bots/assets and MUST NOT be called people, sessions or ad impressions.
export async function edgeAnalytics({ token, zoneId, today = new Date().toISOString().slice(0, 10) }, fetcher = fetch) {
  const note = "Cloudflare edge HTTP counters can include bots, assets, subdomains and blocked requests. They are not human visitors, GA4 sessions or AdSense impressions.";
  if (!token || !zoneId) return { connected: false, status: "needs-read-only-connection", note };
  if (!/^[a-f0-9]{32}$/i.test(zoneId)) return { connected: false, status: "invalid-zone-id", note };
  const start = new Date(`${today}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 28);
  try {
    const response = await fetcher("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(15_000),
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ query: `query EdgeCounters($zone: string, $start: Date, $end: Date) {
        viewer { zones(filter: {zoneTag: $zone}) { httpRequests1dGroups(limit: 28,
          filter: {date_geq: $start, date_lt: $end}, orderBy: [date_ASC]) {
          dimensions { date } sum { requests pageViews } } } } }`,
        variables: { zone: zoneId, start: start.toISOString().slice(0, 10), end: today } }),
    });
    if (!response.ok) return { connected: false, status: `http-${response.status}`, note };
    const body = await response.json();
    if (body.errors?.length) return { connected: false, status: "api-permission-plan-or-query-error", note };
    const rows = body.data?.viewer?.zones?.[0]?.httpRequests1dGroups;
    if (!Array.isArray(rows)) return { connected: false, status: "missing-dataset", note };
    if (rows.some((r) => !/^\d{4}-\d{2}-\d{2}$/.test(r.dimensions?.date) || !Number.isFinite(r.sum?.requests) || r.sum.requests < 0 || !Number.isFinite(r.sum?.pageViews) || r.sum.pageViews < 0)) return { connected: false, status: "invalid-response", note };
    return { connected: true, status: "connected", source: "cloudflare-edge", note,
      range: { start: start.toISOString().slice(0, 10), endExclusive: today, timezone: "UTC" },
      daysReturned: rows.length, totals: rows.reduce((s, r) => ({ requests: s.requests + r.sum.requests, htmlPageRequests: s.htmlPageRequests + r.sum.pageViews }), { requests: 0, htmlPageRequests: 0 }) };
  } catch { return { connected: false, status: "network-or-timeout", note }; }
}
