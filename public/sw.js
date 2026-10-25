// Service worker: calculators offline bhi chal jaayein (phone pe install karke).
// Strategy: pages = network first (fresh content), fallback cache.
// Static assets (_next/static, fonts, icons) = cache first (they're versioned).
// Only same-origin GET requests are touched — ads/analytics pass straight through.
// Private pages (admin, My Money) are never cached.
const CACHE = "hmc-v1"; // postbuild (prune-unreleased.mjs) har build pe naya naam deta hai
const MAX_ENTRIES = 150; // old deploys' chunks get pruned, cache can't grow forever
const NEVER_CACHE = ["/admin", "/my-money", "/embed", "/go/"];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function putAndTrim(key, res) {
  const cache = await caches.open(CACHE);
  await cache.put(key, res);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_ENTRIES; i++) await cache.delete(keys[i]); // oldest first
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER_CACHE.some((p) => url.pathname.startsWith(p))) return;

  if (url.pathname.startsWith("/_next/static/") || /\.(svg|png|woff2?|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) event.waitUntil(putAndTrim(req, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // cache by path only, so ?share-params still hit the cached page offline
          if (res.ok) event.waitUntil(putAndTrim(url.pathname, res.clone()));
          return res;
        })
        .catch(() => caches.match(url.pathname).then((hit) => hit || caches.match("/")))
    );
  }
});
