// Capture only existing approved competitor HTML. Never run captured JavaScript.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { boundedGet, robotsAllowed, sourceText } from "../agent/research.mjs";

const config = JSON.parse(readFileSync("data/research-sources.json", "utf8"));
const source = config.sources.find(s => s.kind === "competitor" && s.id === process.argv[2]);
if (!source) throw new Error("Choose an existing approved competitor source ID");
const url = new URL(source.url);
const robots = await boundedGet(`${url.origin}/robots.txt`, fetch);
if (robots.status !== 404 && (robots.status !== 200 || !robotsAllowed(robots.text, url.pathname + url.search))) throw new Error("Robots unavailable or disallowed; capture stopped");
const page = await boundedGet(source.url, fetch);
const text = sourceText(page.text);
if (page.status !== 200 || text.length < 150 || /just a moment|verify you are human|access denied/i.test(text.slice(0, 600))) throw new Error("Public content unavailable; capture stopped");
const directory = `.research/${source.id}-${Date.now()}`;
mkdirSync(directory, { recursive: true });
let inlineScripts = 0;
for (const match of page.text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/\bsrc\s*=/i.test(match[1]) || /\btype\s*=\s*["']application\/(?:ld\+)?json/i.test(match[1]) || !match[2].trim()) continue;
  // This writes text for static inspection; no imports, eval, DOM, or browser.
  writeFileSync(`${directory}/inline-${++inlineScripts}.js`, match[2]);
}
const metadata = {
  source: source.url, capturedAt: new Date().toISOString(),
  htmlSha256: createHash("sha256").update(page.text).digest("hex"),
  inlineScripts, text,
  limitations: ["HTML and inline script text only; external bundles, runtime execution, private APIs, rankings, backlinks and search volume not inspected", "Original feature implementations and public text must not be copied into Calcivy"],
};
writeFileSync(`${directory}/capture.json`, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify({ directory, source: source.url, inlineScripts, htmlSha256: metadata.htmlSha256, limitations: metadata.limitations }, null, 2));
