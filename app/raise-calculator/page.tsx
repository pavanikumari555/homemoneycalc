import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, isReleased } from "@/lib/site";

export const metadata: Metadata = {
  title: "Raise Calculator — HomeMoney Calc",
  description: "See the after-tax value of a pay raise in your state.",
};

export default function Page() {
  const tool = getTool("raise-calculator");
  if (!tool || !isReleased(tool)) notFound();
  
  return <div>Raise Calculator — Coming Soon</div>;
}
