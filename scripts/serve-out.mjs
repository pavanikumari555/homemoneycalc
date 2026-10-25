// ============================================================================
// LOCAL "LIVE JAISA" PREVIEW — `npm run build` ke baad out/ ko public/_headers ke
// security headers (CSP waghera) ke saath serve karta hai, bilkul Cloudflare Pages jaisa.
// Kyun: dev server headers nahi lagata — CSP se kuch toota ho to yahin pata chal jaata hai.
// Usage: node scripts/serve-out.mjs [port]   (sirf 127.0.0.1 pe)
// ============================================================================
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, resolve, relative, isAbsolute } from "node:path";

const OUT = "out";
const port = Number(process.argv[2] || 3124);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".xml": "application/xml" };

// _headers parse: "path-pattern" ke neeche indented "Name: value" ya "! Name" (detach)
const rules = [];
for (const line of readFileSync("public/_headers", "utf8").split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith("#")) continue;
  if (!/^\s/.test(line)) rules.push({ pattern: line.trim(), set: [], detach: [] });
  else if (line.trim().startsWith("!")) rules.at(-1).detach.push(line.trim().slice(1).trim().toLowerCase());
  else {
    const i = line.indexOf(":");
    rules.at(-1).set.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
  }
}
const matches = (pattern, path) => !pattern.startsWith("http") && new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`).test(path);

createServer((req, res) => {
  let path;
  try {
    path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path.includes("\0")) return res.writeHead(400).end();
  } catch {
    return res.writeHead(400).end();
  }
  const root = resolve(OUT);
  let file = resolve(root, `.${path}`);
  const rel = relative(root, file);
  if (rel === ".." || rel.startsWith("../") || rel.startsWith("..\\") || isAbsolute(rel)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  const found = existsSync(file);
  if (!found) file = join(OUT, "404.html");

  const headers = new Map();
  for (const r of rules.filter((r) => matches(r.pattern, path))) {
    for (const d of r.detach) headers.delete(d);
    for (const [k, v] of r.set) headers.set(k.toLowerCase(), v);
  }
  res.writeHead(found ? 200 : 404, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", ...Object.fromEntries(headers) });
  res.end(readFileSync(file));
}).listen(port, "127.0.0.1", () => console.log(`Live-like preview: http://127.0.0.1:${port}`));
