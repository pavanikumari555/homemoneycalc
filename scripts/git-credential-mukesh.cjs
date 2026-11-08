// Repo-scoped Git helper: use only Mukesh's saved gh login, never a fallback account.
const { spawnSync } = require("node:child_process");

function credential(input, run = spawnSync) {
  const fields = Object.fromEntries(input.trim().split(/\r?\n/).map(line => {
    const at = line.indexOf("=");
    return [line.slice(0, at), line.slice(at + 1)];
  }));
  if (fields.protocol !== "https" || fields.host !== "github.com" ||
      !["pavanikumari555/homemoneycalc", "pavanikumari555/homemoneycalc.git"].includes(fields.path) ||
      (fields.username && fields.username !== "mukeshs555")) return "quit=true\n\n";
  const env = { ...process.env };
  for (const key of ["GH_TOKEN", "GITHUB_TOKEN", "GH_ENTERPRISE_TOKEN", "GITHUB_ENTERPRISE_TOKEN"]) delete env[key];
  const invoke = args => run("gh", args, { encoding: "utf8", windowsHide: true, env, timeout: 20000 });
  const saved = invoke(["auth", "token", "--hostname", "github.com", "--user", "mukeshs555"]);
  const token = saved.stdout?.trim();
  if (saved.status !== 0 || !token || /[\r\n]/.test(token)) return "quit=true\n\n";
  env.GH_TOKEN = token;
  const identity = invoke(["api", "--hostname", "github.com", "user", "--jq", ".login"]);
  if (identity.status !== 0 || identity.stdout?.trim() !== "mukeshs555") return "quit=true\n\n";
  return `username=mukeshs555\npassword=${token}\n\n`;
}

if (require.main === module && process.argv[2] === "get") {
  try { process.stdout.write(credential(require("node:fs").readFileSync(0, "utf8"))); }
  catch { process.stdout.write("quit=true\n\n"); }
}
module.exports = { credential };
