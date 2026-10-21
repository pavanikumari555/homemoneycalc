import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = buildMetadata({
  title: "Disclaimer",
  description:
    "CalcIvy provides estimates for informational purposes only. Our calculators are not financial, tax, or investment advice. Read our full disclaimer.",
  path: "/disclaimer/",
});

export default function DisclaimerPage() {
  return (
    <PageShell title="Disclaimer" intro="Important information about using our calculators.">
      <h2>For information only — not advice</h2>
      <p>
        The calculators and content provided by {SITE.name} are for general informational and
        educational purposes only. They are <strong>not</strong> financial, tax, legal,
        accounting, or investment advice, and they are not a substitute for advice from a
        qualified professional who understands your individual circumstances.
      </p>

      <h2>Results are estimates</h2>
      <p>
        All figures produced by our tools are estimates based on the information you enter and on
        standard formulas and assumptions. Real-world results can differ, sometimes
        significantly, due to factors our calculators cannot account for — including your exact
        tax situation, lender fees and terms, local and state rules, rounding, changing interest
        rates, and market conditions. We do not guarantee the accuracy, completeness, or
        suitability of any result.
      </p>

      <h2>Financial calculators</h2>
      <p>
        Tools involving loans, mortgages, paychecks, taxes, debt, and investments rely on rules
        and rates that change over time and vary by location. Where relevant, we note the tax
        year or assumptions used. Before making any financial decision, confirm the numbers with
        your lender, employer, tax authority, or a licensed financial professional.
      </p>

      <h2>No guarantees on investments</h2>
      <p>
        Projections of investment or savings growth (such as our compound interest calculator)
        assume a constant rate of return that you choose. Actual returns fluctuate and are never
        guaranteed. Past performance does not predict future results, and you could lose money.
      </p>

      <h2>Your responsibility</h2>
      <p>
        You use {SITE.name} and its results at your own discretion and risk. {SITE.name} and its
        operators accept no liability for any loss or damage arising from the use of, or reliance
        on, the calculators or content on this Site.
      </p>

      <h2>Questions</h2>
      <p>
        If anything here is unclear, please email us at{" "}
        <a href={`mailto:${SITE.email}`} className="text-ivy-600 underline">{SITE.email}</a>{" "}
        before relying on a result.
      </p>
    </PageShell>
  );
}
