# AdSense launch preparation — 26 Oct 2026

## Current state

Application not submitted. Ads not enabled. Owner wants all feasible preparation now, and application/activation later after genuine traffic and review. There is no automatic income guarantee, and no automatic switch-on after approval. No new paid service is authorized.

## User experience decision

- No first-visit analytics popup, no consent wall, no forced accept button.
- Updated 30 Oct: Google Analytics tag and footer choice interface are retired. Cloudflare Pages Web Analytics is the automatic basic traffic source. No advertising consent is inferred from this choice.
- Search Console measures Google search impressions/clicks separately. Any saved GA4 data is historical, not current total traffic.
- Existing Cloudflare edge statistics provide server traffic context with no new visitor script. Requests include bots/assets/blocked requests and are NOT people, sessions, ad impressions or revenue.
- Optional API adapter is ready but needs a zone-scoped Zone Analytics Read token in GitHub secret CLOUDFLARE_ANALYTICS_TOKEN, and variable CLOUDFLARE_ZONE_ID. Do not paste tokens in chat. No live API connection is claimed until a report verifies it. Plan/API limits may restrict returned data; missing data remains unknown.
- Cloudflare Web Analytics is a different, browser-beacon product. It is free and cookie-free according to Cloudflare, but may be blocked/sampled and is not 100% visitor coverage. Owner enabled the Pages beacon on 30 Oct; CSP verified and Google tag retired; cookieless is not a blanket legal-consent exemption.

## Prepared now

- Existing About, contact, editorial policy, methodology, privacy, disclosures, calculator explanations and public sitemap remain available.
- Private dashboard lists the actual outstanding account steps, separate from source-code checks and planning traffic targets.
- data/monetization.json records the conservative layout plan and empty publisher/account fields.
- npm prebuild runs scripts/monetization-preflight.mjs. It refuses premature ad enablement, malformed publisher identifiers or changing the reviewed UX plan into forced consent/overlays.
- No ad code, publisher ID, ad-unit ID, fake ads.txt line, empty ad box, fake approval or revenue record is generated.

## Actual work that still requires the owner's AdSense account

1. At application time, use the owner's own account; obtain its real publisher ID and chosen site-verification method. Don't create another account merely for convenience. Site verification can be prepared without enabling ad units, using the method the account offers.
2. Create/review applicable regional messages in Google AdSense Privacy & messaging. Google offers its own certified messaging solution. Review EEA/UK/Swiss requirements and applicable US-state opt-outs. Do not assume a custom GA4 choice panel is an ad CMP or can replace mandatory consent. Keep refusal/settings accessible without blocking calculator use. Region decisions must use the actual consent solution, not browser language or guessed location.
3. Verify site approval and any Policy Center actions inside AdSense. Approval does not verify all future placements or guarantee ad fill/payment.
4. Create actual manual ad-unit IDs. Start with at most one labelled in-content unit after original explanation, away from inputs, slider controls, navigation, Share/Save/Print and affiliate buttons. No anchor/vignette/popunder/fullscreen formats; verify Auto ads settings inside the account rather than assuming source code disables them.
5. Install and review the final publisher-specific tag/CMP together. Ad requests can contain contextual URL data; financial calculator parameters must not be leaked. This protection needs specific verification against the final tag/network requests. Cloudflare query exclusion does NOT sanitize future AdSense requests. Do not enable ad serving on financial-query pages until this is resolved and tested.
6. Add only required ad/CMP origins to CSP, preserve security headers, update privacy/disclosure text to actual behavior, publish the exact account-provided ads.txt record and verify it live. No fabricated pub ID. Advertising script integration and ads.txt generation remain unfinished until those real inputs exist.
7. Test mobile/desktop, reserve slot space to reduce layout shifts, keep calculators usable on denial/adblock/no-fill, collapse unusable empty slots safely and test withdrawal. No live-ad clicks or manufactured impressions; use official preview/testing paths.
8. Review the exact deployed result, then explicitly activate the real setup. Follow actual impression/revenue reports, invalid-traffic warnings and performance afterward. Roll back a harmful placement; never promise immediate revenue.

## Sources checked 26 Oct 2026

- https://developers.cloudflare.com/web-analytics/faq/ (edge vs beacon, query strings, sampling and ad blockers)
- https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/
- https://developers.cloudflare.com/analytics/graphql-api/limits/
- https://support.google.com/adsense/answer/48182?hl=en (placements, invalid traffic and navigation)
- https://support.google.com/adsense/answer/10924669?hl=en (Privacy & messaging)
- https://support.google.com/adsense/answer/10961068?hl=en (European messages/consent mode)
- https://support.google.com/adsense/answer/13554116?hl=en (certified CMP requirements)

Prepared does not mean account-approved, fully legally certified, or ready for live ad requests. Keep that distinction in owner reports.
