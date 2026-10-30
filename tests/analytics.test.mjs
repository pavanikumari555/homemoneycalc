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

test("retired GA4 clears only its own settings/cookies and never loads a tag", () => {
  const source = readFileSync("public/analytics.js", "utf8");
  for (const consent of [null, "declined", "accepted"]) {
    const values = new Map([["hmc:analytics-consent:v1", consent], ["hmc:saved:mortgage-payoff-calculator", "keep-my-plan"]]);
    const removedCookies = [];
    const document = { get cookie() { return "hmc_ga=old; hmc_ga_N6Y64JH7QB=old; _ga=old; unrelated=keep"; }, set cookie(v) { removedCookies.push(v); } };
    const window = {};
    vm.runInNewContext(source, {window, document, location:{hostname:"homemoneycalc.com"}, localStorage:{removeItem:k=>values.delete(k)}});
    assert.equal(window["ga-disable-G-N6Y64JH7QB"], true);
    assert.equal(values.has("hmc:analytics-consent:v1"), false);
    assert.equal(values.get("hmc:saved:mortgage-payoff-calculator"), "keep-my-plan");
    assert.equal(removedCookies.length, 9);
    assert.ok(removedCookies.every(c => c.includes("max-age=0") && !c.startsWith("unrelated=")));
  }
});
