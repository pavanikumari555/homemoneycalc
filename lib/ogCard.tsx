import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// Share card (1200x630) ka ek hi design — site wala (/og.png) aur har tool ka (/og/<slug>.png).
export function ogCard({ title, line, footer }: { title: string; line: string; footer: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #1f5135 0%, #2a6a44 55%, #3d8a5c 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="80" height="80" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#ffffff" fillOpacity="0.16" />
            <path d="M12 31 32 15l20 16M18 27v22h28V27" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 800 }}>
            HomeMoney<span style={{ color: "#bfe6cc", marginLeft: 12 }}>Calc</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 1040 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 34, color: "#d9f0e1", maxWidth: 1040 }}>{line}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#d9f0e1" }}>
          <span>{footer}</span>
          <span>{SITE.domain}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
