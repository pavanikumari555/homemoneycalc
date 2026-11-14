// ============================================================================
// SOURCE LINKS — Lychee (weekly, GitHub Action) ka JSON result padhta hai.
// Sirf bahar ke links (IRS, Fed, state sites) check hote hain; apni site ke links audit.mjs dekhta hai.
// Timeout ya bot-block ko "toota" nahi maante — sirf asli errors (404, 410, DNS, 5xx) report hote hain.
// ============================================================================
import { existsSync, readFileSync, statSync } from "node:fs";

// out/paycheck-calculator/index.html -> /paycheck-calculator/
const pageOf = (source) => {
  const p = String(source).replace(/\\/g, "/").replace(/^.*?\bout\//, "/").replace(/index\.html$/, "");
  return p.startsWith("/") ? p : `/${p}`;
};

export function parseLinkCheck(json, checkedAt) {
  const errorMap = json?.error_map ?? json?.fail_map ?? {};
  const byUrl = new Map();
  for (const [source, entries] of Object.entries(errorMap)) {
    for (const e of Array.isArray(entries) ? entries : []) {
      if (!e?.url || !/^https?:/i.test(e.url)) continue;
      const status = typeof e.status === "string" ? e.status : e.status?.code ? `HTTP ${e.status.code}` : String(e.status?.text ?? "error").slice(0, 80);
      const item = byUrl.get(e.url) ?? { url: e.url, status, pages: [] };
      const page = pageOf(source);
      if (!item.pages.includes(page)) item.pages.push(page);
      byUrl.set(e.url, item);
    }
  }
  return {
    checked: true,
    checkedAt,
    total: Number.isFinite(json?.unique) ? json.unique : Number.isFinite(json?.total) ? json.total : null,
    timeouts: Number.isFinite(json?.timeouts) ? json.timeouts : 0,
    broken: [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url)),
  };
}

/** Is run mein naya result hai to wo, warna pichhli report ka result (hafte bhar dikhta rahe). */
export function readLinkCheck(path, previous) {
  if (existsSync(path)) {
    try {
      return parseLinkCheck(JSON.parse(readFileSync(path, "utf8")), statSync(path).mtime.toISOString());
    } catch {
      return { checked: false, status: "unreadable" };
    }
  }
  return previous?.checked ? previous : null;
}
