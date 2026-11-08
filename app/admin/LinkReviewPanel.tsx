type Item = {organization:string;researchUrl:string;resourceUrl:string;checkedOn:string;stage:string;blockers:string[];nextStep:string;draft:string};
type Plan = {date:string;status:string;items:Item[];message?:string};
function https(value:string) { try { const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password?u.href:undefined; } catch { return undefined; } }

export default function LinkReviewPanel({plan,repo}:{plan:Plan;repo:string}) {
  return <details className="mt-5 rounded-2xl border border-line bg-surface p-5">
    <summary className="cursor-pointer font-bold text-ink">Safe growth: resource review ({plan.items?.length ?? 0}/2)</summary>
    <div className="mt-4 space-y-5 text-sm text-muted">
      <p>Queue date: {plan.date} · Maximum do prospects review ke liye. Ye do backlinks ka promise nahi. Sirf saved research hai; current publisher policy dobara check karein.</p>
      <p>Message ya form automatic send nahi hota. Aapke exact recipient aur draft review ke baad hi external step hoga. Neeche koi “Send” button nahi hai.</p>
      {plan.status!=="available"?<p role="status">{plan.message || "Research queue abhi available nahi hai."}</p>:!plan.items.length?<p>Central tracker mein abhi koi suitable uncontacted prospect nahi. Quota bharne ke liye irrelevant contact na karein.</p>:plan.items.map(item=><section key={item.organization} className="rounded-xl border border-line p-4">
        <h3 className="font-bold text-ink">{item.organization}</h3>
        <p className="mt-1">{item.stage==="owner-review"?"Owner review chahiye":"Abhi research chahiye"} · Saved research: {item.checkedOn || "unknown"}</p>
        <p className="mt-3">Agla kaam: {item.nextStep}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">{item.blockers.map(b=><li key={b}>{b}</li>)}</ul>
        <div className="mt-3 flex flex-wrap gap-4">
          {https(item.researchUrl)&&<a href={https(item.researchUrl)} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Publisher ka page dekhein ↗</a>}
          {https(item.resourceUrl)&&<a href={https(item.resourceUrl)} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Hamara worked example ↗</a>}
        </div>
        <details className="mt-4"><summary className="cursor-pointer font-semibold text-ink">Inquiry draft review karein</summary><p className="mt-2">Ye suitability/policy poochhne ka draft hai, placement request ya sent message nahi. Contact channel pehle verify karein aur apna asli naam bharein.</p><textarea readOnly aria-label={`${item.organization} inquiry draft`} value={item.draft} rows={10} className="mt-2 w-full rounded-xl border border-line bg-surface-2 p-3 text-sm text-ink" /></details>
      </section>)}
      <details><summary className="cursor-pointer font-semibold text-ink">Duplicate contact kaise rukta hai?</summary><p className="mt-2">Central tracker mein contacted date, response, published reference, closed ya opt-out record ho to us organization/domain ko queue se hata dete hain. Ek organization ke liye ek hi card aata hai. Reply/contact hone par uska actual record update karwayein; is panel ko dekhne se contact complete mark nahi hota. Daily report fresh observations ya new leads ka proof nahi hai.</p></details>
      <p><a href={`${repo}/blob/main/docs/SAFE-LINK-EARNING.md`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Research guide ↗</a>{" · "}<a href={`${repo}/blob/main/data/link-outreach-tracker.csv`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Central tracker ↗</a></p>
    </div>
  </details>;
}
