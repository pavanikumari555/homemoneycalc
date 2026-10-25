import { TOOLS, getTool } from "@/lib/site";
import { ogCard } from "@/lib/ogCard";

// Har tool ka apna share image: /og/<slug>.png — card pe tool ka naam + asli example result.
// Share pe "$75,000 salary → $2,081 per paycheck" dikhna generic image se zyada click laata hai.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ img: `${t.slug}.png` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ img: string }> }) {
  const { img } = await params;
  const tool = getTool(img.replace(/\.png$/, ""))!;
  return ogCard({ title: tool.title, line: `${tool.example.input} → ${tool.example.output}`, footer: "Free · no sign-up · works on your phone" });
}
