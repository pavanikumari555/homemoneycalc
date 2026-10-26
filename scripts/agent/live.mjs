/** Bounded public checks; admin auth is never bypassed and credentials are never requested. */
export async function liveChecks(siteUrl, fetcher = fetch) {
  const targets = [
    ["/", 200], ["/paycheck-calculator/", 200], ["/sitemap.xml", 200], ["/robots.txt", 200],
    ["/admin/", 302], ["/embed/paycheck-calculator/", 200],
  ];
  return Promise.all(targets.map(async ([path, expected]) => {
    try {
      const response = await fetcher(`${siteUrl}${path}`, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(12_000) });
      // Datacenter/GitHub runners can hit Cloudflare bot/WAF rules even while browsers work.
      // This is missing monitoring coverage, not proof that the page is broken or healthy.
      if (response.headers.get("cf-mitigated") === "challenge" || (response.status === 403 && /cloudflare/i.test(response.headers.get("server") || ""))) {
        await response.body?.cancel();
        return { path, http: response.status, status: "unknown", blockedBy: "cloudflare", ray: response.headers.get("cf-ray"), message: "Cloudflare blocked this monitoring request. Verify browser access and security events; an outage is not confirmed." };
      }
      const problems = [];
      if (response.status !== expected) problems.push(`Expected HTTP ${expected}, got ${response.status}`);
      if (expected === 200 && !response.headers.get("content-security-policy")) problems.push("CSP header missing");
      if (path === "/") {
        if (!/max-age=[1-9]\d*/i.test(response.headers.get("strict-transport-security") || "")) problems.push("HSTS missing or disabled");
        if (response.headers.get("x-content-type-options") !== "nosniff") problems.push("MIME sniffing protection missing");
        if (response.headers.get("x-frame-options") !== "SAMEORIGIN") problems.push("Main page framing protection missing");
        if (/\bnoindex\b/i.test(response.headers.get("x-robots-tag") || "")) problems.push("Public home unexpectedly noindex");
      }
      if (path === "/embed/paycheck-calculator/" && response.headers.get("x-frame-options")) problems.push("Embed framing blocked");
      if (path === "/admin/" && response.headers.get("location") !== "https://homemoneycalc-admin.pages.dev/admin/") problems.push("Secure admin entry destination mismatch");
      await response.body?.cancel();
      return { path, http: response.status, status: problems.length ? "fail" : "pass", message: problems.join("; ") || "Expected response and headers present." };
    } catch {
      return { path, http: null, status: "unknown", message: "Live response unavailable (network/timeout); verify before treating as a site failure." };
    }
  }));
}
