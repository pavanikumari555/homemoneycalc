import Link from "next/link";
import { TOOLS } from "@/lib/site";
import Icon from "@/components/Icon";

// Custom 404 — keeps users on the site with links to popular tools (reduces bounce).
export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <div className="text-6xl">🌿</div>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Try one of our
        calculators instead:
      </p>
      <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-3">
        {TOOLS.slice(0, 4).map((t) => (
          <Link
            key={t.slug}
            href={`/${t.slug}/`}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink/80 hover:border-ivy-400"
          >
            <Icon name={t.icon} className="h-4 w-4 text-ivy-600" /> {t.shortTitle}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/" className="btn-primary">Back to home</Link>
      </div>
    </div>
  );
}
