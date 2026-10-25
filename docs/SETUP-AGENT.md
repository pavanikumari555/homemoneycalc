# AI agent + admin panel setup (site live hone ke baad, ~1 ghanta)

Ye sab **ek baar** karna hai. Har step ke saath likha hai **kyun**.

| Kya milega | Kaun karta hai | Kharcha |
|---|---|---|
| Roz subah 8 baje report → `homemoneycalc.com/admin/` | `seo-daily.yml` | Free (AI summary ~$0.15/din, optional) |
| Har Monday naye tool ka draft → Pull Request | `seo-weekly.yml` | ~$2–8/mahina (ya Claude subscription) |
| Admin panel se "Report a problem" → Claude fix karke PR | `owner-request.yml` | Sirf jab use karo |
| Har PR ka automatic build check | `ci.yml` | Free |

> **Local workflow — owner approved 25 Oct 2026:** local chat mein requested kaam ke liye changes → tests/build → commit → direct `main` push → automatic deployment. PR/merge required nahi. Neeche documented unattended weekly aur issue-triggered Claude jobs apne configured PR flow mein rehte hain; local direct-push preference un jobs ki publishing permissions nahi badalti.

---

## Step 1 — GitHub repo (private)
1. HomeMoney Calc wale alag Gmail se GitHub account → **New repository** → name `homemoneycalc` → **Private**.
2. Code push karo (Claude kar dega — bas bolo).
3. `lib/site.ts` me `repo: "https://github.com/<username>/homemoneycalc"` set karo. *(Kyun: admin panel ka "Report a problem" button isi repo me issue kholta hai.)*

## Step 2 — Google Search Console + service account (ranking data)
*Kyun: bina iske agent ko pata nahi chalega kaunse keywords pe aap rank kar rahe ho.*
1. [Search Console](https://search.google.com/search-console) → **Domain** property → `homemoneycalc.com` → Cloudflare DNS me TXT record add karke verify.
2. [Google Cloud Console](https://console.cloud.google.com) → New project `homemoneycalc-agent`.
3. **APIs & Services → Enable APIs**: *Google Search Console API*, *Google Analytics Data API*, *PageSpeed Insights API*.
4. **IAM → Service Accounts → Create** (`homemoneycalc-agent`) → **Keys → Add key → JSON** → file download hogi. *(Ye password jaisi hai — kisi ko mat bhejna, chat me paste mat karna.)*
5. Search Console → **Settings → Users and permissions → Add user** → service account ka email (…@…iam.gserviceaccount.com) → **Restricted**.

## Step 3 — GA4 (sessions, US share — Mediavine/Raptive ye dekhte hain)
1. [Google Analytics](https://analytics.google.com) → property `HomeMoney Calc` → Web stream `homemoneycalc.com` → **Measurement ID** (G-XXXX) Claude ko batao, wo site me laga dega.
   - *Privacy:* calculator ke numbers URL me hote hain (share link ke liye). GA lagate waqt `page_location` se `?…` hissa hataya jaayega, taaki salary/debt jaise numbers Google ko na jaayein (privacy policy yahi vaada karti hai).
2. **Admin → Property access management → +** → service account email → **Viewer**.
3. **Admin → Property details** → **Property ID** (sirf number) note karo.

## Step 4 — PageSpeed key (speed score, free)
Google Cloud → **APIs & Services → Credentials → Create credentials → API key** → restrict to *PageSpeed Insights API*.

## Step 5 — GitHub secrets & variables
Repo → **Settings → Secrets and variables → Actions**.

**Secrets** (hidden):
| Name | Value |
|---|---|
| `GOOGLE_SA_JSON` | Step 2 wali JSON file ka **poora content** |
| `PSI_API_KEY` | Step 4 ki key |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API keys (billing me $10 credit daal do) |
| *ya* `CLAUDE_CODE_OAUTH_TOKEN` | Agar Claude Pro/Max hai: terminal me `claude setup-token` |
| `CLOUDFLARE_DEPLOY_HOOK` | **Zaroori (release queue):** Cloudflare → Workers & Pages → public project → Settings → Builds → **Deploy hooks** → Add (`daily`, branch `main`) → URL copy. *(Kyun: roz subah site rebuild hoti hai taaki jis tool ki publish date aaj hai wo apne aap live ho.)*
| `BING_WEBMASTER_KEY` | *Optional* — [Bing Webmaster](https://www.bing.com/webmasters) → ⚙ Settings → **API access** → API key. *(Kyun: Bing + DuckDuckGo + ChatGPT search ka data bhi report me aayega.)*
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | *Optional* — roz phone pe chhota message |

**Variables** (visible):
| Name | Value |
|---|---|
| `GSC_SITE` | `sc-domain:homemoneycalc.com` |
| `GA4_PROPERTY_ID` | Step 3 ka number |
| `BING_SITE` | *Optional* — Bing me site jaise add ki, e.g. `https://homemoneycalc.com/` (default yahi) |
| `SITE_LAUNCH_DATE` | Site live hone ki date, e.g. `2026-11-01` (growth checklist ke weeks isi se) |
| `CLAUDE_MODEL` | *Optional* — default `claude-opus-5-5`; sasta chahiye to `claude-haiku-5-5` |

Then: Repo → **Settings → Actions → General → Workflow permissions → Read and write** ✅, aur **Allow GitHub Actions to create and approve pull requests** ✅.
Aur: [Claude GitHub App](https://github.com/apps/claude) install karo is repo pe.

## Step 6 — Admin panel: alag, locked project (free)
*Kyun: `/admin/` me traffic aur kamai ka data hai. Public site ke build me admin **banta hi nahi** (`BUILD_ADMIN` ke bina 404), isliye `*.pages.dev` ya preview links se bhi leak nahi ho sakta.*
1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → **wahi repo**, project name `homemoneycalc-admin`.
   - Build command `npm run build`, output `out`, **Environment variable `BUILD_ADMIN = 1`**.
2. Custom domain: `admin.<aapka-domain>`.
3. **Zero Trust → Access → Applications → Add → Self-hosted**:
   - Domain `admin.<aapka-domain>` (poora subdomain) **aur** `homemoneycalc-admin.pages.dev` + `*.homemoneycalc-admin.pages.dev`.
   - Policy: **Allow → Emails →** sirf aapka Gmail.
4. Ab `admin.<domain>/admin/` kholne pe pehle email OTP aayega. Baaki duniya ke liye band.

## Step 7 — Pehli baar chala ke dekho
GitHub → **Actions → SEO daily report → Run workflow**. 2–3 minute me `data/reports/` me report aayegi aur deploy ke baad `homemoneycalc.com/admin/` pe dikhegi.
Weekly agent bhi **Run workflow** se test kar sakte ho — ek PR banega.

---

## Roz ka routine (5 minute)
1. `homemoneycalc.com/admin/` kholo → "Aapke aaj ke kaam" padho.
2. Koi problem dikhe → **Report a problem to Claude** → issue me likho → Claude PR banayega.
3. Monday: agent ka PR kholo → Cloudflare preview link pe tools chala ke dekho → sahi lage to **Merge**.
4. Mahine ke end me earnings `data/revenue.json` me daalo (ya Claude ko batao).
