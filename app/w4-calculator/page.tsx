import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, isReleased } from "@/lib/site";

export const metadata: Metadata = {
  title: "W-4 Withholding Calculator — HomeMoney Calc",
  description: "Fill out your W-4 correctly and estimate withholding per paycheck.",
};

export default function Page() {
  const tool = getTool("w4-calculator");
  if (!tool || !isReleased(tool)) notFound();
  
  return <div>W-4 Calculator — Coming Soon</div>;
}
