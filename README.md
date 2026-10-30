# HomeMoney Calc 🌿

> 👉 **Kaam aage badhana hai? Pehle [docs/NEXT-STEPS.md](docs/NEXT-STEPS.md) padho** (status + agla step).

Free financial calculators for the US. Static Next.js site — hosts free on Cloudflare Pages, only cost is the domain (homemoneycalc.com).

## What's inside

- **19 implemented calculators:** 15 public and 4 queued as of 30 Oct 2026. Publish dates in `lib/site.ts` control which tools appear.
- **Support pages:** About, Contact, Privacy Policy, Terms, Disclaimer
- **SEO built in:** per-page metadata, canonical URLs, Open Graph, JSON-LD structured data (WebApplication + FAQ + Breadcrumb), auto sitemap, robots.txt
- **Earning setup:** affiliate/template offer components exist; AdSense integration and publisher/site approval still need setup.
- **Security-hardened:** security headers via `_headers`, everything runs client-side (no server, tiny attack surface)

---

## STEP 1 — Install Node.js (one time)

Use Node.js 22 or newer (GitHub CI uses Node 22). If Node is missing, install it:

1. Go to https://nodejs.org and download the **LTS** version for Windows.
2. Run the installer (keep defaults).
3. Close and reopen your terminal, then check it works:

```powershell
node --version
npm --version
```

## STEP 2 — Install dependencies

From inside the project folder:

```powershell
npm ci
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

Preview that production export locally with `npm start` at http://127.0.0.1:3000.
Owner-approved local workflow: sync `main`, make changes, run `npm test`, `npm run check-tools`, `npm run lint`, and `npm run build`, then commit and push directly to `main`. Cloudflare deploys automatically; no PR/merge step is required for this local work. Do not push failed checks or force-push.

---

## STEP 5 — Deploy free on Cloudflare Pages

1. Create a free account at https://pages.cloudflare.com
2. Push this project to a GitHub repo (or use "Direct Upload" and drag the `out/` folder).
3. If using GitHub: connect the repo, and set:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
4. Deploy. Cloudflare gives you a free `*.pages.dev` URL instantly.
5. Add your custom domain `homemoneycalc.com` in the Pages project → Custom Domains. Follow the DNS steps (Cloudflare walks you through it).

Every time you push to GitHub, Cloudflare rebuilds and redeploys automatically. Free, unlimited bandwidth.

---

## Turning on AdSense (after approval)

1. Add the site in the owner's AdSense dashboard and check its verification/approval status there.
2. Implement the dashboard-provided code with the owner's actual publisher ID; the current code has no `AdSlot` component or `adsensePublisherId` config.
3. Add the necessary Google domains to the CSP in `public/_headers` and the dashboard-provided `ads.txt` entry in `public/ads.txt`.
4. Review ad placement and privacy requirements, then build, test, commit and push to `main`. Do not assume approval or revenue before checking the dashboard.

---

## Adding a new calculator later (the weekly habit)

1. Add an entry to `ALL_TOOLS` in `lib/site.ts`, with its real publish date (`added`). `TOOLS` is the filtered public list.
2. Create `app/<your-slug>/page.tsx` (copy an existing tool page as a template) and a client component for the calculator UI.
3. Add the math function to `lib/calc.ts`.
4. Register its widget in `app/embed/[slug]/page.tsx`, update the roadmap, and follow `docs/ADDING-A-TOOL.md`. The home hub, footer links, related tools, and sitemap update from the registry.

---

## Security notes

- Site is fully static: no server, no database, no login → classic attacks (SQL injection, server takeover) don't apply.
- DDoS protection + bot mitigation come free from Cloudflare. Turn on **Bot Fight Mode** in the Cloudflare dashboard.
- Security headers are set in `public/_headers` (CSP, X-Frame-Options, HSTS, etc.).
- Enable **2FA** on your domain registrar and Cloudflare accounts.
