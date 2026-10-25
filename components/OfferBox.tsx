import Link from "next/link";
import data from "@/data/offers.json";
import { BUILD_DATE } from "@/lib/site";

// ============================================================================
// OFFER BOX — affiliate offers + apne templates (data/offers.json). Google ad products nahi.
// Rules (docs/MONETIZATION.md): saaf "Partner" label + disclosure link, rel="sponsored",
// calculator inputs/buttons se door (explainer ke baad), sirf relevant tool + mahine pe.
// url khaali = box nahi dikhta — approval se pehle site pe kuch adhoora nahi dikhega.
// ============================================================================

interface Offer {
  id: string;
  kind: "affiliate" | "template";
  name: string;
  blurb: string;
  cta: string;
  url: string;
  tools: string[];
  months: number[];
}

const month = Number(BUILD_DATE.slice(5, 7)); // daily rebuild -> seasonal offers apne aap badalte

export default function OfferBox({ slug }: { slug: string }) {
  const offers = (data.offers as Offer[])
    .filter((o) => /^https:\/\//.test(o.url) && o.tools.includes(slug) && (!o.months.length || o.months.includes(month)))
    .slice(0, 2);
  if (!offers.length) return null;

  return (
    <aside className="no-print mt-10 max-w-3xl rounded-2xl border border-line bg-surface p-5" aria-label="Partner offers">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-semibold uppercase tracking-wider">Next step</span>
        <Link href="/advertising-disclosure/" className="underline underline-offset-2">
          Partner links — we may earn a commission
        </Link>
      </div>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {offers.map((o) => (
          <li key={o.id} className="rounded-xl border border-line bg-surface-2 p-4">
            <div className="text-xs text-muted">{o.kind === "template" ? "Our template" : "Partner offer"}</div>
            <div className="mt-0.5 font-semibold text-ink">{o.name}</div>
            <p className="mt-1 text-sm text-muted">{o.blurb}</p>
            <a href={`/go/${o.id}/`} target="_blank" rel="sponsored nofollow noopener" className="btn-primary mt-3 inline-flex py-1.5 text-sm">
              {o.cta} →
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
