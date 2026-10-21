import Link from "next/link";
import { getRelatedTools } from "@/lib/site";

// Related tools = internal links (SEO) + more pageviews (more ad revenue).
export default function RelatedTools({ slug }: { slug: string }) {
  const related = getRelatedTools(slug, 3);
  if (!related.length) return null;

  return (
    <section className="mt-10" aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-4 text-2xl font-bold text-slate-900">
        Related Calculators
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((t) => (
          <Link
            key={t.slug}
            href={`/${t.slug}/`}
            className="card transition-shadow hover:shadow-md"
          >
            <div className="mb-2 text-2xl">{t.icon}</div>
            <div className="font-semibold text-slate-900">{t.shortTitle}</div>
            <p className="mt-1 text-sm text-slate-600">{t.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
