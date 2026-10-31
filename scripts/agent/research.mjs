// Read-only monitoring. Fetched text is untrusted evidence, never executable instructions.
import { createHash } from "node:crypto";
const hash = (s) => createHash("sha256").update(s).digest("hex");
const AGENT = "HomeMoneyCalcMonitor";
const HOSTS = new Set(["www.irs.gov", "www.ssa.gov", "www.ftb.ca.gov", "developers.google.com", "support.google.com", "www.adp.com", "www.calculator.net", "smartasset.com"]);

export function robotsAllowed(text, target) {
  const groups = [];
  let group = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#")[0].trim();
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).toLowerCase(), val = line.slice(colon + 1).trim();
    if (key === "user-agent") {
      if (!group || group.rules.length) { group = { agents: [], rules: [] }; groups.push(group); }
      group.agents.push(val.toLowerCase());
    } else if (group && ["allow", "disallow"].includes(key) && val) group.rules.push({ allow: key === "allow", path: val });
  }
  const specific = groups.filter((g) => g.agents.some((a) => a !== "*" && AGENT.toLowerCase().startsWith(a)));
  const selected = specific.length ? specific : groups.filter((g) => g.agents.includes("*"));
  const rules = selected.flatMap((g) => g.rules).filter((r) => {
    const escaped = r.path.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$");
    return new RegExp(`^${escaped}`).test(target);
  }).sort((a, b) => b.path.replace(/[*$]/g, "").length - a.path.replace(/[*$]/g, "").length || Number(b.allow) - Number(a.allow));
  return !rules.length || rules[0].allow;
}

async function boundedGet(url, fetcher, redirects = 0) {
  const u = new URL(url);
  if (u.protocol !== "https:" || !HOSTS.has(u.hostname) || u.username || u.password || redirects > 2) throw new Error("Unapproved source or redirect.");
  const response = await fetcher(url, { redirect: "manual", headers: { "user-agent": `${AGENT}/1.0 (+https://homemoneycalc.com/contact/)`, accept: "text/html,text/plain" }, signal: AbortSignal.timeout(10000) });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const destination = new URL(response.headers.get("location") || "", url);
    await response.body?.cancel();
    if (destination.hostname !== u.hostname) throw new Error("Cross-host redirect needs review.");
    return boundedGet(destination.href, fetcher, redirects + 1);
  }
  if (!response.ok) { await response.body?.cancel(); return { status: response.status, text: "" }; }
  const reader = response.body?.getReader();
  const chunks = []; let size = 0;
  if (reader) {
    for (;;) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 512000) { await reader.cancel(); throw new Error("Source exceeds bounded response size."); } chunks.push(value); }
  }
  const combined = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
  return { status: response.status, text: new TextDecoder().decode(combined) };
}
export function sourceText(html) {
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] || /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] || html;
  return main.replace(/<(script|style|nav|footer|header)\b[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim().slice(0, 60000);
}
export async function observeSources(config, previous = { observations: [] }, now = new Date(), fetcher = fetch) {
  const observations = [];
  const robots = new Map();
  for (const source of (config.sources || []).slice(0, 8)) {
    const old = previous.observations?.find((o) => o.id === source.id && o.url === source.url);
    const age = old?.checkedAt ? (now - new Date(old.checkedAt)) / 86400000 : Infinity;
    if (age >= 0 && age < Math.max(7, config.intervalDays || 7)) { observations.push(old); continue; }
    const base = { ...source, checkedAt: now.toISOString(), previousHash: old?.hash || null };
    try {
      const u = new URL(source.url);
      if (!HOSTS.has(u.hostname)) throw new Error("Host is not approved.");
      if (!robots.has(u.origin)) robots.set(u.origin, await boundedGet(`${u.origin}/robots.txt`, fetcher));
      const robot = robots.get(u.origin);
      if (robot.status !== 404 && (robot.status !== 200 || !robotsAllowed(robot.text, `${u.pathname}${u.search}`))) throw new Error("Robots permission unavailable or disallowed; no page fetched.");
      const page = await boundedGet(source.url, fetcher);
      if (page.status !== 200) throw new Error(`HTTP ${page.status}; content not verified.`);
      const text = sourceText(page.text);
      if (text.length < 150 || /just a moment|verify you are human|access denied/i.test(text.slice(0, 600))) throw new Error("Source content blocked or too short.");
      const currentHash = hash(text);
      observations.push({ ...base, hash: currentHash, status: old?.hash ? old.hash === currentHash ? "unchanged" : "changed" : "baseline", excerpt: text.slice(0, 900), summary: old?.hash && old.hash !== currentHash ? "Public page text changed since previous successful observation; verify the actual change and effective date before using it." : "Read-only observation; no verified rule/feature change inferred.", previousExcerpt: old?.excerpt || null });
    } catch (e) {
      observations.push({ ...base, hash: old?.hash || null, excerpt: old?.excerpt || null, status: "unknown", summary: String(e.message).slice(0, 200) });
    }
  }
  return { version: 1, generatedAt: now.toISOString(), keywordVolumesVerified: false, automatedSearchScraping: false, observations };
}
