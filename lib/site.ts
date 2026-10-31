// ============================================================================
// CENTRAL SITE CONFIG
// Ek hi jagah saari site info. Naya tool add karna ho to bas TOOLS array me
// entry daalo + uska page banao. Baaki (home hub, sitemap, related links)
// automatic update ho jayega. Ye "single source of truth" pattern hai.
// ============================================================================

export const SITE = {
  name: "HomeMoney Calc",
  domain: "homemoneycalc.com",
  url: "https://homemoneycalc.com",
  // Short tagline used in header/footer + meta
  tagline: "Money calculators that actually explain your numbers",
  description:
    "Free US money calculators: take-home pay, mortgage payoff, debt payoff, auto loans, credit cards and savings. Charts, share links, no sign-up.",
  // Contact email (Contact/Privacy pages). Launch se pehle Cloudflare Email Routing se Gmail pe forward karo (SETUP-AGENT.md)
  email: "hello@homemoneycalc.com",
  locale: "en_US",
  twitter: "", // optional @handle
  // GitHub repo URL (e.g. "https://github.com/you/homemoneycalc"). Admin panel ka
  // "Report a problem" button isi repo me issue kholta hai -> Claude fix karta hai.
  repo: "https://github.com/pavanikumari555/homemoneycalc",
  // IndexNow key (public by design): Bing/Yandex/ChatGPT-search ko naye pages turant batata hai.
  // Same value ki file public/<key>.txt me hai — dono saath badalna.
  indexNowKey: "003c58862834fce1e9714cc87fd0d1e2",
} as const;

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
  // Publish date (YYYY-MM-DD). Release queue: is date se pehle tool public site pe nahi dikhta
  // (menu, sitemap, search, page sab band). Uske baad 30 din "New" badge.
  added: string;
}

// Order here = order on the home hub. Saare tools — published + queued (future `added`).
export const ALL_TOOLS: Tool[] = [
  {
    slug: "paycheck-calculator",
    title: "Take-Home Paycheck Calculator",
    shortTitle: "Paycheck",
    category: "pay",
    blurb: "Estimate net pay after federal, state, Social Security and Medicare taxes — for all 50 states.",
    icon: "wallet",
    updated: "2026-10-31",
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
    updated: "2026-10-25",
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
    blurb: "Estimate your mortgage payoff date and how much interest extra payments could save.",
    icon: "home",
    updated: "2026-10-30",
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
    updated: "2026-10-30",
    related: ["credit-card-payoff-calculator", "paycheck-calculator", "mortgage-payoff-calculator"],
    example: { input: "4 debts + $250/month extra", output: "Debt-free in 3 yr 9 mo" },
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
    updated: "2026-10-30",
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
    updated: "2026-10-25",
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
    updated: "2026-10-30",
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
    updated: "2026-10-25",
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
    updated: "2026-10-25",
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
    updated: "2026-10-25",
    related: ["percentage-calculator", "tip-calculator", "compound-interest-calculator"],
    example: { input: "Born June 15, 1995", output: "Exact age + birthday countdown" },
    keywords: "birthday birth date how old days",
    added: "2026-10-24",
  },
  {
    slug: "overtime-calculator",
    title: "Overtime Pay Calculator",
    shortTitle: "Overtime Pay",
    category: "pay",
    blurb: "Work out time-and-a-half or double-time pay per week and per year, plus a rough after-tax figure for your state.",
    icon: "clock",
    updated: "2026-10-31",
    related: ["paycheck-calculator", "salary-to-hourly-calculator", "tip-calculator"],
    example: { input: "$22/hr, 48 hours a week", output: "$264 overtime, $1,144 a week" },
    keywords: "time and a half double time ot pay flsa hours over 40 after tax hourly",
    added: "2026-10-30",
  },
  {
    slug: "no-tax-on-overtime-calculator",
    title: "No Tax on Overtime Calculator",
    shortTitle: "No Tax on Overtime",
    category: "pay",
    blurb: "Estimate your qualified overtime deduction (2025–2028) and the federal income tax it saves, with the cap and income phase-out applied.",
    icon: "clock",
    updated: "2026-10-30",
    related: ["overtime-calculator", "paycheck-calculator", "percentage-calculator"],
    example: { input: "$25/hr, 5 OT hrs/week for 50 weeks, single, $70k income", output: "$3,125 deduction, saves $687.50" },
    keywords: "overtime deduction obbba schedule 1-a w-2 code tt box 12 time and a half tax free flsa",
    added: "2026-11-08",
  },
  {
    slug: "no-tax-on-tips-calculator",
    title: "No Tax on Tips Calculator",
    shortTitle: "No Tax on Tips",
    category: "pay",
    blurb: "See how much of your tip income you can deduct for 2025–2028 (up to $25,000) and roughly what it saves in federal tax.",
    icon: "receipt",
    updated: "2026-10-30",
    related: ["tip-calculator", "paycheck-calculator", "salary-to-hourly-calculator"],
    example: { input: "$18,000 tips, single, $48k income", output: "$18,000 deduction, saves $2,160" },
    keywords: "tips deduction obbba schedule 1-a w-2 code tp server bartender tipped occupations tax free",
    added: "2026-11-16",
  },
  {
    slug: "senior-deduction-calculator",
    title: "Senior $6,000 Deduction Calculator",
    shortTitle: "Senior Deduction",
    category: "pay",
    blurb: "Estimate the new $6,000-per-person deduction for people 65+ (2025–2028), after the income phase-out.",
    icon: "receipt",
    updated: "2026-10-28",
    related: ["social-security-cola-calculator", "paycheck-calculator", "car-loan-interest-deduction-calculator"],
    example: { input: "Married jointly, both 65+, $170k MAGI", output: "$9,600 deduction, saves about $2,112" },
    keywords: "6000 senior deduction enhanced deduction for seniors over 65 age 65 retiree obbba schedule 1-a social security tax",
    added: "2026-11-24",
  },
  {
    slug: "social-security-cola-calculator",
    title: "Social Security COLA Calculator 2027",
    shortTitle: "SS COLA 2027",
    category: "save",
    blurb: "See your 2027 Social Security check after the 3.6% COLA, and what's left after Medicare Part B.",
    icon: "percent",
    updated: "2026-10-28",
    related: ["senior-deduction-calculator", "compound-interest-calculator", "paycheck-calculator"],
    example: { input: "$2,000 monthly benefit, 3.6% COLA", output: "$2,072/mo, +$72 a month ($864/yr)" },
    keywords: "social security raise 2027 cola increase benefit increase retirement ssi ssdi medicare part b premium hold harmless",
    added: "2026-12-02",
  },
  {
    slug: "car-loan-interest-deduction-calculator",
    title: "Car Loan Interest Deduction Calculator",
    shortTitle: "Car Loan Interest Deduction",
    category: "borrow",
    blurb: "See how much new-car loan interest you can deduct for 2025–2028, after the $10,000 cap and income phase-out.",
    icon: "car",
    updated: "2026-11-10",
    related: ["auto-loan-calculator", "senior-deduction-calculator", "paycheck-calculator"],
    example: { input: "$40,000 at 7% for 60 mo, bought Jan 2026, single, $85k MAGI", output: "$2,384 deduction for 2026, saves about $525" },
    keywords: "obbba one big beautiful bill no tax on car loan interest schedule 1-a auto loan interest deductible new car vin phase out",
    added: "2026-12-10",
  },
  {
    slug: "hsa-calculator",
    title: "HSA Calculator",
    shortTitle: "HSA",
    category: "save",
    blurb: "See your 2026 or 2027 HSA limit, the room left after your employer's deposit, the taxes you save and how the account could grow.",
    icon: "sprout",
    updated: "2026-11-17",
    related: ["paycheck-calculator", "compound-interest-calculator", "bonus-tax-calculator"],
    example: { input: "Self-only, $3,400 + $1,000 employer, $75k, TX", output: "Saves $1,008 in taxes (2026)" },
    keywords: "hsa health savings account contribution limit 2026 2027 hdhp catch-up tax savings per paycheck",
    added: "2026-12-18",
  },
  {
    slug: "bonus-tax-calculator",
    title: "Bonus Tax Calculator",
    shortTitle: "Bonus Tax",
    category: "pay",
    blurb: "See what you keep from a bonus after 22% flat or aggregate federal withholding, Social Security, Medicare and state tax.",
    icon: "receipt",
    updated: "2026-11-20",
    related: ["paycheck-calculator", "salary-to-hourly-calculator", "hsa-calculator"],
    example: { input: "$5,000 bonus, Texas, 22% flat", output: "You keep $3,517.50" },
    keywords: "bonus tax rate supplemental wages withholding 22 percent aggregate method commission take home",
    added: "2026-12-26",
  },
  {
    slug: "holiday-budget-calculator",
    title: "Holiday Budget Calculator",
    shortTitle: "Holiday Budget",
    category: "everyday",
    blurb: "Plan gifts per person plus travel, food and decorations, compare with your budget and see what to save each paycheck.",
    icon: "cake",
    updated: "2026-10-30",
    related: ["credit-card-payoff-calculator", "compound-interest-calculator", "tip-calculator"],
    example: { input: "6 gifts ($800) + $675 extras, from Nov 1", output: "$1,475 total, $492 per paycheck" },
    keywords: "christmas budget gift budget per person holiday savings plan hanukkah presents spending",
    added: "2026-11-01",
  },
  // ============================================================================
  // WAVE 2 — Strategic new calculators (1 tool per 10-14 days, quality focus)
  // ============================================================================
  {
    slug: "trump-account-calculator",
    title: "Trump Account Calculator",
    shortTitle: "Trump Account",
    category: "save",
    blurb: "See how the $1,000 federal seed plus your family contributions could grow in a MAGA (Trump) Account by age 18.",
    icon: "sprout",
    updated: "2027-01-17",
    related: ["compound-interest-calculator", "hsa-calculator", "paycheck-calculator"],
    example: { input: "$1k seed + $250/month for 15 years", output: "Grows to $76,482 at 7%" },
    keywords: "trump account maga account federal seed baby account $1000 child savings 529 alternative tax free growth",
    added: "2027-01-17",
  },
  {
    slug: "raise-calculator",
    title: "Raise Calculator",
    shortTitle: "Raise",
    category: "pay",
    blurb: "See the after-tax value of a raise and how much more you'll actually take home per paycheck in your state.",
    icon: "wallet",
    updated: "2027-01-31",
    related: ["paycheck-calculator", "salary-to-hourly-calculator", "percentage-calculator"],
    example: { input: "$75k → $82k in California", output: "+$356 per paycheck after tax" },
    keywords: "pay raise salary increase percentage after tax take home promotion annual review",
    added: "2027-01-31",
  },
  {
    slug: "fsa-calculator",
    title: "FSA Calculator (Per Paycheck)",
    shortTitle: "FSA",
    category: "save",
    blurb: "See your 2026 or 2027 Health Care or Dependent Care FSA limit, the taxes you save and how much to set aside per paycheck.",
    icon: "receipt",
    updated: "2027-02-14",
    related: ["hsa-calculator", "paycheck-calculator", "compound-interest-calculator"],
    example: { input: "Health FSA $3,200, $80k, CA, 24 pays", output: "Saves $1,139, set aside $133/check" },
    keywords: "fsa flexible spending account health care dependent care 2026 2027 limit per paycheck tax savings open enrollment",
    added: "2027-02-14",
  },
  {
    slug: "rap-student-loan-calculator",
    title: "RAP Student Loan Payment Calculator",
    shortTitle: "RAP Payment",
    category: "borrow",
    blurb: "Estimate your monthly payment under the Repayment Assistance Plan (RAP) and see when your balance would be forgiven.",
    icon: "chain",
    updated: "2027-02-28",
    related: ["debt-payoff-calculator", "paycheck-calculator", "salary-to-hourly-calculator"],
    example: { input: "$40k balance, $55k income, single", output: "$191/month, forgiven in 20 years" },
    keywords: "rap repayment assistance plan student loan idr income driven save replacement payment calculator forgiveness",
    added: "2027-02-28",
  },
  {
    slug: "tax-refund-calculator",
    title: "Tax Refund Estimator 2026",
    shortTitle: "Tax Refund",
    category: "pay",
    blurb: "Estimate your 2026 federal tax refund with the new overtime, tips, senior and car-loan deductions included.",
    icon: "wallet",
    updated: "2027-03-14",
    related: ["paycheck-calculator", "no-tax-on-overtime-calculator", "no-tax-on-tips-calculator"],
    example: { input: "$65k income, $2 kids, $8k withheld", output: "Estimated refund: $2,340" },
    keywords: "tax refund estimator 2026 2027 federal return irs child tax credit ctc obbba deductions withholding",
    added: "2027-03-14",
  },
  {
    slug: "w4-calculator",
    title: "W-4 Withholding Calculator",
    shortTitle: "W-4",
    category: "pay",
    blurb: "Fill out your W-4 correctly for 2026 jobs, estimate withholding per paycheck and avoid a surprise tax bill or big refund.",
    icon: "receipt",
    updated: "2027-03-28",
    related: ["paycheck-calculator", "tax-refund-calculator", "bonus-tax-calculator"],
    example: { input: "$90k, married, 2 jobs, 1 kid", output: "Claim 0 allowances + $50 extra" },
    keywords: "w4 form withholding calculator 2020 w-4 allowances extra withholding multiple jobs married filing jointly",
    added: "2027-03-28",
  },
];

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  pay: "Pay & Salary",
  borrow: "Loans & Debt",
  save: "Savings & Growth",
  everyday: "Everyday Math",
};

// ============================================================================
// RELEASE QUEUE — tool pehle se ready rakho, `added` me publish date daalo.
// Roz subah ka rebuild (.github/workflows/release.yml) us din wale tools live kar deta hai
// + Bing ko IndexNow ping. BUILD_DATE next.config.mjs build ke waqt fix karta hai
// (server + browser dono me same date, warna search me unpublished tool dikh jaata).
// Dev (npm run dev) ya NEXT_PUBLIC_PREVIEW_ALL=1 wale preview build me sab tools dikhte hain.
// ============================================================================
export const BUILD_DATE = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
const SHOW_ALL = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_PREVIEW_ALL === "1";

export function isReleased(tool: Tool): boolean {
  return SHOW_ALL || tool.added <= BUILD_DATE;
}

// Public site sirf ye dekhti hai (home, menu, footer, search, sitemap).
export const TOOLS: Tool[] = ALL_TOOLS.filter(isReleased);

// Upcoming releases, earliest first (admin panel ka "Publish calendar").
export const QUEUED_TOOLS: Tool[] = ALL_TOOLS.filter((t) => t.added > BUILD_DATE).sort((a, b) => a.added.localeCompare(b.added));

// Helper: get a tool by slug (queued ones bhi — page khud isReleased check karta hai)
export function getTool(slug: string): Tool | undefined {
  return ALL_TOOLS.find((t) => t.slug === slug);
}

// Helper: related tools (hand-picked first, then fill from same category)
export function getRelatedTools(slug: string, count = 3): Tool[] {
  const current = getTool(slug);
  if (!current) return TOOLS.slice(0, count);
  const picked = current.related.map(getTool).filter((t): t is Tool => Boolean(t) && isReleased(t!));
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
