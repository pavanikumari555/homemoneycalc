// Only a read-only repository token is necessary. Never return GitHub errors or credentials.
const ROOT = "https://api.github.com/repos/pavanikumari555/homemoneycalc/contents/data/reports";
export async function onRequest({ request, env, waitUntil }, fetcher = fetch) {
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "x-content-type-options": "nosniff" };
  const reply = (status, data) => new Response(JSON.stringify(data), { status, headers });
  if (request.method !== "GET") return reply(405, {});
  const token = env.GITHUB_REPORT_TOKEN || env.GITHUB_AGENT_TOKEN;
  if (!token) return reply(503, { status: "setup-needed" });
  try {
    const cache = globalThis.caches?.default;
    const key = new Request("https://owner-report.invalid/daily-report-v1");
    const cached = cache ? await cache.match(key) : null;
    if (cached) return new Response(cached.body, { headers });
    const read = async (url) => {
      const r = await fetcher(url, { redirect: "error", signal: AbortSignal.timeout(12_000), headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "HomeMoneyCalcOwnerReport", "x-github-api-version": "2022-11-28" } });
      if (!r.ok) throw new Error("Unavailable");
      const text = await r.text();
      if (text.length > 2_000_000) throw new Error("Too large");
      return JSON.parse(text);
    };
    const list = await read(`${ROOT}?ref=main`);
    const name = list.filter((r) => r.type === "file" && /^\d{4}-\d{2}-\d{2}\.json$/.test(r.name)).map((r) => r.name).sort().at(-1);
    if (!name) throw new Error("Missing report");
    const file = await read(`${ROOT}/${name}?ref=main`);
    if (file.encoding !== "base64" || typeof file.content !== "string") throw new Error("Invalid data");
    const report = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g, "")), (c) => c.charCodeAt(0))));
    if (report.date !== name.slice(0, 10) || !Number.isFinite(Date.parse(report.generatedAt))) throw new Error("Invalid report");
    const body = { status: "connected", report };
    if (cache && waitUntil) waitUntil(cache.put(key, new Response(JSON.stringify(body), { headers: { "cache-control": "max-age=300" } })));
    return reply(200, body);
  } catch { return reply(502, { status: "temporarily-unavailable" }); }
}
