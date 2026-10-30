import Script from "next/script";

// No consent UI or Google tag. Retain the local URL to retire previous opt-ins.
// Cloudflare Pages injects its own cookieless Web Analytics beacon.
export default function AnalyticsConsent() {
  return <Script src="/analytics.js" strategy="afterInteractive" />;
}
