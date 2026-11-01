import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import PageShell from "@/components/PageShell";
import AuthorSchema from "@/components/AuthorSchema";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn about HomeMoney Calc — free, fast, accurate money calculators that help people make clearer money decisions, with no sign-up required.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <>
      <AuthorSchema />
      <PageShell
        title="About HomeMoney Calc"
        intro="Free, fast, and honest financial calculators — built to help you make clearer money decisions."
      >
      <h2>Our mission</h2>
      <p>
        {SITE.name} exists to make everyday financial math simple. Questions like &quot;what will
        my paycheck actually be?&quot;, &quot;how fast can I pay off this debt?&quot;, or &quot;how much will my
        savings grow?&quot; shouldn&apos;t require a spreadsheet or a finance degree. We build clean,
        accurate calculators that give you a clear answer in seconds — free, and with no
        account needed.
      </p>

      <h2>How we build our calculators</h2>
      <p>
        Every tool on this site uses standard, widely accepted financial formulas — the same
        amortization, tax, and compounding math used by banks and lenders. We test each
        calculator against known worked examples before publishing it, and every tool includes
        a plain-English explanation of how it reaches its result, so you can understand and
        trust the number.
      </p>
      <p>
        Our calculators do the math entirely in your browser — there are no accounts and no forms
        that send your numbers to us. Your inputs do appear in the page address (that&apos;s what makes
        share links work), so they can show up in our host&apos;s standard request logs; our{" "}
        <a href="/privacy-policy/">privacy policy</a> explains exactly what is and isn&apos;t collected.
      </p>

      <h2>Our commitment to accuracy and honesty</h2>
      <p>
        We treat accuracy seriously. Where a calculation depends on rules that change — like tax
        brackets — we tell you which year&apos;s figures we use. Where a result is an estimate, we
        say so clearly. We will never present a projection as a guarantee, and we always
        recommend confirming important decisions with a qualified professional.
      </p>

      <h2>Who is behind HomeMoney Calc?</h2>
      <p>
        {SITE.name} is founded and edited by <strong>Pavani Kumari</strong>, who oversees editorial direction,
        tax parameter research, and calculator accuracy standards. Tool algorithms, formulas, and regression
        testing are developed and maintained in-house. We are an independent, family-run financial education
        resource — not a bank, lender, or financial advisor, and we never sell your personal data.
      </p>
      <p>
        Our tools are engineered to give everyday users instant, clear answers to complicated money questions.
        Every calculator is verified against published IRS guidance, Federal Reserve data, or statutory amortization math.
        Learn more about our standards in our <a href="/editorial-policy/">editorial policy</a>.
      </p>

      <h2>Get in touch</h2>
      <p>
        Have a question, a correction, or an idea for a calculator you&apos;d like us to build? We&apos;d
        genuinely like to hear it. Reach us any time at{" "}
        <a href={`mailto:${SITE.email}`} className="text-ivy-600 underline">{SITE.email}</a>{" "}
        or through our <a href="/contact/" className="text-ivy-600 underline">contact page</a>.
      </p>
      </PageShell>
    </>
  );
}
