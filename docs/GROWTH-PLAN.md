# CalcIvy — Growth Plan v2 ($5,000/month)

> ⚠️ **Update (24 Oct 2026): Google ad networks (AdSense, Mediavine, Raptive, Ezoic) owner ke liye band hain.** Earning ab affiliates + templates + sponsors se — `docs/MONETIZATION.md` dekho. Neeche ke ads wale hisse sirf reference ke liye hain.

> Research: 24 Oct 2026 (competitor teardown, AdSense/RPM policy, keyword roadmap, backlinks). Numbers marked *est.* are estimates (no paid SEO tool).
> Live data files: `data/roadmap.json` (kaunsa tool kab), `data/growth-tasks.json` (hafte ke kaam), `data/reports/` (roz ki report). Sab `/admin/` me dikhta hai.

---

## 1. $5,000 ka hisaab (badla nahi)
```
Earning = US traffic × RPM + affiliate commissions
```
| Raasta | Traffic chahiye/month | Kab tak (realistic) |
|---|---|---|
| Sirf AdSense ($5–12 RPM) | 4–10 lakh pageviews | 3+ saal |
| Mediavine/Raptive ($15–30 session RPM) | 1.7–3.3 lakh sessions | 2–3 saal |
| **Ads + affiliate mix (hamara plan)** | **~1.2 lakh sessions** | **18–36 mahine** |

Milestones (Oct 2026 rules): 1k Tier-1 sessions/30 din → Mediavine Journey · 25k pageviews (50% Tier-1, domain 6 mahine, long-form content) → Raptive · **$5,000 ad revenue / 12 mahine → Mediavine Official** (Jan 2026 se traffic nahi, kamai ka rule; Journey se apne aap upgrade).

> India se chalane ke liye (AdSense payment, W-8BEN, tax/GST, ad networks kyun, naye mauke): **`docs/INDIA-OWNER-GUIDE.md`**

---

## 2. Competitors se kya seekha, hum kya alag karte hain

| Site | Traffic *est.* | Unki taakat | Unki kamzori (hamara mauka) |
|---|---|---|---|
| calculator.net | 67M/mo | Bahut saare tools, related links | 2005 jaisa design, chart nahi, share link nahi, save ke liye login |
| Omni | 15M/mo | Author + reviewer + sources (E-E-A-T), embed program | Headline answer nahi, embed ke liye apply karna padta |
| NerdWallet / SmartAsset | — | Brand trust | Lead-gen forms, share/save nahi; SmartAsset me 2025 bracket ki galti dikhi |
| CalculatorSoup / RapidTables | 11–14M/mo | Formula + steps, dense "see also" | Purana look, history/favorites nahi |
| timeanddate | 57M/mo, **38% direct** | Personal saved views, embeddable widgets | — (return-visit ka role model) |
| Naye indie sites (Numveo etc.) | chhote | Client-side, no signup | Saved scenarios / compare nahi — users ne khud maanga. **Hamare paas hai.** |

**CalcIvy ka formula = calculator.net ki breadth + Omni ka trust + timeanddate ki "wapas aane ki aadat" + modern design.**

### Jo ab site me hai (is round me bana)
| Feature | Kyun |
|---|---|
| **My Money dashboard** (`/my-money/`) — pinned tools + saare saved plans + recent | Koi competitor nahi deta. Bookmark ka reason. |
| **⭐ Pin this calculator** har tool pe | Ek click me wapas |
| **"/" ya Ctrl+K quick search** | Power users ki daily aadat (RapidTables jaisi speed) |
| **Install app prompt** (2nd visit ke baad) | Home screen icon = direct traffic |
| **Take-home pay by state 2026** data page | Backlink magnet (journalists isi type ki table cite karte hain) |
| **All calculators** page + registry check | 10 ho ya 200 tools, home/menu nahi bigadta |
| Live demo, examples, charts, share/save/print | (pehle se) |

### Agle features (roadmap)
1. **Embeddable widget + /embed page** (week 7) — sabse bada backlink lever. Attribution link branded + nofollow (Google rule).
2. **Progress check-in** — "aaj ka balance daalo → plan se aage/peeche" (debt/mortgage ke liye habit loop).
3. **Rich share previews** (share link pe result wali image).
4. **Natural-language input** — "I owe 5k at 22%" type karo, tool khul jaaye.

---

## 3. Ads layout (AdSense policy + Better Ads ke hisaab se — code me laga hai)
- Calculator card ke **andar ya inputs/buttons ke paas kabhi ad nahi** (accidental click policy). Har slot ~150px door.
- Slots: **after tool** (300×250 mobile / 728×90 desktop) → **in-article** → **multiplex** (FAQ ke baad). Har ek ki height pehle se reserved → CLS 0.
- **Auto ads sirf overlays ke liye** (approval ke baad): bottom anchor + side rails ON, in-page Auto ads OFF, ad intents OFF, vignette baad me test.
- Input change pe ad refresh nahi (policy).
- Mobile pe ad density < 30%.
- `public/ads.txt` build ke waqt apne aap banta hai jab `adsensePublisherId` set hoga.
- AdSense **Privacy & messaging**: EEA message + US-states message ON (free, Google ka certified CMP).
- **Affiliate boxes** (baad me): apne design me, "Affiliate disclosure" label, AdSense unit ke bilkul saath nahi.

---

## 4. Keywords — kis pe khelna hai
**Sabse bada mauka (abhi):** 2025 ke OBBBA tax law ke naye deductions — *no tax on overtime / tips, car loan interest, senior $6,000*. Search results me abhi chhoti nayi sites hain, aur Jan–Apr 2027 me demand peak karegi. **Ye pages Dec ke pehle index hone chahiye.**

| Wave | Kab | Tools (detail: `data/roadmap.json`) |
|---|---|---|
| 1 | Oct 30 – Nov 24 | No tax on overtime, No tax on tips, Overtime, Car loan interest deduction, Senior deduction, HSA, Bonus tax, Holiday budget |
| 2 | Dec – Feb | Tax refund estimator (long tail), Raise, FSA, W-4, Self-employment tax, Quarterly estimated tax, DTI, PMI, Biweekly mortgage, Recast, Capital gains on home sale |
| 3 | Mar – Apr | Balance transfer, Debt consolidation, Student loan, How much car, Lease vs buy, Home affordability, Rent vs buy, Closing costs |
| 4 | May – Aug | 401(k) match, Roth IRA, Social Security break-even, FIRE, Inflation, Net worth by age, Emergency fund, 50/30/20 |

**Abhi mat lado:** "mortgage calculator", "tax refund calculator" (head), "retirement/401k calculator" (head), "loan calculator", "best X" affiliate listicles.

**Safe programmatic pages:** sirf jahan data sach me alag ho — state paycheck, state bonus rates, local-tax cities (NYC, Philadelphia, Ohio/Michigan cities, Maryland counties), state closing costs. **Risky:** bina local tax ke city pages, "$N an hour" × 200.

Existing tools ke titles/descriptions research ke hisaab se update kar diye hain.

---

## 5. Backlinks & authority (6 mahine, ~8–10 ghante/hafta, sab free)
Week-by-week list `data/growth-tasks.json` me hai (admin panel me checklist).

| Kab | Kaam |
|---|---|
| W1 | Search Console, Bing, Ahrefs Webmaster Tools, GA4; brand profiles (X, LinkedIn, GitHub, YouTube, Crunchbase) |
| W2 | AlternativeTo, SaaSHub; journalist platforms: Source of Sources, HARO (free), Featured, Qwoted free |
| W3–4 | Reddit/Quora pe roz 30 min sirf madad (link nahi) |
| W4–6 | "Take-home pay by state" pitch → 50 local business reporters + 20 bloggers; r/dataisbeautiful |
| W7–8 | Embed widget launch + bloggers/credit unions outreach; 8 Shorts/Reels |
| W10 | Product Hunt (hook: widget) |
| W11–12 | Data study #2 (minimum payment trap); .edu / credit-union resource pages |
| W17 | Jan 1: "2027 take-home pay by state" — sab ko dobara pitch |

**Skip:** Google Business Profile (online-only allowed nahi), "290+ directory" lists, paid links, Pinterest pe zyada time (2025–26 me traffic gira).
**Journalist reply formula:** 1 ghante ke andar, ek unique number + 2 line method + exact calculator link, signed "Founder, CalcIvy".
**Targets (est.):** Month 3 → 30–50 referring domains; Month 6 → DR 15–25 agar ek data study chal gayi.

---

## 6. AI agent + admin panel (bana diya)
| Part | Kya karta hai |
|---|---|
| **Daily agent** (8 AM IST) | Search Console + GA4 + PageSpeed data, site ki technical jaanch (broken links, titles, thin pages), position 8–30 opportunities, roadmap deadlines → Claude Hinglish summary + "aaj ke kaam" → `/admin/` |
| **Weekly agent** (Monday) | Roadmap ke next 1–2 tools + 1 page improvement + health fixes → **Pull Request** (aap review karke merge karte ho) |
| **Owner request** | Admin panel → "Report a problem" → GitHub issue → Claude fix → PR |
| **Admin panel** (`/admin/`) | Aaj ki report, KPIs, clicks trend, earnings goal + milestones, opportunities, roadmap, growth checklist, site health, speed. Cloudflare Access se locked. |

Setup: `docs/SETUP-AGENT.md` (site live hone ke baad ~1 ghanta).

**"Google ko human lage" ka sahi tareeka:** agent draft karta hai, **aap review karke merge karte ho** — ye asli human review hai. Google ka rule AI ke against nahi, bina review ke dher saare pages ke against hai.

---

## 7. Aapka routine
- **Roz 5 min:** `/admin/` → aaj ke kaam
- **Monday 15 min:** agent ka PR → preview check → merge
- **Hafte me 3–4 ghante:** growth checklist (journalists, Reddit madad, outreach)
- **Mahine me 1 baar:** earnings `data/revenue.json` me / Claude ko batao
