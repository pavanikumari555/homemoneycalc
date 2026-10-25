// ============================================================================
// ADMIN LOGIN (username + password) — Cloudflare Pages Function, sirf /admin/* pe chalta hai.
// Password code me NAHI hai: Cloudflare project "homemoneycalc-admin" ke Settings ->
// Variables and Secrets me ADMIN_USER + ADMIN_PASS (Encrypt/Secret) owner khud daalti hai.
// - Password set nahi -> admin band (403). Galti se bhi khula nahi rehta ("fail closed").
// - Galat password -> 401, browser dobara poochhta hai. Sahi -> page, kabhi cache nahi.
// Public /admin is a shortcut to the existing protected dashboard; no credentials are copied.
// ============================================================================

const REALM = "HomeMoney Calc Admin";

// Timing-safe compare: dono strings ka hash milao, taaki andaaze se password na pakda jaa sake
async function same(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function parseBasic(header) {
  const m = /^Basic\s+([A-Za-z0-9+/=]+)$/.exec(header || "");
  if (!m) return null;
  try {
    const decoded = new TextDecoder().decode(Uint8Array.from(atob(m[1]), (c) => c.charCodeAt(0)));
    const i = decoded.indexOf(":");
    return i < 0 ? null : { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
  } catch {
    return null;
  }
}

const deny = (status, text, extra = {}) =>
  new Response(text, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", ...extra } });

export async function onRequest({ request, env, next }) {
  const hostname = new URL(request.url).hostname;
  if (["homemoneycalc.com", "www.homemoneycalc.com", "homemoneycalc.pages.dev"].includes(hostname) || hostname.endsWith(".homemoneycalc.pages.dev")) {
    return new Response(null, { status: 302, headers: {
      location: "https://homemoneycalc-admin.pages.dev/admin/",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    } });
  }
  const user = env.ADMIN_USER;
  const pass = env.ADMIN_PASS;
  // Bahut chhota password = galti; admin band rakho jab tak strong password na ho
  if (!user || !pass || pass.length < 12) return deny(403, "Admin is locked. Owner: set ADMIN_USER and a 12+ character ADMIN_PASS in Cloudflare.");

  const given = parseBasic(request.headers.get("authorization"));
  const ok = given && (await same(given.user, user)) & (await same(given.pass, pass));
  if (!ok) return deny(401, "Login required.", { "www-authenticate": `Basic realm="${REALM}", charset="UTF-8"` });

  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set("cache-control", "no-store");
  out.headers.set("x-robots-tag", "noindex, nofollow");
  return out;
}
