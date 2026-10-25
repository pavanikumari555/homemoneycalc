/** Registry dates decide what is released; roadmap status can lag behind auto-release. */
export function roadmapSummary(items, tools, today) {
  const dates = new Map(tools.map((t) => [t.slug, t.added]));
  const pending = items
    .filter((t) => dates.has(t.slug) ? dates.get(t.slug) > today : t.status !== "live")
    .map((t) => ({ ...t, targetDate: dates.get(t.slug) || t.targetDate }))
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  return {
    live: items.length - pending.length,
    planned: pending.length,
    pending,
    overdue: pending.filter((t) => t.targetDate < today && t.status === "planned"),
    dueSoon: pending.filter((t) => t.targetDate >= today).slice(0, 3),
  };
}
