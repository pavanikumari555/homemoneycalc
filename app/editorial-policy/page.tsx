import Link from "next/link";
import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Editorial Policy: How We Create & Review Content",
  description:
    "How CalcIvy builds, checks and updates its calculators and guides, how we use AI tools, and how we keep our content independent and accurate.",
  path: "/editorial-policy/",
});

export default function Page() {
  return (
    <PageShell title="Editorial policy" intro="How we build, check and update everything on CalcIvy.">
      <h2>Accuracy first</h2>
      <p>
        Every calculator is tested against worked examples before it is published, and every tax figure is checked against the
        official source linked on the page. When a figure changes — for example, new tax brackets each year — we update the
        calculator and the &ldquo;Updated&rdquo; date on the page. We only change that date when the content actually changes.
      </p>

      <h2>How we use AI</h2>
      <p>
        We use software tools, including AI assistants, to help with research, to spot pages that need updating and to draft
        explanations. A person reviews every change before it goes live: formulas are tested, numbers are checked against sources,
        and the writing is edited for clarity. We don&apos;t publish pages just to target search terms — each page has to do
        something useful.
      </p>

      <h2>Independence</h2>
      <p>
        CalcIvy is free because of advertising. Advertisers have no say in our calculators, results or explanations. If we ever
        include affiliate links, they will be clearly labeled, and they will never change how a calculator works or what it shows.
      </p>

      <h2>Not financial advice</h2>
      <p>
        Our tools and guides are educational and give estimates. They don&apos;t know your full situation. For important
        decisions, talk to a qualified professional. See our <Link href="/disclaimer/">disclaimer</Link>.
      </p>

      <h2>Corrections</h2>
      <p>
        Found something wrong? <Link href="/contact/">Contact us</Link> with the page and what you expected. We review every
        report and fix confirmed errors promptly.
      </p>

      <h2>Methodology</h2>
      <p>
        The formulas and data behind each tool are described on our <Link href="/methodology/">methodology page</Link>.
      </p>
    </PageShell>
  );
}
