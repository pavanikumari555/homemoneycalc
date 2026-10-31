import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// This narrowly reviewed legacy branch has no optimizationLevel/firstPhasePreProcess
// implementation described by GHSA-g3hv-75wg-m249. The vulnerable v10 branch is patched
// to v11. Never waive a new advisory, new file/version, production finding, or expired review.
export function reviewedLegacyMatcher(root = process.cwd(), today = new Date().toISOString().slice(0,10)) {
  if (today > "2026-11-30") return false;
  try {
    const dir = join(root,"node_modules/minimatch");
    return JSON.parse(readFileSync(join(dir,"package.json"),"utf8")).version === "3.1.5" && createHash("sha256").update(readFileSync(join(dir,"minimatch.js"))).digest("hex") === "746849f267c4868a53729225bd85c7dccd387712136fb305fcc0a3eadd4a3d9d";
  } catch { return false; }
}
export function auditDisposition(audit, { legacyReviewed = false, root = process.cwd() } = {}) {
  const total = audit.metadata?.vulnerabilities?.total;
  if (!Number.isFinite(total)) return { status:"unknown", summary:"Dependency audit unavailable." };
  if (!total) return { status:"pass", rawFindings:0, summary:"No known dependency findings reported." };
  const entries = Object.values(audit.vulnerabilities || {});
  const minimatch = audit.vulnerabilities?.minimatch;
  const onlyKnown = entries.length > 0 && minimatch && entries.every(v => v.severity === "moderate" && v.via.every(a => typeof a === "string" ? Boolean(audit.vulnerabilities[a]) : a.url === "https://github.com/advisories/GHSA-g3hv-75wg-m249" && a.name === "minimatch"));
  const legacyNodes = minimatch?.nodes?.length && minimatch.nodes.every(node => {
    try { return JSON.parse(readFileSync(join(root,node,"package.json"),"utf8")).version === "3.1.5" && existsSync(join(root,node,"minimatch.js")) && createHash("sha256").update(readFileSync(join(root,node,"minimatch.js"))).digest("hex") === "746849f267c4868a53729225bd85c7dccd387712136fb305fcc0a3eadd4a3d9d"; } catch { return false; }
  });
  let developmentOnly=false;
  try { const lock=JSON.parse(readFileSync(join(root,"package-lock.json"),"utf8"));developmentOnly=entries.every(v=>v.nodes?.length&&v.nodes.every(n=>lock.packages?.[n]?.dev===true)); } catch { /* fail closed */ }
  if (legacyReviewed && onlyKnown && legacyNodes && developmentOnly) return { status:"pass", rawFindings:total, reviewedFindings:total, reviewExpires:"2026-11-30", summary:`${total} propagated moderate development findings reviewed: legacy minimatch 3.1.5 lacks the affected optimization code. Raw npm warning retained; review expires 30 Nov. Patched v10 branch upgraded to v11.` };
  return { status:"fail", rawFindings:total, summary:`${total} dependency findings need review/update. New, changed or expired advisories are never auto-waived.` };
}
