// Upstream bytes are evidence only. This command never installs or executes them.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const APPROVED = new Set(["vercel-labs/skills", "vercel-labs/agent-skills", "vercel-labs/web-interface-guidelines", "morluto/rea"]);
const SHA = /^[a-f0-9]{40}$/;

async function githubJson(path, fetcher) {
  const response = await fetcher(`https://api.github.com/repos/${path}`, {
    redirect: "error",
    headers: { accept: "application/vnd.github+json", "user-agent": "HomeMoneyCalcSkillReview/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) { await response.body?.cancel(); throw new Error(`GitHub HTTP ${response.status}; source not verified`); }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Missing response body");
  const chunks = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4 * 1024 * 1024) { await reader.cancel(); throw new Error("Comparison exceeds bounded review size"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function relevant(path, prefixes) {
  return typeof path === "string" && prefixes.some(p => p.endsWith("/") ? path.startsWith(p) : path === p);
}

export async function watchSkills(config, fetcher = fetch, now = new Date()) {
  const observations = [];
  if (!Array.isArray(config.sources) || config.sources.length > 6) throw new Error("Invalid source inventory");
  for (const source of config.sources) {
    const base = { id: source.id, repo: source.repo, reviewedRef: source.reviewedRef, checkedAt: now.toISOString() };
    try {
      if (!APPROVED.has(source.repo) || !SHA.test(source.reviewedRef) || !Array.isArray(source.paths) || !source.paths.length || source.paths.some(p => typeof p !== "string" || !p || p.includes("..") || p.startsWith("/") || p.includes("\\"))) throw new Error("Unapproved source or invalid review boundary");
      const head = await githubJson(`${source.repo}/commits/main`, fetcher);
      if (!SHA.test(head.sha)) throw new Error("Invalid upstream revision");
      const compareUrl = `https://github.com/${source.repo}/compare/${source.reviewedRef}...${head.sha}`;
      if (head.sha === source.reviewedRef) {
        observations.push({ ...base, candidateRef: head.sha, status: "unchanged", changedFiles: [], compareUrl });
        continue;
      }
      const comparison = await githubJson(`${source.repo}/compare/${source.reviewedRef}...${head.sha}?per_page=1`, fetcher);
      if (comparison.status !== "ahead" || !Array.isArray(comparison.files) || comparison.files.length >= 300) throw new Error("History diverged or comparison incomplete; manual source review required");
      const files = comparison.files.filter(f => relevant(f.filename, source.paths) || relevant(f.previous_filename, source.paths));
      observations.push({ ...base, candidateRef: head.sha, status: files.length ? "review-needed" : "unchanged", compareUrl,
        changedFiles: files.map(f => ({ path: f.filename, previousPath: f.previous_filename || null, status: f.status })) });
    } catch (error) {
      observations.push({ ...base, status: "unknown", reason: String(error.message).slice(0, 200), changedFiles: [] });
    }
  }
  return { version: 1, generatedAt: now.toISOString(), automaticInstallation: false, automaticExecution: false, observations };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = JSON.parse(readFileSync("data/skill-sources.json", "utf8"));
  const result = await watchSkills(config);
  writeFileSync("data/skill-observations.json", `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
  if (result.observations.some(o => o.status === "unknown")) process.exitCode = 1;
}
