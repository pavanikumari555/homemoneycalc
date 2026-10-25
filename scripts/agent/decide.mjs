// Runs only in the trusted decision workflow. Input is identifiers, never code/commands.
import { readFileSync, writeFileSync, lstatSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { applyMetadata, validateProposal } from "./proposals.mjs";
import { readTools } from "./ideas.mjs";

export function decide({ queue, history, id, hash, decision, today, registry }) {
  if (!["approve", "reject"].includes(decision)) throw new Error("Invalid decision.");
  const proposal = queue.proposals.find((p) => p.id === id && p.digest === hash);
  if (!proposal) throw new Error("Proposal not found; refresh the inbox.");
  const p = validateProposal(proposal, today);
  if (history.decisions.some((d) => d.id === id)) throw new Error("Already decided; no duplicate execution.");
  const result = decision === "reject" ? "rejected" : p.kind === "metadata" ? "applied-after-checks" : "approved-research";
  const nextRegistry = decision === "approve" && p.kind === "metadata" ? applyMetadata(registry, proposal, today) : registry;
  return { registry: nextRegistry, history: { version: 1, decisions: [...history.decisions, { id, digest: hash, decision, result, title: p.title, topic: p.topic, kind: p.kind, decidedAt: new Date().toISOString(), actor: process.env.GITHUB_ACTOR || "local-test", channel: "owner-reviewed-workflow", payload: p }] } };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.env.GITHUB_EVENT_NAME !== "workflow_dispatch" || process.env.GITHUB_REF !== "refs/heads/main") throw new Error("Trusted main workflow required.");
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const input = event.inputs || {};
  if (input.reviewed !== "yes") throw new Error("Explicit owner review required.");
  const proposal = JSON.parse(readFileSync("data/agent-proposals.json", "utf8")).proposals.find((p) => p.id === input.proposal_id);
  let file = null;
  if (proposal?.payload.kind === "metadata" && input.decision === "approve") {
    validateProposal(proposal);
    const slug = proposal.payload.change.slug;
    const tool = readTools().find((t) => t.slug === slug && t.added <= new Date().toISOString().slice(0, 10));
    if (!tool || lstatSync(`app/${slug}`).isSymbolicLink() || lstatSync(`app/${slug}/page.tsx`).isSymbolicLink()) throw new Error("Published regular tool source required.");
    file = `app/${slug}/page.tsx`;
  }
  const registry = file ? readFileSync(file, "utf8") : "";
  const result = decide({ queue: JSON.parse(readFileSync("data/agent-proposals.json", "utf8")), history: JSON.parse(readFileSync("data/agent-decisions.json", "utf8")), id: input.proposal_id, hash: input.proposal_digest, decision: input.decision, today: new Date().toISOString().slice(0, 10), registry });
  if (file && result.registry !== registry) writeFileSync(file, result.registry);
  writeFileSync("data/agent-decisions.json", `${JSON.stringify(result.history, null, 2)}\n`);
  console.log("Decision prepared. Repository changes are published only after all workflow checks pass.");
}
