// ============================================================================
// IndexNow ping — Bing (aur Bing se chalne wala ChatGPT search), Yandex, Seznam
// ko batata hai ki kaunse pages naye/badle. Google IndexNow use nahi karta
// (uske liye sitemap + Search Console). Workflow: .github/workflows/indexnow.yml
// Usage: node scripts/agent/indexnow.mjs [--all] [changed files...]
// ============================================================================
import { readFileSync } from "node:fs";

const site = readFileSync("lib/site.ts", "utf8");
const SITE_URL = /url: "([^"]+)"/.exec(site)?.[1];
const KEY = /indexNowKey: "([^"]+)"/.exec(site)?.[1];
if (!SITE_URL || !KEY) {
  console.log("IndexNow: SITE.url or indexNowKey missing — skipped");
  process.exit(0);
}
const host = new URL(SITE_URL).host;

const args = process.argv.slice(2);
const all = args.includes("--all");
const files = args.filter((a) => !a.startsWith("--"));

// Every public route from the built sitemap (fallback: home only)
let sitemapUrls = [`${SITE_URL}/`];
try {
  sitemapUrls = [...readFileSync("out/sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
} catch {
  // no build output - fine
}

// Changed source files -> page URLs. Shared code (lib/, components/) touches every page.
let urls;
if (all || files.some((f) => /^(lib|components)\/|^app\/(layout|globals)/.test(f))) {
  urls = sitemapUrls;
} else {
  const routes = new Set();
  for (const f of files) {
    const m = /^app\/([^/]+)\//.exec(f);
    if (m && !m[1].startsWith("(") && m[1] !== "admin") routes.add(`${SITE_URL}/${m[1]}/`);
    if (f === "app/page.tsx") routes.add(`${SITE_URL}/`);
  }
  urls = sitemapUrls.filter((u) => routes.has(u));
}

if (!urls.length) {
  console.log("IndexNow: no public pages changed");
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: submitted ${urls.length} URL(s) -> HTTP ${res.status}`);
// 200/202 = accepted. 403 = key file not reachable yet (domain not live) — harmless.
