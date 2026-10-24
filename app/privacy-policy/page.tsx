import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How CalcIvy handles information: calculators run in your browser, saved plans stay on your device, plus analytics, affiliate links and your choices.",
  path: "/privacy-policy/",
});

// Keep this page true to how the site actually behaves. Change it whenever
// analytics, affiliate partners or any third-party script is added.
export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" intro="Last updated: October 25, 2026">
      <p>
        This Privacy Policy explains how {SITE.name} (&quot;we&quot;, &quot;us&quot;) handles information when you
        visit {SITE.domain}. We&apos;ve written it in plain language so it&apos;s easy to understand.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>Calculations run entirely in your browser. We don&apos;t have accounts, forms or a database that store your numbers.</li>
        <li>Plans you save, tools you pin and your last inputs are kept only in your own browser storage.</li>
        <li>Your numbers appear in the page address (URL) so results can be shared and bookmarked — see below.</li>
        <li>We may use analytics to understand overall traffic, configured so your calculator numbers aren&apos;t sent.</li>
        <li>Some pages include clearly labeled affiliate links. We never sell your personal information.</li>
      </ul>

      <h2>Information we collect</h2>
      <p>
        <strong>Calculator inputs:</strong> Numbers you enter are processed locally in your browser to show your result.
        We don&apos;t collect them into any account or database.
      </p>
      <p>
        <strong>Numbers in the page address:</strong> To make results shareable, the calculator writes your inputs into
        the URL (for example <code>?b=300000&amp;r=6.5</code>). Like any web address, it can be seen by our hosting
        provider when the page is loaded, saved in your browser history, and seen by anyone you share the link with.
        Don&apos;t share a link if you don&apos;t want others to see those numbers, and use &ldquo;Start fresh&rdquo; to clear them.
      </p>
      <p>
        <strong>Saved on your device:</strong> To remember your last numbers, the plans you choose to save, your pinned
        calculators and your light/dark preference, {SITE.name} uses your browser&apos;s local storage. This data stays on
        your device and is never sent to us. You can remove it with &ldquo;Start fresh&rdquo;, by deleting a saved plan, or by
        clearing your browser&apos;s site data.
      </p>
      <p>
        <strong>Usage data:</strong> Our hosting provider (Cloudflare) receives standard technical information such as
        IP address, browser type and the pages requested, to deliver and protect the site. If we use an analytics tool
        such as Google Analytics, it receives similar information (pages viewed, approximate region, device type,
        referring site). We configure it so the numbers in calculator URLs are not sent, and we use the data only in
        aggregate.
      </p>

      <h2>Affiliate links</h2>
      <p>
        Some calculators suggest a relevant next step, such as a budgeting app or a loan comparison service. If you
        click one of these links and sign up or buy, we may earn a commission at no extra cost to you. These links are
        labeled, and they never change how a calculator works or what it shows. When you leave our site, the other
        company&apos;s privacy policy applies. Read more in our{" "}
        <Link href="/advertising-disclosure/">advertising disclosure</Link>.
      </p>

      <h2>Cookies</h2>
      <p>
        {SITE.name} itself doesn&apos;t need cookies to work. Analytics tools and affiliate partners may set cookies to
        count visits or to credit a referral. You can block or delete cookies in your browser settings or use
        private/incognito mode; the calculators will keep working.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        {SITE.name} is intended for a general audience and is not directed at children under 13. We do not knowingly
        collect personal information from children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. When we do, we&apos;ll revise the &quot;last updated&quot; date at the
        top of this page.
      </p>

      <h2>Contact</h2>
      <p>
        If you have any questions about this Privacy Policy, email us at{" "}
        <a href={`mailto:${SITE.email}`} className="text-ivy-600 underline">
          {SITE.email}
        </a>
        .
      </p>
    </PageShell>
  );
}
