// ============================================================================
// TOOL REGISTRY CHECK — har build se pehle chalta hai (npm "prebuild").
// Naya tool add karte waqt koi cheez bhool gaye to build yahin ruk jaayega
// aur saaf bata dega kya missing hai. Isse live site kabhi tootegi nahi.
// ============================================================================
import { readFileSync, existsSync } from "node:fs";

const src = readFileSync("lib/site.ts", "utf8");
const block = src.slice(src.indexOf("export const TOOLS"), src.indexOf("export const CATEGORY_LABELS"));
const tools = [...block.matchAll(/\{\s*slug: "([^"]+)"[\s\S]*?\n  \},/g)].map((m) => ({ slug: m[1], body: m[0] }));
const categories = [...src.matchAll(/^\s+(\w+): "[^"]+",$/gm)]
  .filter((m) => src.indexOf(m[0]) > src.indexOf("CATEGORY_LABELS"))
  .map((m) => m[1]);
const icons = readFileSync("components/Icon.tsx", "utf8");

const errors = [];
const seen = new Set();
const slugs = new Set(tools.map((t) => t.slug));
const REQUIRED = ["title:", "shortTitle:", "category:", "blurb:", "icon:", "updated:", "related:", "example:", "keywords:", "added:"];

for (const t of tools) {
  const where = `Tool "${t.slug}"`;
  if (seen.has(t.slug)) errors.push(`${where}: duplicate slug`);
  seen.add(t.slug);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug)) errors.push(`${where}: slug must be lowercase-with-dashes`);
  for (const f of REQUIRED) if (!t.body.includes(f)) errors.push(`${where}: missing field ${f.replace(":", "")}`);
  if (!existsSync(`app/${t.slug}/page.tsx`)) errors.push(`${where}: page file app/${t.slug}/page.tsx not found`);
  const cat = /category: "(\w+)"/.exec(t.body)?.[1];
  if (cat && !categories.includes(cat)) errors.push(`${where}: unknown category "${cat}"`);
  const icon = /icon: "(\w+)"/.exec(t.body)?.[1];
  if (icon && !icons.includes(`\n  ${icon}: "`)) errors.push(`${where}: icon "${icon}" not defined in components/Icon.tsx`);
  for (const d of [...t.body.matchAll(/(updated|added): "([^"]*)"/g)]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d[2])) errors.push(`${where}: ${d[1]} must be YYYY-MM-DD`);
  }
  const related = /related: \[([^\]]*)\]/.exec(t.body)?.[1] ?? "";
  for (const r of related.match(/"[^"]+"/g) ?? []) {
    const rs = r.slice(1, -1);
    if (!slugs.has(rs)) errors.push(`${where}: related tool "${rs}" does not exist`);
    if (rs === t.slug) errors.push(`${where}: related list includes itself`);
  }
}

if (errors.length) {
  console.error(`\n✗ Tool registry check failed (${errors.length}):\n  - ${errors.join("\n  - ")}\n`);
  process.exit(1);
}
console.log(`✓ Tool registry OK — ${tools.length} tools`);
