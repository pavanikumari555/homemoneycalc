// Brand mark: ivy leaf inside a rounded tile + wordmark. Pure SVG/text.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-ivy-500 to-ivy-700 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 18c0-7 5-12 13-12 0 8-5 13-12 13" />
          <path d="M6 18 13 11" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink">
        Calc<span className="text-ivy-600 dark:text-ivy-400">Ivy</span>
      </span>
    </span>
  );
}
