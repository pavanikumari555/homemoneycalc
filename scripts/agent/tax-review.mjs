export function taxReview(config, today) {
  if (!Number.isInteger(config.taxYear) || !Number.isFinite(Date.parse(config.lastReviewed)) || !Number.isFinite(config.reviewIntervalDays) || !Array.isArray(config.rules)) return { due:true, yearChanged:false, taxYear:config.taxYear??null, lastReviewed:null, nextReview:null, limitations:[], rules:[], status:"review-record-missing" };
  const age = (Date.parse(today) - Date.parse(config.lastReviewed)) / 86400000;
  const yearChanged = Number(today.slice(0, 4)) !== config.taxYear;
  const due = !Number.isFinite(age) || age < 0 || age >= config.reviewIntervalDays || yearChanged;
  return { taxYear: config.taxYear, lastReviewed: config.lastReviewed, nextReview: new Date(Date.parse(config.lastReviewed) + config.reviewIntervalDays * 86400000).toISOString().slice(0, 10), due, yearChanged, limitations: config.rules.filter(r => ["older-parameters", "limited-model"].includes(r.status)), rules: config.rules };
}
