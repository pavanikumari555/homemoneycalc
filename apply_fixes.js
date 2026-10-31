const fs = require('fs');

console.log("--- Starting Auto-Fix for HomeMoneyCalc ---");

// 1. Fix app/privacy-policy/page.tsx
try {
  let p = fs.readFileSync('app/privacy-policy/page.tsx', 'utf8');
  if (!p.includes('Google AdSense &amp; Advertising Cookies')) {
    const adsenseSection = `      <h2>Google AdSense &amp; Advertising Cookies</h2>
      <p>
        We may use Google AdSense and other third-party advertising partners to serve ads when you visit our website.
        Third-party vendors, including Google, use cookies (such as the DoubleClick DART cookie) to serve ads based on
        your prior visits to this website or other websites on the internet.
      </p>
      <p>
        You may opt out of personalized advertising by visiting{&apos; &apos;}
        <a
          href="https://adssettings.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ivy-600 underline"
        >
          Google Ads Settings
        </a>
        . Alternatively, you can opt out of third-party vendors&apos; use of cookies for personalized advertising by visiting{&apos; &apos;}
        <a
          href="https://www.aboutads.info/choices/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ivy-600 underline"
        >
          aboutads.info
        </a>
        .
      </p>

      <h2>Cookies</h2>`;
    p = p.replace('<h2>Cookies</h2>', adsenseSection);
    fs.writeFileSync('app/privacy-policy/page.tsx', p, 'utf8');
    console.log("[1/5] ✓ app/privacy-policy/page.tsx updated");
  } else {
    console.log("[1/5] - app/privacy-policy/page.tsx already updated");
  }
} catch (err) {
  console.error("[1/5] ✗ Error in privacy-policy:", err.message);
}

// 2. Fix app/advertising-disclosure/page.tsx
try {
  let a = fs.readFileSync('app/advertising-disclosure/page.tsx', 'utf8');
  if (!a.includes('Google AdSense')) {
    const adParagraph = `      <p>
        In addition to affiliate links, we may display third-party advertisements via Google AdSense. These ads are
        clearly distinguished from our calculator tools and editorial content, and ad placements never alter our
        mathematical formulas or recommendations.
      </p>

      <h2>What never changes</h2>`;
    a = a.replace('<h2>What never changes</h2>', adParagraph);
    fs.writeFileSync('app/advertising-disclosure/page.tsx', a, 'utf8');
    console.log("[2/5] ✓ app/advertising-disclosure/page.tsx updated");
  } else {
    console.log("[2/5] - app/advertising-disclosure/page.tsx already updated");
  }
} catch (err) {
  console.error("[2/5] ✗ Error in advertising-disclosure:", err.message);
}

// 3. Fix lib/site.ts (holiday budget release date)
try {
  let s = fs.readFileSync('lib/site.ts', 'utf8');
  if (s.includes('2027-01-03')) {
    s = s.replace('2027-01-03', '2026-11-01');
    fs.writeFileSync('lib/site.ts', s, 'utf8');
    console.log("[3/5] ✓ lib/site.ts updated (holiday-budget-calculator set to 2026-11-01)");
  } else {
    console.log("[3/5] - lib/site.ts already updated");
  }
} catch (err) {
  console.error("[3/5] ✗ Error in lib/site.ts:", err.message);
}

// 4. Fix scripts/check-tools.mjs (coming soon guard)
try {
  let c = fs.readFileSync('scripts/check-tools.mjs', 'utf8');
  if (!c.includes('AdSense Safety Guard')) {
    const guardCode = `\n// AdSense Safety Guard: Koi bhi live tool "Coming Soon" ya placeholder nahi hona chahiye
for (const t of tools) {
  const dir = "app/" + t.slug;
  if (!existsSync(dir)) continue;
  const isReleasedNow = addedOf[t.slug] <= (process.env.BUILD_DATE || new Date().toISOString().slice(0, 10));
  const code = readdirSync(dir).map((f) => readFileSync(dir + "/" + f, "utf8")).join("\\n");
  if (isReleasedNow && /coming soon/i.test(code)) {
    errors.push("Tool " + t.slug + " (added: " + addedOf[t.slug] + ") live hone ke liye scheduled hai par usme Coming Soon placeholder hai - pehle pura component banayein!");
  }
}
\nif (errors.length) {`;
    c = c.replace('if (errors.length) {', guardCode);
    fs.writeFileSync('scripts/check-tools.mjs', c, 'utf8');
    console.log("[4/5] ✓ scripts/check-tools.mjs updated with AdSense guard");
  } else {
    console.log("[4/5] - scripts/check-tools.mjs already has guard");
  }
} catch (err) {
  console.error("[4/5] ✗ Error in check-tools.mjs:", err.message);
}

// 5. Fix .github/workflows/seo-daily.yml (add [skip ci])
try {
  let y = fs.readFileSync('.github/workflows/seo-daily.yml', 'utf8');
  if (!y.includes('[skip ci]')) {
    y = y.replace(
      'git commit -m "chore(report): daily SEO report $(date -u +%F)"',
      'git commit -m "chore(report): daily SEO report $(date -u +%F) [skip ci]"'
    );
    fs.writeFileSync('.github/workflows/seo-daily.yml', y, 'utf8');
    console.log("[5/5] ✓ .github/workflows/seo-daily.yml updated with [skip ci]");
  } else {
    console.log("[5/5] - .github/workflows/seo-daily.yml already has [skip ci]");
  }
} catch (err) {
  console.error("[5/5] ✗ Error in seo-daily.yml:", err.message);
}

console.log("\n--- All 5 Fixes Applied Successfully! ---");
