"use client";
import { useState } from "react";

// Roz ke share drafts (daily report ke `ideas` se). Owner padhe, badle, khud post kare.
// Yahan se kuch bhi automatic post/send NAHI hota.
type Json = any;

const BUFFER_URL = "https://publish.buffer.com/";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("failed"); // clipboard blocked: text neeche select karke copy kar sakte hain
    }
    window.setTimeout(() => setState("idle"), 2500);
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={copy} className="btn-ghost px-3 py-1.5 text-xs">{label}</button>
      <span role="status" className="text-xs text-muted">{state === "done" ? "Copy ho gaya" : state === "failed" ? "Copy nahi hua, text select karke copy karein" : ""}</span>
    </span>
  );
}

function Draft({ title, text, note }: { title: string; text: string; note?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">{title}</h3>
        <CopyButton text={text} label="Copy" />
      </div>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-surface p-3 text-sm text-ink">{text}</pre>
    </div>
  );
}

export default function ShareDrafts({ ideas }: { ideas: Json }) {
  const pin = ideas?.social?.pinterest;
  const outreach: Json[] = Array.isArray(ideas?.outreach) ? ideas.outreach : [];
  const seasonal: Json[] = Array.isArray(ideas?.seasonal) ? ideas.seasonal : [];
  if (!pin && !outreach.length && !seasonal.length) {
    return <p className="text-sm text-muted">Aaj ki report mein share drafts nahi mile. Agli daily report ke baad yahan dikhenge.</p>;
  }
  const pinText = pin ? `${pin.title}\n\n${pin.description}\n\n${pin.link}` : "";
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        Ye drafts roz automatic bante hain. Post karne se pehle padhein aur apne shabdon mein thoda badlein. Link khol ke check karein
        ki number sahi dikh raha hai. Sirf apne accounts pe post karein. Reddit/Facebook groups mein un group ke rules padh ke,
        apna link batate hue hi share karein.
      </p>
      {pin && (
        <Draft
          title="Aaj ka Pinterest pin"
          text={pinText}
          note={`Board: ${pin.board}. Design: ${pin.design}`}
        />
      )}
      {outreach.map((o: Json, i: number) => (
        <Draft
          key={`${o.subject}-${i}`}
          title={`Email draft: ${o.to}`}
          text={`Subject: ${o.subject}\n\n${o.body}`}
          note={`[Name] jaise brackets bharein. Ek-ek ko personal bhejein, bulk nahi. ${o.rules ?? ""}`}
        />
      ))}
      {seasonal.length > 0 && (
        <div className="rounded-xl bg-surface-2 p-4">
          <h3 className="font-semibold text-ink">Is season ke share ideas</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {seasonal.map((s: Json) => (
              <li key={s.name}>
                <strong className="text-ink">{s.name}</strong> ({s.status}): {s.idea}
              </li>
            ))}
          </ul>
        </div>
      )}
      <a className="inline-block text-sm font-semibold underline" href={BUFFER_URL} target="_blank" rel="noopener noreferrer">
        Buffer kholein (copy kiya text wahan schedule karein) ↗
      </a>
    </div>
  );
}
