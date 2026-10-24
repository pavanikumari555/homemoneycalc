"use client";

import LineChart from "@/components/calc/LineChart";

// Daily Google clicks + impressions chart for the admin panel.
export default function AdminTrend({ points }: { points: { date: string; clicks: number; impressions: number }[] }) {
  const xs = points.map((p, i) => ({ i, ...p }));
  const label = (x: number) => {
    const p = xs[Math.round(x)];
    return p ? p.date.slice(5) : "";
  };
  return (
    <LineChart
      height={220}
      ariaLabel="Daily Google clicks"
      formatX={label}
      formatY={(y) => String(Math.round(y))}
      series={[{ name: "Clicks", color: "#2a6a44", area: true, points: xs.map((p) => ({ x: p.i, y: p.clicks })) }]}
    />
  );
}
