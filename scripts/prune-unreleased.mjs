// ============================================================================
// Build ke baad (postbuild): jo tools abhi queue me hain (publish date future me),
// unke folders out/ se hata do — taaki live site pe asli 404 aaye, "soft 404" nahi.
// Public build me admin folder bhi hatao (wo sirf BUILD_ADMIN=1 wale locked project me).
// ============================================================================
import { readFileSync, rmSync, existsSync, writeFileSync } from "node:fs";

const OUT = "out";
if (!existsSync(OUT)) process.exit(0);

const today = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
const previewAll = process.env.NEXT_PUBLIC_PREVIEW_ALL === "1";
const src = readFileSync("lib/site.ts", "utf8");
const block = src.slice(src.indexOf("export const ALL_TOOLS"), src.indexOf("export const CATEGORY_LABELS"));
const queued = previewAll
  ? []
  : [...block.matchAll(/\{\s*slug: "([^"]+)"[\s\S]*?added: "([^"]+)"/g)].filter((m) => m[2] > today).map((m) => m[1]);

for (const slug of queued) {
  for (const dir of [`${OUT}/${slug}`, `${OUT}/embed/${slug}`]) rmSync(dir, { recursive: true, force: true });
}
if (process.env.BUILD_ADMIN !== "1") rmSync(`${OUT}/admin`, { recursive: true, force: true });
console.log(`✓ Release queue: ${queued.length} tool(s) waiting${queued.length ? ` (${queued.join(", ")})` : ""}`);

// Service worker cache ka naam har build pe naya — purane deploy ke HTML/chunks offline me mix na hon
const sw = `${OUT}/sw.js`;
if (existsSync(sw)) {
  const id = `hmc-${today}-${Date.now().toString(36)}`;
  writeFileSync(sw, readFileSync(sw, "utf8").replace(/const CACHE = "[^"]*";/, `const CACHE = "${id}";`));
}
