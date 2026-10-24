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
  tagline: "Money calculators that actually explain your numbers",
  description:
    "Free, beautifully simple money calculators for the US: take-home pay, mortgage payoff, debt payoff, auto loans, credit cards, savings and more. Charts, share links, no sign-up.",
  // Contact email shown on Contact/Privacy pages (change to your real inbox)
  email: "hello@calcivy.com",
  // Your Google AdSense publisher ID goes here AFTER approval.
  // Leave empty ("") until AdSense approves — ads won't render until set.
  adsensePublisherId: "", // e.g. "ca-pub-1234567890123456"
  // Ad unit IDs from the AdSense dashboard (Ads → By ad unit). Khaali = slot hidden.
  // afterTool = display unit below the calculator, inArticle = in-article unit,
  // multiplex = "related content" grid after the FAQ. Anchor/side-rail ads come
  // from Auto ads (dashboard setting) - code me kuch nahi chahiye.
  adSlots: { afterTool: "", inArticle: "", multiplex: "" } as Record<AdPlacement, string>,
  locale: "en_US",
  twitter: "", // optional @handle
  // GitHub repo URL (e.g. "https://github.com/you/calcivy"). Admin panel ka
  // "Report a problem" button isi repo me issue kholta hai -> Claude fix karta hai.
  repo: "",
} as const;

export type AdPlacement = "afterTool" | "inArticle" | "multiplex";

export type ToolCategory = "pay" | "borrow" | "save" | "everyday";

export type IconName =
  | "wallet"
  | "clock"
  | "home"
  | "car"
  | "chain"
  | "card"
  | "sprout"
  | "percent"
  | "receipt"
  | "cake";

export interface Tool {
  slug: string; // URL segment, e.g. "paycheck-calculator" -> /paycheck-calculator/
  title: string; // H1 / card title
  shortTitle: string; // used in nav / related lists
  category: ToolCategory;
  // One-line description for cards + meta description base
  blurb: string;
  icon: IconName;
  // Last time the page's content or math was genuinely changed (YYYY-MM-DD).
  // Sitemap lastmod + "Last updated" line dono yahin se. Sirf asli update pe badlo.
  updated: string;
  // Hand-picked related tools (topic clusters = better internal linking)
  related: string[];
  // Real worked example shown on home cards so visitors instantly see what they get.
  // Numbers come from the calculator's own defaults - re-check if the math changes.
  example: { input: string; output: string };
  // Extra words people search with (home search box). Not shown anywhere.
  keywords: string;
  // Date the tool first went live (YYYY-MM-DD). Shows a "New" badge for 30 days.
  added: string;
}

// Order here = order on the home hub.
export const TOOLS: Tool[] = [
  {
    slug: "paycheck-calculator",
    title: "Take-Home Paycheck Calculator",
    shortTitle: "Paycheck",
    category: "pay",
    blurb: "Your real net pay after federal, state, Social Security and Medicare taxes — for all 50 states.",
    icon: "wallet",
    updated: "2026-10-24",
    related: ["salary-to-hourly-calculator", "compound-interest-calculator", "debt-payoff-calculator"],
    example: { input: "$75,000 salary in California", output: "$2,081 per paycheck" },
    keywords: "take home net pay salary tax wage income w2 state",
    added: "2026-10-24",
  },
  {
    slug: "salary-to-hourly-calculator",
    title: "Salary to Hourly Calculator",
    shortTitle: "Salary ↔ Hourly",
    category: "pay",
    blurb: "Convert an annual salary to hourly, weekly and monthly pay — or an hourly wage to a yearly salary.",
    icon: "clock",
    updated: "2026-10-24",
    related: ["paycheck-calculator", "percentage-calculator", "compound-interest-calculator"],
    example: { input: "$65,000 a year, 40 hrs/week", output: "$31.25 an hour" },
    keywords: "hourly wage salary convert per hour annual yearly",
    added: "2026-10-24",
  },
  {
    slug: "mortgage-payoff-calculator",
    title: "Mortgage Payoff Calculator (Extra Payments)",
    shortTitle: "Mortgage Payoff",
    category: "borrow",
    blurb: "See the exact date you'll own your home and how much interest extra payments save.",
    icon: "home",
    updated: "2026-10-24",
    related: ["auto-loan-calculator", "debt-payoff-calculator", "compound-interest-calculator"],
    example: { input: "$300k at 6.5% + $200/month extra", output: "7 years sooner, $103k saved" },
    keywords: "home house loan extra payment refinance early",
    added: "2026-10-24",
  },
  {
    slug: "debt-payoff-calculator",
    title: "Debt Payoff Calculator (Snowball vs Avalanche)",
    shortTitle: "Debt Snowball",
    category: "borrow",
    blurb: "Compare snowball and avalanche side by side and get your debt-free date.",
    icon: "chain",
    updated: "2026-10-24",
    related: ["credit-card-payoff-calculator", "paycheck-calculator", "mortgage-payoff-calculator"],
    example: { input: "4 debts + $250/month extra", output: "Debt-free in 3 yr 11 mo" },
    keywords: "snowball avalanche debt free loans consolidate",
    added: "2026-10-24",
  },
  {
    slug: "credit-card-payoff-calculator",
    title: "Credit Card Payoff Calculator",
    shortTitle: "Credit Card Payoff",
    category: "borrow",
    blurb: "How long to pay off a card, what it really costs, and the payment you need to be debt-free by a date.",
    icon: "card",
    updated: "2026-10-24",
    related: ["debt-payoff-calculator", "percentage-calculator", "paycheck-calculator"],
    example: { input: "$6,000 at 22.9%, paying $250", output: "Paid off in 2 yr 9 mo" },
    keywords: "card apr balance interest minimum payment",
    added: "2026-10-24",
  },
  {
    slug: "auto-loan-calculator",
    title: "Auto Loan Calculator with Trade-In",
    shortTitle: "Auto Loan",
    category: "borrow",
    blurb: "Monthly car payment with trade-in, sales tax and fees — and how loan length changes the total cost.",
    icon: "car",
    updated: "2026-10-24",
    related: ["mortgage-payoff-calculator", "debt-payoff-calculator", "paycheck-calculator"],
    example: { input: "$35k car, $8k trade-in, 60 months", output: "$564 a month" },
    keywords: "car vehicle truck trade in payment finance lease",
    added: "2026-10-24",
  },
  {
    slug: "compound-interest-calculator",
    title: "Compound Interest Calculator",
    shortTitle: "Compound Interest",
    category: "save",
    blurb: "Watch your savings grow with compound interest and monthly deposits, in any currency.",
    icon: "sprout",
    updated: "2026-10-24",
    related: ["paycheck-calculator", "mortgage-payoff-calculator", "percentage-calculator"],
    example: { input: "$10k + $300/month at 7% for 20 yrs", output: "Grows to $196,665" },
    keywords: "savings invest growth retirement interest money",
    added: "2026-10-24",
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    shortTitle: "Percentage",
    category: "everyday",
    blurb: "X% of Y, percentage change, increase or decrease by a percent — instantly, with the working shown.",
    icon: "percent",
    updated: "2026-10-24",
    related: ["tip-calculator", "salary-to-hourly-calculator", "compound-interest-calculator"],
    example: { input: "What is 20% of 150?", output: "30" },
    keywords: "percent discount increase decrease change math",
    added: "2026-10-24",
  },
  {
    slug: "tip-calculator",
    title: "Tip Calculator",
    shortTitle: "Tip & Split",
    category: "everyday",
    blurb: "Work out the tip and split the bill between friends, with optional rounding.",
    icon: "receipt",
    updated: "2026-10-24",
    related: ["percentage-calculator", "salary-to-hourly-calculator", "age-calculator"],
    example: { input: "$86.40 bill, 20% tip, 3 people", output: "$34.56 each" },
    keywords: "restaurant bill split gratuity",
    added: "2026-10-24",
  },
  {
    slug: "age-calculator",
    title: "Age Calculator",
    shortTitle: "Age",
    category: "everyday",
    blurb: "Your exact age in years, months and days, plus a countdown to your next birthday.",
    icon: "cake",
    updated: "2026-10-24",
    related: ["percentage-calculator", "tip-calculator", "compound-interest-calculator"],
    example: { input: "Born June 15, 1995", output: "Exact age + birthday countdown" },
    keywords: "birthday birth date how old days",
    added: "2026-10-24",
  },
];

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  pay: "Pay & Salary",
  borrow: "Loans & Debt",
  save: "Savings & Growth",
  everyday: "Everyday Math",
};

// Helper: get a tool by slug (used on tool pages)
export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

// Helper: related tools (hand-picked first, then fill from same category)
export function getRelatedTools(slug: string, count = 3): Tool[] {
  const current = getTool(slug);
  if (!current) return TOOLS.slice(0, count);
  const picked = current.related.map(getTool).filter((t): t is Tool => Boolean(t));
  const fill = TOOLS.filter(
    (t) => t.slug !== slug && !picked.includes(t) && t.category === current.category
  );
  return [...picked, ...fill].slice(0, count);
}

// "New" badge: tool went live in the last 30 days (relative to build time).
export function isNewTool(tool: Tool, now = new Date()): boolean {
  const days = (now.getTime() - new Date(`${tool.added}T00:00:00Z`).getTime()) / 86_400_000;
  return days >= 0 && days <= 30;
}

// Tools in one category, in registry order (home, menu, footer, /calculators sab yahi use karte).
export function toolsIn(category: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}
