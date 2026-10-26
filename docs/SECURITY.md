# HomeMoney Calc — security and search protection

Last reviewed: 26 Oct 2026 (IST). Security reduces risk; no setting guarantees that a site cannot be hacked or lose rankings.

## Architecture and boundaries

Public calculators use a static Next.js export; calculations stay in the browser. Cloudflare Pages Functions do run server code for admin login, redirects and approval decisions. Account takeover, unsafe scripts, dependency issues and function bugs remain possible.

Admin uses a separate deployment with username/password authentication, not a verified Cloudflare Access/OTP policy. Missing configuration fails closed. Private responses are no-store/noindex. The decision API also validates host, origin, JSON, proposal hash and expiry. Its restricted server token remains an owner setup dependency. A 401 probe does not verify authenticated decisions.

## Verified live on 26 Oct

- Root 200 with CSP, HSTS, nosniff and SAMEORIGIN.
- HTTP redirects to HTTPS; www redirects to root, preserving query strings.
- Scanner paths /wp-login.php and /.env return 403. The exact causing rule was not inspected.
- Public /admin/ redirects to private admin. Unauthenticated dashboard/API return 401 with Basic challenge, no-store and noindex.
- Alternate public pages.dev host returns noindex. Robots permits public crawling and advertises the sitemap; sitemap returns 200.
- Production dependency audit: zero known vulnerabilities at review time. Unknown vulnerabilities and full code-audit coverage are not implied.
- Resolver 1.1.1.1 returned no DS answer: DNSSEC registrar chain remains pending.

Evidence: data/security-review.json. scripts/agent/security.mjs adds daily bounded HEAD checks to existing report/action queues. Challenges and timeouts remain unknown. No affiliate clicks or load tests are generated.

## Protections and limitations

CSP restricts origins but currently permits inline scripts/styles for Next.js. It reduces some injection risks; it does not prevent all XSS. React escaping, safe JSON-LD and validated inputs remain necessary. Embeds intentionally allow framing. New ads/analytics require privacy, consent and CSP review.

Cloudflare can mitigate DDoS; availability is not guaranteed. Static hosting and server-function quotas differ. Bot protection can challenge legitimate visitors/monitors. Inspect security events and verified search crawler access before changing it. Free Bot Fight Mode cannot be skipped using a WAF Skip rule. Do not weaken protection globally to turn a monitor green.

## Account settings requiring inspection

1. Verify authenticator/passkey 2FA on Gmail, GitHub, Cloudflare and Namecheap; keep recovery codes privately offline. 2FA reduces takeover risk, not all risk.
2. Prior checkpoint records Namecheap domain lock/auto-renew enabled. Verify payment method and current settings inside the account.
3. Enable Cloudflare DNSSEC and publish its exact DS at Namecheap, then verify the chain. Incorrect DS can break DNS.
4. Prior checkpoint records Bot Fight Mode, WAF scanner rule, /go/ rate limit and minimum TLS 1.2 enabled. Public probes do not reverify all these settings. Do not test rate limits by clicking affiliate links.
5. Verify available GitHub scanning/Dependabot settings. GitHub CLI authentication is unavailable in this session; alerts and previous hosted daily-run result remain unverified.

## Ranking and negative SEO

- Check Search Console Security issues, Manual actions, indexing and real search performance. These are not verified by the disconnected reporting API. A ranking drop alone does not prove an attack.
- Fake traffic can distort analytics and create invalid-traffic/affiliate risk. Never buy traffic or generate ad clicks. Investigate anomalies using hosting/network evidence.
- Most sites do not need disavow. Google's criteria require substantial artificial/spam links plus an actual or likely manual action. No automatic disavow/removal requests; owner review is required.
- Canonicals and alternate noindex are useful search signals, not proof of ownership or guaranteed copying protection.
- Robots controls cooperative crawling; it is not access control. Noindex is not a confidentiality boundary.

## Incident steps

1. Unexpected deployed content: inspect commits/deployments, preserve evidence, roll back the affected deployment, fix the cause.
2. Suspected compromise: revoke sessions/tokens and rotate affected secrets through the provider. Never paste secrets into chat.
3. Traffic attack: inspect events/availability; use scoped controls. Emergency challenges can affect visitors/crawlers.
4. Invalid-click warning: preserve logs and follow the network's reporting process. Do not create test clicks.

## Official references

- Cloudflare false positives: https://developers.cloudflare.com/bots/troubleshooting/false-positives/
- Google disavow criteria: https://support.google.com/webmasters/answer/2648487?hl=en
- Google hacked-content policy: https://developers.google.com/search/docs/essentials/spam-policies
