// A green structural audit cannot turn failed, stale or missing checks green.
export function ownerStatus(report, today) {
  const age = report?.date ? (Date.parse(today) - Date.parse(report.date)) / 86400000 : Infinity;
  const stale = !Number.isFinite(age) || age < 0 || age > 2;
  const failures = (report?.quality ?? []).filter(c => c.status === "fail").length + (report?.liveChecks ?? []).filter(c => c.status === "fail").length + (report?.health?.errors ?? 0) + (report?.taxReview?.due ? 1 : 0);
  const unknown = report?.health?.ran !== true || !Number.isFinite(report?.health?.errors) || !report?.quality?.length || !report?.liveChecks?.length || [...(report?.quality ?? []), ...(report?.liveChecks ?? [])].some(c => !["pass","fail"].includes(c.status));
  if (stale) return { kind: "unknown", stale, title: "Naya report chahiye", explanation: "Purane ya missing report se aaj ki website ka haal confirm nahi kar sakte." };
  if (failures) return { kind: "problem", stale, title: `${failures} check mein fix chahiye`, explanation: "Zaroori kaam mein reason aur next steps hain. Iska matlab har page band hai, aisa nahi." };
  if (unknown) return { kind: "unknown", stale, title: "Checking ka kuch hissa baaki hai", explanation: "Completed checks mein confirmed failure nahi mila. Kuch monitoring responses verify nahi hue; poori website ko all-clear nahi keh rahe." };
  return { kind: "checked", stale, title: "Latest completed checks pass hain", explanation: "Ye tested coverage ka result hai. Tax updates aur user experience ki regular review jaari rahegi." };
}
