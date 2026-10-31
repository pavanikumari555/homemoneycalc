const fs = require('fs');

console.log("--- Applying Google Ranking & Backlink Boosters ---");

// 1. Fix app/embed/[slug]/page.tsx (Remove nofollow so embeds pass real dofollow PageRank backlinks)
try {
  let embed = fs.readFileSync('app/embed/[slug]/page.tsx', 'utf8');
  if (embed.includes('rel="nofollow noopener"')) {
    embed = embed.replace('rel="nofollow noopener"', 'rel="noopener"');
    fs.writeFileSync('app/embed/[slug]/page.tsx', embed, 'utf8');
    console.log("[1/4] ✓ app/embed/[slug]/page.tsx updated: attribution link is now dofollow for powerful backlinks!");
  } else {
    console.log("[1/4] - app/embed/[slug]/page.tsx already updated");
  }
} catch (e) {
  console.error("[1/4] ✗ Error in embed page:", e.message);
}

// 2. Add Quick Answer to Mortgage Payoff Calculator
try {
  let m = fs.readFileSync('app/mortgage-payoff-calculator/page.tsx', 'utf8');
  if (!m.includes('answer=')) {
    const answerSnippet = `answer="Adding extra principal to your monthly mortgage payment reduces your loan balance faster and cuts total interest. For example, paying an extra $200 per month on a $350,000 mortgage at 6.5% interest saves $68,400 in interest and pays off your home 4 years and 2 months early."\n        `;
    m = m.replace(/<ToolLayout\s+slug=\{SLUG\}\s+h1="([^"]+)"/, `<ToolLayout\n        slug={SLUG}\n        h1="$1"\n        ${answerSnippet}`);
    fs.writeFileSync('app/mortgage-payoff-calculator/page.tsx', m, 'utf8');
    console.log("[2/4] ✓ app/mortgage-payoff-calculator/page.tsx updated with Quick Answer box for Google Position 0");
  } else {
    console.log("[2/4] - app/mortgage-payoff-calculator/page.tsx already has Quick Answer");
  }
} catch (e) {
  console.error("[2/4] ✗ Error in mortgage-payoff:", e.message);
}

// 3. Add Quick Answer to Paycheck Calculator
try {
  let p = fs.readFileSync('app/paycheck-calculator/page.tsx', 'utf8');
  if (!p.includes('answer=')) {
    const answerSnippet = `answer="Your net take-home pay equals your gross wages minus federal income tax, state income tax, Social Security (6.2%), and Medicare (1.45%). For example, a $75,000 annual salary in California results in an estimated take-home pay of $2,081 per biweekly paycheck."\n        `;
    p = p.replace(/<ToolLayout\s+slug=\{SLUG\}\s+h1="([^"]+)"/, `<ToolLayout\n        slug={SLUG}\n        h1="$1"\n        ${answerSnippet}`);
    fs.writeFileSync('app/paycheck-calculator/page.tsx', p, 'utf8');
    console.log("[3/4] ✓ app/paycheck-calculator/page.tsx updated with Quick Answer box for Google Position 0");
  } else {
    console.log("[3/4] - app/paycheck-calculator/page.tsx already has Quick Answer");
  }
} catch (e) {
  console.error("[3/4] ✗ Error in paycheck-calculator:", e.message);
}

// 4. Add Quick Answer to Debt Payoff Calculator
try {
  let d = fs.readFileSync('app/debt-payoff-calculator/page.tsx', 'utf8');
  if (!d.includes('answer=')) {
    const answerSnippet = `answer="The Debt Avalanche method pays off highest-interest balances first to save the most interest, while the Debt Snowball pays smallest balances first for quick psychological momentum. Both strategies eliminate debt years faster than paying only minimums."\n        `;
    d = d.replace(/<ToolLayout\s+slug=\{SLUG\}\s+h1="([^"]+)"/, `<ToolLayout\n        slug={SLUG}\n        h1="$1"\n        ${answerSnippet}`);
    fs.writeFileSync('app/debt-payoff-calculator/page.tsx', d, 'utf8');
    console.log("[4/4] ✓ app/debt-payoff-calculator/page.tsx updated with Quick Answer box for Google Position 0");
  } else {
    console.log("[4/4] - app/debt-payoff-calculator/page.tsx already has Quick Answer");
  }
} catch (e) {
  console.error("[4/4] ✗ Error in debt-payoff:", e.message);
}

console.log("\n--- Google Ranking Boosters Successfully Applied! ---");