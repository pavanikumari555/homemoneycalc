import Link from "next/link";
import { getRelatedTools } from "@/lib/site";
import Icon from "./Icon";

// Related tools = internal links (SEO) + more pageviews (more ad revenue).
export default function RelatedTools({ slug }: { slug: string }) {
  const related = getRelatedTools(slug, 3);
  if (!related.length) return null;

  return (
    <section className="mt-12" aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-4 text-2xl font-bold tracking-tight text-ink">
        Keep going
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((t) => (
          <Link key={t.slug} href={`/${t.slug}/`} className="card group transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ivy-50 text-ivy-700 dark:bg-ivy-900/40 dark:text-ivy-300">
              <Icon name={t.icon} />
            </span>
            <div className="mt-3 font-semibold text-ink group-hover:text-ivy-600">{t.shortTitle}</div>
            <p className="mt-1 text-sm text-muted">{t.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
