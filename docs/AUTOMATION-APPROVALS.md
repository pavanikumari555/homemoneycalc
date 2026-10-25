# Agent automation and owner approvals — 26 Oct 2026

## What is automatic

The daily workflow builds and audits the site, runs code checks, reads connected analytics, checks bounded live URLs, and observes a fixed list of public official/competitor pages. Each source is checked at most weekly, robots.txt is respected, redirects/response sizes/time are bounded. The agent never loads ads or executes fetched JavaScript. Remote text is evidence, not instructions.

The first observation is a **baseline**, not a news event. Changed text becomes a research proposal, never an assumed law change. Failed/blocked observations stay unknown. There is no automated Google result scraping, keyword-volume invention, traffic generation, outreach or mass publishing.

## Open the inbox

1. Open https://homemoneycalc.com/admin/ and use the existing login.
2. Choose **Aapki approvals**.
3. Read the reason, sources, exact before/after (when applicable), outcome and checklist.
4. Check the reviewed box, then approve or reject.
5. The response says **queued**, not published. Check workflow results, refresh the inbox and allow the Cloudflare deployment to finish.

Approvals are server-side GitHub workflow requests, never localStorage decisions. The server permits only the protected production admin origin, explicit JSON review requests and the fixed repository/workflow. Login, origin checks, immutable SHA-256 payloads, expiry, source comparisons, duplicate protection and a durable decision log apply. Secrets never go to the browser. Preview hosts cannot submit decisions.

## One-time server connection (owner)

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
2. Resource owner: **pavanikumari555**. Repository access: **Only select repositories → homemoneycalc**.
3. Repository permissions: **Contents: Read-only** and **Actions: Read and write**. Set a short practical expiry and a reminder to renew/revoke. Metadata read is automatic.
4. Copy the token directly to Cloudflare → Workers & Pages → **homemoneycalc-admin** → Settings → Variables and Secrets → Add secret named **GITHUB_AGENT_TOKEN**. Production only; never the public project, preview environment, repository or chat.
5. Redeploy the admin project. Open the inbox and press **Refresh status**.
6. Missing, revoked or expired token means approvals stay disabled. Do not weaken authentication to work around a connection error.

The hosting token can read this repository and dispatch Actions. Only the trusted workflow uses its temporary GitHub token to save checked changes. Desktop credentials are not copied into hosting.

## Supported execution and limits

- **Metadata:** exact existing calculator SEO title/description string only, parsed through TypeScript AST. No code, URL, schema, ads, permissions, trackers, financial formulas, release dates or automatic last-updated changes. Published registry tool required. Fresh GSC evidence is required to generate a title proposal. Every approved change passes tests, registry validation, lint and a public build before a normal main push. A concurrent main change makes the push fail; never force-push or rebase the approved payload.
- **Research:** approval records an accepted task, not a public-content change. Financial/new-page/general code implementations require their own concrete reviewed change; this inbox does not yet execute them.
- Decisions are retained in the private repository, including the exact payload and GitHub actor. Duplicate decisions fail rather than execute twice. A failed workflow means no successful decision should be assumed; inspect history before retrying.
- Title tests record baseline impressions/CTR/position and wait at least 32 days before asking for a descriptive comparison. No new automated title proposal for the same recently changed tool during that window. Missing data isn't a win; aggregate comparisons are not causal proof. No automatic rewrite/rollback based on daily position noise.
- The old optional Claude weekly workflow still drafts PRs and needs working authentication. It is not made fully autonomous by the dashboard token. It must read approved research tasks and cannot silently publish sensitive changes.

AdSense application remains off. Internal readiness numbers aren't Google's requirements. Genuine traffic, original useful tools, accurate financial sources and final human policy review remain necessary; no system guarantees approval or immunity from enforcement.

## Verification and continuation

See `docs/AUTOMATION-CHECKPOINT.md`. Remaining work includes GSC/GA4 setup, source-access gaps, complete reviewed code/new-page publication support, user-behavior measurement, and a focused debt/paycheck improvement pilot. Don't describe these as already implemented.

References: [Google AI content review](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content), [Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies), [AdSense policies](https://support.google.com/adsense/answer/48182?hl=en), [GitHub workflow dispatch](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event), [Cloudflare server bindings](https://developers.cloudflare.com/pages/functions/bindings/).
