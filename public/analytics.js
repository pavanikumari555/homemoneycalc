// Retire the previous optional Google tag. No network calls or visitor tracking.
(function () {
  "use strict";
  window["ga-disable-G-N6Y64JH7QB"] = true;
  try { localStorage.removeItem("hmc:analytics-consent:v1"); } catch { /* storage unavailable */ }
  if (location.hostname !== "homemoneycalc.com") return;
  document.cookie.split(";").forEach(function (item) {
    const name = item.split("=")[0].trim();
    if (!/^(_ga|hmc_ga)(_|$)/.test(name)) return;
    ["", ";domain=homemoneycalc.com", ";domain=.homemoneycalc.com"].forEach(function (domain) {
      document.cookie = name + "=;max-age=0;path=/" + domain + ";SameSite=Lax;Secure";
    });
  });
})();
