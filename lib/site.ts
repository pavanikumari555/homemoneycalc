// ============================================================================
// CENTRAL SITE CONFIG
// Ek hi jagah saari site info. Naya tool add karna ho to bas TOOLS array me
// entry daalo + uska page banao. Baaki (home hub, sitemap, related links)
// automatic update ho jayega. Ye "single source of truth" pattern hai.
// ============================================================================

export const SITE = {
  name: "CalcIvy",
  domain: "calcivy.com",
  url: "https://calcivy.com",
  // Short tagline used in header/footer + meta
  tagline: "Free, fast financial calculators",
  description:
    "Free online financial calculators for the US: paycheck, mortgage payoff, debt payoff, auto loan, percentage, and compound interest. No sign-up, instant results.",
  // Contact email shown on Contact/Privacy pages (change to your real inbox)
  email: "hello@calcivy.com",
  // Your Google AdSense publisher ID goes here AFTER approval.
  // Leave empty ("") until AdSense approves — ads won't render until set.
  adsensePublisherId: "", // e.g. "ca-pub-1234567890123456"
  locale: "en_US",
  twitter: "", // optional @handle
} as const;

export type ToolCategory = "money" | "everyday";

export interface Tool {
  slug: string; // URL segment, e.g. "paycheck-calculator" -> /paycheck-calculator/
  title: string; // H1 / card title
  shortTitle: string; // used in nav / related lists
  category: ToolCategory;
  // One-line description for cards + meta description base
  blurb: string;
  // Emoji/icon shown on the card (kept simple, no icon library = lighter)
  icon: string;
}

// The 6 MVP tools. Order here = order on the home hub.
export const TOOLS: Tool[] = [
  {
    slug: "paycheck-calculator",
    title: "Take-Home Paycheck Calculator",
    shortTitle: "Paycheck Calculator",
    category: "money",
    blurb:
      "Estimate your net pay after federal, Social Security, and Medicare taxes from your gross salary.",
    icon: "💵",
  },
  {
    slug: "mortgage-payoff-calculator",
    title: "Mortgage Payoff Calculator (Extra Payments)",
    shortTitle: "Mortgage Payoff",
    category: "money",
    blurb:
      "See how much time and interest you save by adding extra to your monthly mortgage payment.",
    icon: "🏠",
  },
  {
    slug: "debt-payoff-calculator",
    title: "Debt Payoff Calculator (Snowball vs Avalanche)",
    shortTitle: "Debt Payoff",
    category: "money",
    blurb:
      "Compare the snowball and avalanche methods to find your fastest, cheapest path out of debt.",
    icon: "📉",
  },
  {
    slug: "auto-loan-calculator",
    title: "Auto Loan Calculator with Trade-In",
    shortTitle: "Auto Loan",
    category: "money",
    blurb:
      "Calculate your monthly car payment including trade-in value, down payment, sales tax, and fees.",
    icon: "🚗",
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    shortTitle: "Percentage",
    category: "everyday",
    blurb:
      "Quickly work out percentages: what is X% of Y, percentage change, and X is what percent of Y.",
    icon: "％",
  },
  {
    slug: "compound-interest-calculator",
    title: "Compound Interest Calculator",
    shortTitle: "Compound Interest",
    category: "everyday",
    blurb:
      "See how your savings grow over time with compound interest and regular monthly contributions.",
    icon: "📈",
  },
];

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  money: "Money & Loans",
  everyday: "Everyday Math",
};

// Helper: get a tool by slug (used on tool pages)
export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

// Helper: related tools (same category first, then fill from others)
export function getRelatedTools(slug: string, count = 3): Tool[] {
  const current = getTool(slug);
  if (!current) return TOOLS.slice(0, count);
  const sameCat = TOOLS.filter((t) => t.slug !== slug && t.category === current.category);
  const otherCat = TOOLS.filter((t) => t.slug !== slug && t.category !== current.category);
  return [...sameCat, ...otherCat].slice(0, count);
}
