// Descriptive comparisons only. No automatic ranking claims or rollback on daily noise.
export function evaluateExperiments(history, report, today) {
  return (history.decisions || []).filter((d) => d.result === "applied-after-checks" && d.kind === "metadata").map((d) => {
    const days = (Date.parse(`${today}T12:00:00Z`) - Date.parse(d.decidedAt)) / 86400000;
    const page = `/${d.payload.change.slug}/`;
    const current = report.topPages?.find((p) => p.page === page);
    const baseline = d.payload.baseline;
    const status = days < 32 ? "waiting-for-comparable-window" : !report.sources?.gsc || !current || !baseline || current.impressions < 100 ? "insufficient-data" : "review-comparison";
    return { id: d.id, title: d.title, page, status, baseline: baseline || null, current: current || null, note: "Aggregate observations, not a controlled experiment. Position, device, country, season and Google updates can change CTR; do not infer causation or auto-rewrite." };
  });
}
