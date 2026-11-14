// Google Analytics (GA4) — owner direction 14 Nov 2026: bina popup ke default ON, footer se band ho sakta hai.
// Kabhi calculator fields, saved plans ya URL parameters nahi bhejte: sirf page path, fixed title, referrer origin.
// EEA/UK/Switzerland: consent mode default "denied" (no analytics cookies) jab tak visitor Allow na kare.
(function () {
  "use strict";
  const ID = "G-N6Y64JH7QB";
  const KEY = "hmc:analytics-choice:v2"; // "declined" | "accepted" | absent (default)
  const CONSENT_REGIONS = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH"];
  let started = false;
  let lastPath = "";
  function publicPage() {
    return location.hostname === "homemoneycalc.com" && !/^\/(admin|embed|go|my-money)(\/|$)/.test(location.pathname);
  }
  function choice() {
    try { return localStorage.getItem(KEY); } catch { return null; }
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
    const path = location.pathname;
    if (path === lastPath) return; // calculator inputs/query badalna naya pageview nahi
    lastPath = path;
    let referrer = "";
    try { referrer = new URL(document.referrer).origin + "/"; } catch { /* no referrer */ }
    const fields = {
      page_location: "https://homemoneycalc.com" + path,
      page_path: path,
      page_referrer: referrer,
      page_title: "HomeMoney Calc", // result text kabhi nahi
    };
    gtag("set", fields); // auto events bhi isi sanitized URL ke saath jaate hain
    gtag("config", ID, { ...fields, send_page_view: false, allow_google_signals: false,
      allow_ad_personalization_signals: false, cookie_prefix: "hmc", cookie_expires: 7776000,
      cookie_flags: "SameSite=Lax;Secure" });
    gtag("event", "page_view", { ...fields, send_to: ID });
  }
  function sync() {
    const c = choice();
    if (!publicPage() || c === "declined") {
      window["ga-disable-" + ID] = true;
      clearCookies();
      if (started) location.reload(); // loaded library ko poori tarah band karo
      return;
    }
    window["ga-disable-" + ID] = false;
    if (!started) {
      started = true;
      window.dataLayer = window.dataLayer || [];
      const ads = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
      // Region wala default zyada specific hai, isliye EEA/UK/CH mein ye lagega
      gtag("consent", "default", { analytics_storage: "denied", ...ads, region: CONSENT_REGIONS });
      gtag("consent", "default", { analytics_storage: "granted", ...ads });
      if (c === "accepted") gtag("consent", "update", { analytics_storage: "granted" });
      gtag("js", new Date());
      page(); // sanitized config library chalne se pehle queue
      const script = document.createElement("script");
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
      document.head.appendChild(script);
    } else {
      if (c === "accepted") gtag("consent", "update", { analytics_storage: "granted" });
      page();
    }
  }
  // Purana v1 key: pehle "Decline" kiya tha to wo choice v2 mein bhi rahe, phir v1 hatao
  try {
    if (localStorage.getItem("hmc:analytics-consent:v1") === "declined" && !localStorage.getItem(KEY)) localStorage.setItem(KEY, "declined");
    localStorage.removeItem("hmc:analytics-consent:v1");
  } catch { /* storage unavailable */ }
  window.addEventListener("hmc:analytics-choice", sync);
  window.addEventListener("hmc:analytics-page", sync);
  window.addEventListener("storage", function (event) { if (event.key === KEY || event.key === null) sync(); });
  sync();
})();
