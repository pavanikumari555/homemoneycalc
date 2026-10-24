// ============================================================================
// AI SUMMARY — Claude se roz ki report ka Hinglish summary + "aaj kya karo" list.
// ANTHROPIC_API_KEY na ho to rule-based summary (agent fir bhi chalta hai).
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

const SYSTEM = `You are the SEO analyst for CalcIvy (calcivy.com), a free US money-calculator website.
The owner is a beginner from India who reads Hinglish (Hindi in Roman script mixed with simple English). Write for them: short, warm, specific, no jargon without a 3-word explanation.
Goal: grow Google traffic from the US safely and reach $5,000/month from ads + affiliates over 18-36 months.
Rules you must follow:
- Only use numbers present in the data. If a data source is not connected, say so and give the setup step instead of inventing numbers.
- Never suggest anything against Google's spam policies: no bought links, no mass AI pages, no fake traffic, no clicking own ads.
- Prefer actions with the best payoff for a new site: fixing technical errors, improving pages ranking in positions 8-30, shipping the next roadmap tool on time, earning links from the growth checklist.
- Keep every task doable in under 1 hour and say where to do it.`;

export async function summarize(report) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return { ...fallback(report), by: "rules" };

  const client = new Anthropic();
  const response = await client.messages.parse({
    // Model is configurable; default is Claude Opus 5.5 at low effort (~$0.15/run for this size).
    model: process.env.CLAUDE_MODEL || "claude-opus-5-5",
    max_tokens: 16000,
    output_config: { effort: process.env.CLAUDE_EFFORT || "low", format: zodOutputFormat(Summary) },
    system: SYSTEM,
    messages: [{ role: "user", content: `Today's data (JSON):\n${JSON.stringify(report)}` }],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) return { ...fallback(report), by: "rules" };
  return { ...response.parsed_output, by: response.model };
}

/** No-AI fallback so the report is always useful. */
function fallback(r) {
  const youDo = [];
  const risks = [];
  if (!r.sources.gsc) youDo.push("Search Console connect karo (docs/SETUP-AGENT.md, Step 2) — bina iske ranking data nahi milega.");
  if (r.health?.errors) youDo.push(`Site me ${r.health.errors} technical error(s) hain — admin panel ke 'Site health' me dekho.`);
  if (r.opportunities?.length) youDo.push(`"${r.opportunities[0].query}" position ${r.opportunities[0].position.toFixed(1)} pe hai — us page ko improve karne ka kaam agent ko do.`);
  const due = r.roadmap?.dueSoon?.[0];
  if (due) youDo.push(`Next tool: ${due.title} (target ${due.targetDate}).`);
  const task = r.growth?.thisWeek?.[0];
  if (task) youDo.push(`Growth task: ${task.task}`);
  if (r.kpis?.clicksChange != null && r.kpis.clicksChange < -20) risks.push(`Google clicks ${r.kpis.clicksChange}% gire hain — Search Console me check karo.`);
  return {
    headline: r.sources.gsc ? `Last 28 days: ${r.kpis.clicks} clicks, ${r.kpis.impressions} impressions` : "Site ready — ab Search Console connect karna hai",
    summary: r.sources.gsc
      ? `Google se ${r.kpis.clicks} clicks aaye (avg position ${r.kpis.position?.toFixed?.(1)}). ${r.opportunities?.length ?? 0} keywords position 8-30 me hain jinko thoda improve karke page 1 pe la sakte hain.`
      : `Abhi traffic data connect nahi hai, isliye sirf site ki technical jaanch hui: ${r.health?.pageCount ?? 0} pages, ${r.health?.errors ?? 0} errors, ${r.health?.warnings ?? 0} warnings.`,
    youDo: youDo.slice(0, 5),
    agentNext: due ? [`Draft ${due.title} (${due.slug})`] : [],
    risks,
  };
}
