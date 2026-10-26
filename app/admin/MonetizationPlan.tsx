type Plan = { adsEnabled?: boolean; siteApproval?: string; accountChecks?: { id: string; label: string; done: boolean }[] };
export default function MonetizationPlan({ plan }: { plan: Plan }) {
  return <div className="space-y-4 text-sm leading-relaxed">
    <p className="text-ink"><strong>Abhi: ads band · site status: {plan.siteApproval || "verify pending"}.</strong> Approval ko automatic earning ya guaranteed income na samjhein.</p>
    <p className="text-muted">Plan: shuru mein ek labelled in-content ad, original explanation ke baad; inputs, Share/Save buttons aur navigation se door. Anchor/vignette overlays aur forced consent nahi. Ads band hon to khaali ad box nahi.</p>
    <ul className="space-y-2">{(plan.accountChecks || []).map((item) => <li key={item.id} className="rounded-xl bg-surface-2 p-3 text-ink"><span className="mr-2 font-semibold">{item.done ? "Verified:" : "Account setup/review baaki:"}</span>{item.label}</li>)}</ul>
    <p className="text-muted">Google-certified Privacy &amp; messaging setup account mein hota hai. Current Analytics choices uska replacement nahi. Final publisher ID, ad-unit IDs aur applicable privacy settings ke bina ad activation ready nahi keh sakte.</p>
    <a href="https://support.google.com/adsense/answer/10924669?hl=en" target="_blank" rel="noopener noreferrer" className="font-semibold text-ivy-700 underline dark:text-ivy-300">Google Privacy &amp; messaging guide</a>
  </div>;
}
