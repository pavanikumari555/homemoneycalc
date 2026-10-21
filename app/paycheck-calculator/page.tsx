import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/site";
import { ToolSchema, FaqSchema, BreadcrumbSchema, FaqItem } from "@/components/StructuredData";
import FaqSection from "@/components/FaqSection";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import PaycheckCalculator from "./PaycheckCalculator";

const SLUG = "paycheck-calculator";
const tool = getTool(SLUG)!;
const PATH = `/${SLUG}/`;

export const metadata: Metadata = buildMetadata({
  title: "Take-Home Paycheck Calculator (2024) — Net Pay After Taxes",
  description:
    "Free take-home paycheck calculator. Estimate your net pay after federal income tax, Social Security, Medicare, and state tax. Works for weekly, biweekly, and monthly pay.",
  path: PATH,
  keywords: [
    "paycheck calculator",
    "take home pay calculator",
    "net pay calculator",
    "salary after tax",
    "how much will my paycheck be",
  ],
});

const faqs: FaqItem[] = [
  {
    question: "How is my take-home pay calculated?",
    answer:
      "Your take-home (net) pay is your gross salary minus federal income tax, Social Security (6.2%), Medicare (1.45%), any state income tax, and pre-tax deductions such as 401(k) contributions or health insurance premiums. This calculator applies the 2024 federal tax brackets and standard deduction, then subtracts each item to estimate what actually lands in your bank account.",
  },
  {
    question: "Why is my paycheck smaller than my salary divided by 12?",
    answer:
      "Because taxes and deductions come out first. Federal income tax, Social Security, and Medicare are withheld from every paycheck, and many people also have state tax and pre-tax benefits deducted. Together these can reduce a paycheck by 20% to 35% or more, so your net pay is noticeably lower than your gross salary split evenly.",
  },
  {
    question: "Does this calculator include state taxes?",
    answer:
      "It includes state income tax as a flat percentage you enter yourself, because rates vary widely by state — from 0% in states like Texas and Florida to over 10% in states like California. For a precise figure, enter your state's effective rate, which you can find on your state's department of revenue website.",
  },
  {
    question: "What are pre-tax deductions and how do they help?",
    answer:
      "Pre-tax deductions are amounts taken from your gross pay before income tax is calculated, such as traditional 401(k) contributions and many health insurance premiums. Because they lower your taxable income, they reduce the tax you owe — so contributing to a 401(k), for example, costs you less in take-home pay than the amount you actually save.",
  },
  {
    question: "Is this calculator accurate for my exact situation?",
    answer:
      "It gives a solid estimate using standard federal rules, but your real withholding depends on your W-4 elections, additional withholding, local city taxes, and credits that this tool doesn't model. Treat the result as a planning estimate and check your actual pay stub or a tax professional for precise numbers.",
  },
];

export default function Page() {
  return (
    <>
      <ToolSchema name={tool.title} description={tool.blurb} path={PATH} />
      <FaqSchema items={faqs} />
      <BreadcrumbSchema toolName={tool.shortTitle} path={PATH} />

      <div className="container-page py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
          <Link href="/" className="hover:text-ivy-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{tool.shortTitle}</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Take-Home Paycheck Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Find out what actually lands in your bank account. Enter your salary and this tool
          estimates your net pay after federal tax, Social Security, Medicare, and state tax.
        </p>

        <AdSlot />

        {/* Calculator */}
        <div className="mt-6">
          <PaycheckCalculator />
        </div>

        <AdSlot />

        {/* How it works — unique, useful content (SEO + AdSense quality) */}
        <article className="prose-content mt-10 max-w-none">
          <h2>How this paycheck calculator works</h2>
          <p>
            When you get paid, the number on your offer letter (your gross salary) is not
            the number that reaches your bank account. Several deductions come out first.
            This calculator estimates each one and shows you the realistic take-home amount
            for each paycheck.
          </p>
          <p>Here is the order the math follows:</p>
          <ul>
            <li>
              <strong>Pre-tax deductions</strong> come out first (for example, a traditional
              401(k) or certain health premiums). These lower your taxable income.
            </li>
            <li>
              <strong>Federal income tax</strong> is calculated on your income after the
              standard deduction, using the progressive 2024 tax brackets — meaning
              different slices of your income are taxed at different rates.
            </li>
            <li>
              <strong>Social Security</strong> is 6.2% of wages up to the annual wage cap
              ($168,600 in 2024), and <strong>Medicare</strong> is 1.45% of all wages.
            </li>
            <li>
              <strong>State income tax</strong> is applied as the flat rate you enter,
              since it varies by state.
            </li>
          </ul>
          <p>
            Whatever remains is your net, or take-home, pay. Dividing that by your number of
            pay periods gives your per-paycheck amount.
          </p>

          <h2>How to lower the taxes taken from your paycheck (legally)</h2>
          <p>
            The most common way to reduce the tax bite is to increase pre-tax contributions.
            Adding to a traditional 401(k) or a Health Savings Account (HSA) lowers your
            taxable income, which lowers the income tax withheld. You can test this in the
            calculator: raise the pre-tax deductions field and watch how your take-home pay
            changes by less than the amount you contribute — because part of that contribution
            would otherwise have gone to taxes.
          </p>

          <h2>Understanding your effective tax rate</h2>
          <p>
            The effective tax rate shown is your total tax divided by your gross salary. It is
            almost always lower than your top tax bracket, because only the income in the
            highest bracket is taxed at that top rate. This is why knowing your effective rate
            gives a much more honest picture of your real tax burden than your bracket alone.
          </p>
        </article>

        <FaqSection items={faqs} />

        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> This is an estimate for informational purposes only and
          is not tax or financial advice. Actual withholding depends on your W-4 and local
          rules. See our{" "}
          <Link href="/disclaimer/" className="underline">full disclaimer</Link>.
        </div>

        <RelatedTools slug={SLUG} />
      </div>
    </>
  );
}
