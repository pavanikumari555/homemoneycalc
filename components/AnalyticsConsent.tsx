"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

const KEY = "hmc:analytics-consent:v1";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("hmc:analytics-choice", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("hmc:analytics-choice", callback); };
}
function choice() { try { return localStorage.getItem(KEY); } catch { return "declined"; } }
const serverChoice = () => "pending-hydration";

export default function AnalyticsConsent() {
  const path = usePathname();
  const consent = useSyncExternalStore(subscribe, choice, serverChoice);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { window.dispatchEvent(new Event("hmc:analytics-page")); }, [path]);
  if (consent === "pending-hydration" || /^\/(admin|embed|go|my-money)(\/|$)/.test(path)) return null;
  const eligible = ["homemoneycalc.com", "localhost", "127.0.0.1"].includes(window.location.hostname);
  if (!eligible) return null;
  const choose = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(KEY, value);
      setOpen(false);
      window.dispatchEvent(new Event("hmc:analytics-choice"));
    } catch { setError("Your preference could not be saved. Optional analytics stays off."); }
  };
  return <>
    <Script src="/analytics.js" strategy="afterInteractive" />
    <div className="container-page pb-6 text-sm text-muted">
      <button type="button" className="underline underline-offset-4 hover:text-ivy-600" onClick={() => setOpen(true)}>Analytics choices</button>
    </div>
    {open && <section aria-label="Optional analytics" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-5 text-ink shadow-lift sm:inset-x-6">
      <h2 className="text-base font-semibold">Help us understand site visits?</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">With your permission, Google Analytics measures visits and pages viewed. Calculator values and share-link parameters are excluded. You can use every calculator without analytics. <Link href="/privacy-policy/" className="underline">Privacy details</Link></p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface-2" onClick={() => choose("declined")}>Decline analytics</button>
        <button type="button" className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface-2" onClick={() => choose("accepted")}>Allow analytics</button>
        <button type="button" className="px-3 py-2.5 text-sm underline" onClick={() => setOpen(false)}>Close</button>
      </div>
      {error && <p role="status" className="mt-3 text-sm">{error}</p>}
    </section>}
  </>;
}

