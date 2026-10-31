# START HERE — HomeMoney Calc handoff (last updated 25 Oct 2026, ~1 PM IST)

> Current work — 31 October 2026: read [OWNER-DASHBOARD.md](OWNER-DASHBOARD.md) first. Four simple owner views, SC/Utah phase-out fixes, local font/build reliability, browser regression workflow, tax-review reminders and private RUM/report adapters supersede older interface/setup notes below. Account-dependent connections are not claimed verified until their live response succeeds. AdSense remains off, and no new paid service is authorized.

> **Latest owner budget decision — 26 Oct 2026:** Project-wide freeze on NEW paid services, subscriptions, paid API use, ads spend and upgrades until revenue starts. Avoid billing/card activation and trials that can charge. Prefer useful verified free options; explain benefit/cost and check existing setup first. Any later spending still needs specific owner approval. Do not cancel existing services/renewals. Search Console API setup is paused for now despite that API itself being free. Earlier setup priorities below do not override this decision.

> **Automation work — 26 Oct 2026:** Read `docs/AUTOMATION-CHECKPOINT.md` first for the current resumable milestone. New **Aapki approvals** dashboard section supports exact reviewed metadata edits and accepted research tasks. Server setup instructions: `docs/AUTOMATION-APPROVALS.md`. Restricted Cloudflare admin secret still needs owner setup; do not claim end-to-end live decisions are configured until verified. GSC/GA4 connections and broader reviewed publishing remain pending.

> **Current owner decisions — 26 Oct 2026:** Admin entry is https://homemoneycalc.com/admin/ (shortcut to existing password-protected dashboard). Dashboard is simplified into Overview, Visitors, Earning, Agent and Settings. $5,000 is an adjustable estimate, not an income ceiling or guarantee. Do not apply for AdSense yet; wait for genuine traffic and final readiness review. Compliant affiliates/templates may coexist with AdSense. One PayPal account is available; receiving eligibility is not yet verified. `data/business.json` stores the shared business/readiness assumptions. Daily agent now records code checks, live checks, explicit audit coverage and a prioritized action queue; autonomous source-code repair still needs local Codex or the separate configured coding workflow.

> **AI/assistant ke liye:** pehle `CLAUDE.md` padho (rules), phir ye file. Owner beginner hai (India) — Hinglish me baat karo, "kyun" pehle, chhote steps, screenshot maang lo. Password/2FA/API key kabhi chat me mat mangwao.
> **Human ke liye:** VS Code me folder `D:\cybersecurity\calcivy` kholo → Terminal me `git switch main` aur `git pull` → phir AI ko bolo: *"docs/NEXT-STEPS.md padho aur agla step batao"*.

---

## 1. Abhi kya status hai

| Cheez | Status |
|---|---|
| Website | ✅ **LIVE** — https://homemoneycalc.com (Cloudflare Pages, project `homemoneycalc`) |
| www → root redirect (301, query string preserved) | ✅ Cloudflare Redirect Rule "www to root" |
| Code | ✅ GitHub **private** repo `pavanikumari555/homemoneycalc`, `main` up to date (PR #1, #2 merged) |
| Roz ka auto-release | ✅ `.github/workflows/release.yml` + secret `CLOUDFLARE_DEPLOY_HOOK` (test run "Deploy triggered") — roz 5:45 AM IST |
| Domain | ✅ homemoneycalc.com — Namecheap, **expires 25 Oct 2027**, auto-renew ON, WHOIS privacy ON, transfer lock ON, nameservers = Cloudflare (carol / kenneth) |
| Cloudflare zone | ✅ Active, Free plan. AI Training bots = Block, Search/Agent = Allow, Bot Preference Sync ON |
| Security headers (CSP, frame-ancestors, COOP, pages.dev noindex) | ✅ live par verify kiye |
| Search Console / Bing / GA4 / AI key | ❌ abhi nahi (neeche steps) |
| Admin panel (locked) | ❌ abhi nahi — local me `npm run dev` → http://127.0.0.1:3123/admin/ |

**Accounts (sab owner ke naam):** Owner **Pavani Kumari**. Gmail `homemoneycalc.site@gmail.com`. GitHub `pavanikumari555`. Cloudflare + Namecheap isi Gmail se. Is PC pe `gh` CLI **pavanikumari555** se login hai (workflow scope ke saath); git identity "Pavani Kumari" (GitHub noreply email). Developer (owner ka devar) apna personal account use nahi karna chahte — sab kuch owner ke account se.

**Release queue (lib/site.ts → `added`):** 28 Oct: Social Security COLA 2027 + Senior deduction · 30 Oct: No tax on overtime, No tax on tips, Overtime · 1 Nov: Holiday budget · 10 Nov: Car loan interest deduction · 17 Nov: HSA · 20 Nov: Bonus tax. Ye apni date pe khud live honge. Check: admin panel "📅 Publish calendar".

---

## 2. Agle steps (isi order me)

### Step 8 — Cloudflare security ✅ DONE 25 Oct (verified: http→https 301, TLS<1.2 band, /wp-login.php etc. 403, /go/ rate limit 429, Bot Fight Mode ON)
Domain homemoneycalc.com ke andar:
- **A. SSL/TLS → Edge Certificates:** Always Use HTTPS = ON, Minimum TLS = 1.2, Automatic HTTPS Rewrites = ON.
- **B. Security → Security rules → Create rule → Custom rules:** name `Block hacker scans`, "Edit expression":
  `(http.request.uri.path contains "/wp-") or (http.request.uri.path contains "/xmlrpc.php") or (http.request.uri.path contains "/.env") or (http.request.uri.path contains "/.git") or (http.request.uri.path contains "/phpmyadmin")` → Action **Block** → Deploy.
- **C. Security rules → Create rule → Rate limiting rules:** name `Affiliate link limit`, expression `starts_with(http.request.uri.path, "/go/")`, characteristics IP, **10 requests / 10 seconds**, action **Block** for 10 seconds → Deploy. (Kyun: bot clicks se affiliate account ko risk na ho.)
- **D. Bot Fight Mode** ON (Security → Settings / Overview quick start) — agar pehle nahi kiya.
- **Verify (AI kare):** `curl -sI https://homemoneycalc.com/wp-login.php` → 403; `curl -sI https://homemoneycalc.com/` → 200; `curl -sI http://homemoneycalc.com/` → 301 to https.
- Phir `data/security-checklist.json` me jo ho gaya `done: true` karo; local workflow ke mutabik checks ke baad main par push karo.

### Step 9 — Email forwarding ✅ DONE 25 Oct (hello@ → Gmail tested, SPF + DMARC p=quarantine)
Cloudflare → homemoneycalc.com → **Email → Email Routing** → Get started → custom address `hello` → destination `homemoneycalc.site@gmail.com` → Gmail me verify link → "Add records and enable" (MX + SPF khud aate hain). Phir DNS me DMARC TXT: name `_dmarc`, value `v=DMARC1; p=quarantine; rua=mailto:homemoneycalc.site@gmail.com`. Test: kisi aur email se hello@homemoneycalc.com pe mail bhejo.

### Step 10 — DNSSEC (5 min)
Cloudflare → DNS → Settings → **Enable DNSSEC** → DS record details dikhenge → Namecheap → Domain List → Manage → **Advanced DNS → DNSSEC** → add (Key Tag, Algorithm 13, Digest Type 2, Digest). Verify: `nslookup -type=DS homemoneycalc.com 1.1.1.1`.

### Step 11 — Google Search Console ✅ parts 1–3 DONE 25 Oct (Domain property verified, sitemap.xml submitted — "Couldn't fetch" at first is normal, home + 4 pages Request indexing). Part 4 (service account for the agent) = **NEXT**
1. search.google.com/search-console (owner Gmail) → **Domain** property `homemoneycalc.com` → TXT record Cloudflare DNS me daalo → Verify.
2. Sitemaps → `https://homemoneycalc.com/sitemap.xml` submit.
3. URL Inspection → home + paycheck page → "Request indexing".
4. Agent ke liye: Google Cloud project `homemoneycalc-agent` → enable Search Console API + Analytics Data API → Service account → JSON key download (**chat me paste nahi**) → Search Console Settings → Users → service account email ko "Restricted" add. GitHub secret `GOOGLE_SA_JSON` = JSON ka poora text; variable `GSC_SITE` = `sc-domain:homemoneycalc.com`. Detail: `docs/SETUP-AGENT.md` Step 2.

### Step 12 — Bing Webmaster ✅ DONE 25 Oct (imported from GSC, BING_WEBMASTER_KEY secret, IndexNow 21 URLs → HTTP 200)
bing.com/webmasters → "Import from Google Search Console" → Settings → API access → key → GitHub secret `BING_WEBMASTER_KEY`. (IndexNow key file pehle se live: `/003c58862834fce1e9714cc87fd0d1e2.txt`.)

### Step 13 — GitHub settings ✅ mostly DONE 25 Oct (SITE_LAUNCH_DATE var, Dependabot alerts, GEMINI_API_KEY + GROQ_API_KEY with auto-fallback). Branch protection is not available on the free plan for private repos — skip.
- Repo variables: `SITE_LAUNCH_DATE` = `2026-10-25`, `GSC_SITE` (upar).
- Free AI summary: aistudio.google.com se Gemini key → secret `GEMINI_API_KEY` (owner khud daale).
- Settings → Code security: Dependabot alerts + secret scanning ON.
- Owner ka local workflow (25 Oct): tests/build pass hone ke baad direct `main` push. PR-only restriction required nahi hai. `seo-daily.yml` bhi `data/reports/` main pe commit karta hai.

### Step 14 — Admin panel: secure website/admin entry
Open https://homemoneycalc.com/admin/ → existing protected dashboard on homemoneycalc-admin.pages.dev → enter existing username/password. The public URL is a shortcut; the address bar changes to the protected host. Public builds still omit the dashboard; authentication stays on the separate admin deployment. Local preview remains `Admin-Kholo.bat`. New dashboard guide: `docs/ADMIN-AND-AGENT.md`.

### Step 15 — Kamai shuru (owner)
- Payoneer + W-8BEN → Impact, CJ, FlexOffers, Awin apply (`docs/MONETIZATION.md`). **Tax software links 1 Jan se pehle** — `data/offers.json` me `url` bharo (sirf `https://` link; build galat link pe ruk jaata hai).
- Payhip pe 3 templates (Debt Snowball, Paycheck Budget, Mortgage Tracker).

---

## 3. Owner se pending
- About page ke liye **asli naam dikhana hai ya nahi** + 2 line bio (`app/about/page.tsx`). Nakli naam kabhi nahi.
- Indiana county tax ka default rate (in.gov se verify karke) — abhi user khud daalta hai.

## 4. Review / date wale kaam
- **9–10 Nov se pehle:** car loan interest deduction ke final IRS regs (IRB 2026-39, 9 Nov se lagu) padh ke `app/car-loan-interest-deduction-calculator` check.
- **Nov me:** CMS 2027 Medicare Part B premium announce kare to COLA tool ka default update.
- Wisconsin 2026 standard deduction numbers revenue.wi.gov PDF se confirm.
- **Oct–Jan:** IRS 2027 brackets aate hi `lib/tax2027.ts` (daily agent "refresh" alert dega).
- **Sep 2027:** domain renewal (auto-renew ON, card valid ho).

## 5. Kaam karne ka tareeka (AI ke liye)
- Owner ne local chat ke kaam ke liye direct push approve kiya hai: latest `main` sync → changes → checks → commit → `git push origin main`. Naya PR/merge step zaroori nahi (CLAUDE.md rule 3).
- Push se pehle: `npm test`, `npm run check-tools`, `npm run lint`, `npm run build`; security headers test: `node scripts/serve-out.mjs` (port 3124). Failed checks fix karo; unrelated local edits preserve karo; force-push mat karo.
- Live check: `curl -sI https://homemoneycalc.com/...`.
- Plan/priority: `docs/PRIORITY-PLAN.md`, `data/priorities.json`. Security: `docs/SECURITY.md`. SEO routine (owner ka weekly kaam): `docs/SEO-ROUTINE.md`.

### Owner clarification — free alternatives first (26 Oct 2026)
Before proposing any new service or setting, check what is already configured and identify the concrete growth, usability or essential security need. Prefer existing functionality or no extra tool if it meets that need without a material downside. Research useful free/manual/open-source alternatives and their limits before paid alternatives. For a genuinely necessary paid option, explain why it matters, what fails or becomes harder without it, free alternatives and their tradeoffs, verified total/recurring costs, and expected benefit with uncertainty. Paid options may be presented for owner consideration; this is not authorization to buy or activate billing and the no-new-spend rule remains in force unless the owner explicitly approves an exception. Prioritize measurable traffic/earning opportunities; never promise fast rankings or traffic. Explain benefits/costs before guiding each step, and do not repeat completed setup. Search Console API setup remains paused pending owner resumption.

Latest reporting update (26 Oct 2026): owner resumed the previously paused FREE Search Console connection and completed it; the saved 09:10 IST report and owner dashboard confirm sources.gsc=true. The old paused-setup instruction above is superseded. New GA4 basic opt-in integration is being verified with Measurement ID G-N6Y64JH7QB. GA4 reporting still requires the existing reporter service account's property Viewer access, Analytics Data API and numeric GA4_PROPERTY_ID. Full continuation details are in docs/AUTOMATION-CHECKPOINT.md. Budget/free-first rules continue unchanged.

Current implementation note (26 Oct 2026): no forced analytics popup; optional GA4 is available only through footer choices. Admin Earning now lists account-dependent AdSense launch work separately. Details: docs/ADSENSE-LAUNCH.md. Prepare now, apply later; no claimed complete ad-serving integration without the owner's actual publisher/CMP/unit setup.
