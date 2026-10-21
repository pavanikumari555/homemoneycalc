# CalcIvy 🌿

Free financial calculators for the US. Static Next.js site — hosts free on Cloudflare Pages, only cost is the domain (calcivy.com).

## What's inside

- **6 calculators:** Paycheck, Mortgage Payoff, Debt Payoff (Snowball vs Avalanche), Auto Loan (Trade-In), Percentage, Compound Interest
- **Support pages:** About, Contact, Privacy Policy, Terms, Disclaimer
- **SEO built in:** per-page metadata, canonical URLs, Open Graph, JSON-LD structured data (WebApplication + FAQ + Breadcrumb), auto sitemap, robots.txt
- **AdSense-ready:** ad slots placed, just add your publisher ID after approval
- **Security-hardened:** security headers via `_headers`, everything runs client-side (no server, tiny attack surface)

---

## STEP 1 — Install Node.js (one time)

This machine doesn't have Node yet. Install it:

1. Go to https://nodejs.org and download the **LTS** version for Windows.
2. Run the installer (keep defaults).
3. Close and reopen your terminal, then check it works:

```powershell
node --version
npm --version
```

## STEP 2 — Install dependencies

From inside the `calcivy` folder:

```powershell
npm install
```

## STEP 3 — Preview locally (optional but recommended)

```powershell
npm run dev
```

Open http://localhost:3000 in your browser. Check the tools work. Press Ctrl+C to stop.

## STEP 4 — Build the static site

```powershell
npm run build
```

This creates an `out/` folder with pure HTML/CSS/JS — that's your whole website, ready to host anywhere.

---

## STEP 5 — Deploy free on Cloudflare Pages

1. Create a free account at https://pages.cloudflare.com
2. Push this project to a GitHub repo (or use "Direct Upload" and drag the `out/` folder).
3. If using GitHub: connect the repo, and set:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
4. Deploy. Cloudflare gives you a free `*.pages.dev` URL instantly.
5. Add your custom domain `calcivy.com` in the Pages project → Custom Domains. Follow the DNS steps (Cloudflare walks you through it).

Every time you push to GitHub, Cloudflare rebuilds and redeploys automatically. Free, unlimited bandwidth.

---

## Turning on AdSense (after approval)

1. Apply at https://adsense.google.com once the site is live with content.
2. After approval, open `lib/site.ts` and set your publisher ID:
   ```ts
   adsensePublisherId: "ca-pub-XXXXXXXXXXXXXXXX",
   ```
3. (Optional) Give each `<AdSlot />` a real `slot` ID from your AdSense dashboard for manual ad units. Auto ads work with just the publisher ID.
4. Rebuild and redeploy. Ads appear where the "Ad space" placeholders are now.

Until you set the publisher ID, ad areas show a subtle placeholder — the site never looks broken.

---

## Adding a new calculator later (the weekly habit)

1. Add an entry to the `TOOLS` array in `lib/site.ts`.
2. Create `app/<your-slug>/page.tsx` (copy an existing tool page as a template) and a client component for the calculator UI.
3. Add the math function to `lib/calc.ts`.
4. That's it — the home hub, footer links, related-tools, and sitemap all update automatically from the `TOOLS` array.

---

## Security notes

- Site is fully static: no server, no database, no login → classic attacks (SQL injection, server takeover) don't apply.
- DDoS protection + bot mitigation come free from Cloudflare. Turn on **Bot Fight Mode** in the Cloudflare dashboard.
- Security headers are set in `public/_headers` (CSP, X-Frame-Options, HSTS, etc.).
- Enable **2FA** on your domain registrar and Cloudflare accounts.
