import { normalizeQuestionUrl, prepareQuestion } from "../../../lib/community-questions.mjs";

const origin = "https://homemoneycalc-admin.pages.dev";
const reply = (status, data) => Response.json(data, { status, headers: { "cache-control": "no-store" } });

async function readInput(request) {
  if (!request.headers.get("content-type")?.startsWith("application/json") || !request.body) throw new Error();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  for await (const chunk of request.body) {
    bytes += chunk.byteLength;
    if (bytes > 24000) throw new Error();
    text += decoder.decode(chunk, { stream: true });
  }
  const input = JSON.parse(text + decoder.decode());
  if (!input || typeof input !== "object") throw new Error();
  return input;
}

export async function onRequest({ request, env }) {
  if (new URL(request.url).origin !== origin) return reply(403, { error: "Protected owner dashboard required." });
  if (!["GET", "POST"].includes(request.method)) return reply(405, { error: "Method not allowed." });
  if (request.method === "POST" && (request.headers.get("origin") !== origin || request.headers.get("x-owner-action") !== "community-review")) {
    return reply(403, { error: "Submit changes from the owner dashboard." });
  }
  const db = env.COMMUNITY_DB;
  if (!db) return reply(503, { error: "Community review database needs to be connected." });

  try {
    if (request.method === "GET") {
      const { results } = await db.prepare("SELECT * FROM community_questions ORDER BY created_at DESC, url LIMIT 100").all();
      return reply(200, { questions: results });
    }
    let input;
    try { input = await readInput(request); }
    catch { return reply(400, { error: "Invalid or oversized request." }); }
    if (input.action === "add") {
      let row;
      try { row = prepareQuestion(input); }
      catch (error) { return reply(400, { error: error.message }); }
      const result = await db.prepare(
        "INSERT INTO community_questions (url, question, context, tool, answer, status) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(url) DO NOTHING",
      ).bind(row.url, row.question, row.context, row.tool, row.answer, row.status).run();
      return result.meta.changes ? reply(201, { question: row }) : reply(409, { error: "This question is already in the inbox." });
    }
    const status = input.action === "approve" ? "approved" : input.action === "skip" ? "skipped" : null;
    const answer = typeof input.answer === "string" ? input.answer.trim() : "";
    if (!status || answer.length > 6000 || (status === "approved" && !answer)) {
      return reply(400, { error: "Review the exact answer before approving." });
    }
    let url;
    try { url = normalizeQuestionUrl(input.url); }
    catch { return reply(400, { error: "Invalid question URL." }); }
    const result = await db.prepare(
      "UPDATE community_questions SET answer = ?, status = ? WHERE url = ? AND status IN ('review', 'needs_context')",
    ).bind(answer, status, url).run();
    if (!result.meta.changes) return reply(409, { error: "Question already reviewed. Refresh the inbox." });
    return reply(200, { status });
  } catch {
    return reply(503, { error: "Community inbox unavailable. Verify the D1 binding and schema." });
  }
}
