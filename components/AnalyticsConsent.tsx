"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

// GA4 bina popup ke chalta hai (public/analytics.js). Footer ke neeche sirf ek chhota
// "Analytics choices" button: visitor band ya (EEA/UK mein) chalu kar sakta hai.
const KEY = "hmc:analytics-choice:v2";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("hmc:analytics-choice", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("hmc:analytics-choice", callback); };
}
function choice() { try { return localStorage.getItem(KEY) ?? "default"; } catch { return "default"; } }
const serverChoice = () => "pending-hydration";

export default function AnalyticsConsent() {
  const path = usePathname();
  const current = useSyncExternalStore(subscribe, choice, serverChoice);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { window.dispatchEvent(new Event("hmc:analytics-page")); }, [path]);
  if (current === "pending-hydration" || /^\/(admin|embed|go|my-money)(\/|$)/.test(path)) return null;
  const eligible = ["homemoneycalc.com", "localhost", "127.0.0.1"].includes(window.location.hostname);
  if (!eligible) return null;
  const choose = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(KEY, value);
      setOpen(false);
      window.dispatchEvent(new Event("hmc:analytics-choice"));
    } catch { setError("Your preference could not be saved in this browser."); }
  };
  const status = current === "declined" ? "Analytics is off in this browser." : current === "accepted" ? "Analytics is on in this browser." : "Analytics is on by default (in the EU, UK and Switzerland it stays cookie-free until you allow it).";
  return <>
    <Script src="/analytics.js" strategy="afterInteractive" />
    <div className="container-page pb-6 text-sm text-muted">
      <button type="button" className="underline underline-offset-4 hover:text-ivy-600" onClick={() => setOpen(true)}>Analytics choices</button>
    </div>
    {open && <section aria-label="Analytics choices" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-5 text-ink shadow-lift sm:inset-x-6">
      <h2 className="text-base font-semibold">Analytics choices</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">We use Google Analytics to count visits and which pages are viewed. Calculator values and share-link numbers are never sent. Advertising features are off. {status} <Link href="/privacy-policy/" className="underline">Privacy details</Link></p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface-2" onClick={() => choose("declined")}>Turn off analytics</button>
        <button type="button" className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface-2" onClick={() => choose("accepted")}>Allow analytics</button>
        <button type="button" className="px-3 py-2.5 text-sm underline" onClick={() => setOpen(false)}>Close</button>
      </div>
      {error && <p role="status" className="mt-3 text-sm">{error}</p>}
    </section>}
  </>;
}
