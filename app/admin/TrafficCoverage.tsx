type Edge = { connected?: boolean; status?: string; totals?: { requests?: number; htmlPageRequests?: number }; range?: { start: string; endExclusive: string }; daysReturned?: number };
export default function TrafficCoverage({ edge }: { edge?: Edge }) {
  return <div className="space-y-4 text-sm leading-relaxed text-muted">
    <p><strong className="text-ink">Google search traffic:</strong> Search Console ke clicks/impressions GA4 Allow par depend nahi karte. Ye sab traffic sources ka count nahi hai.</p>
    <p><strong className="text-ink">Cloudflare edge:</strong> Existing server traffic counters ke liye visitor ko analytics permission ya browser script nahi chahiye. Requests mein bots, assets aur blocked traffic aa sakte hain; inhe real people, sessions ya ad impressions mat maanenge.</p>
    {edge?.connected ? <div className="rounded-xl bg-surface-2 p-4 text-ink"><strong>{edge.totals?.requests?.toLocaleString("en-US")} HTTP requests</strong><p>{edge.totals?.htmlPageRequests?.toLocaleString("en-US")} HTML page requests · {edge.daysReturned} returned days · UTC {edge.range?.start} se {edge.range?.endExclusive} (end exclusive).</p></div> : <p className="rounded-xl bg-surface-2 p-4">Admin mein automatic edge counters: read-only connection verify/setup baaki. Cloudflare dashboard ke existing Analytics &amp; Traffic counters abhi manually dekhe ja sakte hain. Missing data ko zero nahi dikhayenge.</p>}
    <p><strong className="text-ink">Optional GA4:</strong> Sirf consenting/unblocked visitors ka sample. First-visit popup nahi; footer ke Analytics choices se user khud opt in kar sakta hai. GA4 count AdSense ki compulsory eligibility condition nahi.</p>
    <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-ivy-700 underline dark:text-ivy-300">Cloudflare mein homemoneycalc.com → Analytics &amp; Traffic dekhein</a>
  </div>;
}
