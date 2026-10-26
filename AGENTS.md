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
