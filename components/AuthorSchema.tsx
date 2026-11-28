export default function AuthorSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://homemoneycalc.com/#author",
        "name": "Pavani Kumari",
        "jobTitle": "Founder and editor",
        "description": "Founder and editor of HomeMoney Calc, a free set of US money calculators. Oversees tax-figure research and accuracy checks against official sources.",
        "url": "https://homemoneycalc.com/about/",
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
