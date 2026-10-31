import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, isReleased } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tax Refund Estimator 2026 — HomeMoney Calc",
  description: "Estimate your 2026 federal tax refund with new deductions.",
};

export default function Page() {
  const tool = getTool("tax-refund-calculator");
  if (!tool || !isReleased(tool)) notFound();
  
  return <div>Tax Refund Calculator — Coming Soon</div>;
}
