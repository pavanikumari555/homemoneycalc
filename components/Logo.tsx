// Brand mark: chhota ghar + "$" tile + wordmark. Pure SVG/text.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-ivy-500 to-ivy-700 text-white shadow-sm sm:h-9 sm:w-9">
        <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 9.5V20h13V9.5" />
          <path d="M14 11.5c-.4-.6-1.1-1-2-1-1.1 0-2 .6-2 1.5s.9 1.3 2 1.5 2 .6 2 1.5-.9 1.5-2 1.5c-.9 0-1.6-.4-2-1M12 9.5v1m0 6v1" strokeWidth="1.6" />
        </svg>
      </span>
      <span className="text-base font-extrabold tracking-tight text-ink sm:text-lg">
        HM<span className="text-ivy-600 dark:text-ivy-400"> Calc</span>
      </span>
    </span>
  );
}
