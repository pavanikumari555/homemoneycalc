import { FaqItem } from "./StructuredData";

// Accessible FAQ list using native <details> (no JS needed = lighter).
// Content also fed to FaqSchema separately for the rich snippet.
export default function FaqSection({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-10" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-4 text-2xl font-bold text-slate-900">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {items.map((f, i) => (
          <details
            key={i}
            className="group rounded-lg border border-slate-200 bg-white p-4"
          >
            <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:content-none">
              <span className="flex items-center justify-between">
                {f.question}
                <span className="ml-2 text-ivy-600 transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-slate-700">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
