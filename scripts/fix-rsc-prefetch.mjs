// ============================================================================
// Next.js 16 static-export workaround (build ke baad chalta hai: "postbuild").
// Export writes segment files as  out/<route>/__next.<route>/__PAGE__.txt
// but the browser prefetches       out/<route>/__next.<route>.__PAGE__.txt
// -> 404s in the console and slower page-to-page clicks. We copy each file to
// the name the browser asks for. Safe to delete once Next.js fixes it.
// ============================================================================
import { readdirSync, statSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
if (!existsSync(OUT)) process.exit(0);

let copied = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      // flatten: __next.<route>/<a>/<b>.txt -> __next.<route>.<a>.<b>.txt (next to the folder)
      const flatten = (sub, prefix) => {
        for (const f of readdirSync(sub)) {
          const fp = join(sub, f);
          if (statSync(fp).isDirectory()) flatten(fp, `${prefix}.${f}`);
          else if (f.endsWith(".txt")) {
            copyFileSync(fp, join(dir, `${prefix}.${f}`));
            copied++;
          }
        }
      };
      flatten(p, name);
    } else if (name !== "_next") {
      walk(p);
    }
  }
}
walk(OUT);
console.log(`✓ RSC prefetch files fixed (${copied})`);
