import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, CATEGORY_LABELS, ToolCategory, toolsIn } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import ToolCard from "@/components/ToolCard";
import ToolSearch from "@/components/ToolSearch";

export const metadata: Metadata = buildMetadata({
  title: "All Calculators — Free Money & Everyday Calculators",
  description: `Browse all ${TOOLS.length} free HomeMoney Calc calculators: pay and salary, loans and debt, savings and everyday math. Charts, share links, no sign-up.`,
  path: "/calculators/",
});

const categories = (Object.keys(CATEGORY_LABELS) as ToolCategory[]).filter((c) => toolsIn(c).length > 0);

// Full directory of every tool, grouped by category. Registry se auto-generate
// hota hai — 10 tools ho ya 200, ye page khud sambhal leta hai.
export default function Page() {
  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-ivy-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">All calculators</span>
      </nav>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">All calculators</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">
        {TOOLS.length} free calculators, each with a chart, a plain-English answer and a link you can share.
      </p>

      <div className="mt-6 max-w-xl">
        <ToolSearch />
      </div>

      <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <a key={cat} href={`#${cat}`} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:border-ivy-400">
            {CATEGORY_LABELS[cat]} <span className="text-muted">({toolsIn(cat).length})</span>
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-12">
        {categories.map((cat) => (
          <section key={cat} id={cat} aria-labelledby={`${cat}-heading`} className="scroll-mt-24">
            <h2 id={`${cat}-heading`} className="mb-4 text-2xl font-bold tracking-tight text-ink">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {toolsIn(cat).map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
