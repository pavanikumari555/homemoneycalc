# Naya calculator kaise add karein (5 steps)

Site ka design aisa hai ki naya tool add karne se **home page, menu, footer, search, sitemap, "All calculators" page aur related links apne aap update** ho jaate hain. Kuch bhi manually jodna nahi padta.

## Step 1 — Registry me entry (`lib/site.ts` → `TOOLS`)

```ts
{
  slug: "rent-vs-buy-calculator",          // URL: /rent-vs-buy-calculator/
  title: "Rent vs Buy Calculator",         // page/card title
  shortTitle: "Rent vs Buy",               // menu + chips
  category: "borrow",                      // pay | borrow | save | everyday
  blurb: "One line: what it does for the user.",
  icon: "home",                            // components/Icon.tsx me jo naam hai
  updated: "2026-11-05",                   // jab content/math asli me badle
  related: ["mortgage-payoff-calculator", "compound-interest-calculator"],
  example: { input: "$2,000 rent vs $400k home", output: "Buying wins after 6 years" },
  keywords: "rent buy house home afford",  // search box ke liye extra words
  added: "2026-11-05",                     // 30 din tak "New" badge
},
```

Example ka output **asli calculator chala ke** likhna hai, andaaza nahi.

## Step 2 — Math (`lib/calc.ts`)
Ek pure function likho (input → result), UI se alag. Edge cases: 0, khaali input, bahut bade numbers, "never pays off".

## Step 3 — Calculator UI (`app/<slug>/<Name>Calculator.tsx`)
Kisi existing calculator ko copy karo (jaise `mortgage-payoff-calculator/MortgageCalculator.tsx`). Ye pieces reuse karo:
- `useToolState("<slug>", DEFAULTS)` → share link, "Welcome back", saved plans free me
- `CalcShell`, `NumberField`, `Segmented`, `ResultHero`, `Stat`, `LineChart`, `SplitBar`, `ToolActions`

`DEFAULTS` hamesha component ke **bahar** (module level) rakho.

## Step 4 — Page (`app/<slug>/page.tsx`)
`ToolLayout` use karo aur do:
- `buildMetadata` (title ≤ 60 chars, description ≤ 155 chars)
- 600–1,500 words ka asli explainer: formula, worked example, tips
- 4–6 FAQs
- `sources` — official links (IRS, CFPB, Fed…)

Ads, schema, breadcrumb, disclaimer, related tools — sab `ToolLayout` khud lagata hai.

## Step 5 — Check
```bash
npm run check-tools
```
```bash
npm run build
```
`check-tools` batata hai agar kuch bhool gaye (galat category, icon, related slug, missing page). Build fail ho to live site tak galti nahi pahunchti.

## Rules (Google-safe)
- Ek tool = ek asli kaam. Sirf naam badal ke copy pages **nahi** (scaled content abuse).
- State/city pages tabhi jab har page me sach me alag data ho.
- Local chat mein requested tool ko sources/examples aur checks se verify karke direct `main` par push karo (CLAUDE.md rule 3). Unattended weekly-agent drafts ka configured PR flow alag hai.
