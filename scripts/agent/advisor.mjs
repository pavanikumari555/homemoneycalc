const finite = (n) => typeof n === "number" && Number.isFinite(n);

/** Planning signal only: this cannot approve an AdSense account or certify traffic. */
export function adsenseReadiness(report, business, today) {
  const limit = business.readiness ?? { sessions28d: 1000, googleClicks28d: 200, activeSearchDays: 14, searchLandingPages: 3 };
  // Consented GA4 sessions are a sample, not a mandatory AdSense eligibility gate.
  const connected = Boolean(report?.sources?.gsc);
  const age = report?.date ? (Date.parse(today) - Date.parse(report.date)) / 86_400_000 : Infinity;
  const fresh = connected && age >= 0 && age <= 2;
  const activeDays = new Set((report?.trend ?? []).filter((d) => d.clicks > 0 && /^\d{4}-\d{2}-\d{2}$/.test(d.date)).map((d) => d.date)).size;
  const landingPages = new Set((report?.topPages ?? []).filter((p) => p.clicks > 0 && typeof p.page === "string").map((p) => p.page)).size;
  const checks = [
    { id: "clicks", label: "Google se clicks", value: fresh && finite(report?.kpis?.clicks) ? report.kpis.clicks : null, target: limit.googleClicks28d },
    { id: "days", label: "Alag din Google traffic aaya", value: fresh ? activeDays : null, target: limit.activeSearchDays },
    { id: "pages", label: "Pages par Google traffic aaya", value: fresh ? landingPages : null, target: limit.searchLandingPages },
  ].map((c) => ({ ...c, passed: c.value != null && c.value >= c.target }));
  const passed = checks.filter((c) => c.passed).length;
  const healthKnown = report?.health?.ran === true;
  const checksPassed = report?.quality?.length > 0 && report.quality.every((c) => c.status === "pass");
  const livePassed = report?.liveChecks?.length > 0 && report.liveChecks.every((c) => c.status === "pass");
  const technicalReady = healthKnown && report.health.errors === 0 && Boolean(checksPassed && livePassed);
  const status = !connected ? "needs-data" : !fresh ? "stale" : passed < checks.length ? "building-traffic" : !technicalReady ? "needs-check" : "review-ready";
  return { status, checks, passed, technicalReady, officialMinimum: false, automaticApplication: false,
    optionalAnalytics: { source: "ga4-consented-sample", sessions: report?.sources?.ga4 && finite(report?.kpis?.sessions) ? report.kpis.sessions : null, requiredForApplication: false } };
}

/** Deterministic priorities keep missing data and completed owner tasks out of AI guesswork. */
export function actionPlan(report, business, today) {
  const actions = [];
  const add = (id, title, why, who, priority, steps, url = "") => actions.push({ id, title, why, who, priority, steps, url });
  if (!report?.sources?.gsc) add("gsc-data", "Google report connection poora karo", "Site verification aur agent ka data access alag hain. Agent ko abhi Google clicks nahi mil rahe.", "owner", 1,
    ["Google Cloud mein Search Console API enable karo aur service account banao.", "Search Console mein service-account email ko access do.", "GitHub secret GOOGLE_SA_JSON aur variable GSC_SITE set karo. Private key chat mein mat bhejo."], "https://console.cloud.google.com/");
  // Google collection is retired; do not ask the owner to reinstall its tag.
  const age = report?.date ? (Date.parse(today) - Date.parse(report.date)) / 86_400_000 : Infinity;
  if (age > 2) add("stale-report", "Daily report dobara chalao", "Purane data ko aaj ka result nahi maan sakte.", "owner", 0,
    ["GitHub Actions mein SEO daily report kholo.", "Latest failed run ka error dekho; phir Run workflow karo."], "https://github.com/pavanikumari555/homemoneycalc/actions");
  if (report?.health?.ran !== true) add("audit-missing", "Fresh website health check chalao", "Audit nahi chala to zero errors ka matlab healthy nahi hai.", "agent", 1,
    ["Production build banao aur technical audit chalao.", "Broken links, assets, metadata aur structured data ka result report mein save karo."]);
  for (const issue of (report?.health?.issues ?? []).filter((i) => i.severity === "error").slice(0, 5)) {
    add(`health-${actions.length}`, `Page ki galti: ${issue.route}`, issue.message, "agent", 0,
      ["Affected source page aur generated output mein problem reproduce karo.", "Small fix karo; regression tests, lint aur build pass karke authorized workflow se publish karo."]);
  }
  for (const check of report?.quality ?? []) {
    if (check.status !== "pass") add(`quality-${check.id}`, `${check.label}: ${check.status === "fail" ? "fix chahiye" : "check adhoora"}`, check.summary, "agent", check.status === "fail" ? 0 : 1,
      ["GitHub Actions ka matching check log kholo.", "Cause reproduce karke fix karo; guessing se pass mat mark karo."]);
  }
  const blocked = (report?.liveChecks ?? []).filter((c) => c.blockedBy === "cloudflare");
  for (const page of (report?.assetBudget ?? []).filter(p => p.status !== "pass")) add(`weight-${page.page}`, "Page ki loading weight check karein", `${page.page}: compressed asset budget ${page.status}. Ye real-user speed score nahi hai.`, "agent", 1,
    ["Build ke JS/CSS size aur missing assets inspect karo.", "Large imports ko reduce karke build aur mobile browser checks phir verify karo."]);
  if (report?.taxReview?.due) add("tax-review-due", "Tax rules ki scheduled review", `${report.taxReview.taxYear} tax data ki review due hai; dates badalne se figures verify nahi hote.`, "agent", 0,
    ["data/tax-review.json ke official sources aur latest annual rules verify karo.", "Math/source change ko boundary tests ke saath publish karo; unverified values estimate label ke saath hi rakho."]);
  if (report?.traffic && !report.traffic.connected) {
    const needsAccess = ["setup-needed", "permission-needed"].includes(report.traffic.status);
    add("web-traffic", needsAccess ? "Daily visits ka ek baar connection poora karein" : "Daily visits connection ka error verify karein", "Website ka analytics beacon aur private report access alag hain. Abhi daily report total visits nahi padh sakta.", needsAccess ? "owner" : "agent", 1,
      needsAccess ? ["Existing account ka sirf Account Analytics Read access verify karein; naya paid service nahi.", "Read-only token private admin aur GitHub ke CLOUDFLARE_WEB_ANALYTICS_TOKEN secret mein rakhein. Account aur Pages property code mein selected hain; connected result verify karein."] : ["Permission failure aur unsupported API query mein farq verify karein.", "Query/configuration fix ya temporary outage diagnose karein; verified access failure ke bina extra token permissions na maangein."], "https://dash.cloudflare.com/?to=/:account/web-analytics");
  }
  if (blocked.length) add("monitoring-access", "Cloudflare monitoring access verify karo", `${blocked.length} automated requests Cloudflare ne block kiye. Ye confirmed website outage nahi; monitoring coverage incomplete hai.`, "owner", 2,
    ["Website normal browser mein kholkar access verify karo.", "Cloudflare Security Events mein monitoring request/ray dekho; verified search crawlers ka access bhi check karo.", "Bot protection hataaye bina scoped monitoring solution choose karo; blocked checks ko healthy mat mark karo."], "https://dash.cloudflare.com/");
  for (const check of (report?.liveChecks ?? []).filter((c) => c.status !== "pass" && c.blockedBy !== "cloudflare")) {
    add(`live-${check.path}`, `Live page check: ${check.path}`, check.message, "agent", check.status === "fail" ? 0 : 1,
      ["Live response aur recent deployment compare karo.", "Routing/header/source fix verify karo; unavailable data ko failure details ke saath record karo."]);
  }
  for (const item of (report?.opportunities ?? []).slice(0, 2)) add(`growth-${item.page}`, `Improve karo: ${item.query}`, `${item.impressions} impressions; average position ${Number(item.position).toFixed(1)}. Improvement ka chance hai, ranking guarantee nahi.`, "agent", 2,
    ["Current query ke liye page ka answer aur search intent check karo.", "Original example, missing explanation ya title improve karo. Ek change ka result agle comparable period mein dekho."]);
  if (report?.approvals?.pending > 0) add("owner-approvals", "Approval inbox mein proposals padhein", `${report.approvals.pending} evidence-backed proposals await review. Approval applies only to the shown payload.`, "owner", 2,
    ["Admin → Aapki approvals kholo aur linked evidence padho.", "Exact before/after aur checklist verify karke approve/reject karo.", "Workflow result aur deployment verify karo; queued ko live mat samjho."], "https://homemoneycalc.com/admin/");
  if (!actions.length) add("grow", "Ek useful page ya product improve karo", "Latest connected checks mein abhi urgent issue nahi mila. Har possible problem detect hone ka claim nahi hai.", "agent", 3,
    ["Top landing page aur visitor queries dekho.", "User ke kaam ka ek improvement choose karo, verify karo aur impact measure karo."]);
  return actions.sort((a, b) => a.priority - b.priority);
}
