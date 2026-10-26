// Basic opt-in analytics only. Never read calculator fields, saved plans or URL parameters.
(function () {
  "use strict";
  const ID = "G-N6Y64JH7QB";
  const KEY = "hmc:analytics-consent:v1";
  let started = false;
  let lastPath = "";
  function publicPage() {
    return location.hostname === "homemoneycalc.com" && !/^\/(admin|embed|go|my-money)(\/|$)/.test(location.pathname);
  }
  function accepted() {
    try { return localStorage.getItem(KEY) === "accepted"; } catch { return false; }
  }
  function gtag() { window.dataLayer.push(arguments); }
  function clearCookies() {
    document.cookie.split(";").forEach(function (item) {
      const name = item.split("=")[0].trim();
      if (!/^(_ga|hmc_ga)(_|$)/.test(name)) return;
      ["", ";domain=homemoneycalc.com", ";domain=.homemoneycalc.com"].forEach(function (domain) {
        document.cookie = name + "=;max-age=0;path=/" + domain + ";SameSite=Lax;Secure";
      });
    });
  }
  function page() {
    if (!publicPage() || !accepted()) return;
    const path = location.pathname;
    if (path === lastPath) return; // query/input changes are not new pageviews
    lastPath = path;
    let referrer = "";
    try { referrer = new URL(document.referrer).origin + "/"; } catch { /* no referrer */ }
    const fields = {
      page_location: "https://homemoneycalc.com" + path,
      page_path: path,
      page_referrer: referrer,
      page_title: "HomeMoney Calc", // never send dynamically generated result text
    };
    gtag("set", fields);
    gtag("config", ID, { ...fields, send_page_view: false, allow_google_signals: false,
      allow_ad_personalization_signals: false, cookie_prefix: "hmc", cookie_expires: 7776000,
      cookie_flags: "SameSite=Lax;Secure" });
    gtag("event", "page_view", { ...fields, send_to: ID });
  }
  function sync() {
    if (!publicPage() || !accepted()) {
      window["ga-disable-" + ID] = true;
      clearCookies();
      // Unload the third-party library on withdrawal; no denied/cookieless pings.
      if (started) location.reload();
      return;
    }
    window["ga-disable-" + ID] = false;
    if (!started) {
      started = true;
      window.dataLayer = [];
      gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied",
        ad_user_data: "denied", ad_personalization: "denied" });
      gtag("js", new Date());
      page(); // queue sanitized config before the Google library can run
      const script = document.createElement("script");
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
      document.head.appendChild(script);
    } else page();
  }
  window.addEventListener("hmc:analytics-choice", sync);
  window.addEventListener("hmc:analytics-page", sync);
  window.addEventListener("storage", function (event) { if (event.key === KEY || event.key === null) sync(); });
  sync();
})();
