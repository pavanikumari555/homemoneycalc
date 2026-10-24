# CalcIvy — guide for Claude (local sessions and the GitHub agent)

CalcIvy (calcivy.com) is a free US money-calculator site. Static Next.js 16 export (React 19) on Cloudflare Pages, Tailwind, TypeScript. No server, no database, no accounts. Revenue: **no Google ad products** (owner's old AdSense was closed for invalid traffic — never suggest a new AdSense account, in any name). Earn via clearly-labeled finance affiliates, own templates (Payhip), sponsors — see `docs/MONETIZATION.md`. Goal: $5,000/month in 18–36 months from US search traffic.

The owner is a beginner from India. Talk to them in Hinglish: why first, then how, small steps. Code comments in this repo are short Hinglish/English mixes — match that.

## Layout
- `lib/site.ts` — **tool registry** (`TOOLS`) + site config. Home, menu, footer, search, sitemap, /calculators/ all read from it.
- `lib/calc.ts` — pure calculation functions. `lib/paycheck.ts` + `lib/tax2026.ts` — tax engine and 2026 data.
- `lib/useToolState.ts` — share links, saved plans, favorites, "welcome back" (browser storage only).
- `components/ToolLayout.tsx` — every tool page's structure (schema, ads, sources, FAQ, related).
- `components/calc/*` — shared calculator UI (fields, result hero, chart, actions).
- `data/roadmap.json` — which tool ships when (status: planned → drafted → live).
- `data/growth-tasks.json`, `data/revenue.json`, `data/reports/*.json` — admin panel data.
- `app/admin/` — private owner dashboard. `scripts/agent/` — daily report agent.
- How to add a tool: `docs/ADDING-A-TOOL.md`. Growth strategy: `docs/GROWTH-PLAN.md`.

## Non-negotiable rules (Google + AdSense safety)
1. **No scaled content.** Every new page must do a real job with real math and original explanation. Never create near-duplicate pages that only swap a name (city/state/salary) unless the underlying data genuinely differs.
2. **Accuracy over speed.** Tax/finance numbers must come from official sources (IRS, SSA, state revenue departments, CFPB, Fed). Cite them in the page's `sources`. If you can't verify a figure, say so in the PR instead of guessing.
3. **Humans publish.** Never push content to `main`. Always work on a branch and open a PR for the owner to review. (The daily report job is the only thing that commits to main, and only `data/reports/`.)
4. **No link schemes.** No paid links, PBNs, link exchanges, keyword-anchor widget links, or comment spam. Suggest outreach; never perform it.
5. **Ads policy.** No ads inside or right next to the calculator inputs/buttons. Don't add ad slots outside `components/AdSlot.tsx` placements. Never encourage clicks.
6. **Privacy.** Calculations stay client-side. Don't add trackers, forms that send data, or third-party scripts without the owner's OK.
7. Only change the `updated` date of a tool when its content or math really changed.

## Quality bar for a tool page
- Calculator works for edge cases (0, empty, huge numbers, "never pays off").
- 600–1,500 words of useful explainer: formula in plain English, a worked example whose numbers you computed, practical tips.
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
