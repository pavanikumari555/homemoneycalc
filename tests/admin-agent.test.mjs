import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join, basename } from "node:path";
import { tmpdir } from "node:os";
import { onRequest } from "../functions/admin/_middleware.js";
import { adsenseReadiness, actionPlan } from "../scripts/agent/advisor.mjs";
import { auditSite } from "../scripts/agent/audit.mjs";
import { qualityChecks } from "../scripts/agent/quality.mjs";

const business = { readiness: { sessions28d: 1000, googleClicks28d: 200, activeSearchDays: 14, searchLandingPages: 3 } };
test("public admin entry redirects only to the protected dashboard; private host remains locked", async () => {
  let opened = false;
  const next = () => { opened = true; return new Response("private report"); };
  const entry = await onRequest({ request: new Request("https://homemoneycalc.com/admin/"), env: {}, next });
  assert.equal(entry.status, 302);
  assert.equal(entry.headers.get("location"), "https://homemoneycalc-admin.pages.dev/admin/");
  assert.equal(entry.headers.get("cache-control"), "no-store");
  assert.equal(opened, false);
  const locked = await onRequest({ request: new Request("https://homemoneycalc-admin.pages.dev/admin/"), env: {}, next });
  assert.equal(locked.status, 403);
  const env = { ADMIN_USER: "owner", ADMIN_PASS: "fake-test-pass-12345" };
  const denied = await onRequest({ request: new Request("https://homemoneycalc-admin.pages.dev/admin/"), env, next });
  assert.equal(denied.status, 401);
  assert.equal(opened, false);
  const authorized = await onRequest({ request: new Request("https://homemoneycalc-admin.pages.dev/admin/", { headers: { authorization: `Basic ${Buffer.from(`${env.ADMIN_USER}:${env.ADMIN_PASS}`).toString("base64")}` } }), env, next });
  assert.equal(await authorized.text(), "private report");
  assert.equal(authorized.headers.get("cache-control"), "no-store");
  assert.equal(authorized.headers.get("x-robots-tag"), "noindex, nofollow");
});

test("missing/stale traffic is never treated as approval; meeting checkpoints only requests review", () => {
  assert.equal(adsenseReadiness(null, business, "2026-10-26").status, "needs-data");
  const report = { date: "2026-10-26", sources: { gsc: true, ga4: true }, kpis: { sessions: 1001, clicks: 201 }, trend: Array.from({ length: 14 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, "0")}`, clicks: 1 })), topPages: Array.from({ length: 3 }, (_, i) => ({ page: `/tool-${i}/`, clicks: 1 })), health: { ran: true, errors: 0 }, quality: [{ status: "pass" }], liveChecks: [{ status: "pass" }] };
  const ready = adsenseReadiness(report, business, "2026-10-26");
  assert.equal(ready.status, "review-ready");
  assert.equal(ready.officialMinimum, false);
  assert.equal(ready.automaticApplication, false);
  report.quality[0].status = "fail";
  assert.equal(adsenseReadiness(report, business, "2026-10-26").status, "needs-check");
  report.quality[0].status = "pass";
  assert.equal(adsenseReadiness(report, business, "2026-10-30").status, "stale");
  report.health.ran = false;
  assert.equal(adsenseReadiness(report, business, "2026-10-26").status, "needs-check");
});

test("agent prioritizes real errors and missing reporting, not repeating website launch", () => {
  const actions = actionPlan({ date: "2026-10-26", sources: {}, health: { ran: true, errors: 1, issues: [{ route: "/loan/", severity: "error", message: "Missing asset" }] } }, business, "2026-10-26");
  assert.equal(actions[0].who, "agent");
  assert.match(actions[0].why, /Missing asset/);
  assert.ok(actions.some((a) => a.id === "gsc-data"));
  assert.ok(!actions.some((a) => /site live karo|sitemap submit/i.test(a.title)));
  assert.ok(actions.every((a) => a.steps.length >= 2));
});

test("audit catches broken assets, wrong canonical, duplicate title and invalid schema", () => {
  const root = mkdtempSync(join(tmpdir(), "hmc-audit-test-"));
  try {
    mkdirSync(join(root, "loan"));
    const html = (canonical, extra = "") => `<title>Same title</title><meta name="description" content="${"Useful calculator explanation. ".repeat(4)}"><link rel="canonical" href="${canonical}"><h1>Calculator</h1><p>${"original example ".repeat(180)}</p>${extra}`;
    writeFileSync(join(root, "index.html"), html("https://example.com/"));
    writeFileSync(join(root, "loan/index.html"), html("https://example.com/wrong/", '<script src="/_next/static/missing.js"></script><script type="application/ld+json">not json</script>'));
    writeFileSync(join(root, "sitemap.xml"), "<urlset><url><loc>https://example.com/</loc></url><url><loc>https://example.com/loan/</loc></url></urlset>");
    const result = auditSite(root, "https://example.com");
    assert.equal(result.ran, true);
    assert.ok(result.issues.some((i) => i.message.includes("Missing local asset")));
    assert.ok(result.issues.some((i) => i.message.includes("Canonical does not match")));
    assert.ok(result.issues.some((i) => i.message.includes("Invalid JSON-LD")));
    assert.ok(result.issues.some((i) => i.message.includes("Duplicate title")));
  } finally {
    // Only remove this freshly-created, checked test directory.
    assert.equal(resolve(root).startsWith(resolve(tmpdir())), true);
    assert.equal(basename(root).startsWith("hmc-audit-test-"), true);
    rmSync(root, { recursive: true, force: true });
  }
});

test("failed/unavailable executable checks never become green", () => {
  assert.ok(qualityChecks((_, args) => ({ status: 1, stdout: args.join(" ").includes("audit") ? '{"metadata":{"vulnerabilities":{"total":2}}}' : "" })).every((c) => c.status === "fail"));
  assert.ok(qualityChecks(() => ({ error: new Error("timeout"), status: null })).every((c) => c.status === "unknown"));
});
