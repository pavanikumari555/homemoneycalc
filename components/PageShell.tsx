import Link from "next/link";

// Simple wrapper for content pages (about, legal). Consistent heading + breadcrumb.
export default function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-ivy-700">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{title}</span>
      </nav>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>
      {intro && <p className="mt-3 max-w-2xl text-lg text-slate-600">{intro}</p>}
      <article className="prose-content mt-8 max-w-none">{children}</article>
    </div>
  );
}
