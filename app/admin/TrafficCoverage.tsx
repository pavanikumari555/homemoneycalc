export function AutomaticTraffic() {
  return <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
    <h2 className="text-lg font-bold text-ink">Automatic website traffic</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted">Cloudflare Web Analytics mein Visits, Page views, Referer, Country aur Path dekhein. Visitors ko Allow button dabana nahi padta. Host filter homemoneycalc.com aur Exclude Bots = Yes rakhein. Visits unique insaanon ki exact ginti nahi hain.</p>
    <a href="https://dash.cloudflare.com/?to=/:account/web-analytics" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg bg-ivy-700 px-4 py-2 text-sm font-bold text-white">Visits aur traffic sources dekhein ↗</a>
    <p className="mt-3 text-xs leading-relaxed text-muted">Live Web Analytics numbers abhi is saved admin report mein import nahi hote. Neeche purana GA4 sample ya raw requests dekhkar total visitors zero mat samjhein. Agent ke HTTP checks browser beacon nahi chalate; browser automation ko alag exclude karna zaroori hai.</p>
  </section>;
}

type Edge = { connected?: boolean; status?: string; totals?: { requests?: number; htmlPageRequests?: number }; range?: { start: string; endExclusive: string }; daysReturned?: number };
export default function TrafficCoverage({ edge }: { edge?: Edge }) {
  return <div className="space-y-4 text-sm leading-relaxed text-muted">
    <p><strong className="text-ink">Google search traffic:</strong> Search Console ke clicks/impressions analytics permission par depend nahi karte. Ye sab traffic sources ka count nahi hai.</p>
    <p><strong className="text-ink">Cloudflare edge:</strong> Existing server traffic counters ke liye visitor ko analytics permission ya browser script nahi chahiye. Requests mein bots, assets aur blocked traffic aa sakte hain; inhe real people, sessions ya ad impressions mat maanenge.</p>
    {edge?.connected ? <div className="rounded-xl bg-surface-2 p-4 text-ink"><strong>{edge.totals?.requests?.toLocaleString("en-US")} HTTP requests</strong><p>{edge.totals?.htmlPageRequests?.toLocaleString("en-US")} HTML page requests · {edge.daysReturned} returned days · UTC {edge.range?.start} se {edge.range?.endExclusive} (end exclusive).</p></div> : <p className="rounded-xl bg-surface-2 p-4">Admin mein automatic edge counters: read-only connection verify/setup baaki. Cloudflare dashboard ke existing Analytics &amp; Traffic counters abhi manually dekhe ja sakte hain. Missing data ko zero nahi dikhayenge.</p>}
    <p><strong className="text-ink">Historical GA4:</strong> Google tag 30 October 2026 se retired hai. Saved reports mein purana consented sample aa sakta hai; current traffic ke liye upar Cloudflare Web Analytics kholein. GA4 count AdSense ki compulsory eligibility condition nahi.</p>
    <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-ivy-700 underline dark:text-ivy-300">Cloudflare mein homemoneycalc.com → Analytics &amp; Traffic dekhein</a>
  </div>;
}
