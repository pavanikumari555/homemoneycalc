import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = buildMetadata({
  title: "Advertising & Affiliate Disclosure",
  description:
    "How HomeMoney Calc makes money: clearly labeled affiliate links and sponsorships that never change how our calculators work or what they show.",
  path: "/advertising-disclosure/",
});

// FTC guidance: tell readers plainly when we may earn from a link. Har affiliate
// box pe "Affiliate disclosure" label + yahan link hona chahiye.
export default function Page() {
  return (
    <PageShell title="Advertising & affiliate disclosure" intro="How we keep HomeMoney Calc free — and independent.">
      <h2>How we make money</h2>
      <p>
        {SITE.name} is free to use. To pay for it, some pages show a relevant next step — for example a budgeting app
        after the debt payoff calculator, or tax software during tax season. If you click one of these links and sign
        up or buy, the company may pay us a commission. It costs you nothing extra.
      </p>
      <p>
        We may also show clearly marked sponsorships. Sponsored placements are always labeled &ldquo;Sponsored&rdquo;.
      </p>

            <p>
        In addition to affiliate links, we may display third-party advertisements via Google AdSense. These ads are
        clearly distinguished from our calculator tools and editorial content, and ad placements never alter our
        mathematical formulas or recommendations.
      </p>

      <h2>What never changes</h2>
      <ul>
        <li>Calculator formulas, results and explanations are never influenced by partners or sponsors.</li>
        <li>We don&apos;t rank or hide options because someone paid us.</li>
        <li>Affiliate suggestions appear after your result, never mixed into the inputs.</li>
        <li>We only suggest products that fit the situation the calculator is about.</li>
      </ul>

      <h2>How to spot them</h2>
      <p>
        Every affiliate suggestion is labeled. Links that may earn us a commission are marked as such, and
        sponsorships are labeled &ldquo;Sponsored&rdquo;.
      </p>

      <h2>Questions</h2>
      <p>
        See our <Link href="/editorial-policy/">editorial policy</Link> and{" "}
        <Link href="/privacy-policy/">privacy policy</Link>, or email{" "}
        <a href={`mailto:${SITE.email}`} className="text-ivy-600 underline">
          {SITE.email}
        </a>
        .
      </p>
    </PageShell>
  );
}
