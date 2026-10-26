import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function validateMonetization(config) {
  const errors = [];
  if (config.adsEnabled !== false) errors.push("Ads cannot be enabled yet: install and review the real account-specific tag/CMP before changing this guard.");
  if (typeof config.publisherId !== "string" || (config.publisherId && !/^ca-pub-\d{16}$/.test(config.publisherId))) errors.push("Publisher ID must be empty or the owner's exact ca-pub ID; never use placeholders.");
  const plan = config.placementPlan;
  if (!plan || plan.mode !== "manual-in-content" || plan.initialMaximumPerPage !== 1 || plan.anchorAds !== false || plan.vignetteAds !== false || plan.popups !== false || plan.forcedConsent !== false || plan.showEmptySpaceBeforeActivation !== false) errors.push("Preserve the reviewed non-obstructive placement plan.");
  if (config.siteApproval === "approved" && !config.publisherId) errors.push("Cannot claim site approval without the owner's publisher identity.");
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = validateMonetization(JSON.parse(readFileSync("data/monetization.json", "utf8")));
  if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
  else console.log("✓ Monetization preflight: preparation only; no ad requests or empty ad boxes.");
}
