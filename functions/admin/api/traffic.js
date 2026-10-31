import { webAnalytics } from "../../../scripts/agent/web-analytics.mjs";
import { ANALYTICS_ACCOUNT, ANALYTICS_SITE } from "../../../lib/analytics-config.mjs";
// Parent middleware authenticates before every request, including cached responses.
export async function onRequest({ request, env, waitUntil }, fetcher = fetch) {
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "x-content-type-options": "nosniff" };
  if (request.method !== "GET") return new Response("{}", { status: 405, headers });
  const key = new Request("https://owner-report.invalid/traffic-v1");
  const cache = globalThis.caches?.default;
  const cached = cache ? await cache.match(key) : null;
  if (cached) return new Response(cached.body, { headers });
  const result = await webAnalytics({ token: env.CLOUDFLARE_WEB_ANALYTICS_TOKEN || env.CLOUDFLARE_ANALYTICS_TOKEN, accountId: env.CLOUDFLARE_ACCOUNT_ID || ANALYTICS_ACCOUNT, siteId: env.CLOUDFLARE_WEB_ANALYTICS_SITE_ID || ANALYTICS_SITE }, fetcher);
  if (cache && result.connected && waitUntil) waitUntil(cache.put(key, new Response(JSON.stringify(result), { headers: { "cache-control": "max-age=300" } })));
  return new Response(JSON.stringify(result), { headers });
}
