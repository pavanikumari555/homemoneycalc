import { SITE, TOOLS } from "@/lib/site";
import { ogCard } from "@/lib/ogCard";

// Site ka default share image — WhatsApp/Facebook/X pe home ya info page ka link daalo to yahi.
// Build ke waqt ek baar out/og.png ban jaata hai (static export), koi server nahi.
export const dynamic = "force-static";

export function GET() {
  return ogCard({ title: SITE.tagline, line: "Paycheck, mortgage, debt, savings — answers in plain English.", footer: `${TOOLS.length} free calculators · no sign-up` });
}
