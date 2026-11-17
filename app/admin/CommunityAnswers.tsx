"use client";

import { useEffect, useState, type FormEvent } from "react";

type Question = {
  url: string;
  question: string;
  context: string;
  tool: string;
  answer: string;
  status: "needs_context" | "review" | "approved" | "skipped";
};

const labels = {
  needs_context: "Needs context or an answer",
  review: "Ready to review",
  approved: "Approved for manual posting",
  skipped: "Skipped",
};

async function inbox(action?: Record<string, unknown>) {
  const response = await fetch("/admin/api/community-questions", {
    cache: "no-store",
    ...(action ? {
      method: "POST",
      headers: { "content-type": "application/json", "x-owner-action": "community-review" },
      body: JSON.stringify(action),
    } : {}),
  });
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error("Community inbox needs the protected Cloudflare admin.");
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load the community inbox.");
  return data;
}

export default function CommunityAnswers({ tools, siteUrl }: { tools: { slug: string; title: string }[]; siteUrl: string }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error: boolean }>();

  useEffect(() => {
    let mounted = true;
    inbox().then((data) => { if (mounted) setQuestions(data.questions); })
      .catch((error: Error) => { if (mounted) setNotice({ text: error.message, error: true }); });
    return () => { mounted = false; };
  }, []);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setBusy(true);
    setNotice(undefined);
    try {
      const data = await inbox({ ...fields, action: "add" });
      setQuestions((rows) => [data.question, ...(rows ?? [])].slice(0, 100));
      form.reset();
      setNotice({ text: "Question added.", error: false });
    } catch (error) {
      setNotice({ text: (error as Error).message, error: true });
    } finally {
      setBusy(false);
    }
  }

  async function decide(question: Question, action: "approve" | "skip", answer: string) {
    setBusy(true);
    setNotice(undefined);
    try {
      const { status } = await inbox({ action, url: question.url, answer });
      setQuestions((rows) => rows?.map((row) => row.url === question.url ? { ...row, status, answer: answer.trim() } : row) ?? null);
      setNotice({ text: action === "approve" ? "Answer approved. Copy it and publish in the original thread." : "Question skipped.", error: false });
    } catch (error) {
      setNotice({ text: (error as Error).message, error: true });
    } finally {
      setBusy(false);
    }
  }

  return <div className="space-y-5">
    {notice && <p role={notice.error ? "alert" : "status"} className="text-sm font-semibold">{notice.text}</p>}
    {questions === null && !notice && <p role="status" className="text-sm">Loading the community inbox…</p>}
    {questions !== null && <form className="space-y-3" onSubmit={add}>
      <label className="block text-sm font-semibold">Reddit or Quora question link
        <input className="input-field" name="url" type="url" required maxLength={1000} />
      </label>
      <label className="block text-sm font-semibold">Question title
        <input className="input-field" name="question" required maxLength={500} />
      </label>
      <label className="block text-sm font-semibold">Relevant context
        <textarea className="input-field" name="context" rows={3} maxLength={4000} />
      </label>
      <button className="btn-primary" disabled={busy}>Add question</button>
    </form>}
    {questions?.length === 0 && <p className="text-sm text-muted">No questions in the inbox yet.</p>}
    {questions?.map((question) => {
      const tool = tools.find((item) => item.slug === question.tool);
      const toolUrl = tool ? siteUrl + "/" + tool.slug + "/" : "";
      const answer = drafts[question.url] ?? question.answer;
      const setAnswer = (value: string) => setDrafts((rows) => ({ ...rows, [question.url]: value }));
      const editable = question.status === "review" || question.status === "needs_context";

      return <article className="space-y-3 rounded-xl border border-line p-4" key={question.url}>
        <p className="text-xs font-semibold text-muted">{labels[question.status]}</p>
        <h3 className="font-bold text-ink">{question.question}</h3>
        <a className="text-sm underline" href={question.url} target="_blank" rel="noopener noreferrer">Open original thread</a>
        {question.context && <p className="whitespace-pre-wrap break-words text-sm text-muted">{question.context}</p>}
        {tool && <p className="text-sm">Suggested tool <a className="underline" href={toolUrl} target="_blank" rel="noopener noreferrer">{tool.title}</a></p>}
        {editable && <>
          <label className="block text-sm font-semibold">Answer draft
            <textarea className="input-field" value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={6000} rows={5} />
          </label>
          {tool && <button type="button" className="text-sm underline" disabled={busy || !answer.trim() || answer.includes(toolUrl)} onClick={() =>
            setAnswer(answer.trim() + "\n\nDisclosure: I work on HomeMoney Calc. You can compare your own inputs with the " + tool.title + " (" + toolUrl + ").")
          }>Add calculator link and disclosure if allowed</button>}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" disabled={busy || !answer.trim()} onClick={() => void decide(question, "approve", answer)}>Approve answer</button>
            <button type="button" className="text-sm underline" disabled={busy} onClick={() => void decide(question, "skip", answer)}>Skip</button>
          </div>
        </>}
        {question.status === "approved" && <>
          <p className="whitespace-pre-wrap break-words text-sm">{question.answer}</p>
          <button type="button" className="text-sm underline" onClick={() => void navigator.clipboard.writeText(question.answer).then(
            () => setNotice({ text: "Approved answer copied.", error: false }),
            () => setNotice({ text: "Clipboard unavailable. Select and copy the approved answer.", error: true }),
          )}>Copy approved answer</button>
        </>}
      </article>;
    })}
  </div>;
}
