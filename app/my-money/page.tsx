import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import MyMoney from "./MyMoney";

// Personal page — har visitor ka alag (browser storage), isliye Google me index nahi.
export const metadata: Metadata = buildMetadata({
  title: "My Money — Your Saved Plans & Pinned Calculators",
  description: "Your pinned calculators and saved money plans in one place, stored privately on this device.",
  path: "/my-money/",
  noindex: true,
});

export default function Page() {
  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-ivy-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">My Money</span>
      </nav>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">My Money</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted">Your pinned calculators and saved plans — private, on this device, no account needed.</p>
        </div>
        <span className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-muted">
          Tip: press <kbd className="rounded border border-line bg-surface-2 px-1.5 font-mono text-xs">Ctrl</kbd> +{" "}
          <kbd className="rounded border border-line bg-surface-2 px-1.5 font-mono text-xs">D</kbd> to bookmark this page
        </span>
      </div>
      <MyMoney />
    </div>
  );
}
