import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool, isReleased } from "@/lib/site";

export const metadata: Metadata = {
  title: "RAP Student Loan Calculator — HomeMoney Calc",
  description: "Estimate monthly payments under the Repayment Assistance Plan (RAP).",
};

export default function Page() {
  const tool = getTool("rap-student-loan-calculator");
  if (!tool || !isReleased(tool)) notFound();
  
  return <div>RAP Calculator — Coming Soon</div>;
}
