# START HERE — HomeMoney Calc handoff (last updated 25 Oct 2026, ~1 PM IST)

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

### Step 8 — Cloudflare security (owner dashboard me karega, ~10 min) ← **YAHAN SE SHURU**
Domain homemoneycalc.com ke andar:
- **A. SSL/TLS → Edge Certificates:** Always Use HTTPS = ON, Minimum TLS = 1.2, Automatic HTTPS Rewrites = ON.
- **B. Security → Security rules → Create rule → Custom rules:** name `Block hacker scans`, "Edit expression":
  `(http.request.uri.path contains "/wp-") or (http.request.uri.path contains "/xmlrpc.php") or (http.request.uri.path contains "/.env") or (http.request.uri.path contains "/.git") or (http.request.uri.path contains "/phpmyadmin")` → Action **Block** → Deploy.
- **C. Security rules → Create rule → Rate limiting rules:** name `Affiliate link limit`, expression `starts_with(http.request.uri.path, "/go/")`, characteristics IP, **10 requests / 10 seconds**, action **Block** for 10 seconds → Deploy. (Kyun: bot clicks se affiliate account ban na ho — owner ka purana AdSense invalid traffic se band hua tha.)
- **D. Bot Fight Mode** ON (Security → Settings / Overview quick start) — agar pehle nahi kiya.
- **Verify (AI kare):** `curl -sI https://homemoneycalc.com/wp-login.php` → 403; `curl -sI https://homemoneycalc.com/` → 200; `curl -sI http://homemoneycalc.com/` → 301 to https.
- Phir `data/security-checklist.json` me jo ho gaya `done: true` karo (branch + PR).

### Step 9 — Email forwarding (5 min)
Cloudflare → homemoneycalc.com → **Email → Email Routing** → Get started → custom address `hello` → destination `homemoneycalc.site@gmail.com` → Gmail me verify link → "Add records and enable" (MX + SPF khud aate hain). Phir DNS me DMARC TXT: name `_dmarc`, value `v=DMARC1; p=quarantine; rua=mailto:homemoneycalc.site@gmail.com`. Test: kisi aur email se hello@homemoneycalc.com pe mail bhejo.

### Step 10 — DNSSEC (5 min)
Cloudflare → DNS → Settings → **Enable DNSSEC** → DS record details dikhenge → Namecheap → Domain List → Manage → **Advanced DNS → DNSSEC** → add (Key Tag, Algorithm 13, Digest Type 2, Digest). Verify: `nslookup -type=DS homemoneycalc.com 1.1.1.1`.

### Step 11 — Google Search Console (15 min) — **sabse zaroori SEO step**
1. search.google.com/search-console (owner Gmail) → **Domain** property `homemoneycalc.com` → TXT record Cloudflare DNS me daalo → Verify.
2. Sitemaps → `https://homemoneycalc.com/sitemap.xml` submit.
3. URL Inspection → home + paycheck page → "Request indexing".
4. Agent ke liye: Google Cloud project `homemoneycalc-agent` → enable Search Console API + Analytics Data API → Service account → JSON key download (**chat me paste nahi**) → Search Console Settings → Users → service account email ko "Restricted" add. GitHub secret `GOOGLE_SA_JSON` = JSON ka poora text; variable `GSC_SITE` = `sc-domain:homemoneycalc.com`. Detail: `docs/SETUP-AGENT.md` Step 2.

### Step 12 — Bing Webmaster (5 min)
bing.com/webmasters → "Import from Google Search Console" → Settings → API access → key → GitHub secret `BING_WEBMASTER_KEY`. (IndexNow key file pehle se live: `/003c58862834fce1e9714cc87fd0d1e2.txt`.)

### Step 13 — GitHub settings (AI `gh` se kar sakta hai, owner ki haan ke baad)
- Repo variables: `SITE_LAUNCH_DATE` = `2026-10-25`, `GSC_SITE` (upar).
- Free AI summary: aistudio.google.com se Gemini key → secret `GEMINI_API_KEY` (owner khud daale).
- Settings → Code security: Dependabot alerts + secret scanning ON.
- `main` branch protection: PR required. ⚠️ `seo-daily.yml` roz `data/reports/` seedha main pe commit karta hai — protection lagate waqt GitHub Actions ko bypass do, warna daily report fail hogi. Lagane ke baad ek baar "SEO daily report" workflow manually chala ke check karo.

### Step 14 — Admin panel (locked) (15 min)
Cloudflare → Workers & Pages → Create → **Pages** ("Continue to Pages", Workers wala nahi) → same repo → project `homemoneycalc-admin` → build `npm run build`, output `out`, env `NODE_VERSION=22` **aur** `BUILD_ADMIN=1` → custom domain `admin.homemoneycalc.com` → Zero Trust → Access → Self-hosted app for `admin.homemoneycalc.com` + `homemoneycalc-admin.pages.dev` + `*.homemoneycalc-admin.pages.dev`, policy: Allow email `homemoneycalc.site@gmail.com`. Detail: `docs/SETUP-AGENT.md` Step 6. Admin data roz ke rebuild pe update hota hai (deploy hook isi project ka bhi bana ke release.yml me jod sakte ho — optional).

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
- Kabhi `main` pe seedha push nahi. Branch → `gh pr create` → owner merge karega (CLAUDE.md rule 3).
- Har change ke baad: `npm run check-tools`, `npm run lint`, `npm run build`; security headers test: `node scripts/serve-out.mjs` (port 3124).
- Live check: `curl -sI https://homemoneycalc.com/...`.
- Plan/priority: `docs/PRIORITY-PLAN.md`, `data/priorities.json`. Security: `docs/SECURITY.md`. SEO routine (owner ka weekly kaam): `docs/SEO-ROUTINE.md`.
