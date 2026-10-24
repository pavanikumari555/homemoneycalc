import Link from "next/link";
import { Tool, isNewTool } from "@/lib/site";
import Icon from "./Icon";

// One tool card, used on the home page and /calculators/. Saari info registry
// (lib/site.ts) se aati hai, isliye naya tool add karne pe card khud ban jaata hai.
export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/${tool.slug}/`}
      className="card group flex flex-col transition hover:-translate-y-1 hover:border-ivy-300 hover:shadow-lift dark:hover:border-ivy-700"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ivy-600 text-white shadow-sm transition group-hover:scale-105">
          <Icon name={tool.icon} />
        </span>
        <h3 className="text-lg font-bold leading-snug text-ink group-hover:text-ivy-700 dark:group-hover:text-ivy-300">{tool.shortTitle}</h3>
        {isNewTool(tool) && (
          <span className="ml-auto rounded-full bg-sun-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sun-600 dark:bg-sun-600/15 dark:text-sun-300">
            New
          </span>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{tool.blurb}</p>

      <div className="mt-4 rounded-xl border border-dashed border-ivy-200 bg-ivy-50/60 p-3 dark:border-ivy-800 dark:bg-ivy-900/20">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Example</div>
        <div className="mt-1 text-sm text-ink/80">{tool.example.input}</div>
        <div className="mt-0.5 flex items-center gap-1.5 font-bold text-ivy-700 dark:text-ivy-300">
          <Icon name="arrow" className="h-4 w-4 shrink-0" />
          {tool.example.output}
        </div>
      </div>

      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-ivy-600 dark:text-ivy-400">
        Try it free <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
