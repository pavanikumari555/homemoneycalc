import { spawnSync } from "node:child_process";

/** These checks execute project scripts only. Never pass AI-generated shell commands. */
export function qualityChecks(run = spawnSync) {
  const jobs = [["tests", "Calculator regression tests", ["test"]], ["registry", "Tool registry", ["run", "check-tools"]], ["lint", "Code quality", ["run", "lint"]], ["dependencies", "Dependency security audit", ["audit", "--json"]]];
  return jobs.map(([id, label, args]) => {
    const windows = process.platform === "win32";
    const result = windows
      ? run(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `npm ${args.join(" ")}`], { encoding: "utf8", timeout: 120_000 })
      : run("npm", args, { encoding: "utf8", timeout: 120_000 });
    if (id === "dependencies") {
      try {
        const audit = JSON.parse(result.stdout);
        const count = audit.metadata?.vulnerabilities?.total;
        if (result.error || typeof count !== "number") throw new Error("No audit data");
        return { id, label, status: count > 0 ? "fail" : "pass", summary: `${count} known dependency vulnerabilities reported.` };
      } catch {
        return { id, label, status: "unknown", summary: "Dependency audit unavailable; network or registry access verify karo." };
      }
    }
    if (result.status !== 0 && !result.error && result.stdout) console.error(`${label}\n${result.stdout.slice(-4000)}\n${(result.stderr || "").slice(-2000)}`);
    return { id, label, status: result.error ? "unknown" : result.status === 0 ? "pass" : "fail", summary: result.error ? "Check execute nahi ho saka; workflow log dekho." : result.status === 0 ? "Check passed." : "Check failed; workflow log mein exact error dekho." };
  });
}
