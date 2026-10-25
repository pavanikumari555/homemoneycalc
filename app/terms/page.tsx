import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "The terms of service for using HomeMoney Calc's free financial calculators, including acceptable use and limitation of liability.",
  path: "/terms/",
});

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service" intro="Last updated: October 25, 2026">
      <p>
        By using {SITE.domain} (the &quot;Site&quot;), you agree to these Terms of Service. If you do not
        agree, please do not use the Site.
      </p>

      <h2>Use of the Site</h2>
      <p>
        {SITE.name} provides free online calculators and related informational content. You may
        use the Site for your personal, non-commercial purposes, and you may place our calculators on
        your own website using the free embed code shown on each tool page (please keep the
        &ldquo;Powered by&rdquo; credit inside the widget). You agree not to misuse the
        Site, including by attempting to disrupt it, access it through automated means at a rate
        that burdens it, or use it for any unlawful purpose.
      </p>

      <h2>No professional advice</h2>
      <p>
        The calculators and content on this Site are for general informational and educational
        purposes only. They do not constitute financial, tax, legal, investment, or other
        professional advice, and should not be relied upon as such. Always consult a qualified
        professional before making financial decisions. See our{" "}
        <a href="/disclaimer/" className="text-ivy-600 underline">disclaimer</a> for more detail.
      </p>

      <h2>Accuracy and estimates</h2>
      <p>
        We work hard to keep our calculators accurate, but all results are estimates. We make no
        warranty that results are error-free, complete, or suitable for your specific situation.
        Figures from a lender, employer, tax authority, or advisor may differ.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {SITE.name} and its operators are not liable for
        any loss or damage arising from your use of, or reliance on, the Site or its results.
        The Site is provided &quot;as is&quot; without warranties of any kind.
      </p>

      <h2>Third-party and affiliate links</h2>
      <p>
        The Site may contain advertising and links to third-party websites. We are not
        responsible for the content, products, or practices of those third parties. Your
        interactions with them are solely between you and the third party.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Site after changes
        means you accept the revised Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email us at{" "}
        <a href={`mailto:${SITE.email}`} className="text-ivy-600 underline">{SITE.email}</a>.
      </p>
    </PageShell>
  );
}
