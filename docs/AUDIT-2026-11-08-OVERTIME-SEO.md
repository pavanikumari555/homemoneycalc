# Overtime launch, admin reporting and US search-intent review

Reviewed 8 November 2026. Continues the earlier audit. The existing unrelated `scripts/agent/ideas.mjs` edit stays uncommitted and is excluded from this work.

## Confirmed changes

- The tool released today is **No Tax on Overtime**, published by its registry date of 2026-11-08. Its deduction cap and full-$1,000 phase-out steps agree with Schedule 1-A. We retained those rules.
- The old combined “Single / HoH” option applied single tax brackets and standard deduction to head-of-household savings. HoH now has its own official tables. A year selector uses 2025 or 2026 ordinary-income brackets and the respective basic standard deduction; 2026 is the default. Future 2027–2028 savings are not guessed. Shared helper defaults remain 2026 for existing consumers; married-separate deductions save zero.
- Updated W-2 guidance to IRS FS-2026-13, August 2026. For 2026, omitted/understated code TT needs employer correction; an hours/pay-stub planning estimate does not replace required reporting. 2025's reasonable record-based methods are distinguished. Added a refund-versus-deduction answer matching observed US questions.
- Removed the output claiming overtime payroll tax is always about 7.65%. MAGI does not identify Social Security wages, employer wage caps or Additional Medicare Tax. Payroll taxes still apply, but their amount is not manufactured.
- Search Console click ties are arbitrary. The old 25-row fetch and 15-row display cut hid high-impression zero-click pages. A bounded 1,000-row fetch plus click/impression sorting makes displayed pages and queries more useful without extra API requests. Aggregate totals are not recomputed from incomplete grouped rows.
- A current admin traffic-query failure no longer disappears behind a saved connected snapshot. The snapshot remains dated; the current error creates developer repair work rather than asking the owner for unnecessary permission changes.
- Percentage-page multiplier examples answer arithmetic queries already visible in saved GSC data. The new prefilled scenario link opens the exact inputs; the page's real content/update date and description changed, not its title merely to chase CTR.
- `/methodology/#classroom-examples` now offers reproducible mortgage, overtime and percentage exercises with optional sharing/embeds and no backlink requirement. A researched manual workflow and unsent CSV tracker replace quantity-based link promises. No outreach or third-party listing was submitted.

## Verification

- 75 executable tests passed, including year/status savings, cross-bracket savings, phase-out boundaries, FLSA premium versus double time, MFS exclusion, current traffic error versus saved reading, and real Search Console adapter response sorting with an isolated test credential.
- Registry: 25 tools valid. Lint passed. Public Webpack build and representative compressed asset budgets passed.
- Public browser suite: 22 passed on desktop/mobile, with six private-only cases intentionally skipped. This includes the new year/status/restore flow, percentage scenario link, every sitemap page's hydration/search/viewport checks and blocked storage.
- Structural SEO audit: 25 public pages; zero errors/warnings for implemented checks. Metadata, canonicals, local assets, internal links, sitemap, heading/image checks and JSON-LD parsing are covered. It is not a complete accessibility, security or ranking certification.

Private browser suite: six passed on desktop/mobile, public-only cases skipped. The public build was restored successfully; public HTML/RSC scanning found neither the owner-dashboard marker nor the saved private report timestamp, and admin HTML is absent. Live authenticated dashboard operations cannot be claimed verified: the earlier Windows UI inspection was stopped because the browser URL could not be established confidently. No authentication was bypassed.

## Research and remaining limits

Sources: [IRS updated overtime FAQs](https://www.irs.gov/pub/taxpros/fs-2026-13.pdf), [2025 Schedule 1-A](https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf), [2025 tax brackets](https://www.irs.gov/pub/irs-drop/rp-24-40.pdf), [2026 tables/amended 2025 deductions](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf), [Search Analytics API sorting/limits](https://developers.google.com/webmaster-tools/v1/searchanalytics/query).

The saved report has 1,078 impressions and two clicks, ending 5 November, before today's new-tool release. It cannot measure the new tool's search performance yet. No keyword-volume tool, competitor traffic estimate, Search Console manual-action review or ranking gain was verified. Existing state-tax limitations and scheduled review dates remain; this was not a full tax-return re-certification.

[SAFE-LINK-EARNING.md](SAFE-LINK-EARNING.md) records US intent evidence, official spam guidance, actual resource-provider criteria, unresolved publisher eligibility/costs and the owner-reviewed workflow. No paid service, Google tag, AdSense activation, automated links or bulk contact was added. Outcomes remain uncertain.
