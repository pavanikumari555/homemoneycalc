import Link from "next/link";
import { SITE, CATEGORY_LABELS, ToolCategory, toolsIn } from "@/lib/site";
import Logo from "./Logo";

// Footer with tool links (internal linking = SEO juice) + legal pages (AdSense needs these).
export default function Footer() {
  const categories = Object.keys(CATEGORY_LABELS) as ToolCategory[];

  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Free money calculators with charts, plain-English results and shareable links.
              Everything runs in your browser — your numbers never leave your device.
            </p>
          </div>

          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="mb-3 text-sm font-semibold text-ink">{CATEGORY_LABELS[cat]}</h3>
              <ul className="space-y-2 text-sm text-muted">
                {toolsIn(cat).slice(0, 6).map((t) => (
                  <li key={t.slug}>
                    <Link href={`/${t.slug}/`} className="hover:text-ivy-600">
                      {t.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link href="/calculators/" className="hover:text-ivy-600">All calculators</Link></li>
            <li><Link href="/about/" className="hover:text-ivy-600">About</Link></li>
            <li><Link href="/methodology/" className="hover:text-ivy-600">Methodology</Link></li>
            <li><Link href="/editorial-policy/" className="hover:text-ivy-600">Editorial policy</Link></li>
            <li><Link href="/contact/" className="hover:text-ivy-600">Contact</Link></li>
            <li><Link href="/privacy-policy/" className="hover:text-ivy-600">Privacy</Link></li>
            <li><Link href="/terms/" className="hover:text-ivy-600">Terms</Link></li>
            <li><Link href="/disclaimer/" className="hover:text-ivy-600">Disclaimer</Link></li>
          </ul>
          <p className="text-xs">
            © {new Date().getFullYear()} {SITE.name}. Estimates for information only — not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
