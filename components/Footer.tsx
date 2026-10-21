import Link from "next/link";
import { SITE, TOOLS, CATEGORY_LABELS, ToolCategory } from "@/lib/site";

// Footer with tool links (internal linking = SEO juice) + legal pages (AdSense needs these).
export default function Footer() {
  const categories = Object.keys(CATEGORY_LABELS) as ToolCategory[];

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-2 font-bold text-ivy-700">
              Calc<span className="text-ivy-500">Ivy</span>
            </div>
            <p className="text-sm text-slate-600">
              Free, fast financial calculators. No sign-up, instant results, updated for {new Date().getFullYear()}.
            </p>
          </div>

          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                {CATEGORY_LABELS[cat]}
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {TOOLS.filter((t) => t.category === cat).map((t) => (
                  <li key={t.slug}>
                    <Link href={`/${t.slug}/`} className="hover:text-ivy-700">
                      {t.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Company</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/about/" className="hover:text-ivy-700">About</Link></li>
              <li><Link href="/contact/" className="hover:text-ivy-700">Contact</Link></li>
              <li><Link href="/privacy-policy/" className="hover:text-ivy-700">Privacy Policy</Link></li>
              <li><Link href="/terms/" className="hover:text-ivy-700">Terms of Service</Link></li>
              <li><Link href="/disclaimer/" className="hover:text-ivy-700">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All results are estimates for informational
            purposes only and are not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
