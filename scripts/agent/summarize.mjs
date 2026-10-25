// ============================================================================
// AI SUMMARY — roz ki report ka Hinglish summary + "aaj kya karo" list.
// Providers (jitni keys hain sab backup ki tarah order me try hoti hain; AI_PROVIDER se pehla chuno):
//   GEMINI_API_KEY (free tier) · GROQ_API_KEY (free tier) · ANTHROPIC_API_KEY (paid)
// Koi key nahi / AI fail -> rule-based summary (agent fir bhi chalta hai).
// ============================================================================
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const Summary = z.object({
  headline: z.string().describe("One short Hinglish line: the single most important thing today"),
  summary: z.string().describe("3-5 sentence Hinglish summary of how the site is doing and why"),
  youDo: z.array(z.string()).describe("2-5 concrete tasks for the owner today, most important first, Hinglish"),
  agentNext: z.array(z.string()).describe("1-4 things the weekly agent should do next (pages to improve, tools to draft)"),
  risks: z.array(z.string()).describe("Problems to watch (traffic drops, errors, policy risks); empty if none"),
});

// Same shape as plain JSON Schema (for providers that take a schema directly)
const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    youDo: { type: "array", items: { type: "string" } },
    agentNext: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
  },
  required: ["headline", "summary", "youDo", "agentNext", "risks"],
};

const SYSTEM = `You are the SEO analyst for HomeMoney Calc, a free US money-calculator website.
The owner is a beginner from India who reads Hinglish (Hindi in Roman script mixed with simple English). Write for them: short, warm, specific, no jargon without a 3-word explanation.
Goal: grow useful US traffic and sustainable revenue from Google AdSense, finance affiliates, templates and sponsors. business.goalMonthly is an adjustable planning estimate, not promised revenue, a fixed ceiling, or a timeline guarantee. Do not apply for AdSense yet; wait for traffic and the owner's readiness review. AdSense approval and account status must be verified, never assumed.
Rules you must follow:
- Only use numbers present in the data. If a data source is not connected, say so and give the setup step instead of inventing numbers.
- Use the deterministic actions list first: explain why, who can act, and the exact next steps. Never say every possible problem was checked or promise fast rankings. Missing/failed checks are not healthy results. health.ran=false means no completed technical audit.
- The owner already has one PayPal account; do not suggest a second one. Account availability does not prove that receiving/KYC or an affiliate payout method is ready.
- sources.gsc=false only means THIS AGENT can't read Search Console yet (service account missing, docs/NEXT-STEPS.md Step 11.4). Tasks marked done in growth.thisWeek / the checklist are already finished by the owner — never ask for them again.
- Never suggest anything against Google's spam policies: no bought links, no mass AI pages, no fake traffic.
- The report has an 'ideas' section (title tests, refresh, seasonal alerts, keyword gap, outreach drafts, social ideas). Use it, but outreach is always sent by the owner by hand.
- Prefer actions with the best payoff for a new site: fixing technical errors, improving pages ranking in positions 8-30, shipping the next roadmap tool on time, earning links from the growth checklist.
- Keep every task doable in under 1 hour and say where to do it.`;

const env = process.env;

/** Jitni keys hain, sab order me try: AI_PROVIDER (agar diya) pehle, phir Gemini → Groq → Anthropic. */
function providerChain() {
  const available = [
    env.GEMINI_API_KEY && "gemini",
    env.GROQ_API_KEY && "groq",
    (env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN) && "anthropic",
  ].filter(Boolean);
  const first = env.AI_PROVIDER && available.includes(env.AI_PROVIDER) ? [env.AI_PROVIDER] : [];
  return [...new Set([...first, ...available])];
}

export async function summarize(report) {
  const prompt = `Today's data (JSON):\n${JSON.stringify(report)}`;
  // Ek provider busy/down ho to agla — free tiers kabhi-kabhi "high demand" dete hain
  for (const provider of providerChain()) {
    try {
      if (provider === "gemini") return await viaGemini(prompt);
      if (provider === "groq") return await viaGroq(prompt);
      if (provider === "anthropic") return await viaAnthropic(prompt, report);
    } catch (e) {
      console.warn(`AI summary via ${provider} failed: ${String(e.message ?? e).slice(0, 200)}`);
    }
  }
  return { ...fallback(report), by: "rules" };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Google Gemini (free tier, key from aistudio.google.com). Aliases stay current; override with GEMINI_MODEL.
 * Free model kabhi "high demand" (503) ya rate limit (429) deta hai -> thoda ruk ke retry,
 * phir halka flash-lite model. Galat key (400/403) pe turant fail (retry bekaar hai).
 */
async function viaGemini(prompt) {
  const models = [...new Set([env.GEMINI_MODEL || "gemini-flash-latest", "gemini-flash-lite-latest"])];
  let lastError;
  for (const model of models) {
    for (const wait of [0, 10_000, 30_000]) {
      if (wait) await sleep(wait);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", responseSchema: SUMMARY_SCHEMA, temperature: 0.4 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
        return { ...Summary.parse(JSON.parse(text)), by: `gemini:${model}` };
      }
      lastError = new Error(`Gemini ${model} ${res.status}: ${(await res.text()).slice(0, 200)}`);
      if (res.status !== 503 && res.status !== 429 && res.status !== 500) throw lastError; // retry sirf busy/limit pe
      console.warn(`Gemini ${model} busy (${res.status}), retrying...`);
    }
  }
  throw lastError;
}

// Groq models jaldi retire hote hain (llama-3.3-70b-versatile 2026 me hat gaya) — pasand ka order,
// aur jo account pe abhi available ho wahi chuno. Override: GROQ_MODEL.
const GROQ_PREFERRED = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "openai/gpt-oss-20b", "llama-3.1-8b-instant"];

async function pickGroqModel() {
  const wanted = [env.GROQ_MODEL, ...GROQ_PREFERRED].filter(Boolean);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", { headers: { authorization: `Bearer ${env.GROQ_API_KEY}` } });
    const ids = new Set(((await res.json()).data ?? []).map((m) => m.id));
    return wanted.find((m) => ids.has(m)) ?? wanted[0];
  } catch {
    return wanted[0];
  }
}

/** Groq (free tier, OpenAI-compatible API, key from console.groq.com). */
async function viaGroq(prompt) {
  const model = await pickGroqModel();
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${SYSTEM}\nReply with ONLY a JSON object with keys: headline (string), summary (string), youDo (string[]), agentNext (string[]), risks (string[]).`,
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return { ...Summary.parse(JSON.parse(data.choices?.[0]?.message?.content ?? "{}")), by: `groq:${model}` };
}

/** Anthropic Claude (paid API key or Claude subscription token). */
async function viaAnthropic(prompt, report) {
  const client = new Anthropic();
  const response = await client.messages.parse({
    // Model is configurable; default is Claude Opus 5.5 at low effort (~$0.15/run for this size).
    model: env.CLAUDE_MODEL || "claude-opus-5-5",
    max_tokens: 16000,
    output_config: { effort: env.CLAUDE_EFFORT || "low", format: zodOutputFormat(Summary) },
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) return { ...fallback(report), by: "rules" };
  return { ...response.parsed_output, by: response.model };
}

/** No-AI fallback so the report is always useful. */
function fallback(r) {
  const youDo = (r.actions ?? []).filter((a) => a.who === "owner").slice(0, 3).map((a) => `${a.title}: ${a.steps.join(" ")}`);
  const risks = [];
  if (!r.sources.gsc && !(r.actions ?? []).some((a) => a.id === "gsc-data")) youDo.push("Report-agent ko Search Console ka data padhne do: service account jodo (docs/NEXT-STEPS.md Step 11.4) — bina iske ranking data report me nahi aayega.");
  if (r.health?.errors) youDo.push(`Site me ${r.health.errors} technical error(s) hain — admin panel ke 'Site health' me dekho.`);
  if (r.opportunities?.length) youDo.push(`"${r.opportunities[0].query}" position ${r.opportunities[0].position.toFixed(1)} pe hai — us page ko improve karne ka kaam agent ko do.`);
  const due = r.roadmap?.dueSoon?.[0];
  if (due) youDo.push(`Next tool: ${due.title} (target ${due.targetDate}).`);
  const refresh = r.ideas?.refresh?.find((x) => x.priority === "high");
  if (refresh) youDo.push(`Content refresh: ${refresh.reason}`);
  const season = r.ideas?.seasonal?.[0];
  if (season) youDo.push(`Season alert — ${season.name} (${season.status}): ${season.idea}`);
  if (r.ideas?.titleTests?.length) youDo.push(`${r.ideas.titleTests[0].page} ka CTR kam hai — admin me 'Title tests' se ek naya title chuno.`);
  const task = r.growth?.thisWeek?.[0];
  if (task) youDo.push(`Growth task: ${task.task}`);
  if (r.kpis?.clicksChange != null && r.kpis.clicksChange < -20) risks.push(`Google clicks ${r.kpis.clicksChange}% gire hain — Search Console me check karo.`);
  return {
    headline: r.sources.gsc ? `Last 28 days: ${r.kpis.clicks} clicks, ${r.kpis.impressions} impressions` : "Google report connection poora karna hai",
    summary: r.sources.gsc
      ? `Google se ${r.kpis.clicks} clicks aaye (avg position ${r.kpis.position?.toFixed?.(1)}). ${r.opportunities?.length ?? 0} keywords position 8-30 me hain jinko thoda improve karke page 1 pe la sakte hain.`
      : r.health?.ran === true ? `Abhi traffic data connect nahi hai. Technical audit mein ${r.health.pageCount} pages check hue: ${r.health.errors} errors, ${r.health.warnings} warnings. Live aur code checks ki coverage alag dekhein.` : "Traffic data missing hai aur technical audit complete nahi hua. Missing checks ko zero errors na samjhein.",
    youDo: youDo.slice(0, 5),
    agentNext: (r.actions ?? []).filter((a) => a.who === "agent").slice(0, 4).map((a) => `${a.title}: ${a.steps.join(" ")}`),
    risks,
  };
}
