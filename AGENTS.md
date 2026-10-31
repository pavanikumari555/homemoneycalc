<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project workflow and owner preferences

Owner budget decision (26 Oct 2026): until the site starts earning, do not add any new paid service, subscription, API usage, advertising spend or paid upgrade anywhere in this project. Avoid card/billing activation and trials that can turn into charges. Prefer useful free options within verified limits; check existing setup first and explain the benefit and cost before owner steps. Revenue starting is not automatic spending authorization: obtain specific owner approval before any later paid purchase. Preserve existing services; this is not authorization to cancel accounts or domain renewals. Search Console API setup is paused for now at the owner's latest direction; do not keep prompting to complete it unless they resume it.

Read `CLAUDE.md` and `docs/NEXT-STEPS.md` for project context. Owner-requested local work uses checks → commit → direct main push; no repeated PR merge step. Preserve unrelated edits and do not force-push. The unattended coding workflows retain their explicitly configured publishing behavior.

Speak in simple Hinglish and give numbered steps for owner actions. The revenue goal is adjustable, not a promise, deadline or ceiling. Do not apply for AdSense yet: wait for genuine traffic and readiness review. The owner already has one PayPal account. AdSense may coexist with compliant affiliates/templates; do not remove them based on a guessed policy conflict.

Public builds must not include admin HTML or report props. `/admin` is an entry redirect to the existing protected dashboard. Never bypass auth or put secrets in source. Agent findings must distinguish unknown data from successful checks and cite evidence before proposing a fix. Never promise rankings or claim every possible issue was detected.

### Owner clarification — free alternatives first (26 Oct 2026)
Before proposing any new service or setting, check what is already configured and identify the concrete growth, usability or essential security need. Prefer existing functionality or no extra tool if it meets that need without a material downside. Research useful free/manual/open-source alternatives and their limits before paid alternatives. For a genuinely necessary paid option, explain why it matters, what fails or becomes harder without it, free alternatives and their tradeoffs, verified total/recurring costs, and expected benefit with uncertainty. Paid options may be presented for owner consideration; this is not authorization to buy or activate billing and the no-new-spend rule remains in force unless the owner explicitly approves an exception. Prioritize measurable traffic/earning opportunities; never promise fast rankings or traffic. Explain benefits/costs before guiding each step, and do not repeat completed setup. Search Console API setup remains paused pending owner resumption.

Latest reporting update (26 Oct 2026): owner resumed the previously paused FREE Search Console connection and completed it; the saved 09:10 IST report and owner dashboard confirm sources.gsc=true. The old paused-setup instruction above is superseded. New GA4 basic opt-in integration is being verified with Measurement ID G-N6Y64JH7QB. GA4 reporting still requires the existing reporter service account's property Viewer access, Analytics Data API and numeric GA4_PROPERTY_ID. Full continuation details are in docs/AUTOMATION-CHECKPOINT.md. Budget/free-first rules continue unchanged.

Latest UX/monetization direction (26 Oct 2026): no first-visit analytics popup or forced consent. Footer-only optional GA4; Search Console and existing Cloudflare aggregate counters are separate sources. GA4 sessions are not a mandatory AdSense application checkpoint. Prepare ad launch now, but application remains on hold; approval is never assumed to guarantee revenue. See docs/ADSENSE-LAUNCH.md and docs/AUTOMATION-CHECKPOINT.md for actual prepared work versus account-dependent remaining steps.

Latest analytics direction (30 Oct 2026): Google collection and footer Allow UI are retired. Owner-enabled Cloudflare Pages Web Analytics is the automatic visit/source report; admin links to it and marks GA4 historical. Do not reinstall the Google tag as a missing-connection fix. AdSense application and ad serving remain on hold.

Latest owner UX direction (31 Oct 2026): primary earning goal is AdSense. Keep admin simple: Aaj ka haal, Visits, AdSense, Zaroori kaam. Daily RUM uses the existing Pages property in lib/analytics-config.mjs, canonical-host filtering and India day boundaries. Unknown data stays unknown. Read docs/OWNER-DASHBOARD.md for implemented adapters versus account access still needing verification. Generated prose and paid AI fallback stay off by default. Use bundled fonts and the verified Webpack build path. Tax reviews/alerts are recurring; do not silently roll 2026 parameters forward or claim all omitted state rules are modeled. Run browser regression checks without production analytics events.
