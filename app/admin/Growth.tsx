// ============================================================================
// ADMIN: Growth ideas (daily agent ki `ideas` section) + owner ka weekly SEO routine.
// Sab suggestions hain — agent kuch post/send nahi karta, owner khud karti hai.
// Detail: docs/SEO-ROUTINE.md
// ============================================================================

// Report JSON is written by our own agent script, so it's typed loosely here.
type Json = any;

function Box({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  );
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function GrowthIdeas({ ideas, bing }: { ideas: Json; bing?: Json }) {
  return (
    <>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Box title="Title tests (high impressions, low CTR)">
          {ideas.titleTests?.length ? (
            <ul className="space-y-4 text-sm">
              {ideas.titleTests.map((t: Json) => (
                <li key={t.page}>
                  <div className="font-medium text-ink">{t.page}</div>
                  <div className="text-xs text-muted">
                    CTR {pct(t.ctr)} vs ~{pct(t.expectedCtr)} expected at #{t.position.toFixed(1)} · {t.impressions.toLocaleString("en-US")} impr.
                    {t.topQuery ? ` · top query “${t.topQuery}”` : ""}
                  </div>
                  {t.currentTitle && <div className="mt-1 text-xs text-muted line-through">{t.currentTitle}</div>}
                  <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-ink">
                    {t.ideas.map((i: string) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ol>
                </li>
              ))}
              <li className="text-xs text-muted">Ek title chuno, Claude se PR banwao, 4 hafte baad CTR compare karo. Ek baar me ek hi page badlo.</li>
            </ul>
          ) : (
            <p className="text-sm text-muted">Koi page abhi “kam CTR” wala nahi (ya Search Console ka data abhi kam hai).</p>
          )}
        </Box>

        <Box title="Season alerts & content refresh">
          <ul className="space-y-3 text-sm">
            {(ideas.refresh ?? []).map((f: Json) => (
              <li key={f.slug} className="flex gap-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${f.priority === "high" ? "bg-red-500" : "bg-sun-400"}`} />
                <span>
                  <span className="font-medium text-ink">{f.slug}</span> — {f.reason}
                </span>
              </li>
            ))}
            {(ideas.seasonal ?? []).map((s: Json) => (
              <li key={s.name} className="flex gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ivy-500" />
                <span>
                  <span className="font-medium text-ink">{s.name}</span>{" "}
                  <span className="text-xs text-muted">
                    ({s.starts} → {s.ends}, {s.status})
                  </span>
                  <br />
                  {s.idea} <span className="text-xs text-muted">Tools: {s.tools.join(", ")}</span>
                </span>
              </li>
            ))}
            {!ideas.refresh?.length && !ideas.seasonal?.length && <li className="text-muted">Abhi koi alert nahi.</li>}
          </ul>
        </Box>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Box title="Keyword gap (competitors have, we don't)">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(ideas.keywordGap?.missingTopics ?? []).slice(0, 14).map((k: Json) => (
              <span key={k.slug} className="rounded-full border border-line px-2.5 py-1 text-ink" title={`Seen on: ${k.seenOn.join(", ")}`}>
                {k.keyword}
              </span>
            ))}
          </div>
          {ideas.keywordGap?.unservedQueries?.length > 0 && (
            <>
              <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Searches reaching us with no matching tool</div>
              <ul className="mt-1 divide-y divide-line text-sm">
                {ideas.keywordGap.unservedQueries.map((q: Json) => (
                  <li key={q.query} className="flex justify-between gap-3 py-1">
                    <span className="text-ink">{q.query}</span>
                    <span className="tabular-nums text-muted">{q.impressions} impr.</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-3 text-xs text-muted">Volumes verified nahi hain — roadmap me daalne se pehle Keyword Planner / Search Console me check karo. List: data/competitor-topics.json</p>
        </Box>

        <Box title={`Pinterest & Shorts idea — ${ideas.social?.tool ?? ""}`}>
          {ideas.social ? (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">Pin · board “{ideas.social.pinterest.board}”</div>
                <div className="font-medium text-ink">{ideas.social.pinterest.title}</div>
                <p className="text-muted">{ideas.social.pinterest.description}</p>
                <p className="text-xs text-muted">{ideas.social.pinterest.design}</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">YouTube Short</div>
                <div className="font-medium text-ink">Hook: {ideas.social.shorts.hook}</div>
                <ol className="list-decimal pl-5 text-muted">
                  {ideas.social.shorts.beats.map((b: string) => (
                    <li key={b}>{b}</li>
                  ))}
                </ol>
                <p className="text-xs text-muted">{ideas.social.shorts.cta}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">—</p>
          )}
        </Box>
      </div>

      {ideas.outreach?.length > 0 && (
        <Box title="Outreach drafts — you send, by hand" className="mt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {ideas.outreach.map((o: Json) => (
              <details key={o.subject} className="rounded-xl border border-line p-3 text-sm">
                <summary className="cursor-pointer">
                  <span className="font-medium text-ink">{o.subject}</span>
                  <div className="text-xs text-muted">To: {o.to}</div>
                </summary>
                <textarea readOnly rows={12} aria-label="Email draft" defaultValue={o.body} className="mt-2 w-full rounded-lg border border-line bg-surface-2 p-2 font-mono text-xs text-ink" />
                <p className="mt-1 text-xs text-sun-700 dark:text-sun-300">⚠ {o.rules}</p>
              </details>
            ))}
          </div>
        </Box>
      )}

      {bing?.topQueries?.length > 0 && (
        <Box title={`Bing (28d) — ${bing.totals.clicks.toLocaleString("en-US")} clicks, ${bing.totals.impressions.toLocaleString("en-US")} impressions`} className="mt-6">
          <ul className="grid gap-x-6 divide-y divide-line text-sm md:grid-cols-2 md:divide-y-0">
            {bing.topQueries.map((q: Json) => (
              <li key={q.query} className="flex justify-between gap-3 py-1">
                <span className="truncate text-ink">{q.query}</span>
                <span className="shrink-0 tabular-nums text-muted">
                  {q.clicks} clicks · {q.impressions} impr.
                </span>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </>
  );
}

// Owner (bhabhi) ka hafte ka SEO kaam — har din ~30-45 minute. Detail + "kyun": docs/SEO-ROUTINE.md
const ROUTINE: [string, string][] = [
  ["Mon", "Admin panel padho. Agent ke PRs review karo — numbers official source se milao, tab hi merge."],
  ["Tue", "Reddit/Quora pe 2 genuine jawab jahan calculator sach me madad kare. Apni baat poori likho, link sirf jab zaroori ho, “I made this” bata do, subreddit rules follow."],
  ["Wed", "Journalist platforms (Qwoted, Featured.com, SourceBottle): 2-3 relevant sawaal ka jawab, jaldi aur ek unique number ke saath."],
  ["Thu", "Outreach: admin ke drafts se 3-5 personalized emails bloggers/teachers ko (state data study, embed widget). Ek-ek karke."],
  ["Fri", "Pinterest: 2 pins, YouTube: 1 Short — admin ka aaj ka idea use karo."],
  ["Monthly", "1-2 genuine tool directories / resource pages, Search Console ‘Pages’ report check, data/revenue.json update."],
];

const NEVER = ["Links kharidna / bechna", "Link exchange, PBN, guest-post farms", "Mass AI pages", "Fake reviews ya fake traffic", "Apne affiliate links khud click karna / dosto se karwana"];

export function SeoRoutine() {
  return (
    <Box title="Your weekly SEO routine (human work)" className="mt-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <ul className="space-y-2 text-sm lg:col-span-2">
          {ROUTINE.map(([day, task]) => (
            <li key={day} className="flex gap-3">
              <span className="w-16 shrink-0 font-semibold text-ivy-700 dark:text-ivy-400">{day}</span>
              <span className="text-ink">{task}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-red-300/60 bg-red-50 p-3 text-sm dark:border-red-500/30 dark:bg-red-500/10">
          <div className="font-bold text-red-700 dark:text-red-300">Kabhi nahi (Google penalty)</div>
          <ul className="mt-1 list-disc pl-5 text-red-700/90 dark:text-red-300/90">
            {NEVER.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </Box>
  );
}
