# Public competitor rehearsal — 8 November 2026

## Evidence and scope

Source: [Calculator.net debt payoff](https://www.calculator.net/debt-payoff-calculator.html), captured after robots permission check. Public HTML SHA-256: `8c89317a6e2aa637fe8385c7eede19cfd240f3e7dcbbb551e8a34e23045658c9`.

REA 6.8.0 successfully parsed three captured inline JavaScript files, without executing them. Complete retained parent Evidence: `ev_ed59c9f45dafdb62d322d70ae7ead8d32f14f55b3d9715dc5400a0f3a311ea0b`; local bundle `.research/debt-rea-evidence.json`. The scripts expose field expansion/number formatting and ad-slot setup. No ads were loaded or clicked. The financial calculation implementation was not established by this inline-only capture. There are 82 semantic unknowns and 16 stated limitations; no runtime observation, ranking/backlink/traffic data or external bundle analysis is claimed. Raw third-party files are ignored and never included in the public export.

## Comparison and decisions

| Observed public feature | Calcivy evidence | Decision |
| --- | --- | --- |
| Competitor page describes its calculator as avalanche-only and explains snowball separately | `app/debt-payoff-calculator/DebtCalculator.tsx` and `lib/calc.ts` already support snowball/avalanche comparisons | Existing differentiation; don't build another near-duplicate page. Consider testing clearer result explanations against actual Search Console queries. |
| Monthly, annual and timed one-off extra payments are offered as inputs | Calcivy debt tool currently takes an extra monthly budget | A candidate feature gap, not proven demand. Prioritize only with query/owner evidence and an independently specified/tested payment schedule. No rushed financial-model change. |
| Fixed total monthly allocation is an option on the competitor | Calcivy fixes the budget and rolls freed minimum payments into other debts, explained on its page | Existing equivalent for rollover; a declining-budget mode is a hypothesis, not a missing correctness fix. |
| Captured inline code includes number formatting and expanded input rows | Calcivy already supports editable debts and its own formatting | No copying or unnecessary replacement; use REA again only for a specific unanswered shipped-behaviour question. |

Useful marketing direction: explain Calcivy's actual side-by-side strategy comparison, saved plans and shareable scenarios where relevant. Do not claim competitors lack a feature based on this single capture, and do not publish comparative superiority claims without broader verified coverage. The annual/one-off extra-payment opportunity should be evaluated alongside existing search queries, not guessed keyword volumes.

This rehearsal validates the capture → REA evidence → source comparison → decision workflow. It does not establish a traffic improvement or justify blindly copying another calculator. No financial formula or public SEO claim was changed in this run.

## First actual upstream change detected during setup

At 17:17 UTC the watcher detected a new REA commit `559083be29bd8502a7feefcbe981380b2bbf4cd9`, ahead of the installed skill's source revision. The [complete one-commit comparison](https://github.com/morluto/rea/compare/5044e20171564d201d5fe49c18e2ea6f90c53010...559083be29bd8502a7feefcbe981380b2bbf4cd9) changes only `SECURITY.md`. Reviewed the full diff: it documents trusted host/provider authority, untrusted target text, operation-specific execution effects, retained data and limits; HTTP MCP is not authenticated multi-tenant isolation.

Decision: no runtime or website-code update is needed for this documentation-only change. Keep CLI/static inspection, no HTTP MCP registration, no execution of captured scripts, private ignored captures and explicit limits/unknowns. The local guide already enforces these relevant boundaries. Advanced only REA's **reviewed reference** after the complete diff review; the installed skill remains from its unchanged pinned source and CLI stays 6.8.0. This demonstrates real detection and assessment, not a simulated update or a blind auto-upgrade.
