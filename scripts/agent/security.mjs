// Read-only edge checks. No credentials, affiliate clicks, load tests or WAF changes.
export async function securityChecks(fetcher = fetch) {
  const root = "https://homemoneycalc.com";
  const targets = [
    { url: "http://homemoneycalc.com/", redirect: `${root}/` },
    { url: "https://www.homemoneycalc.com/?edge-check=1", redirect: `${root}/?edge-check=1` },
    { url: "https://homemoneycalc.pages.dev/", noindex: true },
    { url: "https://homemoneycalc-admin.pages.dev/admin/", private: true },
    { url: "https://homemoneycalc-admin.pages.dev/admin/api/approvals", private: true },
    { url: `${root}/wp-login.php`, scanner: true },
    { url: `${root}/.env`, scanner: true },
  ];
  return Promise.all(targets.map(async (target) => {
    const base = { path: target.url, category: "security", checkedAt: new Date().toISOString() };
    try {
      const response = await fetcher(target.url, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(12_000) });
      const header = (name) => response.headers.get(name) || "";
      const evidence = { location: header("location"), robots: header("x-robots-tag"), cache: header("cache-control"), ray: header("cf-ray") };
      await response.body?.cancel();
      // A challenge proves neither correct routing nor a working login boundary.
      if (header("cf-mitigated") === "challenge" || (!target.scanner && response.status === 403 && /cloudflare/i.test(header("server")))) {
        return { ...base, http: response.status, status: "unknown", blockedBy: "cloudflare", evidence, message: "Edge challenge/block: target protection could not be verified." };
      }
      const problems = [];
      if (target.redirect && (![301, 308].includes(response.status) || evidence.location !== target.redirect)) problems.push("Permanent HTTPS/canonical redirect mismatch");
      if (target.noindex && (response.status !== 200 || !/\bnoindex\b/i.test(evidence.robots))) problems.push("Alternate host must return 200 with noindex");
      if (target.private) {
        if (response.status !== 401 || !/^Basic\s/i.test(header("www-authenticate"))) problems.push("Expected username/password authentication challenge");
        if (!/\bno-store\b/i.test(evidence.cache) || !/\bnoindex\b/i.test(evidence.robots)) problems.push("Private response must be no-store and noindex");
      }
      if (target.scanner && response.status !== 403) problems.push("Expected scanner path block (403)");
      return { ...base, http: response.status, status: problems.length ? "fail" : "pass", evidence, message: problems.join("; ") || (target.scanner ? "Scanner path blocked; specific rule configuration not verified." : "Expected edge response verified; account settings not inspected.") };
    } catch {
      return { ...base, http: null, status: "unknown", message: "Network/timeout: security check unavailable." };
    }
  }));
}
