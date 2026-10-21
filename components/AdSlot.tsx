"use client";

import { useEffect } from "react";
import { SITE } from "@/lib/site";

// ============================================================================
// AD SLOT
// AdSense approval ke BAAD, lib/site.ts me adsensePublisherId set karo aur
// har slot ka `slot` prop apne AdSense dashboard ke ad-unit ID se bharo.
// Jab tak ID empty hai -> clean labelled placeholder dikhta (site broken nahi lagti).
// ============================================================================

interface AdSlotProps {
  slot?: string; // AdSense ad unit ID (from dashboard)
  label?: string; // shown on placeholder only
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ slot, label = "Advertisement", className = "" }: AdSlotProps) {
  const enabled = Boolean(SITE.adsensePublisherId && slot);

  useEffect(() => {
    if (!enabled) return;
    try {
      // Tell AdSense to fill this slot
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Fail silently - a failed ad should never break the page
    }
  }, [enabled]);

  if (!enabled) {
    // Placeholder before AdSense is live
    return (
      <div
        className={`my-6 grid min-h-[100px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-400 ${className}`}
        aria-hidden="true"
      >
        Ad space
      </div>
    );
  }

  return (
    <div className={`my-6 ${className}`}>
      <span className="mb-1 block text-center text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={SITE.adsensePublisherId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
