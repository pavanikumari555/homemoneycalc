// ============================================================================
// GROWTH IDEAS — daily report ke liye extra SEO kaam (sab rule-based, AI ke bina bhi chalta hai):
//   titleTests   — zyada impressions, kam CTR wale pages ke liye naye title try karo
//   refresh      — saal badalne pe tax limits / purane pages update karne ki yaad
//   seasonal     — US money seasons (tax season, Black Friday...) 45 din pehle alert
//   keywordGap   — competitors ke paas hai, hamare TOOLS/roadmap me nahi
//   outreach     — email drafts jo OWNER khud personalize karke bheje (agent kabhi nahi bhejta)
//   social       — aaj ke tool ke liye Pinterest pin + YouTube Shorts idea
// Google-safe: koi auto-posting nahi, koi link buying nahi — sirf suggestions.
// ============================================================================
import { readFileSync, readdirSync, existsSync } from "node:fs";

const DAY = 86_400_000;
const clip = (s, max = 60) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/[\s,:;—-]+\S*$/, "")}…`);
const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** TOOLS registry ko lib/site.ts se padho (TS import nahi kar sakte, isliye regex — check-tools.mjs jaisa). */
export function readTools(file = "lib/site.ts") {
  const src = readFileSync(file, "utf8");
  const block = src.slice(src.indexOf("export const ALL_TOOLS"), src.indexOf("export const CATEGORY_LABELS"));
  return [...block.matchAll(/\{\s*slug: "([^"]+)"[\s\S]*?\n {2}\},/g)].map(([body, slug]) => {
    const get = (k) => new RegExp(`${k}: "([^"]*)"`).exec(body)?.[1] ?? "";
    const ex = /example: \{ input: "([^"]*)", output: "([^"]*)" \}/.exec(body);
    return {
      slug,
      title: get("title"),
      shortTitle: get("shortTitle"),
      category: get("category"),
      blurb: get("blurb"),
      updated: get("updated"),
      added: get("added"),
      keywords: get("keywords"),
      example: { input: ex?.[1] ?? "", output: ex?.[2] ?? "" },
    };
  });
}

/** Built page ka <title> (out/ folder se) — taaki suggestion current title ke saath dikhe. */
function currentTitle(outDir, page) {
  const file = `${outDir}${page === "/" ? "/" : page}index.html`.replace(/\/+/g, "/");
  if (!existsSync(file)) return null;
  return /<title>([^<]*)<\/title>/.exec(readFileSync(file, "utf8"))?.[1]?.replace(/&amp;/g, "&") ?? null;
}

// Rough organic CTR by position (public industry studies) — sirf "kam hai ya theek" batane ke liye.
const EXPECTED_CTR = [0.28, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.017];
const expectedCtr = (pos) => EXPECTED_CTR[Math.max(0, Math.min(9, Math.round(pos) - 1))];

/**
 * CTR title tests: page 1 pe hai (pos <= 12), 100+ impressions, par CTR expected ka 60% se kam.
 * Har page ke liye 3 title ideas (≤ 60 chars) — owner/agent ek chune, 4 hafte baad CTR compare kare.
 */
export function titleTests({ topPages = [], queryPage = [], tools, siteUrl, outDir = "out", year }) {
  return topPages
    .map((p) => ({ ...p, page: p.page.replace(siteUrl, "") || "/" }))
    .filter((p) => p.impressions >= 100 && p.position <= 12 && p.ctr < expectedCtr(p.position) * 0.6)
    .slice(0, 5)
    .map((p) => {
      const top = queryPage
        .filter((r) => (r.page.replace(siteUrl, "") || "/") === p.page)
        .sort((a, b) => b.impressions - a.impressions)[0]?.query;
      const tool = tools.find((t) => p.page === `/${t.slug}/`);
      const kw = cap(top ?? tool?.title ?? "Free Calculator");
      // Example ka number sirf tab, jab query tool ke apne naam jaisi ho (warna "Texas" query pe California ka number aa jaata)
      const exampleFits = tool?.example.output && (!top || tool.title.toLowerCase().includes(top.toLowerCase()));
      const ideas = [
        `${kw} (${year}) — Free, No Sign-Up`,
        exampleFits ? `${kw}: ${tool.example.input} → ${tool.example.output}` : `Free ${kw} — Step-by-Step Math`,
        `${kw} — Exact Numbers in 10 Seconds`,
        `${kw} With Chart & Share Link`,
      ].filter((t) => t.length <= 60); // Google ~60 chars ke baad title kaat deta hai
      if (!ideas.length) ideas.push(clip(kw));
      return {
        page: p.page,
        currentTitle: currentTitle(outDir, p.page),
        topQuery: top ?? null,
        impressions: p.impressions,
        ctr: p.ctr,
        expectedCtr: expectedCtr(p.position),
        position: p.position,
        ideas: [...new Set(ideas)].slice(0, 3),
      };
    });
}

// Tools jinki math IRS/SSA ki saalana limits pe chalti hai
const TAX_TOOLS = ["paycheck-calculator", "salary-to-hourly-calculator"];

/**
 * Content refresh: (1) IRS naye saal ke brackets Oct-Nov me, SSA wage base Oct me announce karta hai —
 * 15 Oct se 31 Jan tak agar agle saal ka lib/taxYYYY.ts nahi bana to yaad dilao. (2) 1 saal purane pages.
 */
export function refreshDue({ tools, today, libDir = "lib" }) {
  const d = new Date(`${today}T12:00:00Z`);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const taxYears = readdirSync(libDir)
    .map((f) => /^tax(\d{4})\.ts$/.exec(f)?.[1])
    .filter(Boolean)
    .map(Number);
  const latest = Math.max(...taxYears, 0);
  const needYear = month >= 10 ? d.getUTCFullYear() + 1 : d.getUTCFullYear();
  const inWindow = (month === 10 && day >= 15) || month >= 11 || month === 1;
  const out = [];
  if (inWindow && latest && latest < needYear) {
    out.push({
      slug: "lib/tax engine",
      reason: `${needYear} ke IRS brackets, standard deduction, 401(k) limit aur SSA wage base aa gaye/aane wale hain — lib/tax${needYear}.ts banana hai (sirf official IRS/SSA numbers, sources ke saath).`,
      tools: TAX_TOOLS,
      priority: "high",
    });
  }
  for (const t of tools) {
    const age = Math.floor((d - Date.parse(`${t.updated}T12:00:00Z`)) / DAY);
    if (age >= 365) out.push({ slug: t.slug, reason: `${age} din se update nahi hua — numbers, examples aur FAQ dobara check karo.`, priority: "normal" });
  }
  return out;
}

// US money calendar. Dates = month/day; tools = jo us season me push karne hain.
const SEASONS = [
  { name: "New Year debt reset", start: "01-01", end: "01-31", tools: ["debt-payoff-calculator", "credit-card-payoff-calculator"], idea: "January 'pay off debt this year' angle: debt-free date wala post/pin." },
  { name: "Tax season", start: "01-20", end: "04-15", tools: ["paycheck-calculator", "salary-to-hourly-calculator"], idea: "W-4 check aur refund vs paycheck wale sawaal — FAQ aur 'Quick answer' fresh karo." },
  { name: "Spring home buying", start: "03-01", end: "06-30", tools: ["mortgage-payoff-calculator"], idea: "Extra payment vs invest — mortgage page pe naya worked example." },
  { name: "Graduation & first job", start: "05-01", end: "06-30", tools: ["salary-to-hourly-calculator", "paycheck-calculator", "compound-interest-calculator"], idea: "'First job offer — kitna haath me aayega' angle; teachers/career blogs ko widget offer." },
  { name: "Summer travel & dining", start: "06-01", end: "08-31", tools: ["tip-calculator"], idea: "Tipping guide refresh + split-the-bill pin." },
  { name: "Back to school", start: "07-15", end: "09-05", tools: ["percentage-calculator", "compound-interest-calculator"], idea: "Teachers ke liye embed widget (percentage/compound) — financial literacy class pages." },
  { name: "Open enrollment & raises", start: "11-01", end: "12-15", tools: ["paycheck-calculator"], idea: "401(k)/HSA change ka paycheck pe asar — paycheck page pe example." },
  { name: "Black Friday & holiday spending", start: "11-20", end: "12-31", tools: ["credit-card-payoff-calculator", "percentage-calculator", "tip-calculator"], idea: "Discount % aur 'holiday credit card bill kab tak chukega' angle." },
  { name: "Year-end car deals", start: "12-01", end: "12-31", tools: ["auto-loan-calculator"], idea: "Dealer deal vs loan length — total interest comparison pin." },
];

/** Jo season 45 din me shuru ho raha hai ya chal raha hai, wo dikhao. */
export function seasonalAlerts({ today, lead = 45 }) {
  const t = Date.parse(`${today}T12:00:00Z`);
  const y = new Date(t).getUTCFullYear();
  const out = [];
  for (const s of SEASONS) {
    for (const yr of [y - 1, y, y + 1]) {
      const start = Date.parse(`${yr}-${s.start}T12:00:00Z`);
      let end = Date.parse(`${yr}-${s.end}T12:00:00Z`);
      if (end < start) end = Date.parse(`${yr + 1}-${s.end}T12:00:00Z`);
      if (t >= start - lead * DAY && t <= end) {
        const days = Math.ceil((start - t) / DAY);
        out.push({
          name: s.name,
          starts: new Date(start).toISOString().slice(0, 10),
          ends: new Date(end).toISOString().slice(0, 10),
          status: days > 0 ? `${days} din me shuru` : "chal raha hai",
          tools: s.tools,
          idea: s.idea,
        });
        break;
      }
    }
  }
  return out.sort((a, b) => a.starts.localeCompare(b.starts));
}

/** Competitor topics jo na TOOLS me hain na roadmap me + GSC queries jinka koi matching tool nahi. */
export function keywordGap({ tools, roadmap, queryPage = [], competitors }) {
  const have = new Set([...tools.map((t) => t.slug), ...(roadmap.tools ?? []).map((t) => t.slug)]);
  const missingTopics = (competitors.topics ?? [])
    .filter((c) => !have.has(c.slug))
    .map((c) => ({ keyword: c.keyword, slug: c.slug, seenOn: c.seenOn }));

  // Queries jo hum pe aa rahi hain par kisi tool ke words se match nahi karti = naya tool/section ka hint
  const vocab = tools.map((t) => `${t.slug} ${t.title} ${t.keywords}`.toLowerCase());
  const byQuery = new Map();
  for (const r of queryPage) {
    const words = r.query.toLowerCase().split(/\s+/).filter((w) => w.length > 3 && !["calculator", "calc", "free", "online", "with", "2026", "2027"].includes(w));
    const matched = words.length === 0 || vocab.some((v) => words.every((w) => v.includes(w)));
    if (matched) continue;
    const prev = byQuery.get(r.query) ?? { query: r.query, impressions: 0 };
    prev.impressions += r.impressions;
    byQuery.set(r.query, prev);
  }
  const unservedQueries = [...byQuery.values()].filter((q) => q.impressions >= 10).sort((a, b) => b.impressions - a.impressions).slice(0, 10);
  return { missingTopics, unservedQueries };
}

/**
 * Outreach email drafts — OWNER khud padhe, naam/details bhare, ek-ek karke bheje.
 * Kabhi paid link / link exchange nahi maangna. Har hafte 2 naye drafts (week number se rotate).
 */
export function outreachDrafts({ tools, siteUrl, siteName, today }) {
  const week = Math.floor(Date.parse(`${today}T12:00:00Z`) / (7 * DAY));
  const pay = tools.find((t) => t.slug === "paycheck-calculator");
  const tool = tools[week % tools.length];
  const templates = [
    {
      to: "Personal-finance blogger jisne haal me is topic pe post likhi ho",
      subject: `A free ${tool.shortTitle.toLowerCase()} tool for your readers`,
      body: `Hi [Name],\n\nI enjoyed your post "[their post title]" — especially [one specific point].\n\nI run ${siteName}, a free, no-sign-up set of US money calculators. Our ${tool.title.toLowerCase()} might be a useful extra for that post: ${siteUrl}/${tool.slug}/ (example: ${tool.example.input} → ${tool.example.output}).\n\nIf it helps your readers, you're welcome to link it or embed it (free embed code is at the bottom of the page). No pressure at all if it's not a fit.\n\nThanks,\n[Your name]\nFounder, ${siteName}`,
    },
    {
      to: "Local/finance journalist (Qwoted, Featured ya unka 'tips' email)",
      subject: "State-by-state take-home pay data for 2026 (free to use)",
      body: `Hi [Name],\n\nSaw you cover [beat]. We put together a free table of 2026 take-home pay for the same salary in all 50 states: ${siteUrl}/take-home-pay-by-state/\n\nOne example: ${pay?.example.input ?? "a $75,000 salary"} takes home about ${pay?.example.output ?? "—"}. Method and official sources (IRS, state revenue departments) are on the page. Happy to pull a custom number for your story.\n\nBest,\n[Your name]\nFounder, ${siteName}`,
    },
    {
      to: "Teacher / financial-literacy class page / school library guide",
      subject: `Free ${tool.shortTitle.toLowerCase()} for your class (no ads inside, no sign-up)`,
      body: `Hi [Name],\n\nI noticed your [resource page / class page] on [topic]. We make free, no-sign-up money calculators that show the working step by step — students can see why the number comes out the way it does.\n\n${tool.title}: ${siteUrl}/${tool.slug}/\n\nIf useful, there's a free embed code at the bottom of the page so it can sit right on your class page.\n\nThank you for teaching this stuff,\n[Your name]`,
    },
  ];
  return [templates[week % 3], templates[(week + 1) % 3]].map((t) => ({ ...t, rules: "Personalize karo, ek-ek bhejo, din me 5 se zyada nahi. Paisa/link exchange kabhi offer mat karna." }));
}

/** Aaj ka tool (din ke hisaab se rotate) — Pinterest pin + YouTube Shorts script idea. */
export function socialIdeas({ tools, siteUrl, today }) {
  const dayNo = Math.floor(Date.parse(`${today}T12:00:00Z`) / DAY);
  const t = tools[dayNo % tools.length];
  const url = `${siteUrl}/${t.slug}/`;
  return {
    tool: t.slug,
    pinterest: {
      title: clip(`${t.example.input} → ${t.example.output}`, 100),
      description: clip(`${t.blurb} Free ${t.title.toLowerCase()} — no sign-up, works on your phone.`, 300),
      board: { pay: "Salary & Paycheck Tips", borrow: "Debt Free Journey", save: "Saving Money Tips", everyday: "Everyday Money Hacks" }[t.category] ?? "Money Tips",
      link: url,
      design: "Tall 1000x1500 pin: upar bada sawaal, beech me answer number, neeche site naam. Canva free template.",
    },
    shorts: {
      hook: `${t.example.input}? Here's the real number.`,
      beats: [`Screen record: ${t.shortTitle} me values daalo`, `Answer dikhao: ${t.example.output}`, "Ek tip: kaunsa input badalne se sabse zyada farak padta hai"],
      cta: "Link in bio / description (seedha tool page).",
    },
  };
}

/** Sab ek saath — daily.mjs isi ko call karta hai. */
export function growthIdeas({ gsc, siteUrl, siteName, today, outDir = "out" }) {
  const tools = readTools().filter((t) => t.added <= today);
  const roadmap = existsSync("data/roadmap.json") ? JSON.parse(readFileSync("data/roadmap.json", "utf8")) : { tools: [] };
  const competitors = existsSync("data/competitor-topics.json") ? JSON.parse(readFileSync("data/competitor-topics.json", "utf8")) : { topics: [] };
  const year = Number(today.slice(0, 4)) + (Number(today.slice(5, 7)) >= 11 ? 1 : 0);
  return {
    titleTests: titleTests({ topPages: gsc.topPages, queryPage: gsc.queryPage, tools, siteUrl, outDir, year }),
    refresh: refreshDue({ tools, today }),
    seasonal: seasonalAlerts({ today }),
    keywordGap: keywordGap({ tools, roadmap, queryPage: gsc.queryPage, competitors }),
    outreach: outreachDrafts({ tools, siteUrl, siteName, today }),
    social: socialIdeas({ tools, siteUrl, today }),
  };
}
