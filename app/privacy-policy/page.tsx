import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "CalcIvy's privacy policy: what data we collect, how cookies and advertising work, and your choices. Our calculators run in your browser and don't store your inputs.",
  path: "/privacy-policy/",
});

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" intro="Last updated: January 2026">
      <p>
        This Privacy Policy explains how {SITE.name} (&quot;we&quot;, &quot;us&quot;) handles information when you
        visit {SITE.domain}. We&apos;ve written it in plain language so it&apos;s easy to understand.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>Our calculators run entirely in your browser. The numbers you type are never sent to us or stored.</li>
        <li>We use privacy-respecting analytics to understand overall traffic, not to identify you.</li>
        <li>We show ads, and ad partners may use cookies as described below.</li>
        <li>We never sell your personal information.</li>
      </ul>

      <h2>Information we collect</h2>
      <p>
        <strong>Calculator inputs:</strong> Numbers you enter into any calculator are processed
        locally in your browser to show your result. They are not transmitted to our servers,
        logged, or stored by us.
      </p>
      <p>
        <strong>Usage data:</strong> Like most websites, our hosting and analytics tools may
        automatically receive standard information such as your browser type, device type,
        approximate region, referring page, and the pages you view. This helps us understand
        what&apos;s popular and improve the site. It is used in aggregate and not to personally
        identify you.
      </p>

      <h2>Cookies and advertising</h2>
      <p>
        {SITE.name} is supported by advertising. We may use Google AdSense and other advertising
        partners to display ads. These partners may use cookies and similar technologies to
        serve ads based on your prior visits to this and other websites.
      </p>
      <p>
        Google, as a third-party vendor, uses cookies to serve ads. Google&apos;s use of advertising
        cookies enables it and its partners to serve ads based on your visits to this site and
        other sites. You can opt out of personalized advertising by visiting Google&apos;s{" "}
        <a href="https://www.google.com/settings/ads" className="text-ivy-600 underline" rel="noopener noreferrer" target="_blank">
          Ads Settings
        </a>
        . You can also learn more about how advertising cookies work and opt out of some
        third-party vendors at{" "}
        <a href="https://www.aboutads.info" className="text-ivy-600 underline" rel="noopener noreferrer" target="_blank">
          aboutads.info
        </a>
        .
      </p>

      <h2>Your choices</h2>
      <p>
        You can control or delete cookies through your browser settings, and you can use your
        browser&apos;s private/incognito mode. Disabling cookies may affect how ads are shown but
        will not stop the calculators from working, since they don&apos;t rely on cookies.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        {SITE.name} is intended for a general audience and is not directed at children under 13.
        We do not knowingly collect personal information from children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. When we do, we&apos;ll revise the &quot;last
        updated&quot; date at the top of this page.
      </p>

      <h2>Contact</h2>
      <p>
        If you have any questions about this Privacy Policy, email us at{" "}
        <a href={`mailto:${SITE.email}`} className="text-ivy-600 underline">{SITE.email}</a>.
      </p>
    </PageShell>
  );
}
