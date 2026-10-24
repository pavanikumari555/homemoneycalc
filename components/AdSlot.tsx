"use client";

import { useEffect, useRef } from "react";
import { SITE, AdPlacement } from "@/lib/site";

// ============================================================================
// AD SLOT — research ke hisaab se (AdSense policy + Better Ads Standards):
// - Calculator card ke ANDAR ya inputs/buttons ke paas kabhi ad nahi (accidental
//   click policy). Har slot calculator se kam se kam ~150px door hai.
// - Har slot ki height pehle se reserve (CLS = 0, page nahi hilta).
// - Input badalne pe ad refresh NAHI hota (Google policy).
// - Publisher ID ya slot ID khaali ho -> kuch render nahi (review ke time saaf site).
// Slot IDs lib/site.ts ke SITE.adSlots me daalo (AdSense dashboard se).
// ============================================================================

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Reserved heights per placement (mobile / desktop). Ad size se thoda zyada.
const LAYOUT: Record<AdPlacement, { wrap: string; format: string }> = {
  afterTool: { wrap: "min-h-[280px] md:min-h-[100px]", format: "auto" },
  inArticle: { wrap: "min-h-[280px]", format: "fluid" },
  multiplex: { wrap: "min-h-[300px]", format: "autorelaxed" },
};

export default function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  const slot = SITE.adSlots[placement];
  const enabled = Boolean(SITE.adsensePublisherId && slot);
  const pushed = useRef(false);

  useEffect(() => {
    if (!enabled || pushed.current) return;
    pushed.current = true; // once per mount — never refresh on input changes
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // A failed ad should never break the page
    }
  }, [enabled]);

  if (!enabled) return null;
  const { wrap, format } = LAYOUT[placement];

  return (
    <div className={`ad-slot no-print my-10 ${wrap} ${className}`}>
      <span className="mb-1 block text-center text-[10px] uppercase tracking-wide text-muted">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={SITE.adsensePublisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(placement === "inArticle" ? { "data-ad-layout": "in-article" } : {})}
        {...(placement === "afterTool" ? { "data-full-width-responsive": "true" } : {})}
      />
    </div>
  );
}
