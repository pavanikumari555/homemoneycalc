// Parent /admin middleware authenticates every request. Token stays server-side.
const ORIGIN = "https://homemoneycalc-admin.pages.dev";
const REPO = "pavanikumari555/homemoneycalc";
const reply = (status, data) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "x-content-type-options": "nosniff" } });
const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
async function github(token, path, init = {}, fetcher = fetch) {
  const response = await fetcher(`https://api.github.com/repos/${REPO}/${path}`, { ...init, redirect: "error", signal: AbortSignal.timeout(12000), headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "HomeMoneyCalcOwnerDashboard", "content-type": "application/json", "x-github-api-version": "2022-11-28" } });
  if (!response.ok) throw new Error("GitHub unavailable.");
  return response.status === 204 ? null : response.json();
}
async function content(token, file, fetcher) {
  const data = await github(token, `contents/data/${file}?ref=main`, {}, fetcher);
  if (data.encoding !== "base64" || typeof data.content !== "string" || data.content.length > 1000000) throw new Error("Invalid inbox data.");
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(data.content.replace(/\s/g, "")), (c) => c.charCodeAt(0))));
}
async function inputBody(request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("JSON required.");
  const reader = request.body?.getReader(); let text = "";
  const decoder = new TextDecoder();
  if (reader) for (;;) { const part = await reader.read(); if (part.done) break; text += decoder.decode(part.value, { stream: true }); if (text.length > 4096) { await reader.cancel(); throw new Error("Request too large."); } }
  return JSON.parse(text + decoder.decode());
}
export async function onRequest({ request, env }, fetcher = fetch) {
  if (new URL(request.url).origin !== ORIGIN) return reply(403, { error: "Protected production admin host required." });
  if (!["GET", "POST"].includes(request.method)) return reply(405, { error: "Method not allowed." });
  if (request.method === "POST" && (request.headers.get("origin") !== ORIGIN || request.headers.get("x-owner-action") !== "reviewed-decision" || ![null, "same-origin"].includes(request.headers.get("sec-fetch-site")))) return reply(403, { error: "Same-origin owner review required." });
  if (!env.GITHUB_AGENT_TOKEN) return reply(503, { configured: false, error: "One-time setup pending: restricted GITHUB_AGENT_TOKEN admin Cloudflare project mein add karein. Token chat mein nahi bhejna." });
  try {
    const [queue, history] = await Promise.all([content(env.GITHUB_AGENT_TOKEN, "agent-proposals.json", fetcher), content(env.GITHUB_AGENT_TOKEN, "agent-decisions.json", fetcher)]);
    if (request.method === "GET") return reply(200, { configured: true, queue, history });
    let input;
    try { input = await inputBody(request); } catch { return reply(400, { error: "Invalid or oversized JSON request." }); }
    if (!/^proposal-[a-f0-9]{20}$/.test(input.id || "") || !/^[a-f0-9]{64}$/.test(input.digest || "") || !["approve", "reject"].includes(input.decision) || input.reviewed !== true) return reply(400, { error: "Exact proposal and explicit review required." });
    const proposal = queue.proposals.find((p) => p.id === input.id && p.digest === input.digest);
    if (!proposal || history.decisions.some((d) => d.id === input.id)) return reply(409, { error: "Proposal changed or already decided. Refresh inbox." });
    const hash = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(proposal.payload))));
    const today = new Date().toISOString().slice(0, 10);
    if (hash !== input.digest || proposal.id !== `proposal-${hash.slice(0, 20)}` || proposal.payload.created > today || proposal.payload.expires < today) return reply(409, { error: "Proposal changed or expired. Fresh review required." });
    await github(env.GITHUB_AGENT_TOKEN, "actions/workflows/agent-decision.yml/dispatches", { method: "POST", body: JSON.stringify({ ref: "main", inputs: { proposal_id: input.id, proposal_digest: input.digest, decision: input.decision, reviewed: "yes" } }) }, fetcher);
    return reply(202, { queued: true, message: "Decision workflow queued. Abhi applied/live nahi hai. Workflow finish hone par Refresh karein." });
  } catch { return reply(502, { error: "GitHub connection/permission unavailable. Success assume nahi hua; retry se pehle workflow history dekhein." }); }
}
