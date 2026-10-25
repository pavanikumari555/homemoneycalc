# HomeMoney Calc — Priority plan + publish strategy (25 Oct 2026)

Admin panel ke "🗺️ Bada plan" card me yahi list live dikhti hai (`data/priorities.json`). Status badalne ke liye Claude ko bolo.

## 1. Publish kaise hoga (research ke baad faisla)

**Sawaal:** sab tools abhi bana ke dheere-dheere publish karein taaki Google ko lage site regular update hoti hai?

**Research ka jawab (Google Search Central + Google ke log):**
- Google **publish karne ki speed ya rhythm ko reward nahi karta.** "Freshness" sirf un searches pe lagta hai jahan log nayi info chahte hain (jaise "2027 tax brackets") — poori site ke "kitni baar post karti hai" pe nahi.
- **Taarikh badalna bina asli badlaav ke** = Google ki guidance me seedha warning sign. Hum ye kabhi nahi karte (`updated` sirf asli math/content change pe).
- **Ek saath publish karna bhi safe hai** jab pages asli kaam ke hon (9–40 pages se koi "spam" signal nahi).
- Seasonal pages (tax tools) ko season se **2–3 mahine pehle** live hona chahiye, ek hi permanent URL ke saath (har saal wahi URL update).
- AI se banana theek hai **agar insaan check kare aur content kaam ka ho.** Mass auto-pages = spam policy.

**To humne kya kiya — "release queue":**
1. Har tool pehle poora banta hai + aap PR me review karte ho (numbers official source se).
2. Merge ke waqt uski **publish date** (`added`) set hoti hai — roadmap ki seasonal date.
3. Roz subah 5:45 AM (India) `release.yml` site dobara build karta hai → us din wale tools apne aap live → Bing ko IndexNow ping → sitemap me sahi date.
4. Date se pehle tool kahin nahi dikhta (page 404, menu/search/sitemap me nahi). Koi future date public nahi hoti.
5. Admin panel "📅 Publish calendar" me dikhta hai kya kab live hoga. Rokna/badalna ho to Claude ko bolo.

**Faayda:** aapko roz kuch nahi karna; review aaram se ek baar; tools seasonal demand se pehle live; Google ke rules ke andar.
**Dhyan:** Wave 1 tools ki dates (28 Oct – 20 Nov) already "abhi" wali hain — jaise hi site live hogi, jinki date nikal chuki hai wo turant dikhenge. Aage ke tools (Wave 2+) ko **jaldi** queue me daalna behtar hai, der se nahi.

## 2. Priority list (order = importance)

| # | Kaam | Kyun | Kiska |
|---|---|---|---|
| 1 | Site live: GitHub (private) + domain + Cloudflare Pages | Google ki ghadi live hone se chalti hai | **Aap** (accounts) → Claude setup |
| 2 | Search Console + Bing + Email Routing | Bina iske Google ko pata nahi | **Aap** + Claude guide |
| 3 | Wave 1 tax tools (9) release queue me | Naya law, kam competition, Jan–Apr peak | Claude ✅ bana diye — aapka review |
| 4 | 10 purane tools ke explainers 600+ words | Audit: sab pages patle the | ✅ (700–860 words) |
| 5 | Paycheck engine accuracy fixes | Married couples, MD/IN me hazaron $ galat | ✅ (Indiana rate abhi user input) |
| 6 | Release queue + auto publish | Upar dekho | ✅ |
| 7 | Monthly check-in, calendar reminders, compare plans, share images | Users wapas aayein | ✅ |
| 8 | Affiliate + template boxes (`data/offers.json`) | Kamai | ✅ system — **aap** approval + links |
| 9 | 3 Payhip templates | Sabse jaldi pehla paisa | Claude bana sakta hai (sheets) + **aap** upload |
| 10 | About page pe asli naam + bio | E-E-A-T (money sites) | **Aap** naam/bio do |
| 11 | Weekly SEO routine (`docs/SEO-ROUTINE.md`) | Backlinks = ranking | **Aap** |
| 12 | Wave 2 tools (Dec–Feb) | Tax season | Claude, review ke baad queue |
| 13 | Data study #2 + 2027 take-home by state (1 Jan) | Journalist links | Claude + **aap** outreach |
| 14 | 50 state paycheck pages | Asli alag data = safe | Claude |
| 15 | Spanish versions | Kam competition | Baad me |

## 3. Audit (25 Oct) — kya mila, kya hua
- ✅ Federal 2026 numbers, registry examples, edge cases sahi mile.
- ✅ Theek kiya: AdSense code hataya (offer box lagaya), About/Contact/Terms ki galat lines, embed ke liye Terms, CSP, service-worker cache, Organization schema, skip-link, robots.
- ✅ Explainers lambe (700–860 words), married 2-earner Social Security, Maryland county tax, WI deduction, CA/NJ HSA, salary 0-hour aur auto-loan edge cases theek. Indiana county rate official site se verify nahi hua — user khud daalta hai, warning dikhti hai.
- ⏳ Aapse chahiye: owner ka asli naam + 2 line bio (About page), `hello@` email ka forward (Cloudflare Email Routing).
