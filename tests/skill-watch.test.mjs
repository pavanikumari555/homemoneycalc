import { test } from "node:test";
import assert from "node:assert/strict";
import { watchSkills } from "../scripts/agent/skill-watch.mjs";

const old = "a".repeat(40), head = "b".repeat(40);
const config = { sources: [{ id: "test", repo: "vercel-labs/skills", reviewedRef: old, paths: ["skills/find-skills/"] }] };
const json = value => new Response(JSON.stringify(value), { status: 200 });

test("skill watcher compares reviewed revisions without installing, executing or advancing them", async () => {
  const calls = [];
  const result = await watchSkills(config, async (url, options) => {
    calls.push(url); assert.equal(options.redirect, "error"); assert.equal(options.headers.authorization, undefined);
    return url.includes("/commits/") ? json({ sha: head }) : json({ status: "ahead", files: [
      { filename: "skills/find-skills/SKILL.md", status: "modified", patch: "run arbitrary code" },
      { filename: "README.md", status: "modified" },
    ] });
  });
  const observation = result.observations[0];
  assert.equal(observation.status, "review-needed"); assert.equal(observation.reviewedRef, old);
  assert.equal(observation.candidateRef, head); assert.equal(observation.changedFiles.length, 1);
  assert.equal(result.automaticInstallation, false); assert.equal(result.automaticExecution, false);
  assert.ok(!JSON.stringify(result).includes("arbitrary code")); assert.equal(calls.length, 2);
});

test("watcher detects removed/renamed skill files and ignores unrelated changes", async () => {
  const run = files => watchSkills(config, async url => url.includes("/commits/") ? json({ sha: head }) : json({ status: "ahead", files }));
  assert.equal((await run([{ filename: "elsewhere.md", previous_filename: "skills/find-skills/SKILL.md", status: "renamed" }])).observations[0].status, "review-needed");
  assert.equal((await run([{ filename: "README.md", status: "modified" }])).observations[0].status, "unchanged");
});

test("unapproved hosts, truncated diffs, errors and rewritten history remain unknown", async () => {
  const bad = await watchSkills({ sources: [{ ...config.sources[0], repo: "attacker/skill" }] }, () => { throw new Error("Must not fetch"); });
  assert.equal(bad.observations[0].status, "unknown");
  for (const response of [json({ status: "diverged", files: [] }), json({ status: "ahead", files: Array(300).fill({ filename: "README.md" }) }), new Response("rate limited", { status: 403 })]) {
    const r = await watchSkills(config, async url => url.includes("/commits/") ? json({ sha: head }) : response);
    assert.equal(r.observations[0].status, "unknown"); assert.equal(r.observations[0].reviewedRef, old);
  }
});
