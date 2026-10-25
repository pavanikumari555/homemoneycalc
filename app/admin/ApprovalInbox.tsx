"use client";
import { useEffect, useState } from "react";
type Proposal = { id: string; digest: string; payload: { kind: string; title: string; reason: string; expires: string; outcome: string; evidence: { url: string; observation: string }[]; reviewChecklist: string[]; change?: { before: string; after: string } } };
type Decision = { id: string; title: string; result: string; decidedAt: string };
async function inboxResponse(response: Response) {
  if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Approval API local preview mein available nahi hai. Protected production admin par secure setup verify karein.");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Live connection unavailable.");
  return data;
}
export default function ApprovalInbox({ initialQueue, initialHistory }: { initialQueue: { proposals?: Proposal[] }; initialHistory: { decisions?: Decision[] } }) {
  const [proposals, setProposals] = useState(initialQueue.proposals || []);
  const [decisions, setDecisions] = useState(initialHistory.decisions || []);
  const [configured, setConfigured] = useState(false);
  const [busy, setBusy] = useState(true);
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [queued, setQueued] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("Live approval connection check ho raha hai…");
  async function refresh() {
    try {
      const response = await fetch("/admin/api/approvals", { credentials: "same-origin", cache: "no-store", redirect: "error" });
      const data = await inboxResponse(response);
      setProposals(data.queue.proposals); setDecisions(data.history.decisions); setConfigured(true);
      setMessage("Live GitHub inbox connected. Approval sirf shown change ke liye hai.");
    } catch (e) { setConfigured(false); setMessage(e instanceof Error ? e.message : "Connection unavailable."); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/admin/api/approvals", { credentials: "same-origin", cache: "no-store", redirect: "error", signal: controller.signal })
      .then(inboxResponse)
      .then((data) => { if (!controller.signal.aborted) { setProposals(data.queue.proposals); setDecisions(data.history.decisions); setConfigured(true); setMessage("Live GitHub inbox connected. Approval sirf shown change ke liye hai."); } })
      .catch((e) => { if (!controller.signal.aborted) { setConfigured(false); setMessage(e instanceof Error ? e.message : "Connection unavailable."); } })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, []);
  async function submit(proposal: Proposal, decision: string) {
    setBusy(true);
    try {
      const response = await fetch("/admin/api/approvals", { method: "POST", credentials: "same-origin", cache: "no-store", redirect: "error", headers: { "content-type": "application/json", "x-owner-action": "reviewed-decision" }, body: JSON.stringify({ id: proposal.id, digest: proposal.digest, decision, reviewed: true }) });
      const data = await inboxResponse(response);
      setQueued((old) => ({ ...old, [proposal.id]: true })); setMessage(data.message);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Decision not confirmed. Workflow history dekhein."); }
    finally { setBusy(false); }
  }
  const today = new Date().toISOString().slice(0, 10);
  const pending = proposals.filter((p) => !decisions.some((d) => d.id === p.id) && p.payload.expires >= today);
  return <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-ink">Aapki approval inbox</h2><p className="mt-1 text-sm text-muted">Reason, source aur exact change padhein. Research approval public page publish nahi karta.</p></div><button type="button" disabled={busy} onClick={() => { setBusy(true); void refresh(); }} className="btn-secondary disabled:opacity-50">Refresh status</button></div>
    <p role="status" className="my-4 rounded-xl bg-surface-2 p-3 text-sm text-ink">{message}</p>
    {!configured && <details className="mb-4 text-sm text-muted"><summary className="cursor-pointer font-semibold text-ink">One-time secure connection kaise karein?</summary><ol className="mt-3 list-decimal space-y-2 pl-5"><li>GitHub Settings → Developer settings → Fine-grained personal access token. Sirf homemoneycalc repository select karein.</li><li>Permissions: Contents = Read-only, Actions = Read and write. Expiry set karein; token kisi ko send na karein.</li><li>Cloudflare → Workers & Pages → homemoneycalc-admin → Settings → Variables and Secrets → secret GITHUB_AGENT_TOKEN add karein.</li><li>Sirf production admin project par add karein; public project ya preview par nahi. Admin redeploy ke baad Refresh status karein.</li><li>Token missing/expired ho to approvals locked rahengi. Browser-only approval save nahi hota.</li></ol></details>}
    {!pending.length && <p className="text-sm text-muted">Abhi evidence-backed review proposal nahi hai. Empty inbox ka matlab har cheez verified nahi hai.</p>}
    <div className="space-y-4">{pending.map((p) => <article key={p.id} className="rounded-xl border border-line p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">{p.payload.kind === "metadata" ? "Exact title/description change" : "Research task · no automatic publication"}</p><h3 className="mt-2 font-bold text-ink">{p.payload.title}</h3><p className="mt-2 text-sm text-muted">{p.payload.reason}</p><ul className="mt-3 space-y-2 text-sm">{p.payload.evidence.map((e) => <li key={e.url}><a href={e.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-ivy-700 underline dark:text-ivy-300">Source kholo</a><span className="ml-2 text-muted">{e.observation}</span></li>)}</ul>{p.payload.change && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-surface-2 p-3"><strong className="text-xs text-muted">Abhi</strong><p className="mt-2 break-words text-sm text-ink">{p.payload.change.before}</p></div><div className="rounded-lg border border-ivy-300 p-3"><strong className="text-xs text-muted">Approve ke baad</strong><p className="mt-2 break-words text-sm text-ink">{p.payload.change.after}</p></div></div>}<ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">{p.payload.reviewChecklist.map((c) => <li key={c}>{c}</li>)}</ol><p className="mt-3 text-sm font-medium text-ink">{p.payload.outcome}</p><label className="mt-4 flex items-start gap-2 text-sm text-ink"><input type="checkbox" className="mt-1" checked={Boolean(reviewed[p.id])} onChange={(e) => setReviewed((v) => ({ ...v, [p.id]: e.target.checked }))} />Maine sources, change aur checklist padh li hai.</label><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={!configured || !reviewed[p.id] || busy || queued[p.id]} onClick={() => void submit(p, "approve")} className="btn-primary disabled:opacity-40">{queued[p.id] ? "Workflow queued — result dekhein" : "Approve shown proposal"}</button><button type="button" disabled={!configured || !reviewed[p.id] || busy || queued[p.id]} onClick={() => void submit(p, "reject")} className="btn-secondary disabled:opacity-40">Reject</button></div><p className="mt-3 break-all text-xs text-muted">{p.id} · expires {p.payload.expires} (UTC)</p></article>)}</div>
    <details className="mt-5"><summary className="cursor-pointer text-sm font-semibold text-ink">Decisions aur accepted research ({decisions.length})</summary><ul className="mt-3 space-y-3">{decisions.slice(-15).reverse().map((d) => <li key={d.id} className="rounded-xl bg-surface-2 p-3 text-sm text-ink">{d.title}<span className="mt-1 block text-xs text-muted">{d.result} · {new Date(d.decidedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</span></li>)}</ul></details>
    <a href="https://github.com/pavanikumari555/homemoneycalc/actions/workflows/agent-decision.yml" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm font-semibold text-ivy-700 underline dark:text-ivy-300">Workflow result / failure dekhein</a><p className="mt-3 text-xs text-muted">Queued ≠ applied/live. Tests, build aur deployment successful hone ke baad supported change live hota hai. Ads/traffic manipulation, bulk pages aur financial-rule changes auto publish nahi hote.</p>
  </section>;
}
