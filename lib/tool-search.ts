type SearchableTool = { title: string; blurb: string; keywords: string };
/** All search entry points share the same whitespace-token matching. */
export function searchTools<T extends SearchableTool>(tools: readonly T[], query: string, limit = 8): T[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return tools.filter(t => {
    const text = [t.title, t.blurb, t.keywords].join(" ").toLowerCase();
    return words.every(word => text.includes(word));
  }).slice(0, limit);
}
