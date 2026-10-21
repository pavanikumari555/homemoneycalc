import Link from "next/link";
import { TOOLS } from "@/lib/site";

// Site header with logo + nav. Server component (no JS shipped = lighter/faster).
export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-ivy-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ivy-600 text-white">
            🌿
          </span>
          <span className="text-lg">
            Calc<span className="text-ivy-500">Ivy</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/" className="hover:text-ivy-700">
            Home
          </Link>
          {/* Show first 4 tools directly in nav for quick access + internal linking */}
          {TOOLS.slice(0, 4).map((t) => (
            <Link key={t.slug} href={`/${t.slug}/`} className="hover:text-ivy-700">
              {t.shortTitle}
            </Link>
          ))}
          <Link href="/about/" className="hover:text-ivy-700">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
