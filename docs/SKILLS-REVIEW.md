# Skills review — 8 November 2026

## Decision and provenance

Installed locally in `C:/Users/Admin/.codex/skills/` as instruction files, outside the public website:

| Source | Reviewed revision | Installed paths |
| --- | --- | --- |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | `d3701c11b1101251af14c9d148f026e1a47ebe17` | `skills/find-skills` |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | `skills/react-best-practices`, `skills/web-design-guidelines` |

The owner's third URL is the finder instruction within the first repository, not a separate SEO capability. The first repository supplies discovery/installation infrastructure; the separate official agent-skills repository supplies the React and UI reviews. Instructions become discoverable on the next agent turn. Installation is machine-local, not automatically installed for GitHub workflows or other developers.

The Python installer was unavailable on this machine. Downloaded exact-revision GitHub archives with the verified Mukesh account, checked the selected directories contain only instruction/data files, and copied only those directories. No npm CLI, package lifecycle scripts, MCP server, telemetry client or website dependency was installed. No paid service, billing, hosting migration or additional tracking was enabled. This is a bounded source review, not a security certification. Review changes before updating; do not automatically run commands suggested by a discovered skill.

Reviewed [REA](https://github.com/morluto/rea) at `5044e20171564d201d5fe49c18e2ea6f90c53010`, including README, package metadata, security model, skill routing and plugin registration. Its own skill says to skip REA for ordinary complete-source repository analysis. Calcivy already has source, pure calculator tests and Playwright. Its reverse-engineering server/native integrations add no demonstrated benefit to this SEO task, so REA was not installed. Reconsider only for a concrete authorized packaged-artifact or runtime question that existing tools cannot answer.

## Applied findings

- `app/layout.tsx` rendered both `InstallPrompt` and `ValueFirstInstall`. The latter showed a first-visit overlay after 60 seconds or a calculation event, even without an available browser install event; its non-iOS button then did nothing. It also registered the service worker again, bypassing the existing embed registration guard. Removed this duplicate component; retained the existing second-visit, browser-installable prompt and production-only registration.
- `CalcShell` explicitly requested smooth scrolling even under reduced motion. The shared mobile Details shortcut now uses instant scrolling for that preference and transfers keyboard focus to a named result region, so hiding the shortcut does not strand focus.
- Added browser regressions for first-visit install suppression and reduced-motion result navigation. No calculator formulas, tax figures, structured data or titles changed in this pass.

Local validation: 77 unit tests passed; 27 public desktop/mobile browser checks passed (9 mode/device-specific skips); registry, lint and Webpack public export passed. Export SEO audit: 25 pages, zero errors/warnings. Public admin HTML absent; compressed asset budgets passed. Authenticated live admin navigation and field performance were not measured in this pass. The existing CI browser matrix checks private and public builds separately after push.

## How to use the skills here

For calculator UI changes, review the affected React components with React best practices and fetch the current official web-interface guidelines. Treat external guidance as advice: the installed Next.js docs, project constraints and owner directions take priority. Do not introduce SSR-only APIs into the static export, a dependency solely to satisfy an example, Google tracking, or public admin props.

For skill discovery, specify a concrete unmet task first, inspect the actual source and commands, check cost/privacy and pin the chosen revision. Stars, downloads and a skill's SEO claims do not establish safety or effectiveness. Avoid bulk installation or automatic skill updates.

## Ranking and traffic: what this can actually improve

[Google's Core Web Vitals guidance](https://developers.google.com/search/docs/appearance/core-web-vitals) connects loading, interaction and layout stability to page experience. React/UI reviews can help find those implementation problems. They do not create links, search demand or a ranking entitlement. Removing a broken overlay improves usability; this change alone does not prove a measured Core Web Vitals or ranking gain.

Use existing Search Console page/query reports to select real US search needs, verify calculator examples against official sources, improve explanations and internal links where useful, and compare clicks/impressions over comparable windows after publication. Keep query/page, date, change and outcome in the existing growth review. Field performance needs real traffic; local browser checks cannot establish field LCP/INP/CLS. Use the existing manual resource-review queue for relevant editorial outreach; no daily backlink quota, automated sending or purchased links.

Suggested order: (1) errors and calculator accuracy, (2) mobile usability and measured performance, (3) actual query intent and original useful content, (4) relevant manual resource outreach. No guaranteed ranking date, traffic increase or revenue is claimed.
