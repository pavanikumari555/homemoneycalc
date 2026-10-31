// Read-only Cloudflare browser RUM. Never substitute edge requests for visits.
const ID = /^[a-f0-9]{32}$/i;
const DAY = 86_400_000;
const OFFSET = 330 * 60_000;
export function indiaDays(now = new Date()) {
  const today = new Date(now.getTime() + OFFSET).toISOString().slice(0, 10);
  const midnight = Date.parse(`${today}T00:00:00+05:30`);
  return Array.from({ length: 8 }, (_, i) => {
    const start = midnight - (7 - i) * DAY;
    return { date: new Date(start + OFFSET).toISOString().slice(0, 10), start: new Date(start).toISOString(), end: new Date(i === 7 ? now.getTime() : start + DAY).toISOString(), partial: i === 7 };
  });
}
export async function webAnalytics({ token, accountId, siteId, now = new Date() }, fetcher = fetch) {
  const base = { connected: false, source: "cloudflare-web-analytics", timezone: "Asia/Kolkata", checkedAt: now.toISOString(), note: "Visits are estimated visits, not unique people. Browser blocking and sampling affect coverage; known bots excluded." };
  if (!token || !accountId || !siteId) return { ...base, status: "setup-needed" };
  if (!ID.test(accountId) || !ID.test(siteId)) return { ...base, status: "invalid-configuration" };
  const days = indiaDays(now);
  const filter = (start, end) => `siteTag:${JSON.stringify(siteId)},requestHost:"homemoneycalc.com",bot:0,datetime_geq:${JSON.stringify(start)},datetime_lt:${JSON.stringify(end)}`;
  const daily = days.map((d, i) => `d${i}:rumPageloadEventsAdaptiveGroups(limit:1,filter:{${filter(d.start, d.end)}}){count sum{visits}}`).join("\n");
  const window = filter(days[0].start, days.at(-1).end);
  const query = `{viewer{accounts(filter:{accountTag:${JSON.stringify(accountId)}}){${daily}
    pages:rumPageloadEventsAdaptiveGroups(limit:10,orderBy:[count_DESC],filter:{${window}}){count dimensions{requestPath}}
    sources:rumPageloadEventsAdaptiveGroups(limit:10,orderBy:[sum_visits_DESC],filter:{${window}}){sum{visits} dimensions{refererHost}}
  }}}`;
  try {
    const response = await fetcher("https://api.cloudflare.com/client/v4/graphql", { method: "POST", redirect: "error", signal: AbortSignal.timeout(15_000), headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ query }) });
    if (!response.ok) return { ...base, status: [401, 403].includes(response.status) ? "permission-needed" : "temporarily-unavailable" };
    const json = await response.json();
    if (json.errors?.length) return { ...base, status: "permission-or-query-error" };
    const account = json.data?.viewer?.accounts?.[0];
    if (!account) return { ...base, status: "account-unavailable" };
    const numbers = (row) => row && Number.isFinite(row.count) && row.count >= 0 && Number.isFinite(row.sum?.visits) && row.sum.visits >= 0;
    const rows = days.map((d, i) => {
      const group = account[`d${i}`];
      if (!Array.isArray(group) || group.length > 1 || (group.length && !numbers(group[0]))) throw new Error("Invalid dataset");
      // Empty successful dataset is distinguished from a failed request.
      return { date: d.date, partial: d.partial, pageviews: group[0]?.count ?? 0, visits: group[0]?.sum.visits ?? 0 };
    });
    const safePath = (s) => typeof s === "string" && s.startsWith("/") ? s.split(/[?#]/)[0].slice(0, 160) : "/";
    const pages = (account.pages ?? []).filter((r) => Number.isFinite(r.count) && r.count >= 0).map((r) => ({ path: safePath(r.dimensions?.requestPath), pageviews: r.count }));
    const sources = (account.sources ?? []).filter((r) => Number.isFinite(r.sum?.visits) && r.sum.visits >= 0).map((r) => ({ host: typeof r.dimensions?.refererHost === "string" ? r.dimensions.refererHost.slice(0, 160) : "", visits: r.sum.visits }));
    return { ...base, connected: true, status: "connected", days: rows, today: rows.at(-1), yesterday: rows.at(-2), pages, sources };
  } catch { return { ...base, status: "temporarily-unavailable" }; }
}
