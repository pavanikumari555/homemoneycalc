# HomeMoney Calc — India se chalane ki poori guide

> Research: 24 Oct 2026 (Google AdSense Help, Income Tax Act 2025 summaries, GST notifications, Mediavine/Raptive help centers, Cloudflare docs).
> **[V]** = official source se verify · **[S]** = bharosemand secondary source · **[A]** = anecdotal.
> ⚠️ Tax aur GST wale points **CA se confirm** karne hain — main CA nahi hoon, ye planning ke liye hai.

---

## 1. Site ka purpose: "India owner, US audience"

| | Kya | Kyun |
|---|---|---|
| **Owner** | Aap — India me rehne wale individual (abhi company nahi) | Shuru me company ki zaroorat nahi; AdSense individuals ko pay karta hai |
| **Audience** | USA (+ UK/Canada/Australia = Tier-1) | Finance ads ke liye US advertiser sabse zyada dete hain: ~$15–30 per 1,000 visits vs India ~$1–3 *(est.)* |
| **Content** | US rules (IRS, 50 states, 401k, OBBBA) | Ad networks (Journey, Raptive) sirf Tier-1 traffic ginte hain |
| **Paisa kahan se aata** | Google Asia Pacific (Singapore) → wire → aapka Indian bank (USD → INR) | India ke liye sirf wire transfer [V] |
| **Tax kahan** | India me (aapki income) — US me 0% (W-8BEN se) | India–US treaty |

**Kya India owner hona nuksaan hai?** Zyada nahi. AdSense, Mediavine, Raptive sab international publishers lete hain. Bas 3 cheezein dhyan rakhni hain:
1. **Google Discover** (feed traffic) non-US publishers ko kam dikha sakta hai [S] — humara main raasta Google Search hai, isliye chhota asar.
2. Kuch **US lender affiliate programs** non-US sites ko reject karte hain [A] — baad me zaroorat padi to US LLC soch sakte hain (FEMA/CA advice ke saath).
3. **Invalid traffic ka khatra** (section 7) — sabse badi galti Indian publishers yahin karte hain.

---

## 2. Accounts setup (domain lene se pehle / saath)

| Step | Kya karna | Kyun / dhyan |
|---|---|---|
| 1 | **Naya Gmail** sirf HomeMoney Calc ke liye | Sab accounts isi pe — ek problem baaki projects tak na jaaye |
| 2 | **2FA har jagah** (authenticator app/passkey), backup codes offline | Domain ya AdSense chori = sab khatam |
| 3 | **Domain kharidna** — Cloudflare Registrar (sasta, at-cost) ya Namecheap | Cloudflare pe Indian card ke saath **3DS mandatory** aur auto-renewal aksar fail hota hai (RBI rules) [V]. **Hal:** 2–3 saal ek saath le lo, ya Namecheap (PayPal/Indian card + account balance) [A]. Renewal date calendar me daalo |
| 4 | **WHOIS privacy** | Cloudflare me default, Namecheap me free. Details sahi bharo |
| 5 | **Email:** Cloudflare Email Routing → `hello@homemoneycalc.com` aapke Gmail me (free) [V] | Reply bhi usi naam se: Gmail → "Send mail as" (SMTP relay) |
| 6 | **Address site pe?** | Zaroorat nahi — sirf email + Privacy/Terms/Disclaimer [S] |

---

## 3. AdSense — India se kaise


| Point | Detail |
|---|---|
| **Ek insaan = ek account** [V] | Agar pehle se **koi bhi AdSense account** hai (YouTube monetization wala bhi), **homemoneycalc.com usi me add karo**. Doosra account = dono ban |
| Eligibility [V] | 18+, content aapka, site ka HTML aapke control me |
| Identity verification [V] | PAN/ID se — 45 din ka time |
| **Address PIN** [V] | Earnings ~$10 hone pe Google post se 6-digit PIN bhejta hai (~3 hafte). Address wahi do jo ID/PAN pe hai. 4 mahine me verify nahi kiya → ads band |
| Payment [V] | Sirf **wire transfer** to Indian bank. Threshold **$100**. Payment 21–26 tareekh ke beech |
| Bank pe | Har payment pe **e-FIRA/FIRC** maango (₹0–500 fee) aur sambhal ke rakho. Purpose code aam taur pe **P1007** (advertising) — bank se confirm [S] |
| **W-8BEN** [S] | AdSense → Payments → Manage settings → US tax info → **Individual**, treaty **India Article 7** → US tax **0%**. Na bharo to Google 24–30% kaat sakta hai. **3 saal baad renew** |
| Kab apply | Site live + saare pages complete + 3–4 hafte ka content history. Approval ke baad hi ads code lagega (`lib/site.ts` me ID) |

---

## 4. Tax aur GST (⚠️ CA se confirm)

**Income tax** [S]
- **1 April 2026 se naya Income-tax Act 2025** lagu hai. Purana 44AD/44ADA ab **Section 58** me hai.
- AdSense = **business income**. Website publishing "profession" list me nahi, isliye 50% wala route doubtful; likely **presumptive 6% of digital receipts** (ITR-4 type) — ya actual profit with books (ITR-3) agar kharche zyada hon.
- Presumptive me **advance tax ek baar, 15 March tak**.
- US me tax kata hi nahi (W-8BEN), to Form 67 ki zaroorat nahi.
- Records 8+ saal: AdSense monthly reports, FIRA, bank statements, W-8BEN copy, kharche ke bills.

**GST** [S]
- Singapore Google entity se USD me payment = **export of services** → zero-rated.
- ₹20 lakh se kam turnover pe registration aam taur pe zaroori nahi (kuch experts alag raay rakhte hain).
- Register hue to har saal **LUT (RFD-11)** file karo, warna 18% IGST bharke refund lena padega.

**CA kab:** pehli ITR jisme AdSense income ho · ₹10 lakh ke paas pahunchne pe · affiliate income shuru hone pe · US LLC ka socha to.

---

## 5. Ad networks — ye wale kyun, baaki kyun nahi


### Hamara raasta
| Step | Network | Kab | Kyun |
|---|---|---|---|
| 1 | **Google AdSense** | Site live hote hi | Koi traffic minimum nahi, India supported, exclusive nahi. Seekhne aur "Google standing" banane ka pehla kadam — Mediavine/Raptive dono AdSense me achhi standing dekhte hain |
| 1b | **Mediavine Grow** (free script) | Saath me | Journey review se pehle 30 din chahiye — clock jaldi shuru |
| 2 | **Mediavine Journey** | 1,000 Tier-1 sessions / 30 din | AdSense se 2–3x RPM *(est.)*, international publishers accept [V], PayPal/wire payout. **Next.js support email se confirm karna** |
| 3 | **Raptive** *ya* **Mediavine Official** | Raptive: 25k pageviews + 50% Tier-1 + domain 6 mahine + long-form. Mediavine Official: **$5k ad revenue / 12 mahine** (Jan 2026 rule) | Sabse oonche RPM (~$15–35 *est.*), 75%+ revenue share. Dono exclusive — tab jo zyada de wo |
| Backup | **Newor Media** (no minimum) → **MonetizeMore** ($1k/month revenue pe) | Agar Journey mana kare | Google Ad Exchange ka access chhoti sites ko |

### Baaki kyun nahi
| Network | Kyun nahi (abhi) |
|---|---|
| **Ezoic** | Feb 2026 se **2,50,000 monthly users** chahiye |
| **Monumetric** | Sirf WordPress/Blogger — hamari site Next.js hai |
| Freestar, Playwire, Publift, Snigel, AdPushup | 5 lakh–20 lakh pageviews ya $2k–5k/month revenue chahiye |
| **Media.net** | Aam taur pe AdSense se kam kamata hai aur saath chalane pe dono ka RPM girta hai [A] |
| SHE Media, Carbon | Audience match nahi (women lifestyle / developers) |
| **Adsterra, PropellerAds (popunder/push)** | ❌ **Kabhi nahi** — pop-under wali site pe Google AdSense ban karta hai [S], ranking girti hai, aur Mediavine/Raptive ka raasta band |

**Exclusivity:** AdSense ke saath doosre contextual ads chal sakte hain, par **Mediavine aur Raptive exclusive** hain — switch karte waqt AdSense hatana padega. Affiliate links hamesha chalte rehte hain.

**Technical note:** Next.js me ek tool se doosre pe jaate waqt page reload nahi hota. AdSense hamare code me har page pe naya slot bharta hai (theek hai). Mediavine/Raptive se join karte waqt poochna hai ki wo client-side navigation me pageview kaise ginte hain — zaroorat padi to tool links pe full page load kar denge.

---

## 6. Affiliates — India se

| Network | India publisher? | Payment |
|---|---|---|
| **Impact** | Haan | Bank/PayPal, $10 se [V] |
| **CJ** | Haan | Direct deposit (India) / Payoneer [A] |
| **FlexOffers** | Haan | USD wire / PayPal [S] |
| **Awin** | Haan | (ShareASale **Oct 2025 me band** hokar Awin me gaya [V]) |

Sabme **W-8BEN**. Finance advertisers (lenders, debt relief) manually approve karte hain aur nayi/non-US sites ko aksar mana karte hain [A] — isliye affiliates **traffic aane ke baad** (month 4–6) apply karenge. Har link pe "Affiliate disclosure" label (AdSense policy).

---

## 7. India-specific khatre (sabse zaroori)

| ❌ Kabhi mat karna | Kyun |
|---|---|
| Apne ads pe click, ya family/friends se click/visit karwana | Invalid traffic = account **hamesha ke liye band**, wapas nahi khulta [V] |
| WhatsApp/Facebook pe "meri site support karo" | Wahi — Indian low-quality clicks = invalid traffic |
| Traffic khareedna, "US traffic" bechne wale, traffic exchange | Bot traffic — instant ban |
| VPN se AdSense login, ya alag-alag deshon se login | Security hold / re-verification [A] |
| AdSense password freelancer ko dena | Unhe Search Console/Analytics access do, AdSense nahi |

✅ **Karna:** Analytics me khud ko exclude karo; ads check karne ho to AdSense ka "Ad review center" use karo; click-bombing dikhe to Google ka invalid-click form.

---

## 8. Naye mauke (research Oct 2026) — top 10

| # | Kya | Kyun abhi | Effort |
|---|---|---|---|
| 1 | **W-2 code TT/TP** overtime & tips deduction tools Jan se pehle | 2026 W-2s (1 Feb 2027 tak) pe naye codes — Jan–Apr me bhaari search | S–M |
| 2 | **Bing Webmaster + IndexNow** + har tool pe 1 line ka saaf jawab | ChatGPT ke citations Bing ranking se jude hain; `llms.txt` aur extra schema ka koi asar nahi mila | S |
| 3 | **Trump Account, RAP student loan, Social Security COLA** calculators | Naye launch, demand hai, tools kam | S each |
| 4 | **Spanish (es-US)** versions — paycheck, auto, mortgage, overtime | ~6 crore US Spanish speakers, competition bahut kam; RPM ~30–60% of English *(est.)* | M |
| 5 | **Embed widget + WordPress plugin** | Realtors, credit unions, tax preparers → backlinks | M |
| 6 | **"$X salary after tax in [state]"** — max 50×5 pages, har ek me asli numbers | Bada long-tail; template-copy nahi to safe | M |
| 7 | **Annual data studies** + "Add as preferred source" button | Journalist links; Preferred Sources ab AI Mode me bhi | M |
| 8 | **ChatGPT app** (MCP) | Directory abhi nayi — brand reach | M |
| 9 | Reddit madad + Shorts | Reddit Google top-3 ka ~10% leta hai; Shorts sirf reach ke liye (kamai negligible) | ongoing |
| 10 | **.ics reminders** (W-2, 15 April, COLA day) | Log wapas aate hain; server nahi chahiye | S |

Roadmap me jod diye hain: `data/roadmap.json` (tools + `projects`). India setup steps growth checklist me (`data/growth-tasks.json`) → admin panel me dikhte hain.

---

## 9. Ab ka order
1. **Domain** (2–3 saal ek saath, Indian card 3DS ready) → Cloudflare Pages ↔ GitHub
2. Email routing + Search Console + Bing + GA4
3. Age/Tip/Percentage pages 800+ words, About me aapka naam, privacy me GA4 → **AdSense apply**
4. W-8BEN, Grow script, Wave 1 tools (OBBBA + W-2 codes) Dec se pehle
5. Traffic aane pe: Journey → affiliates → Raptive/Mediavine Official
