import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
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

      <h2>Reporting a calculation error</h2>
      <p>
        If a result looks wrong, the fastest way to get it fixed is to send us the page link (use the
        &ldquo;Share result&rdquo; button so your exact numbers are included), the number you expected, and where
        that number came from — for example your pay stub, lender statement or an official IRS or state
        table. We check every report against the official source and update the calculator and its
        &ldquo;Updated&rdquo; date when we confirm a mistake.
      </p>

      <h2>Suggesting a new calculator</h2>
      <p>
        Tell us what you were trying to work out and what other tools got wrong or left out. Many of our
        calculators started as a reader question.
      </p>

      <h2>Response time</h2>
      <p>
        We&apos;re a small team, so replies may take a little longer during busy periods. Corrections
        to our calculators are always prioritized — accuracy matters to us.
      </p>
    </PageShell>
  );
}
