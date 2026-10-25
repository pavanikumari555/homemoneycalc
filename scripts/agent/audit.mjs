// ============================================================================
// TECHNICAL SEO AUDIT — built site (out/ folder) ki har HTML file check karta hai.
// Koi external service nahi; build ke baad free me chalta hai.
// ============================================================================
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attr = (html, re) => decode(re.exec(html)?.[1]?.trim() ?? "");

export function auditSite(outDir = "out", siteUrl = "https://homemoneycalc.com") {
  if (!existsSync(outDir)) return { ran: false, reason: "out/ not found — run npm run build first" };

  const htmlFiles = walk(outDir).filter((f) => f.endsWith(".html"));
  const routes = new Set(
    htmlFiles.map((f) => {
      const r = "/" + relative(outDir, f).replace(/\\/g, "/").replace(/index\.html$/, "").replace(/\.html$/, "/");
      return r === "//" ? "/" : r;
    })
  );
  const sitemap = existsSync(join(outDir, "sitemap.xml")) ? readFileSync(join(outDir, "sitemap.xml"), "utf8") : "";
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(siteUrl, "") || "/");

  const pages = [];
  const issues = [];
  for (const file of htmlFiles) {
    const route = "/" + relative(outDir, file).replace(/\\/g, "/").replace(/index\.html$/, "");
    if (route.startsWith("/404") || route.startsWith("/_not-found") || route.startsWith("/admin") || route.startsWith("/embed")) continue; // embed = noindex iframe widget
    const html = readFileSync(file, "utf8");
    const title = attr(html, /<title>([^<]*)<\/title>/);
    const desc = attr(html, /<meta name="description" content="([^"]*)"/);
    const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
    const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
    const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
    const words = html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    const kb = Math.round(statSync(file).size / 1024);
    pages.push({ route, title, titleLength: title.length, descriptionLength: desc.length, h1s, words, kb, noindex });

    const add = (severity, message) => issues.push({ route, severity, message });
    if (!title) add("error", "Missing <title>");
    else if (title.length > 65) add("warn", `Title is ${title.length} chars (aim ≤ 60)`);
    if (!desc) add("error", "Missing meta description");
    else if (desc.length > 160) add("warn", `Meta description is ${desc.length} chars (aim ≤ 155)`);
    else if (desc.length < 70) add("warn", `Meta description is short (${desc.length} chars)`);
    if (h1s !== 1) add("warn", `Page has ${h1s} <h1> tags (should be exactly 1)`);
    if (!canonical && !noindex) add("warn", "Missing canonical link");
    if (!noindex && words < 300) add("warn", `Thin content: ~${words} words`);
    if (!noindex && !sitemapUrls.includes(route)) add("warn", "Indexable page not in sitemap.xml");

    // Broken internal links
    for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
      const href = m[1].endsWith("/") ? m[1] : `${m[1]}/`;
      const isAsset = /\.(svg|png|ico|xml|txt|webmanifest|js|css|json)\/$/.test(href);
      if (!isAsset && !routes.has(href) && !href.startsWith("/_next/")) add("error", `Broken internal link → ${m[1]}`);
    }
    // Images without alt text
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) add("warn", "Image without alt text");
  }

  for (const url of sitemapUrls) if (!routes.has(url)) issues.push({ route: url, severity: "error", message: "In sitemap but page does not exist" });

  // De-duplicate repeated identical issues on the same page
  const seen = new Set();
  const unique = issues.filter((i) => {
    const k = `${i.route}|${i.message}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    ran: true,
    pageCount: pages.length,
    errors: unique.filter((i) => i.severity === "error").length,
    warnings: unique.filter((i) => i.severity === "warn").length,
    issues: unique.slice(0, 100),
    pages,
  };
}
