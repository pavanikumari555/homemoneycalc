const fs = require('fs');

console.log("--- Applying E-E-A-T & Author Trust Fixes ---");

// 1. Update app/about/page.tsx
try {
  let about = fs.readFileSync('app/about/page.tsx', 'utf8');
  if (!about.includes('Pavani Kumari')) {
    const oldWho = /<h2>Who is behind HomeMoney Calc\?<\/h2>[\s\S]*?<p>[\s\S]*?<\/p>/;
    const newWho = `<h2>Who is behind HomeMoney Calc?</h2>
      <p>
        {SITE.name} is founded and edited by <strong>Pavani Kumari</strong>, who oversees editorial direction,
        tax parameter research, and calculator accuracy standards. Tool algorithms, formulas, and regression
        testing are developed and maintained in-house. We are an independent, family-run financial education
        resource — not a bank, lender, or financial advisor, and we never sell your personal data.
      </p>
      <p>
        Our tools are engineered to give everyday users instant, clear answers to complicated money questions.
        Every calculator is verified against published IRS guidance, Federal Reserve data, or statutory amortization math.
        Learn more about our standards in our <a href="/editorial-policy/">editorial policy</a>.
      </p>`;
    about = about.replace(oldWho, newWho);
    fs.writeFileSync('app/about/page.tsx', about, 'utf8');
    console.log("[1/3] ✓ app/about/page.tsx updated with Pavani Kumari founder profile");
  } else {
    console.log("[1/3] - app/about/page.tsx already has Pavani Kumari profile");
  }
} catch (e) {
  console.error("[1/3] ✗ Error updating app/about/page.tsx:", e.message);
}

// 2. Update app/editorial-policy/page.tsx
try {
  let ed = fs.readFileSync('app/editorial-policy/page.tsx', 'utf8');
  if (!ed.includes('Pavani Kumari')) {
    const oldResp = /<h2>Who is responsible<\/h2>[\s\S]*?<p>[\s\S]*?<\/p>/;
    const newResp = `<h2>Who is responsible</h2>
      <p>
        HomeMoney Calc is edited by founder <strong>Pavani Kumari</strong>, who directs editorial policy and review
        standards, alongside an in-house developer who maintains the financial formulas, automated regression tests,
        and primary source documentation. While we verify every formula against official government publications
        (such as IRS Publication 15-T and CFPB guidelines), our tools are designed for educational estimates and do
        not substitute for individualized CPA or fiduciary advice. You can send corrections through our <Link href="/contact/">contact page</Link>.
      </p>`;
    ed = ed.replace(oldResp, newResp);
    fs.writeFileSync('app/editorial-policy/page.tsx', ed, 'utf8');
    console.log("[2/3] ✓ app/editorial-policy/page.tsx updated with editorial responsibility");
  } else {
    console.log("[2/3] - app/editorial-policy/page.tsx already updated");
  }
} catch (e) {
  console.error("[2/3] ✗ Error updating app/editorial-policy/page.tsx:", e.message);
}

// 3. Update components/StructuredData.tsx (Person Schema for ToolSchema)
try {
  let sd = fs.readFileSync('components/StructuredData.tsx', 'utf8');
  if (!sd.includes('Founder & Financial Editor')) {
    const oldPublisher = `        publisher: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
        },`;
    const newAuthorAndPublisher = `        author: {
          "@type": "Person",
          name: "Pavani Kumari",
          jobTitle: "Founder & Financial Editor",
          url: \`\${SITE.url}/about/\`,
        },
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
        },`;
    sd = sd.replace(oldPublisher, newAuthorAndPublisher);
    fs.writeFileSync('components/StructuredData.tsx', sd, 'utf8');
    console.log("[3/3] ✓ components/StructuredData.tsx updated with Person Schema");
  } else {
    console.log("[3/3] - components/StructuredData.tsx already has Person schema");
  }
} catch (e) {
  console.error("[3/3] ✗ Error updating components/StructuredData.tsx:", e.message);
}

console.log("\n--- E-E-A-T & Author Attribution Successfully Applied! ---");