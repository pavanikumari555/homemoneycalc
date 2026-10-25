import test from "node:test";
import assert from "node:assert/strict";
import { sealProposal, validateProposal, applyMetadata, proposalQueue } from "../scripts/agent/proposals.mjs";
import { decide } from "../scripts/agent/decide.mjs";
import { robotsAllowed, sourceText, observeSources } from "../scripts/agent/research.mjs";
import { onRequest as approvals } from "../functions/admin/api/approvals.js";
import { onRequest as protect } from "../functions/admin/_middleware.js";
import { titleTests, outreachDrafts, readTools } from "../scripts/agent/ideas.mjs";
import { evaluateExperiments } from "../scripts/agent/experiments.mjs";

const today = "2026-10-26";
const payload = { kind: "metadata", topic: "title-paycheck", created: today, expires: "2026-11-09", title: "Review paycheck title", reason: "Observed search demand; hypothesis only.", evidence: [{ url: "https://homemoneycalc.com/paycheck-calculator/", observation: "Observed query from GSC." }], reviewChecklist: ["Reviewed actual supported features."], change: { slug: "paycheck-calculator", field: "title", before: "Take-Home Paycheck Calculator", after: "Take-Home Paycheck Calculator — Free" } };
const source = `import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({ title: "Take-Home Paycheck Calculator", description: "A useful take-home estimate with assumptions.", path: "/paycheck-calculator/" });
export default function Page() { return <div>Stable calculator code</div>; }`;
test("approved metadata edits only the reviewed string; executable code and dates remain unchanged", () => {
  const p = sealProposal(payload);
  const edited = applyMetadata(source, p, today);
  assert.equal(edited.replace(JSON.stringify(payload.change.after), JSON.stringify(payload.change.before)), source);
  assert.throws(() => applyMetadata(edited, p, today), /stale/);
  assert.throws(() => applyMetadata(source, p, "2026-11-10"), /expired/);
  const tampered = structuredClone(p); tampered.payload.change.after = "Different claim";
  assert.throws(() => applyMetadata(source, tampered, today), /changed/);
});
test("ads, scripts, dates, future-year claims and misleading accuracy claims cannot be applied", () => {
  for (const change of [{ field: "added" }, { slug: "../../functions/admin" }, { after: "Guaranteed exact numbers" }, { after: "Calculator <script>oops</script>" }, { after: "Paycheck Calculator 2027" }]) {
    assert.throws(() => validateProposal(sealProposal({ ...payload, change: { ...payload.change, ...change } }), today));
  }
  assert.throws(() => applyMetadata(source, sealProposal({ ...payload, change: { ...payload.change, field: "description", before: "not current description" } }), today), /stale/);
});
test("decision execution deduplicates, rejects stale source and never publishes research", () => {
  const p = sealProposal(payload), queue = { proposals: [p] }, history = { decisions: [] };
  const input = { queue, history, id: p.id, hash: p.digest, decision: "approve", today, registry: source };
  const result = decide(input);
  assert.notEqual(result.registry, source);
  assert.throws(() => decide({ ...input, history: result.history }), /Already decided/);
  assert.equal(decide({ ...input, decision: "reject" }).registry, source);
  const research = sealProposal({ ...payload, kind: "research", change: undefined });
  const accepted = decide({ ...input, queue: { proposals: [research] }, id: research.id, hash: research.digest });
  assert.equal(accepted.registry, source);
  assert.equal(accepted.history.decisions[0].result, "approved-research");
});
test("robots policy honors disallow, most specific allow, named agents and wildcard end anchors", () => {
  const text = "User-agent: *\nDisallow: /private\nAllow: /private/public\nDisallow: /*.pdf$";
  assert.equal(robotsAllowed(text, "/private/data"), false);
  assert.equal(robotsAllowed(text, "/private/public/"), true);
  assert.equal(robotsAllowed(text, "/tax.pdf"), false);
  assert.equal(robotsAllowed(text, "/tax.pdf.html"), true);
  assert.equal(robotsAllowed("User-agent: *\nAllow: /\nUser-agent: HomeMoneyCalcMonitor\nDisallow: /", "/"), false);
});
test("research respects robots, caches observations, distinguishes baseline/change/unknown", async () => {
  const config = { sources: [{ id: "irs", label: "IRS", kind: "official", url: "https://www.irs.gov/newsroom/test" }] };
  let calls = 0;
  const fetcher = async (url) => { calls++; return new Response(url.endsWith("robots.txt") ? "User-agent: *\nAllow: /" : `<main>${"Official evidence text ".repeat(30)}</main>`); };
  const baseline = await observeSources(config, {}, new Date(`${today}T12:00:00Z`), fetcher);
  assert.equal(baseline.observations[0].status, "baseline");
  assert.equal(calls, 2);
  await observeSources(config, baseline, new Date("2026-10-27T12:00:00Z"), fetcher);
  assert.equal(calls, 2);
  const changed = await observeSources(config, baseline, new Date("2026-11-03T12:00:00Z"), async (url) => new Response(url.endsWith("robots.txt") ? "User-agent: *\nAllow: /" : `<main>${"Changed official page ".repeat(30)}</main>`));
  assert.equal(changed.observations[0].status, "changed");
  let pageFetched = false;
  const blocked = await observeSources(config, {}, new Date(), async (url) => { if (!url.endsWith("robots.txt")) pageFetched = true; return new Response("User-agent: *\nDisallow: /"); });
  assert.equal(pageFetched, false);
  assert.equal(blocked.observations[0].status, "unknown");
  const rejectedHost = await observeSources({ sources: [{ ...config.sources[0], url: "https://evil.example/" }] }, {}, new Date(), () => { throw new Error("must never fetch"); });
  assert.equal(rejectedHost.observations[0].status, "unknown");
  assert.equal(sourceText("<main>Useful <script>doBadThing()</script> data</main>"), "Useful data");
});
test("queue requires real evidence; observed page changes create research only", () => {
  assert.equal(proposalQueue({}, [], {}, today).proposals.length, 0);
  const queue = proposalQueue({ research: { observations: [{ id: "irs", label: "IRS", status: "changed", url: "https://www.irs.gov/", summary: "Page text changed; review needed." }] } }, [], {}, today);
  assert.equal(queue.proposals.length, 1);
  assert.equal(queue.proposals[0].payload.kind, "research");
  assert.equal(proposalQueue({ research: { observations: [] } }, [], queue, today).proposals[0].digest, queue.proposals[0].digest);
});

const origin = "https://homemoneycalc-admin.pages.dev";
const fakeToken = "fake-test-token";
function request(body, headers = {}) { return new Request(`${origin}/admin/api/approvals`, { method: "POST", headers: { origin, "content-type": "application/json", "x-owner-action": "reviewed-decision", ...headers }, body: JSON.stringify(body) }); }
const encoded = (o) => new Response(JSON.stringify({ encoding: "base64", content: Buffer.from(JSON.stringify(o)).toString("base64") }), { headers: { "content-type": "application/json" } });
test("approval endpoint remains behind auth, fails closed without token and rejects CSRF/preview hosts", async () => {
  let fetched = false;
  const next = () => { fetched = true; return approvals({ request: new Request(`${origin}/admin/api/approvals`), env: {} }); };
  const denied = await protect({ request: new Request(`${origin}/admin/api/approvals`), env: { ADMIN_USER: "test", ADMIN_PASS: "fake-test-password-long" }, next });
  assert.equal(denied.status, 401); assert.equal(fetched, false);
  assert.equal((await approvals({ request: new Request(`${origin}/admin/api/approvals`), env: {} })).status, 503);
  assert.equal((await approvals({ request: request({}, { origin: "https://evil.example" }), env: { GITHUB_AGENT_TOKEN: fakeToken } })).status, 403);
  assert.equal((await approvals({ request: new Request("https://preview.homemoneycalc-admin.pages.dev/admin/api/approvals"), env: {} })).status, 403);
});
test("only immutable reviewed proposals dispatch the fixed workflow; queued is not applied", async () => {
  const p = sealProposal({ ...payload, created: new Date().toISOString().slice(0, 10), expires: "2099-01-01" });
  const dispatches = [];
  const fetcher = async (url, init) => {
    assert.ok(url.startsWith("https://api.github.com/repos/pavanikumari555/homemoneycalc/"));
    if (url.includes("agent-proposals.json")) return encoded({ proposals: [p] });
    if (url.includes("agent-decisions.json")) return encoded({ decisions: [] });
    dispatches.push(JSON.parse(init.body)); return new Response(null, { status: 204 });
  };
  const input = { id: p.id, digest: p.digest, decision: "approve", reviewed: true };
  const response = await approvals({ request: request(input), env: { GITHUB_AGENT_TOKEN: fakeToken } }, fetcher);
  assert.equal(response.status, 202); assert.equal((await response.json()).queued, true);
  assert.deepEqual(dispatches[0], { ref: "main", inputs: { proposal_id: p.id, proposal_digest: p.digest, decision: "approve", reviewed: "yes" } });
  assert.equal((await approvals({ request: request({ ...input, reviewed: false }), env: { GITHUB_AGENT_TOKEN: fakeToken } }, fetcher)).status, 400);
  assert.equal((await approvals({ request: request({ ...input, digest: "a".repeat(64) }), env: { GITHUB_AGENT_TOKEN: fakeToken } }, fetcher)).status, 409);
  assert.equal(dispatches.length, 1);
  p.payload.reason = "Changed after review";
  assert.equal((await approvals({ request: request(input), env: { GITHUB_AGENT_TOKEN: fakeToken } }, fetcher)).status, 409);
});
test("suggestions avoid unsupported year/accuracy claims and unpublished outreach study", () => {
  const tools = readTools().filter((t) => t.added <= today);
  const titles = titleTests({ topPages: [{ page: "https://homemoneycalc.com/paycheck-calculator/", impressions: 500, position: 8, ctr: 0.001 }], queryPage: [{ page: "https://homemoneycalc.com/paycheck-calculator/", query: "paycheck calculator", impressions: 500 }], tools, siteUrl: "https://homemoneycalc.com", year: 2027 });
  assert.ok(titles[0].ideas.every((t) => !/2027|exact numbers/i.test(t)));
  for (let day = 1; day < 30; day++) assert.ok(outreachDrafts({ tools, siteUrl: "https://homemoneycalc.com", siteName: "HomeMoney Calc", today: `2026-10-${String(day).padStart(2, "0")}` }).every((d) => !d.body.includes("/take-home-pay-by-state/")));
});
test("experiment evaluation waits for a comparable window and never treats missing data as a win", () => {
  const history = { decisions: [{ id: "test", title: "Title test", kind: "metadata", result: "applied-after-checks", decidedAt: "2026-10-26T12:00:00Z", payload: { change: { slug: "paycheck-calculator" }, baseline: { impressions: 500, ctr: 0.01 } } }] };
  assert.equal(evaluateExperiments(history, {}, "2026-10-27")[0].status, "waiting-for-comparable-window");
  assert.equal(evaluateExperiments(history, {}, "2026-12-01")[0].status, "insufficient-data");
  const result = evaluateExperiments(history, { sources: { gsc: true }, topPages: [{ page: "/paycheck-calculator/", impressions: 800, ctr: 0.03 }] }, "2026-12-01")[0];
  assert.equal(result.status, "review-comparison");
  assert.match(result.note, /not a controlled experiment/);
});
