import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, isReleased } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trump Account Calculator — HomeMoney Calc",
  description: "Calculate Trump Account (MAGA Account) growth with federal seed and family contributions.",
};

export default function Page() {
  const tool = getTool("trump-account-calculator");
  if (!tool || !isReleased(tool)) notFound();
  
  return <div>Trump Account Calculator — Coming Soon</div>;
}
