import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { edgeAnalytics } from "../scripts/agent/cloudflare.mjs";
import { validateMonetization } from "../scripts/monetization-preflight.mjs";

test("edge reporting never invents visitors, leaks raw API errors or treats missing data as zero", async () => {
  let requests = 0;
  const missing = await edgeAnalytics({}, async () => { requests++; });
  assert.equal(missing.connected, false);
  assert.equal(requests, 0);
  const options = { token: "fake-test-token", zoneId: "a".repeat(32), today: "2026-10-26" };
  const ok = await edgeAnalytics(options, async (_, init) => {
    const body = JSON.parse(init.body);
    assert.equal(body.variables.start, "2026-09-28");
    assert.doesNotMatch(body.query, /clientIP|userAgent|uniques|cookie|referrer/);
    return new Response(JSON.stringify({ data: { viewer: { zones: [{ httpRequests1dGroups: [{ dimensions: { date: "2026-10-25" }, sum: { requests: 200, pageViews: 50 } }] }] } } }));
  });
  assert.equal(ok.totals.requests, 200);
  assert.equal(ok.totals.htmlPageRequests, 50);
  assert.equal(ok.totals.sessions, undefined);
  const denied = await edgeAnalytics(options, async () => new Response(JSON.stringify({ errors: [{ message: "do-not-copy-raw-error" }] })));
  assert.equal(denied.connected, false);
  assert.doesNotMatch(JSON.stringify(denied), /do-not-copy-raw-error|fake-test-token/);
});

test("monetization preflight blocks early ads, invented identities and obstructive placement changes", () => {
  const plan = JSON.parse(readFileSync("data/monetization.json", "utf8"));
  assert.deepEqual(validateMonetization(plan), []);
  assert.ok(validateMonetization({ ...plan, adsEnabled: true }).length);
  assert.ok(validateMonetization({ ...plan, publisherId: "ca-pub-placeholder" }).length);
  assert.ok(validateMonetization({ ...plan, placementPlan: { ...plan.placementPlan, forcedConsent: true } }).length);
});

// public/analytics.js ko fake browser mein chalao (koi asli network call nahi)
function runGa({ path = "/mortgage-payoff-calculator/", search = "", host = "homemoneycalc.com", stored = {}, referrer = "" } = {}) {
  const values = new Map(Object.entries({ "hmc:saved:mortgage-payoff-calculator": "keep-my-plan", ...stored }));
  const scripts = [];
  const removedCookies = [];
  const document = {
    referrer,
    get cookie() { return "hmc_ga=old; _ga=old; unrelated=keep"; },
    set cookie(v) { removedCookies.push(v); },
    createElement: () => ({}),
    head: { appendChild: (s) => scripts.push(s) },
  };
  const window = { addEventListener() {} };
  const localStorage = { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: (k) => values.delete(k) };
  vm.runInNewContext(readFileSync("public/analytics.js", "utf8"), { window, document, localStorage, URL, location: { hostname: host, pathname: path, search, reload() {} } });
  const calls = (window.dataLayer ?? []).map((a) => Array.from(a));
  return { window, values, scripts, removedCookies, calls };
}

test("GA4 runs by default without leaking calculator inputs or enabling ad features", () => {
  const r = runGa({ search: "?b=300000&r=6.5&x=200", referrer: "https://www.google.com/search?q=my+salary+75000" });
  assert.equal(r.scripts.length, 1);
  assert.match(r.scripts[0].src, /^https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-N6Y64JH7QB$/);
  assert.equal(r.window["ga-disable-G-N6Y64JH7QB"], false);
  const sent = JSON.stringify(r.calls);
  assert.doesNotMatch(sent, /300000|6\.5|b=|75000|q=/); // query aur search words kabhi nahi
  const view = r.calls.find((c) => c[0] === "event" && c[1] === "page_view")[2];
  assert.equal(view.page_location, "https://homemoneycalc.com/mortgage-payoff-calculator/");
  assert.equal(view.page_referrer, "https://www.google.com/");
  assert.equal(view.page_title, "HomeMoney Calc");
  const config = r.calls.find((c) => c[0] === "config")[2];
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  // EEA/UK/CH default denied, baaki jagah analytics granted; ads hamesha denied
  const defaults = r.calls.filter((c) => c[0] === "consent" && c[1] === "default").map((c) => c[2]);
  const eu = defaults.find((d) => d.region);
  assert.equal(eu.analytics_storage, "denied");
  assert.ok(["DE", "FR", "GB", "CH"].every((code) => eu.region.includes(code)));
  assert.equal(defaults.find((d) => !d.region).analytics_storage, "granted");
  assert.ok(defaults.every((d) => d.ad_storage === "denied" && d.ad_user_data === "denied" && d.ad_personalization === "denied"));
});

test("GA4 stays off after Turn off, on private pages and on other hosts; old declines are kept", () => {
  const off = runGa({ stored: { "hmc:analytics-choice:v2": "declined" } });
  assert.equal(off.scripts.length, 0);
  assert.equal(off.window["ga-disable-G-N6Y64JH7QB"], true);
  assert.ok(off.removedCookies.length > 0 && off.removedCookies.every((c) => c.includes("max-age=0") && !c.startsWith("unrelated=")));
  assert.equal(off.values.get("hmc:saved:mortgage-payoff-calculator"), "keep-my-plan");
  for (const path of ["/admin/", "/embed/paycheck-calculator/", "/my-money/", "/go/partner"]) assert.equal(runGa({ path }).scripts.length, 0, path);
  assert.equal(runGa({ host: "homemoneycalc.pages.dev" }).scripts.length, 0);
  assert.equal(runGa({ host: "localhost" }).scripts.length, 0);
  // Pehle (v1) Decline kiya tha to ab bhi band
  const migrated = runGa({ stored: { "hmc:analytics-consent:v1": "declined" } });
  assert.equal(migrated.scripts.length, 0);
  assert.equal(migrated.values.get("hmc:analytics-choice:v2"), "declined");
  assert.equal(migrated.values.has("hmc:analytics-consent:v1"), false);
  // Allow = EEA mein bhi granted update
  const allowed = runGa({ stored: { "hmc:analytics-choice:v2": "accepted" } });
  assert.ok(allowed.calls.some((c) => c[0] === "consent" && c[1] === "update" && c[2].analytics_storage === "granted"));
});

test("CSP allows only the Google Analytics endpoints the tag needs", () => {
  const csp = readFileSync("public/_headers", "utf8").split("\n").find((l) => l.trim().startsWith("Content-Security-Policy:") && l.includes("frame-ancestors 'self'"));
  assert.match(csp, /script-src [^;]*https:\/\/www\.googletagmanager\.com\/gtag\//);
  assert.match(csp, /connect-src [^;]*https:\/\/\*\.google-analytics\.com/);
  // Google ka "GA without Ads" CSP list: tag www.google.com/g/collect pe bhi bhejta hai
  assert.match(csp, /connect-src [^;]*https:\/\/www\.google\.com[ ;]/);
  assert.match(csp, /img-src [^;]*https:\/\/www\.googletagmanager\.com/);
  assert.doesNotMatch(csp, /googlesyndication|doubleclick|adservice/); // ads abhi band
});
