# US search intent and safe link earning — 8 November 2026

## What the evidence says

The saved 8 November Search Console report covers search data through 5 November: 1,078 impressions, two clicks, average position about 32. These are historical search metrics, not today's visits or proof of future ranking. The site's young age and small sample make strong CTR conclusions premature.

The full report's title-test candidates include percentage (299 impressions, average position 9.09) and tip (115, position 7.90) pages with no recorded clicks. Its truncated top-page list omitted them because equal-click rows were cut before an impression tie-break. The adapter now requests a bounded 1,000 rows and sorts click ties by impressions before the 15-row display cut. It still does not claim complete Search Console row coverage.

| US question / intent | Evidence | Implemented response |
|---|---|---|
| Is all my overtime tax-free? Is the deduction my refund? | Repeated wording in public user discussions; not keyword-volume research | New tool separates gross overtime, qualified premium, deduction and estimated tax saving; refund FAQ explains the difference |
| W-2 code TT is missing; 2025 versus 2026 | IRS FS-2026-13 updates reporting rules; older forum advice may be outdated | Year selector, 2025 records versus required 2026 employer reporting, corrected W-2c guidance |
| What does 110 × 1.06 mean? What is a 6% increase? | Existing GSC arithmetic queries such as `110*1.06` and `50000*1.06` | Percentage page explains multiplier versus increase, with computed examples and a working prefilled scenario |
| Can I use a calculator in a lesson? | Existing embeds plus actual financial-education resource collections | `/methodology/#classroom-examples` offers reproducible scenarios, teaching questions and optional embeds without requiring a link |

Tax facts are checked against IRS sources, not forum answers. Search-result observations show possible needs, not search volume or a promise of demand. Keep the existing useful title wording; do not change many titles weekly from tiny samples. Compare the same page/query/country/device across comparable 28-day periods and record the change date. Ranking, clicks and revenue can still fall or remain unchanged.

## The daily workflow: at most two relevant prospects reviewed

**Applied in the existing system:** the protected admin's Zaroori kaam view now has “Safe growth: resource review.” Existing daily reporting stores the bounded queue, gaps and inquiry drafts from the central CSV. This does not automatically research new websites or create/send backlinks. See [OWNER-DASHBOARD.md](OWNER-DASHBOARD.md) for status and duplicate-suppression behavior.

This is a review cap, not a promise of two backlinks per day. A day with no suitable contact should produce zero outreach. Existing calculator examples, embeds, daily report and the CSV tracker are sufficient; no paid outreach tool, credit card, new subscription or automated posting is needed.

1. Read one current US educational page and identify an actual gap our scenario fills. Record its URL, intended learners and the precise benefit. Reject unrelated directories, article farms, paid dofollow offers and exchange requests.
2. Check that page's published suggestion/contact policy. Verify the resource works on a phone, its sources and limitations, and whether ads/affiliate promotion affect eligibility. Check the tracker to avoid contacting the same organization twice.
3. Write a short individual suggestion only when useful: identify ourselves as the tool's creator; refer to the actual lesson; offer the specific scenario and method. Do not request a keyword-rich anchor, dofollow treatment or reciprocal link. Publisher inclusion and wording are optional.
4. The owner reviews and sends through a verified public channel. No messages, submissions or accounts were created by this audit. Record date and response. Do not chase a non-response; reopen only if invited or there is a substantive new reason, and honor opt-outs.
5. Record any voluntarily published reference and relevant referral traffic. Search Console's Links report is delayed and incomplete; it is not an instant backlink counter. Count useful readers and teaching feedback alongside links. No blanket disavow, fabricated reviews or traffic generation.

Google identifies automated link creation, buying ranking links, excessive exchanges, low-quality directories and optimized widget/comment links as link spam. Two such links per day are not made safe by low volume. Our embeds remain optional and link use is not a condition of reuse; publishers control attributes. This is risk reduction, not a no-penalty guarantee.

## Researched starting points — no acceptance or backlink promised

| Organization / page | Verified fact | Decision |
|---|---|---|
| [Jump$tart Clearinghouse provider form](https://jumpstartclearinghouse.org/resource/for-providers/) and [listing criteria](https://jumpstartclearinghouse.org/static/src/assets/criteria.pdf) | Has an editorial resource submission route. New providers may need a reference letter; resources must meet educational standards and restrictions on promotional/paid-ad content. | Conditional research prospect. First map an actual lesson to the standards and confirm provider eligibility, advertising rules and submission cost with the publisher. No fee is assumed verified. Do not buy membership/donate to obtain a link or remove site monetization merely for a listing. Skip if unsuitable. Use the production site, not its `next`/staging copies. |
| [University of Minnesota Extension: teaching personal finance](https://extension.umn.edu/courses-and-events/for-professionals/teaching-personal-finance) | Publishes educator resources, including financial-capability materials. | Relevance research prospect, not an open listing claim. Read a specific lesson first; use a published relevant contact only if external-resource suggestions are welcomed. No outreach, fee or acceptance verified. Do not enroll in paid training to seek links. |
| [FDIC Money Smart](https://www.fdic.gov/consumer-resource-center/money-smart) | Official financial-education curricula and instructor resources exist. | Quality benchmark and topic research, not a promised government backlink or endorsement. No blanket government outreach. |

Tracker: [link-outreach-tracker.csv](../data/link-outreach-tracker.csv). Nothing is marked contacted or linked. The owner need not perform all channels; one relevant educational relationship is preferable to filling a quota.

## Sources and scope

- [Google link-spam policy](https://developers.google.com/search/docs/essentials/spam-policies#link-spam)
- [Google people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Search Analytics API sorting and row limits](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [IRS August 2026 overtime FAQs](https://www.irs.gov/pub/taxpros/fs-2026-13.pdf), [2025 brackets](https://www.irs.gov/pub/irs-drop/rp-24-40.pdf), [2026 tables and amended 2025 deductions](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf)

Known limits: no US keyword-volume subscription, competitor traffic estimates, manual-action inspection, publisher approval or authenticated live admin operation was verified. No automated backlinks, outreach messages, paid service or AdSense activation was performed.
