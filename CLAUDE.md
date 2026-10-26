# HomeMoney Calc — guide for Claude (local sessions and the GitHub agent)

**Start here:** read `docs/NEXT-STEPS.md` first — current status (site is LIVE), accounts, and the exact next step.

HomeMoney Calc (homemoneycalc.com) is a free US money-calculator site. Static Next.js 16 export (React 19) on Cloudflare Pages, Tailwind, TypeScript. Public calculators need no database or account. Revenue plan: **Google AdSense, clearly-labeled finance affiliates, own templates, sponsors** — see `docs/MONETIZATION.md`. The initial $5,000/month target is an adjustable estimate, not a revenue promise, ceiling, or fixed deadline. Wait for genuine traffic and an owner's readiness review before applying for AdSense. The owner has one PayPal account; receiving/KYC and merchant compatibility still need verification. Admin entry is `https://homemoneycalc.com/admin/`, which redirects to the existing protected dashboard.

The owner is a beginner from India. Talk to them in Hinglish: why first, then how, small steps. Code comments in this repo are short Hinglish/English mixes — match that.

## Layout

- `lib/site.ts` — **tool registry** (`ALL_TOOLS`; `TOOLS` = published only, release queue by `added` date) + site config. Home, menu, footer, search, sitemap, `/calculators/` all read from it.
- `lib/calc.ts` — pure calculation functions. `lib/paycheck.ts` + `lib/tax2026.ts` — tax engine and 2026 data.
- `lib/useToolState.ts` — share links, saved plans, favorites, "welcome back" (browser storage only).
- `components/ToolLayout.tsx` — every tool page's structure (schema, sources, partner offers, FAQ, embed, related). Unpublished tools (future `added` date) 404 here.
- `components/calc/*` — shared calculator UI (fields, result hero, chart, actions).
- `data/roadmap.json` — which tool ships when (status: planned → drafted → live).
- `data/growth-tasks.json`, `data/revenue.json`, `data/reports/*.json` — admin panel data.
- `app/admin/` — private owner dashboard. `scripts/agent/` — daily report agent.
- How to add a tool: `docs/ADDING-A-TOOL.md` (also add it to `WIDGETS` in `app/embed/[slug]/page.tsx`). Growth strategy: `docs/GROWTH-PLAN.md`. Owner weekly SEO routine: `docs/SEO-ROUTINE.md`. Security plan: `docs/SECURITY.md` (headers in `public/_headers`; test them with `node scripts/serve-out.mjs` after a build).
- `scripts/agent/ideas.mjs` — daily report growth ideas (title tests, refresh, seasonal, keyword gap, outreach drafts, social). `bing.mjs` — Bing Webmaster data.

## Non-negotiable rules (Google safety)

**Project-wide budget rule — owner, 26 Oct 2026:** No new paid tools/services, subscriptions, paid API usage, ads spend or upgrades before the website earns. No billing/card activation or trials that may charge. Use verified free options when useful; inspect existing settings first and explain benefit/cost before guiding steps. Earning later does not itself authorize purchases: ask for specific approval. Do not cancel existing services/renewals. Search Console API connection setup is currently paused; wait for the owner to resume it.

1. **No scaled content.** Every new page must do a real job with real math and original explanation. Never create near-duplicate pages that only swap a name (city/state/salary) unless the underlying data genuinely differs.
2. **Accuracy over speed.** Tax/finance numbers must come from official sources (IRS, SSA, state revenue departments, CFPB, Fed). Cite them in the page's `sources`. If you can't verify a figure, tell the owner instead of guessing.
3. **Owner-approved direct push (25 Oct 2026).** For work requested in the local chat: sync `main`, make the changes, run `npm test`, `npm run check-tools`, `npm run lint`, and `npm run build`, then commit and push directly to `main`. Do not require a branch, pull request, or another merge approval for that authorized work. Cloudflare deploys after the push. Stop and fix failed checks before pushing; preserve unrelated local edits and never force-push. Future `added` dates still control scheduled tool releases. The separate unattended weekly/issue Claude workflows retain their explicitly configured PR behavior; this local-workflow change does not authorize autonomous publishing by those jobs.
4. **No link schemes.** No paid links, PBNs, link exchanges, keyword-anchor widget links, or comment spam. Suggest outreach; never perform it.
5. **Offers policy:** Google AdSense / Google ad code is allowed, only with the owner's own `ca-pub` ID (ask them; never invent one). Compliant placements near calculator content are OK, but never in positions that encourage accidental clicks or interfere with calculator inputs/buttons; it also needs the Google ad domains added to the CSP in `public/_headers` (see `docs/SECURITY.md`). Affiliate/template offers only via `components/OfferBox.tsx` + `data/offers.json` (labelled, `rel="sponsored"`, disclosure link). Never encourage clicks.
6. **Privacy.** Calculations stay client-side. Don't add trackers, forms that send data, or third-party scripts without the owner's OK.
7. Only change the `updated` date of a tool when its content or math really changed.

## Quality bar for a tool page

- Calculator works for edge cases (0, empty, huge numbers, "never pays off").
- Useful explanation sized to the user's question: formula in plain English, a verified worked example, limitations and practical tips. No mandatory word-count or page-count quota; don't pad content for ranking.
- 4–6 FAQs answering real "People also ask" questions.
- Title ≤ 60 chars with the primary keyword first; meta description ≤ 155 chars.
- `example` in the registry computed by actually running the calculator logic.
- `npm run check-tools`, `npm run lint` and `npm run build` all pass.

## Commands

```bash
npm run dev          # local preview (bound to 127.0.0.1 only, on purpose)
npm run check-tools  # registry sanity check
npm run lint
npm run build        # static export to out/
npm run agent:daily  # writes data/reports/<today>.json (needs a build first for the audit)
```

### Owner clarification — free alternatives first (26 Oct 2026)
Before proposing any new service or setting, check what is already configured and identify the concrete growth, usability or essential security need. Prefer existing functionality or no extra tool if it meets that need without a material downside. Research useful free/manual/open-source alternatives and their limits before paid alternatives. For a genuinely necessary paid option, explain why it matters, what fails or becomes harder without it, free alternatives and their tradeoffs, verified total/recurring costs, and expected benefit with uncertainty. Paid options may be presented for owner consideration; this is not authorization to buy or activate billing and the no-new-spend rule remains in force unless the owner explicitly approves an exception. Prioritize measurable traffic/earning opportunities; never promise fast rankings or traffic. Explain benefits/costs before guiding each step, and do not repeat completed setup. Search Console API setup remains paused pending owner resumption.

Latest reporting update (26 Oct 2026): owner resumed the previously paused FREE Search Console connection and completed it; the saved 09:10 IST report and owner dashboard confirm sources.gsc=true. The old paused-setup instruction above is superseded. New GA4 basic opt-in integration is being verified with Measurement ID G-N6Y64JH7QB. GA4 reporting still requires the existing reporter service account's property Viewer access, Analytics Data API and numeric GA4_PROPERTY_ID. Full continuation details are in docs/AUTOMATION-CHECKPOINT.md. Budget/free-first rules continue unchanged.
