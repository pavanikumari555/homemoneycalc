import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ALL_TOOLS, SITE } from "@/lib/site";
import { actionPlan, adsenseReadiness } from "@/scripts/agent/advisor.mjs";
import AdminDashboard from "./OwnerDashboard";

export const metadata: Metadata = { title: "Owner dashboard | HomeMoney Calc", robots: { index: false, follow: false } };
const DATA = join(process.cwd(), "data");
const read = (file: string, fallback: any) => {
  const path = join(DATA, file);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback;
};

export default function AdminPage() {
  // Public builds never contain dashboard HTML or private report props.
  if (process.env.NODE_ENV === "production" && process.env.BUILD_ADMIN !== "1") notFound();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const dir = join(DATA, "reports");
  const reports = existsSync(dir) ? readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort() : [];
  const report = reports.length ? read(`reports/${reports.at(-1)}`, null) : null;
  const business = read("business.json", {});
  const revenue = read("revenue.json", { goalMonthly: 5000, months: [] });
  return <AdminDashboard today={today} siteUrl={SITE.url} repo={SITE.repo} report={report}
    business={business} revenue={revenue} offers={read("offers.json", { offers: [] }).offers}
    monetization={read("monetization.json", {})}
    approvalQueue={read("agent-proposals.json", { proposals: [] })} approvalHistory={read("agent-decisions.json", { decisions: [] })}
    research={read("research-observations.json", { observations: [] })}
    security={read("security-checklist.json", { items: [] }).items}
    tasks={actionPlan(report, business, today)} readiness={adsenseReadiness(report, business, today)}
    tools={ALL_TOOLS.map((t) => ({ slug: t.slug, title: t.shortTitle, date: t.added }))} />;
}
