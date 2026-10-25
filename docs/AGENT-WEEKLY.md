# Weekly agent procedure

Run by `.github/workflows/seo-weekly.yml` every Monday. Follow the steps in order. Output: **one pull request** the owner can review in 10–15 minutes.

## 1. Read the situation (no edits yet)
- Latest file in `data/reports/` — KPIs, `opportunities`, `lowCtr`, `health.issues`, `ai.agentNext`.
- Start with its deterministic `actions` whose `who` is `agent`, sorted by priority. Read `quality` and `liveChecks`; missing checks are not passes. Reproduce each issue before editing. Do not promise rankings or revenue. The monthly goal is adjustable and may be exceeded.
- `data/roadmap.json` — find tools with `status: "planned"` whose `targetDate` is within the next 10 days or already passed.
- Open GitHub issues labeled `owner-request` that have no linked PR (use `gh issue list --label owner-request`). Owner requests come first.

## 2. Pick this week's work (keep the PR small)
In priority order, pick up to:
1. Any **site-health errors** from the report (broken links, missing titles/descriptions) — fix them all.
2. **One or two new tools** from the roadmap (earliest `targetDate` first). Seasonal items (tax season, open enrollment, holidays) must ship before their season.
3. **One existing page improvement** from `opportunities` (position 8–30) or `lowCtr`: sharpen the title/description, add a section or FAQ that answers the exact query. Don't rewrite pages that are already improving.

Never more than 2 new tools per PR. Quality over quantity.

## 3. Build each new tool
Follow `docs/ADDING-A-TOOL.md` exactly. Also:
- Research the rules from official sources (IRS, SSA, DOL, CFPB, state sites). Put the URLs in `sources`.
- Compute the worked example and the registry `example` by running the math (e.g. a small `node -e` script against `lib/calc.ts` logic).
- Set `added` and `updated` to today, and the roadmap item's `status` to `"drafted"`.
- Link the new tool from 1–2 related existing pages (in their article text) and add it to their `related` lists where it fits.

## 4. Check your work
```bash
npm run check-tools
npm test
npm run lint
npm run build
```
All three must pass. If something can't be finished, leave it out of the PR rather than shipping it half-done.

## 5. Open the PR
- Branch: `agent/week-YYYY-MM-DD`
- Title: `Weekly: <tool names> + <improvements>`
- Body (Hinglish, short), in this order:
  1. **Kya kiya** — bullet list.
  2. **Kaise check karein** — the Cloudflare preview links to open and what to try on each.
  3. **Sources** — the official URLs you used.
  4. **Doubts** — anything you couldn't verify. Be explicit.
  5. **Aapke liye next** — 1–3 growth tasks from `data/growth-tasks.json` for this week.
- Mention the owner-request issue numbers it closes (`Closes #12`).

When the owner merges the PR, Cloudflare deploys it. On the next weekly run, change the shipped items' roadmap status from `"drafted"` to `"live"` if they are on `main`.
