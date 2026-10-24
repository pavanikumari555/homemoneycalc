"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calcMortgage, duration, monthsFromNow, usd0 } from "@/lib/calc";
import { CountUp } from "@/components/calc/Results";
import LineChart, { shortMoney } from "@/components/calc/LineChart";
import Icon from "@/components/Icon";

// Home page "try it now" card: ek slider khiskao aur turant samjho site kya karti hai.
// Real mortgage math (same as the full calculator), fixed example loan.
const LOAN = { principal: 300000, annualRatePercent: 6.5, yearsLeft: 30, extraYearly: 0, oneTime: 0 };

export default function HeroDemo() {
  const [extra, setExtra] = useState(200);
  const res = useMemo(() => calcMortgage({ ...LOAN, extraMonthly: extra }), [extra]);

  return (
    <div className="relative min-w-0">
      <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-ivy-300/40 via-transparent to-sun-300/40 blur-2xl dark:from-ivy-700/30 dark:to-sun-600/20" />
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ivy-600 text-white">
              <Icon name="home" className="h-4 w-4" />
            </span>
            Try it: Mortgage payoff
          </span>
          <span className="rounded-full bg-sun-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sun-600 dark:bg-sun-600/15 dark:text-sun-300">
            Live demo
          </span>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-muted">
            $300,000 home loan at 6.5% for 30 years. <strong className="text-ink">Drag the slider</strong> — what if you paid a little extra each month?
          </p>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label htmlFor="demo-extra" className="text-sm font-medium text-ink">
                Extra each month
              </label>
              <span className="text-2xl font-extrabold tabular-nums text-ivy-700 dark:text-ivy-300">{usd0(extra)}</span>
            </div>
            <input
              id="demo-extra"
              type="range"
              min={0}
              max={1000}
              step={50}
              value={extra}
              onChange={(e) => setExtra(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-ivy-600 to-ivy-800 p-4 text-white">
            <div className="text-xs font-medium uppercase tracking-wider text-white/75">You&apos;d own your home in</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight" aria-live="polite">
              {monthsFromNow(res.withExtra.months)}
            </div>
            <div className="mt-1 text-sm text-white/90">
              {extra > 0 ? (
                <>
                  <strong>{duration(res.monthsSaved)} sooner</strong> ·{" "}
                  <strong>
                    <CountUp value={res.interestSaved} format={usd0} />
                  </strong>{" "}
                  less interest
                </>
              ) : (
                "Move the slider to see the difference"
              )}
            </div>
          </div>

          <LineChart
            height={150}
            ariaLabel="Loan balance with and without extra payments"
            formatX={(m) => `Yr ${Math.round(m / 12)}`}
            formatY={(y) => shortMoney(y)}
            series={[
              { name: "Minimum only", color: "#97a89e", points: res.base.balances, dashed: true },
              { name: "With extra", color: "#2a6a44", points: res.withExtra.balances, area: true },
            ]}
          />

          <Link href={`/mortgage-payoff-calculator/?x=${extra}`} className="btn-primary w-full">
            Use my own numbers <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
