import Link from "next/link";
import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Editorial Policy: How We Create & Review Content",
  description:
    "How HomeMoney Calc builds, checks and updates its calculators and guides, how we use AI tools, and how we keep our content independent and accurate.",
  path: "/editorial-policy/",
});

export default function Page() {
  return (
    <PageShell title="Editorial policy" intro="How we build, check and update everything on HomeMoney Calc.">
      <h2>Who is responsible</h2>
      <p>
        HomeMoney Calc is edited by founder <strong>Pavani Kumari</strong>, who directs editorial policy and review
        standards, alongside an in-house developer who maintains the financial formulas, automated regression tests,
        and primary source documentation. While we verify every formula against official government publications
        (such as IRS Publication 15-T and CFPB guidelines), our tools are designed for educational estimates and do
        not substitute for individualized CPA or fiduciary advice. You can send corrections through our <Link href="/contact/">contact page</Link>.
      </p>
      <h2>Accuracy first</h2>
      <p>
        We test formulas against worked examples and link the official sources used. A passing software test does not prove
        every tax rule is current or included. Older parameters, derived figures and omitted rules are labelled where relevant.
        Tax-source reviews have recorded dates and recurring reminders. We only change the page&apos;s &ldquo;Updated&rdquo; date
        when its content or calculation changes; source-change alerts alone do not automatically rewrite tax law.
      </p>

      <h2>How we use AI</h2>
      <p>
        We use software tools, including AI assistants, to help with research, to spot pages that need updating and to draft
        explanations. Changes go through the project&apos;s review and verification workflow; automatic reports are observations,
        not professional financial advice or proof of a legal change. We don&apos;t publish pages just to target search terms — each page has to do
        something useful.
      </p>

      <h2>Independence</h2>
      <p>
        Our calculators are currently free without active ads. Future advertising, affiliate links and sponsorships will be clearly disclosed. Partners have no say in our calculators,
        results or explanations, and they never change how a calculator works or what it shows. See our{" "}
        <Link href="/advertising-disclosure/">advertising disclosure</Link>.
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
