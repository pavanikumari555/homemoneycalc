export default function AuthorSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://homemoneycalc.com/#author",
        "name": "Pavani Kumari",
        "jobTitle": "Founder & Lead Financial Tools Researcher",
        "description": "Founder and editor of HomeMoney Calc. Specializes in US tax calculation modeling, statutory amortization math, and transparent personal finance software.",
        "url": "https://homemoneycalc.com/about/",
        "knowsAbout": [
          "US Federal and State Income Tax Brackets",
          "Statutory Loan Amortization and Payoff Modeling",
          "Compound Interest and Savings Growth Algorithms",
          "Personal Finance and Budgeting Math"
        ],
        "worksFor": {
          "@type": "Organization",
          "name": "HomeMoney Calc",
          "url": "https://homemoneycalc.com"
        }
      },
      {
        "@type": "AboutPage",
        "@id": "https://homemoneycalc.com/about/#webpage",
        "url": "https://homemoneycalc.com/about/",
        "name": "About HomeMoney Calc & Founder Pavani Kumari",
        "mainEntity": {
          "@id": "https://homemoneycalc.com/#author"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
