import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, isReleased } from "@/lib/site";

export const metadata: Metadata = {
  title: "FSA Calculator — HomeMoney Calc",
  description: "Calculate FSA contribution limits and tax savings per paycheck.",
};

export default function Page() {
  const tool = getTool("fsa-calculator");
  if (!tool || !isReleased(tool)) notFound();
  
  return <div>FSA Calculator — Coming Soon</div>;
}
