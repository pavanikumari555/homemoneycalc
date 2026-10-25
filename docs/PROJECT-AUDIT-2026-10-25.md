# HomeMoney Calc project audit — 25 October 2026

## Result

The site builds successfully. Concrete calculation, reporting, dependency, documentation and local-preview issues were found and corrected on `audit/project-health`. These changes require PR review and merge before deployment. This audit is not a guarantee that every financial rule or every browser/device combination is correct.

## Fixes

| Issue | Correction and evidence |
|---|---|
| Installed dependencies differed from the lockfile (Next 14/React 18/ESLint 8 installed; Next 16/React 19/ESLint 9 declared) | Reinstalled with `npm ci`. Updated the admin launcher to use the lockfile and stop if switching to main or installing fails. |
| NJ 401(k) contributions incorrectly remained subject to state income tax | Traditional 401(k) deferrals now reduce NJ state wages. At $100,000 salary with $10,000 deferred, the corrected NJ state-tax estimate is $637 lower. PA treatment and NJ HSA treatment remain separately covered by regression tests. Other retirement plan types are not modeled as 401(k). |
| Bonus state payroll wage caps used annual salary | Caps now use wages already paid in the year. A $10,000 NJ bonus at $0 YTD wages now includes $84.50 of the modeled state payroll contributions instead of incorrectly treating the caps as exhausted. |
| Agent could promote queued tools | Social and outreach suggestions now select released tools only. |
| Agent/admin roadmap counts stayed stale after date-based release | Reporting derives release status from registry dates and sorts upcoming releases by date. |
| Agent still excluded Google ads | Removed two remaining English restrictions in the daily agent/comment and AI prompt. The goal includes AdSense without assuming account or site approval. |
| Three moderate dependency alerts from one selector-parser advisory | Override selects patched `postcss-selector-parser` 7.1.7. `npm audit` reports zero vulnerabilities; the existing Tailwind 3 configuration still builds. This dependency is used at build time. |
| `npm start` used an incompatible Next server command with static export | It now serves the production export on localhost port 3000. |
| Local static preview accepted unsafe sibling paths and could crash on malformed URL escapes | Added a resolved-path boundary check and safe URL decoding. HTTP checks return 403 for traversal attempts and 400 for malformed escapes. |
| Privacy and calculator explanations contradicted the implementation | Home/footer now distinguish browser calculations and device-local saved plans from share URLs that can enter host logs. Paycheck copy now explains included MD/IN county taxes. |
| README described deleted AdSense components and only six calculators | Updated calculator count, lockfile setup, production preview, tests, tool registration and actual remaining AdSense integration steps. |

## Verification

- Fresh lockfile installation succeeds.
- Eleven regression tests pass. Two tests reproduced the NJ/bonus bugs before the fixes.
- ESLint and TypeScript checks pass through lint and production builds.
- Public export builds; registry validates 19 tools.
- Full preview builds all 19 tools, their widgets, and the admin page.
- SEO audit: public build 22 inspected pages, full preview 31 inspected pages; zero reported errors/warnings in both.
- Production output excludes admin and the nine future calculator pages; sitemap contains the public routes only.
- Browser smoke tests: zero-salary result settles at $0, shared NJ inputs restore, saving/deleting a sample plan works, calculator hub opens, scheduled bonus and HSA tools render in preview.
- Live site smoke checks: home, paycheck, sitemap, robots and embed return 200; admin returns 403; unreleased overtime-deduction tool returns 404. Normal pages have CSP/frame protection; embed has noindex and permits framing.
- Latest main CI observed on GitHub was successful before this PR.

## Remaining work, in practical order

1. **Merge and deploy these fixes**, then check CI and the Cloudflare deployment. Local changes alone do not update the live site.
2. **GSC reporting connection:** Search Console property/sitemap setup is already recorded as done. GitHub has no `GOOGLE_SA_JSON` secret or `GSC_SITE` variable. Create/configure the service account and grant the required Search Console access. Never put its private key in chat or the repository.
3. **GA4:** no tracking integration, `GA4_PROPERTY_ID` variable, or Google service-account secret was found. Owner needs the property/measurement details and access setup; then code, CSP and privacy text can be updated together.
4. **AdSense:** verify the owner's actual dashboard status, add the website, and obtain its real publisher ID/setup instructions. Implement the integration, ads.txt, CSP and appropriate placements. Approval and revenue are not assumed.
5. **Revenue products:** all eight offer URLs are empty; the three planned templates have not been delivered. Build Debt Snowball, Paycheck Budget and Mortgage Payoff templates, then owner uploads/listings and approved affiliate links can be connected.
6. **Owner details/security:** decide About-page name/bio; verify 2FA/recovery codes and DNSSEC in the respective accounts. Old checklist values alone do not confirm current account settings.
7. **Scheduled tools:** nine are built and queued for 28 Oct–20 Nov. Preview build success is not a complete independent validation of every tax rule. Complete the recorded car-loan, Wisconsin and Indiana source reviews, and update 2027 figures only from official releases.
8. **Optional weekly Claude automation:** GitHub has Gemini/Groq keys for the daily report but no Anthropic API/OAuth secret. The weekly Claude drafting workflow needs its own authentication if the owner wants to keep using it; manual Codex work does not configure that workflow automatically.
9. **Growth/expansion:** 29 calculators remain planned (13 Wave 2, 8 Wave 3, 8 Wave 4), plus state pages, Spanish versions and data studies. These are expansion tasks, not prerequisites to keep the current site online. Outreach and traffic work are ongoing tasks.

## Scope limits and preservation

The audit did not independently recertify every state tax table, submit an AdSense application, change account security settings, add tracking, send outreach, or generate paid API calls. GitHub secret/variable names were inspected; their contents were not displayed. Pre-existing local edits to CLAUDE.md were preserved in Git stash with message `Preserve pre-existing local CLAUDE.md edits before project audit`; they are not part of this PR.

## Primary references checked

- NJ Division of Taxation wages/401(k): https://www.nj.gov/treasury/taxation/njit5.shtml
- IRS 2026 tax guidance: https://www.irs.gov/newsroom/working-families-tax-cuts-individuals-and-workers
- IRS 2026 HSA amounts: https://www.irs.gov/irb/2025-21_IRB
- IRS 2027 HSA amounts: https://www.irs.gov/pub/irs-irbs/irb26-25.pdf
- SSA 2027 COLA: https://www.ssa.gov/cola/factsheets/2027.html
- Selector-parser advisory: https://github.com/advisories/GHSA-rj75-hqrm-r3gf
