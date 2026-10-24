import { FaqItem } from "./StructuredData";

// Accessible FAQ list using native <details> (no JS needed = lighter).
export default function FaqSection({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-12 max-w-3xl" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-4 text-2xl font-bold tracking-tight text-ink">
        Frequently asked questions
      </h2>
      <div className="space-y-3">
        {items.map((f, i) => (
          <details key={i} className="group rounded-2xl border border-line bg-surface p-4 open:shadow-soft">
            <summary className="cursor-pointer list-none font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {f.question}
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-ivy-600 transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-ink/80">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
