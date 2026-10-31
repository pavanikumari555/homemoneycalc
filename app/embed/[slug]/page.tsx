import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { SITE, getTool, isReleased } from "@/lib/site";
import AgeCalculator from "@/app/age-calculator/AgeCalculator";
import AutoLoanCalculator from "@/app/auto-loan-calculator/AutoLoanCalculator";
import CompoundCalculator from "@/app/compound-interest-calculator/CompoundCalculator";
import CreditCardCalculator from "@/app/credit-card-payoff-calculator/CreditCardCalculator";
import DebtCalculator from "@/app/debt-payoff-calculator/DebtCalculator";
import MortgageCalculator from "@/app/mortgage-payoff-calculator/MortgageCalculator";
import PaycheckCalculator from "@/app/paycheck-calculator/PaycheckCalculator";
import PercentageCalculator from "@/app/percentage-calculator/PercentageCalculator";
import SalaryCalculator from "@/app/salary-to-hourly-calculator/SalaryCalculator";
import TipCalculator from "@/app/tip-calculator/TipCalculator";
import OvertimeDeductionCalculator from "@/app/no-tax-on-overtime-calculator/OvertimeDeductionCalculator";
import TipsDeductionCalculator from "@/app/no-tax-on-tips-calculator/TipsDeductionCalculator";
import OvertimeCalculator from "@/app/overtime-calculator/OvertimeCalculator";
import CarLoanDeductionCalculator from "@/app/car-loan-interest-deduction-calculator/CarLoanDeductionCalculator";
import SeniorDeductionCalculator from "@/app/senior-deduction-calculator/SeniorDeductionCalculator";
import ColaCalculator from "@/app/social-security-cola-calculator/ColaCalculator";
import HsaCalculator from "@/app/hsa-calculator/HsaCalculator";
import BonusCalculator from "@/app/bonus-tax-calculator/BonusCalculator";
import HolidayBudgetCalculator from "@/app/holiday-budget-calculator/HolidayBudgetCalculator";

// ============================================================================
// EMBED WIDGET — bloggers apni site pe <iframe> se calculator laga sakte hain.
// Sirf calculator + chhota "Powered by" link (brand naam, nofollow — Google ke
// widget-link rules ke hisaab se safe). Page noindex hai, asli page canonical hai.
// Naya tool embed karna ho to bas neeche WIDGETS me jod do.
// ============================================================================
const WIDGETS: Record<string, ComponentType> = {
  "paycheck-calculator": PaycheckCalculator,
  "salary-to-hourly-calculator": SalaryCalculator,
  "mortgage-payoff-calculator": MortgageCalculator,
  "debt-payoff-calculator": DebtCalculator,
  "credit-card-payoff-calculator": CreditCardCalculator,
  "auto-loan-calculator": AutoLoanCalculator,
  "compound-interest-calculator": CompoundCalculator,
  "percentage-calculator": PercentageCalculator,
  "tip-calculator": TipCalculator,
  "age-calculator": AgeCalculator,
  "no-tax-on-overtime-calculator": OvertimeDeductionCalculator,
  "no-tax-on-tips-calculator": TipsDeductionCalculator,
  "overtime-calculator": OvertimeCalculator,
  "car-loan-interest-deduction-calculator": CarLoanDeductionCalculator,
  "senior-deduction-calculator": SeniorDeductionCalculator,
  "social-security-cola-calculator": ColaCalculator,
  "hsa-calculator": HsaCalculator,
  "bonus-tax-calculator": BonusCalculator,
  "holiday-budget-calculator": HolidayBudgetCalculator,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(WIDGETS)
    .filter((slug) => {
      const t = getTool(slug);
      return t && isReleased(t);
    })
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  return {
    title: `${tool?.title ?? "Calculator"} (embed) | ${SITE.name}`,
    robots: { index: false, follow: true }, // noindex hi kaafi — canonical saath dena Google ko mixed signal
  };
}

export default async function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  const Widget = WIDGETS[slug];
  if (!tool || !Widget) notFound();

  return (
    <div className="embed-root p-3 sm:p-4">
      {/* iframe me site ka header/footer/install prompt nahi chahiye */}
      <style>{`body>header,body>footer,[data-install-prompt]{display:none!important}`}</style>
      <Widget />
      <p className="mt-3 text-center text-xs text-muted">
        Powered by{" "}
        <a href={`${SITE.url}/${slug}/`} target="_blank" rel="noopener" className="font-semibold text-ivy-700 underline dark:text-ivy-400">
          {SITE.name}
        </a>
      </p>
    </div>
  );
}
