// Immutable, evidence-backed review payloads. No shell commands, ads or arbitrary patches.
import { createHash } from "node:crypto";
import ts from "typescript";
import { readFileSync } from "node:fs";

export const POLICY = {
  version: 1, automaticAdsenseApplication: false, artificialTraffic: false,
  autoOutreach: false, bulkPages: false, financialChangesRequireReview: true,
  execution: "Only reviewed existing-page SEO title/description strings; research approval creates a task, not a public page.",
};
export const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function sealProposal(payload) {
  const hash = digest(payload);
  return { id: `proposal-${hash.slice(0, 20)}`, digest: hash, payload };
}
export function validateProposal(proposal, today = new Date().toISOString().slice(0, 10)) {
  const p = proposal?.payload;
  if (!p || proposal.digest !== digest(p) || proposal.id !== `proposal-${proposal.digest.slice(0, 20)}`) throw new Error("Proposal changed; fresh review required.");
  if (!["metadata", "research"].includes(p.kind) || !p.title || !p.reason || !p.reviewChecklist?.length || !p.evidence?.length) throw new Error("Missing review evidence.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.expires) || !/^\d{4}-\d{2}-\d{2}$/.test(p.created) || p.created > today || p.expires < today) throw new Error("Proposal expired or has an invalid date.");
  for (const e of p.evidence) {
    const u = new URL(e.url);
    if (u.protocol !== "https:" || u.username || u.password || !e.observation) throw new Error("Invalid evidence URL.");
  }
  if (p.kind === "metadata") {
    const c = p.change;
    if (!c || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug) || !["title", "description"].includes(c.field)) throw new Error("Unsupported change; needs a coding review.");
    if (typeof c.before !== "string" || typeof c.after !== "string" || c.after === c.before || c.after.length < 10 || c.after.length > (c.field === "title" ? 75 : 200)) throw new Error("Invalid metadata change.");
    if (/[<>\r\n\u0000-\u001f]/.test(c.after) || /https?:|guarantee|100% accurate|exact numbers|rank #?1|click.*ads/i.test(c.after)) throw new Error("Unsafe or misleading metadata claim.");
    const futureYears = c.after.match(/\b20\d{2}\b/g) || [];
    if (futureYears.some((y) => Number(y) > Number(today.slice(0, 4)))) throw new Error("Future-year claim needs a separate financial review.");
  }
  return p;
}

// Edit exactly one literal in the existing exported buildMetadata call. No code/date edits.
export function metadataField(source, fieldName) {
  const ast = ts.createSourceFile("page.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const matches = [];
  const visit = (node) => {
    if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) for (const d of node.declarationList.declarations) {
      if (d.name.getText(ast) !== "metadata" || !d.initializer || !ts.isCallExpression(d.initializer) || d.initializer.expression.getText(ast) !== "buildMetadata") continue;
      const obj = d.initializer.arguments[0];
      if (obj && ts.isObjectLiteralExpression(obj)) for (const prop of obj.properties) if (ts.isPropertyAssignment(prop) && prop.name.getText(ast) === fieldName && ts.isStringLiteral(prop.initializer)) matches.push(prop.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  if (matches.length !== 1) throw new Error("Existing metadata string not uniquely found.");
  return { text: matches[0].text, start: matches[0].getStart(ast), end: matches[0].end };
}
export function applyMetadata(source, proposal, today) {
  const p = validateProposal(proposal, today);
  if (p.kind !== "metadata") throw new Error("Research approval cannot publish content.");
  const field = metadataField(source, p.change.field);
  if (field.text !== p.change.before) throw new Error("Source changed; proposal is stale. Review a new proposal.");
  return source.slice(0, field.start) + JSON.stringify(p.change.after) + source.slice(field.end);
}

export function proposalQueue(report, tools, previous = { proposals: [] }, today, history = { decisions: [] }) {
  const expires = new Date(Date.parse(`${today}T12:00:00Z`) + 14 * 86400000).toISOString().slice(0, 10);
  const proposals = (previous.proposals || []).filter((p) => p.payload.expires >= today);
  const add = (payload) => { const p = sealProposal(payload); if (!proposals.some((x) => x.digest === p.digest || x.payload.topic === payload.topic)) proposals.push(p); };
  for (const observation of report.research?.observations || []) {
    if (observation.status !== "changed") continue;
    add({ kind: "research", topic: observation.id, created: today, expires,
      title: `${observation.label}: source update review`,
      reason: "Observed page content changed. A changed hash does not prove a tax rule or competitor feature changed.",
      evidence: [{ url: observation.url, observation: observation.summary }],
      reviewChecklist: ["Linked source kholkar actual relevant change verify karein.", "Effective date aur affected calculators check karein.", "Approval sirf research task accept karega; financial content auto publish nahi hoga."],
      outcome: "Create an approved research task; source-code implementation still requires a concrete reviewed change.",
    });
  }
  // Actual search evidence only; no invented keyword volumes or future-year titles.
  const searchFresh = report.sources?.gsc === true && /^\d{4}-\d{2}-\d{2}$/.test(report.date || "") && report.date <= today && Date.parse(today) - Date.parse(report.date) <= 2 * 86400000;
  for (const row of searchFresh ? report.ideas?.titleTests || [] : []) {
    const tool = tools.find((t) => row.page === `/${t.slug}/` && t.added <= today);
    if (history.decisions?.some((d) => d.result === "applied-after-checks" && d.payload?.change?.slug === tool?.slug && Date.parse(`${today}T12:00:00Z`) - Date.parse(d.decidedAt) < 32 * 86400000)) continue;
    let before;
    try { before = tool && metadataField(readFileSync(`app/${tool.slug}/page.tsx`, "utf8"), "title").text; } catch { continue; }
    const after = row.ideas?.find((s) => s !== before && !/\b20\d{2}\b|exact|guarantee/i.test(s));
    if (!tool || !before || !after || !row.topQuery) continue;
    const payload = { kind: "metadata", topic: `title-${tool.slug}`, created: today, expires,
      title: `${tool.title}: title review`, reason: `Search report: ${row.impressions} impressions, CTR ${Math.round(row.ctr * 10000) / 100}%. This is a test hypothesis, not proof of a title problem.`,
      evidence: [{ url: `https://homemoneycalc.com/${tool.slug}/`, observation: `Observed query: ${row.topQuery}; reported average position ${row.position}.` }],
      change: { slug: tool.slug, field: "title", before, after },
      baseline: { impressions: row.impressions, ctr: row.ctr, position: row.position, reportDate: report.date || today },
      reviewChecklist: ["Naya title calculator ke actual supported features se match karta hai.", "Koi unverified financial/year/accuracy claim nahi hai.", "Sirf exact shown title change approve ho raha hai; ranking guaranteed nahi."],
      outcome: "After approval: tests, registry check, lint and public build; publish only if all pass.",
    };
    try { const p = sealProposal(payload); validateProposal(p, today); add(payload); } catch { /* Reject unsafe suggestions. */ }
  }
  return { version: 1, updatedAt: new Date().toISOString(), policy: POLICY, proposals: proposals.slice(-30) };
}
