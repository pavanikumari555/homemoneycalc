// Prebuild: data/offers.json se public/_redirects banata hai -> /go/<id>/ = affiliate/template link.
// Kyun /go/: link badalna ho to ek jagah badlo; pages pe saaf URL; robots.txt me /go/ disallow.
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";

const { offers = [] } = JSON.parse(readFileSync("data/offers.json", "utf8"));
// Sirf saaf https URL (koi space/newline/quote nahi) aur simple id — warna _redirects file me
// galat/extra rule ghus sakta hai (jaise poori site kahin aur redirect ho jaaye).
const SAFE_URL = /^https:\/\/[^\s"'<>]+$/;
const SAFE_ID = /^[a-z0-9-]+$/;
const bad = offers.filter((o) => o.url && (!SAFE_URL.test(o.url) || !SAFE_ID.test(o.id)));
if (bad.length) {
  console.error(`✗ data/offers.json: unsafe url/id for ${bad.map((o) => o.id).join(", ")}`);
  process.exit(1);
}
const live = offers.filter((o) => SAFE_URL.test(o.url ?? ""));
const path = "public/_redirects";
if (live.length) {
  const lines = live.flatMap((o) => [`/go/${o.id} ${o.url} 302`, `/go/${o.id}/ ${o.url} 302`]);
  writeFileSync(path, `# Auto-generated from data/offers.json — edit that file, not this one.\n${lines.join("\n")}\n`);
  console.log(`✓ _redirects: ${live.length} offer link(s)`);
} else if (existsSync(path)) {
  unlinkSync(path);
}
