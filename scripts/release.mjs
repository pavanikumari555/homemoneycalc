// ============================================================================
// RELEASE CHECK — roz subah release.yml chalata hai.
// Batata hai aaj (ya kal, agar kal ka run chhoot gaya) kaunse tools publish hue,
// aur unke source paths print karta hai taaki indexnow.mjs Bing ko ping kar sake.
// Usage: node scripts/release.mjs            -> "app/<slug>/page.tsx app/page.tsx" (ya khaali)
// ============================================================================
import { readFileSync } from "node:fs";

const DAY = 86_400_000;
const today = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
const since = new Date(Date.parse(`${today}T00:00:00Z`) - DAY).toISOString().slice(0, 10);

const src = readFileSync("lib/site.ts", "utf8");
const block = src.slice(src.indexOf("export const ALL_TOOLS"), src.indexOf("export const CATEGORY_LABELS"));
const fresh = [...block.matchAll(/\{\s*slug: "([^"]+)"[\s\S]*?added: "([^"]+)"/g)]
  .filter((m) => m[2] >= since && m[2] <= today)
  .map((m) => m[1]);

// Naya tool = home + /calculators bhi badle (naya card)
if (fresh.length) console.log([...fresh.map((s) => `app/${s}/page.tsx`), "app/page.tsx", "app/calculators/page.tsx"].join(" "));
