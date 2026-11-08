const CACHE_NAME = "homemoneycalc-v2";
const OFFLINE_URLS = ["/", "/manifest.json", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("homemoneycalc-") && key !== CACHE_NAME).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Only the public shell is cached. Never store financial query strings,
  // admin responses, external analytics or Next.js client navigation payloads.
  if (event.request.method !== "GET" || url.origin !== self.location.origin || url.search ||
      !OFFLINE_URLS.includes(url.pathname) || (url.pathname === "/" && event.request.mode !== "navigate")) return;
  event.respondWith((async () => {
    // Storage can be disabled entirely (not only full). Still try the network.
    let cache;
    try { cache = await caches.open(CACHE_NAME); } catch { /* network remains available */ }
    try {
      const response = await fetch(event.request);
      if (response.ok && !response.redirected) {
        // A full/unavailable cache must not break a successful network response.
        try { await cache?.put(event.request, response.clone()); } catch { /* use network */ }
      }
      return response;
    } catch (error) {
      const cached = await cache?.match(event.request);
      if (cached) return cached;
      throw error;
    }
  })());
});
