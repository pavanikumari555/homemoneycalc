import { spawnSync } from "node:child_process";
import { auditDisposition, reviewedLegacyMatcher } from "./dependency-audit.mjs";

/** These checks execute project scripts only. Never pass AI-generated shell commands. */
export function qualityChecks(run = spawnSync) {
  const jobs = [["tests", "Calculator regression tests", ["test"]], ["registry", "Tool registry", ["run", "check-tools"]], ["lint", "Code quality", ["run", "lint"]], ["dependencies", "Development and production dependency review", ["audit", "--json", "--fetch-timeout=20000", "--fetch-retries=0"]], ["dependencies-production", "Production dependency security audit", ["audit", "--omit=dev", "--json", "--fetch-timeout=20000", "--fetch-retries=0"]]];
  return jobs.map(([id, label, args]) => {
    const windows = process.platform === "win32";
    const result = windows
      ? run(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `npm ${args.join(" ")}`], { encoding: "utf8", timeout: 120_000 })
      : run("npm", args, { encoding: "utf8", timeout: 120_000 });
    if (id.startsWith("dependencies")) {
      try {
        const audit = JSON.parse(result.stdout);
        const count = audit.metadata?.vulnerabilities?.total;
        if (result.error || typeof count !== "number") throw new Error("No audit data");
        return { id, label, ...auditDisposition(audit, { legacyReviewed: id === "dependencies" && reviewedLegacyMatcher() }) };
      } catch {
        return { id, label, status: "unknown", summary: "Dependency audit unavailable; network or registry access verify karo." };
      }
    }
    if (result.status !== 0 && !result.error && result.stdout) console.error(`${label}\n${result.stdout.slice(-4000)}\n${(result.stderr || "").slice(-2000)}`);
    return { id, label, status: result.error ? "unknown" : result.status === 0 ? "pass" : "fail", summary: result.error ? "Check execute nahi ho saka; workflow log dekho." : result.status === 0 ? "Check passed." : "Check failed; workflow log mein exact error dekho." };
  });
}
