import { readFileSync } from "node:fs";

// Central tracker -> bounded research queue. This module never sends or submits.
export function parseTracker(csv) {
  const rows = []; let row = [], field = "", quoted = false;
  const input = csv.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') { field += '"'; i++; }
      else if (quoted || field === "") quoted = !quoted;
      else throw Error("Invalid tracker quoting");
    } else if (!quoted && (c === "," || c === "\n")) {
      row.push(field); field = "";
      if (c === "\n") { if (row.some(v => v.trim())) rows.push(row); row = []; }
    } else field += c;
  }
  if (quoted) throw Error("Unclosed tracker field");
  if (field || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  const required = ["organization", "research_url", "resource_to_offer", "status", "submission_cost_verified", "contact_channel_verified", "contacted_on", "response", "published_reference_url", "checked_on"];
  if (!header || required.some(k => !header.includes(k)) || new Set(header).size !== header.length) throw Error("Tracker columns missing");
  return rows.map(values => {
    if (values.length !== header.length) throw Error("Tracker row columns differ");
    return Object.fromEntries(header.map((key, i) => [key, values[i].trim()]));
  });
}

const norm = s => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
function safeUrl(value) {
  try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password ? u : null; } catch { return null; }
}
const host = u => u?.hostname.toLowerCase().replace(/^www\./, "") || "";
const terminal = row => Boolean(row.contacted_on || row.response || row.published_reference_url || !["research-only", "review-ready"].includes(norm(row.status)));

export function buildLinkReview(csv, date) {
  const base = { date, reviewCap: 2, automatedSubmission: false, source: "committed-tracker", items: [] };
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date))) throw Error("Invalid queue date");
    const rows = parseTracker(csv), blockedNames = new Set(), blockedHosts = new Set();
    // Scan all records before selecting: a later contact/opt-out suppresses an earlier lead.
    for (const row of rows.filter(terminal)) {
      blockedNames.add(norm(row.organization));
      const h = host(safeUrl(row.research_url)); if (h) blockedHosts.add(h);
    }
    const names = new Set(), hosts = new Set(), items = [];
    for (const row of rows) {
      const research = safeUrl(row.research_url), resource = safeUrl(row.resource_to_offer);
      const name = norm(row.organization), domain = host(research);
      if (!name || terminal(row) || !research || !resource || resource.hostname !== "homemoneycalc.com" || blockedNames.has(name) || blockedHosts.has(domain) || names.has(name) || hosts.has(domain)) continue;
      names.add(name); hosts.add(domain);
      const age = (Date.parse(date) - Date.parse(row.checked_on)) / 86400000;
      const blockers = [];
      if (!Number.isFinite(age) || age < 0 || age > 30) blockers.push("Published policy aur resource fit dobara verify karein; saved research purani ya missing hai.");
      if (norm(row.status) !== "review-ready") blockers.push("Publisher eligibility aur specific lesson ka fit abhi confirm nahi hai.");
      if (!["free", "0"].includes(norm(row.submission_cost_verified))) blockers.push("Submission free hai ya nahi, verify karein. Koi payment/trial activate na karein.");
      if (["", "no", "unknown"].includes(norm(row.contact_channel_verified))) blockers.push("Relevant published contact/suggestion channel abhi verify nahi hua.");
      items.push({ organization: row.organization, researchUrl: research.href, resourceUrl: resource.href,
        checkedOn: row.checked_on, stage: blockers.length ? "research-needed" : "owner-review", blockers,
        nextStep: row.next_step || "Current policy aur audience fit verify karein.",
        draft: `Hello ${row.organization} team,\n\nI help maintain HomeMoney Calc. We have free browser-based teaching scenarios with formulas, worked examples and limitations:\n${resource.href}\n\nDo you accept suggestions for independent financial-education resources? If so, could you point me to your current eligibility/reference requirements, relevant review channel and any submission fee? I would like to check suitability before proposing a resource.\n\nThank you,\n[Your name]\nHomeMoney Calc`,
      });
      if (items.length === base.reviewCap) break;
    }
    return { ...base, status: "available", items, trackedRecords: rows.length };
  } catch { return { ...base, status: "unavailable", message: "Tracker missing ya invalid hai; queue verify nahi hui. Iska matlab zero prospects nahi hai." }; }
}

export function readLinkReview(file, date) {
  try { return buildLinkReview(readFileSync(file, "utf8"), date); }
  catch { return { date, reviewCap: 2, automatedSubmission: false, status: "unavailable", items: [], message: "Central tracker unavailable; research queue verify karein." }; }
}
