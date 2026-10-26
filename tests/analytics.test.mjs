import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync("public/analytics.js", "utf8");
function browser(consent = null, hostname = "homemoneycalc.com", pathname = "/paycheck-calculator/") {
  const listeners = {};
  const scripts = [];
  let reloads = 0;
  let stored = consent;
  const location = { hostname, pathname, search: "?salary=999999&email=private@example.com", hash: "#saved-private", reload: () => reloads++ };
  const document = { cookie: "", referrer: "https://example.com/private?salary=111111#secret", head: { appendChild: (script) => scripts.push(script) }, createElement: () => ({}) };
  const window = { addEventListener: (name, fn) => { listeners[name] = fn; } };
  vm.runInNewContext(source, { window, location, document, localStorage: { getItem: () => stored }, URL, Date });
  return { window, scripts, location, document, setConsent: (value) => { stored = value; listeners["hmc:analytics-choice"](); }, navigate: (path) => { location.pathname = path; listeners["hmc:analytics-page"](); }, reloads: () => reloads };
}

test("analytics makes no Google request before consent or on excluded hosts/routes", () => {
  for (const consent of [null, "declined"]) assert.equal(browser(consent).scripts.length, 0);
  for (const host of ["localhost", "homemoneycalc.pages.dev", "homemoneycalc-admin.pages.dev", "preview.homemoneycalc.pages.dev"]) assert.equal(browser("accepted", host).scripts.length, 0);
  for (const path of ["/admin/", "/admin/api/approvals", "/my-money/", "/embed/paycheck-calculator/", "/go/partner"]) assert.equal(browser("accepted", "homemoneycalc.com", path).scripts.length, 0);
});

test("accepted analytics queues sanitized fields before loading Google; no inputs or query leak", () => {
  const b = browser("accepted");
  assert.equal(b.scripts.length, 1);
  assert.equal(b.scripts[0].referrerPolicy, "no-referrer");
  const calls = b.window.dataLayer.map((a) => Array.from(a));
  const config = calls.find((a) => a[0] === "config")[2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(config.page_location, "https://homemoneycalc.com/paycheck-calculator/");
  assert.equal(config.page_referrer, "https://example.com/");
  assert.doesNotMatch(JSON.stringify(calls), /999999|111111|private|saved-private|salary|email|[?#]/);
  assert.equal(calls[0][2].ad_storage, "denied");
});

test("consent changes start once, route changes count once and withdrawal disables/reloads", () => {
  const b = browser();
  b.setConsent("accepted");
  b.setConsent("accepted");
  b.navigate("/paycheck-calculator/");
  b.navigate("/mortgage-payoff-calculator/");
  assert.equal(b.scripts.length, 1);
  assert.equal(b.window.dataLayer.filter((a) => a[0] === "event").length, 2);
  b.setConsent("declined");
  assert.equal(b.window["ga-disable-G-N6Y64JH7QB"], true);
  assert.equal(b.reloads(), 1);
  b.navigate("/percentage-calculator/");
  assert.equal(b.window.dataLayer.filter((a) => a[0] === "event").length, 2);
});
