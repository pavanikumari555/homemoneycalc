# Simple owner panel — current guide, 31 October 2026

Open https://homemoneycalc.com/admin/ and use the existing login. The private dashboard lives on homemoneycalc-admin.pages.dev; public exports still exclude its HTML/report data.

1. **Aaj ka haal**: latest check status, today/yesterday visits and views, your next steps, and AdSense stage.
2. **Visits**: India-calendar-day table, top pages/sources and separate delayed Google search clicks. A visit is not a unique person. A dash means unavailable, not zero.
3. **AdSense**: the owner's main earning goal, preparation steps and the account checklist. Application/ad serving stay on hold. Internal traffic targets are not Google's minimum eligibility rules.
4. **Zaroori kaam**: owner steps first, then automatic coverage. Technical findings, approvals and research are inside expandable details.

The open panel requests fresh saved reports and browser RUM every five minutes. Requests stop when the tab is hidden. Responses remain private/no-store; server-side API cache lasts five minutes. A source failure retains the last dated snapshot with its reading time; it never silently becomes a current zero.

## Resource review queue — applied 8 November 2026

Zaroori kaam → **Safe growth: resource review** contains at most two uncontacted research candidates, saved policy date, eligibility/cost/channel gaps and read-only inquiry drafts. Existing daily reporting (08:00 IST) stores `linkReview`; the packaged private dashboard also has a fallback plan. Its date is an India calendar date. These are saved candidates, not two newly researched leads or backlinks every day.

The committed `data/link-outreach-tracker.csv` is the central ledger. Contact date, response, published reference, closed/opt-out status or a contacted duplicate domain suppresses another queue entry. Update the actual ledger after owner contact/reply; opening/reviewing a card does not mark it sent. There is no outgoing message API, form submission, automatic contact, browser-only hidden ledger or new paid service. The drafts ask about suitability/requirements; they do not claim acceptance. Unknown cost is never treated as free. Research older than 30 days is flagged for another policy check.

Follow [SAFE-LINK-EARNING.md](SAFE-LINK-EARNING.md). Exact recipient/channel and the personalized draft still need owner review before any external step. Public exports must omit these cards, drafts and private report props.

## Existing Cloudflare property

Account e82f13520873b04774f6dadeb2dba33a. Pages RUM site fe3a560743a241edbf9730e48c157038 includes homemoneycalc.pages.dev, homemoneycalc.com and www.homemoneycalc.com. The API filters the canonical homemoneycalc.com host and known bots out. The older standalone property 2db96e896c9a46fa8b33f551fcea86cd is not the automatic Pages property; it can show zero while the Pages property has traffic. No property was deleted.

Daily dates use midnight in Asia/Kolkata, including today as partial. Aggregate estimates can be sampled/blocked. No analytics data is manufactured. Local browser tests do not call live analytics or ads.

## One-time private access, only if current access cannot read RUM

First verify the existing scoped token. Code can reuse CLOUDFLARE_ANALYTICS_TOKEN if it already has the necessary permission; it never broadens permissions. RUM is account-scoped, unlike the existing zone edge-counter API.

If permission is missing, the owner must create an account-restricted **Account Analytics: Read** token and place it directly in the private admin project's encrypted secret **CLOUDFLARE_WEB_ANALYTICS_TOKEN**. The account/site IDs above are already defaulted in code; overrides are optional. Add the same read-only token to the repository secret of the same name if dated snapshots should also be stored by the daily workflow. Never paste a token in chat, source, the public Pages project or screenshots. No paid plan/billing activation is required by the implementation; actual dataset access still needs a successful connected response.

For live *saved report* refresh, the existing restricted GITHUB_AGENT_TOKEN can be used, or an optional GITHUB_REPORT_TOKEN restricted to this repository's Contents: Read. Without it, the panel uses the report packaged by the automatic daily deployment and labels it as saved. Do not grant broader write access just to read reports.

## Automatic prevention

- Calculator boundary tests include SC SCIAD and Utah statutory credit/CPI calculation, plus a multi-state finite-result sweep.
- Storage failures are shown rather than displaying a falsely saved plan.
- Public and admin browser regression jobs run on localhost in CI on desktop/mobile Chromium. No production traffic is generated.
- Build uses a bundled licensed font and a supported Webpack path; no Google Fonts download needed.
- Build fails if representative page JS/CSS budgets are exceeded. This measures compressed assets, not real-user Core Web Vitals.
- Tax-source records have monthly due reminders, year-rollover alerts and a bounded weekly California source observation. An observed source change creates review work, never guessed financial data.
- Compatible package and Actions updates are proposed weekly by Dependabot. Code is not automatically merged on an unreviewed security recommendation.
- Generated AI summaries are off by default; deterministic evidence produces the owner summary. Paid fallback is gated off.

## Limits kept visible

California uses published 2026 annual-return brackets, deduction and credit amounts. The exemption credit phase-out thresholds are derived from the statutory indexing rule pending confirmation in the final 2026 Form 540 worksheet. The paycheck calculator estimates annual liability from wages. See the state notes for excluded credits and local taxes.

Unknown WAF monitoring responses remain unknown. Do not disable protection globally to make a report green. Account security/2FA and authenticated approval execution need owner/account verification. AdSense's final publisher ID, privacy messages, financial-URL protection and mobile ad placement must be checked with the actual future tag before activation.

The exact legacy development dependency exception is documented in DEPENDENCY-REVIEW.md. Raw npm warnings are retained, and the narrow review expires on 30 November 2026; new advisories fail closed.
