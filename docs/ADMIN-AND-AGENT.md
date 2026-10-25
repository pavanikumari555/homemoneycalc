# Owner dashboard and agent — 26 Oct 2026

## Open the dashboard

1. Open **https://homemoneycalc.com/admin/** (with or without the last slash).
2. This entry redirects to **https://homemoneycalc-admin.pages.dev/admin/**.
3. Enter the existing admin username/password in the browser's login prompt.
4. The protected dashboard opens. No credential changes or copying secrets are needed.

The address bar changes to the protected host. This is an entry shortcut, not a reverse proxy. Authentication is still enforced on every `/admin/*` request on that host. Public builds do not export dashboard HTML or report payloads. Credentials are not stored in project files. The `/admin` shortcut is not put in public navigation or the sitemap.

## Use the five views

Update 26 Oct: a sixth **Aapki approvals** view now contains the secure decision inbox and source/competitor observations. Read `docs/AUTOMATION-APPROVALS.md` for supported execution, setup and limits. An empty queue is not a full-site health certification.

- **Aaj ka overview:** three next steps, visitors, latest recorded earning, application checkpoint and upcoming tools. Expand “Kaise karein?” for instructions.
- **Visitors & growth:** sessions, Google impressions, US share, traffic trend, prioritized page opportunities. Missing data is “—”, not zero.
- **Earning & AdSense:** actual monthly record, adjustable planning goal, readiness checklist and earning options.
- **Agent & problems:** completed checks, failures/unknown results, technical findings and improvement queue. This is diagnostic coverage, not certification of all possible problems.
- **Settings & setup:** change the monthly goal, check connections and see account-security tasks.

Changing a goal in the browser saves a **device-local preference**. To change the shared default seen by all devices and by the daily agent, update `data/revenue.json` → `goalMonthly`. Actual income remains in its `months` array. A goal is never an expected payout or an earnings ceiling.

## Stronger agent loop

Daily report: read connected GSC/GA4/Bing data → audit the built site → run regression tests, registry validation and lint → check a bounded set of public URLs/headers → calculate planning checkpoints → create a deterministic priority queue → ask the summary model to explain evidence and steps.

Coverage includes duplicate titles/canonicals, wrong canonical URLs, missing local assets, malformed JSON-LD, sitemap/internal links, live security headers, secure admin entry, disconnected data sources and stale reports. Unknown/failed checks never become healthy green results.

The report's `actions` list contains why, who, priority and exact steps. The coding agent reads this queue before selecting work, reproduces problems, makes bounded improvements and runs tests before publishing through its configured workflow. Gemini/Groq summary access is **not** source-code repair access. The existing weekly Claude workflow needs its own working Anthropic authentication; without it, use local Codex for source edits. No ranking or income guarantee is implied.

## AdSense and payments

`data/business.json` records the decision to wait for genuine traffic. The dashboard's 1,000 sessions / 200 Google clicks / 14 active search days / 3 landing pages are **our review checkpoints, not Google eligibility requirements**. Fresh connected data and completed technical checks are required for a “consider review” signal; content accuracy, traffic quality, policy and privacy checks remain part of the owner's final review. No application is submitted automatically.

AdSense can coexist with compliant non-Google ads/affiliate links: https://support.google.com/adsense/answer/9728?hl=en

The owner already has one PayPal account. Do not ask them to create another by default. Verify international receiving/KYC, merchant compatibility, and each network's payout support before use. Google's payment table lists bank wire for India, not a regular PayPal payout: https://support.google.com/adsense/answer/1714397?hl=en

## Operational limits

GSC service-account, GA4 and PageSpeed connections still need the relevant credentials/configuration. Never paste private keys/passwords into chat. A successful static build does not verify every tax table; official-source financial reviews remain necessary. Public deployment and the separate admin deployment both need to finish before the new entry/design is live.
