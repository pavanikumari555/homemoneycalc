// Generates public/ads.txt from SITE.adsensePublisherId (lib/site.ts) before every build.
// AdSense needs /ads.txt at the site root; ID khaali ho to file nahi banti.
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";

const id = /adsensePublisherId: "([^"]*)"/.exec(readFileSync("lib/site.ts", "utf8"))?.[1] ?? "";
const path = "public/ads.txt";
if (id) {
  const pub = id.replace(/^ca-/, "");
  writeFileSync(path, `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
  console.log(`✓ ads.txt written for ${pub}`);
} else if (existsSync(path)) {
  unlinkSync(path);
}
