"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ============================================================================
// LINE / AREA CHART — khud ka chhota SVG chart (koi library nahi = page fast).
// Multiple series, hover/touch tooltip, smooth draw animation.
// ============================================================================

export interface Series {
  name: string;
  color: string;
  points: { x: number; y: number }[];
  area?: boolean; // fill under the line
  dashed?: boolean;
}

interface LineChartProps {
  series: Series[];
  height?: number;
  formatX: (x: number) => string;
  formatY: (y: number) => string;
  ariaLabel: string;
}

const PAD = { top: 16, right: 16, bottom: 28, left: 64 };

/** "Nice" axis max so gridlines land on round numbers. */
function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const steps = [1, 1.25, 2, 2.5, 5, 10];
  for (const s of steps) if (v <= s * pow) return s * pow;
  return 10 * pow;
}

/** Keep at most `max` points (always keeps first + last) so long schedules stay fast. */
function downsample(points: Series["points"], max = 160) {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}

export default function LineChart({ series: rawSeries, height = 260, formatX, formatY, ariaLabel }: LineChartProps) {
  const series = useMemo(() => rawSeries.map((s) => ({ ...s, points: downsample(s.points) })), [rawSeries]);
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { xMin, xMax, yMax } = useMemo(() => {
    const xs = series.flatMap((s) => s.points.map((p) => p.x));
    const ys = series.flatMap((s) => s.points.map((p) => p.y)).filter(Number.isFinite);
    return {
      xMin: xs.length ? Math.min(...xs) : 0,
      xMax: xs.length ? Math.max(...xs) : 1,
      yMax: niceMax(ys.length ? Math.max(...ys) : 1),
    };
  }, [series]);

  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const sx = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin || 1)) * innerW;
  const sy = (y: number) => PAD.top + innerH - (Math.max(0, y) / yMax) * innerH;

  // Hover index is based on the longest series' x values
  const base = series.reduce((a, b) => (b.points.length > a.points.length ? b : a), series[0] ?? { points: [] });

  function onMove(clientX: number) {
    const el = wrap.current;
    if (!el || !base.points.length) return;
    const rect = el.getBoundingClientRect();
    const x = xMin + ((clientX - rect.left - PAD.left) / innerW) * (xMax - xMin);
    let best = 0;
    let bestD = Infinity;
    base.points.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setHover(best);
  }

  const gridY = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);
  const tickCount = Math.min(6, Math.max(2, Math.floor(innerW / 90)));
  const gridX = Array.from({ length: tickCount + 1 }, (_, i) => xMin + ((xMax - xMin) * i) / tickCount);
  const hoverX = hover != null ? base.points[hover]?.x : null;

  // Re-key paths on data change so the draw animation replays
  const animKey = series.map((s) => `${s.points.length}:${Math.round(s.points[s.points.length - 1]?.y ?? 0)}`).join("|");

  return (
    <div ref={wrap} className="relative w-full min-w-0 select-none">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        className="block touch-pan-y overflow-visible"
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => onMove(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={() => setHover(null)}
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`area-${i}-${s.color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {gridY.map((y) => (
          <g key={y}>
            <line x1={PAD.left} x2={width - PAD.right} y1={sy(y)} y2={sy(y)} className="stroke-line" strokeDasharray={y === 0 ? undefined : "3 4"} />
            <text x={PAD.left - 10} y={sy(y)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px]">
              {formatY(y)}
            </text>
          </g>
        ))}
        {gridX.map((x, i) => (
          <text key={i} x={sx(x)} y={height - 8} textAnchor="middle" className="fill-muted text-[11px]">
            {formatX(x)}
          </text>
        ))}

        {series.map((s, i) => {
          if (!s.points.length) return null;
          const d = s.points.map((p, j) => `${j ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join("");
          const last = s.points[s.points.length - 1];
          const areaD = `${d}L${sx(last.x).toFixed(1)},${sy(0)}L${sx(s.points[0].x).toFixed(1)},${sy(0)}Z`;
          return (
            <g key={`${i}-${animKey}`}>
              {s.area && <path d={areaD} fill={`url(#area-${i}-${s.color.replace("#", "")})`} className="animate-fade-up" />}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={s.dashed ? "0.008 0.012" : "1"}
                className={s.dashed ? "" : "animate-draw"}
              />
            </g>
          );
        })}

        {hoverX != null && (
          <g>
            <line x1={sx(hoverX)} x2={sx(hoverX)} y1={PAD.top} y2={PAD.top + innerH} className="stroke-muted/50" strokeDasharray="2 3" />
            {series.map((s, i) => {
              const p = s.points.find((pt) => pt.x === hoverX) ?? s.points.reduce((a, b) => (Math.abs(b.x - hoverX) < Math.abs(a.x - hoverX) ? b : a), s.points[0]);
              if (!p) return null;
              return <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill={s.color} className="stroke-surface" strokeWidth={2} />;
            })}
          </g>
        )}
      </svg>

      {hoverX != null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[160px] rounded-xl border border-line bg-surface/95 px-3 py-2 text-xs shadow-lift backdrop-blur"
          style={{ left: Math.min(Math.max(sx(hoverX) - 80, 0), width - 170) }}
        >
          <div className="mb-1 font-semibold text-ink">{formatX(hoverX)}</div>
          {series.map((s) => {
            const p = s.points.reduce((a, b) => (Math.abs(b.x - hoverX) < Math.abs(a.x - hoverX) ? b : a), s.points[0]);
            if (!p) return null;
            return (
              <div key={s.name} className="flex items-center justify-between gap-3 text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="font-semibold tabular-nums text-ink">{formatY(p.y)}</span>
              </div>
            );
          })}
        </div>
      )}

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {series.map((s) => (
          <li key={s.name} className="flex items-center gap-1.5">
            <span className="h-[3px] w-4 rounded-full" style={{ background: s.color }} />
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Short money labels for axes: 1500 -> $1.5k, 2300000 -> $2.3M */
export function shortMoney(v: number, symbol = "$"): string {
  const a = Math.abs(v);
  if (a >= 1e6) return `${symbol}${(v / 1e6).toFixed(a >= 1e7 ? 0 : 1)}M`;
  if (a >= 1e3) return `${symbol}${(v / 1e3).toFixed(a >= 1e4 ? 0 : 1)}k`;
  return `${symbol}${Math.round(v)}`;
}
