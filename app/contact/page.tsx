import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = buildMetadata({
  title: "Contact CalcIvy",
  description:
    "Get in touch with CalcIvy. Questions, corrections, or calculator suggestions are always welcome — email us and we'll get back to you.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <PageShell
      title="Contact Us"
      intro="Questions, feedback, or a calculator idea? We'd love to hear from you."
    >
      <h2>Email us</h2>
      <p>
        The best way to reach {SITE.name} is by email. We read every message and aim to reply
        within a couple of business days.
      </p>
      <p>
        <a href={`mailto:${SITE.email}`} className="text-ivy-600 underline text-lg font-semibold">
          {SITE.email}
        </a>
      </p>

      <h2>What we can help with</h2>
      <ul>
        <li>Reporting a calculation that looks wrong, so we can check and fix it.</li>
        <li>Suggesting a new calculator you&apos;d find useful.</li>
        <li>Questions about how a specific tool works.</li>
        <li>Advertising, partnership, or press enquiries.</li>
      </ul>

      <h2>What we can&apos;t do</h2>
      <p>
        Please note that {SITE.name} provides tools and general information only. We can&apos;t give
        personalized financial, tax, legal, or investment advice, and we can&apos;t access or change
        any account you hold with a bank or lender. For advice specific to your situation,
        please consult a qualified professional.
      </p>

      <h2>Response time</h2>
      <p>
        We&apos;re a small team, so replies may take a little longer during busy periods. Corrections
        to our calculators are always prioritized — accuracy matters to us.
      </p>
    </PageShell>
  );
}
