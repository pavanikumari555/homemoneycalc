import assert from "node:assert/strict";
import { test } from "node:test";
import { readTools, growthIdeas } from "../scripts/agent/ideas.mjs";
import { roadmapSummary } from "../scripts/agent/roadmap.mjs";

test("report lists earliest queued tools first, and uses registry dates", () => {
  const items = [
    { slug: "later", targetDate: "2026-10-30", status: "drafted" },
    { slug: "earlier", targetDate: "2026-10-29", status: "drafted" },
    { slug: "unbuilt", targetDate: "2026-10-24", status: "planned" },
  ];
  const tools = [{ slug: "later", added: "2026-10-30" }, { slug: "earlier", added: "2026-10-28" }];
  const before = roadmapSummary(items, tools, "2026-10-25");
  assert.deepEqual(before.dueSoon.map((t) => t.slug), ["earlier", "later"]);
  assert.equal(before.dueSoon[0].targetDate, "2026-10-28");
  assert.equal(before.overdue[0].slug, "unbuilt");
  const after = roadmapSummary(items, tools, "2026-10-28");
  assert.equal(after.live, 1);
  assert.equal(after.planned, 2);
  assert.equal(items[1].status, "drafted"); // reporting must not edit source data
});

test("social and outreach drafts never promote an unreleased calculator", () => {
  const tools = readTools();
  for (let d = 25; d <= 31; d++) {
    const today = `2026-10-${d}`;
    const ideas = growthIdeas({ gsc: {}, siteUrl: "https://homemoneycalc.com", siteName: "HomeMoney Calc", today });
    assert.ok(tools.find((t) => t.slug === ideas.social.tool).added <= today);
    for (const t of tools.filter((t) => t.added > today)) {
      for (const draft of ideas.outreach) assert.ok(!draft.body.includes(`/${t.slug}/`));
    }
  }
});
