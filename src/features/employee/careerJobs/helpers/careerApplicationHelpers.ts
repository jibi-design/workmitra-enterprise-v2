// src/features/employee/careerJobs/helpers/careerApplicationHelpers.ts
//
// Pure helpers + stable-reference cache for EmployeeCareerApplicationsPage.

import type { CareerApplicationStage } from "../../../career/types/careerDomainTypes";
import type {
  Tab,
  BadgeTone,
  AppLite,
  KpiCounts,
  TabCounts,
  ExplanationResult,
} from "../types/careerApplicationTypes";

/* ------------------------------------------------ */
/* Re-export types needed by consumers              */
/* ------------------------------------------------ */
export type { Tab, BadgeTone, AppLite, KpiCounts, TabCounts, ExplanationResult };

/* ------------------------------------------------ */
/* Tab helpers                                      */
/* ------------------------------------------------ */
export function stageToTab(stage: CareerApplicationStage): Tab {
  if (stage === "applied" || stage === "shortlisted") return "active";
  if (stage === "interview") return "interview";
  if (stage === "offered" || stage === "offer_accepted") return "offers";
  if (stage === "hired") return "closed";
  if (stage === "rejected" || stage === "withdrawn" || stage === "offer_declined") return "closed";
  return "active";
}

/* ------------------------------------------------ */
/* Label helpers                                    */
/* ------------------------------------------------ */
export function stageLabel(stageOrApp: CareerApplicationStage | AppLite): string {
  const s = typeof stageOrApp === "string" ? stageOrApp : stageOrApp.stage;
  const app = typeof stageOrApp === "object" ? stageOrApp : null;

  if (s === "rejected") {
    const hadInterview = app && (app.totalScheduled > 0 || app.currentRound > 0);
    return hadInterview ? "Not Selected" : "Not Shortlisted";
  }

  const map: Record<CareerApplicationStage, string> = {
    applied: "Applied",
    shortlisted: "Shortlisted",
    interview: "In Interview",
    offered: "Offer Received",
    offer_accepted: "Offer Accepted",
    offer_declined: "Offer Declined",
    hired: "Confirmed",
    rejected: "Not Selected",
    withdrawn: "Withdrawn",
  };
  return map[s] ?? s;
}

export function toneForStage(s: CareerApplicationStage): BadgeTone {
  if (s === "hired") return "info";
  if (s === "offered" || s === "offer_accepted") return "warn";
  if (s === "shortlisted" || s === "interview") return "info";
  if (s === "rejected" || s === "withdrawn" || s === "offer_declined") return "bad";
  return "neutral";
}

export function badgeColors(tone: BadgeTone): { bg: string; border: string; color: string } {
  if (tone === "good")
    return { bg: "rgba(22,163,74,0.10)", border: "rgba(22,163,74,0.30)", color: "#166534" };
  if (tone === "warn")
    return { bg: "rgba(217,119,6,0.10)", border: "rgba(217,119,6,0.30)", color: "#92400e" };
  if (tone === "info")
    return { bg: "rgba(29,78,216,0.10)", border: "rgba(29,78,216,0.30)", color: "#1e40af" };
  if (tone === "bad")
    return { bg: "rgba(220,38,38,0.10)", border: "rgba(220,38,38,0.30)", color: "#991b1b" };
  return { bg: "rgba(17,24,39,0.04)", border: "rgba(17,24,39,0.10)", color: "#6b7280" };
}

export function cardLeftColor(stage: CareerApplicationStage): string {
  if (stage === "hired") return "#1d4ed8";
  if (stage === "offer_accepted") return "#2563eb";
  if (stage === "offered") return "#d97706";
  if (stage === "rejected" || stage === "withdrawn" || stage === "offer_declined") return "#ef4444";
  return "#1d4ed8";
}

export function cardBgTint(stage: CareerApplicationStage): string {
  if (stage === "hired") return "rgba(29,78,216,0.04)";
  if (stage === "offer_accepted") return "rgba(37,99,235,0.04)";
  if (stage === "offered") return "rgba(217,119,6,0.04)";
  if (stage === "rejected" || stage === "withdrawn" || stage === "offer_declined")
    return "rgba(220,38,38,0.03)";
  return "rgba(29,78,216,0.03)";
}

export function fmtDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function explanationForStage(app: AppLite, totalRounds: number): ExplanationResult | null {
  if (app.stage === "applied")
    return {
      title: "Under Review",
      body: "Your application is being reviewed by the employer.",
      tone: "neutral",
    };
  if (app.stage === "shortlisted")
    return {
      title: "Shortlisted",
      body: "You have been shortlisted. Interview scheduling may follow.",
      tone: "info",
    };
  if (app.stage === "interview") {
    const progress = totalRounds > 0 ? ` ${app.totalPassed}/${totalRounds} rounds passed.` : "";
    const scheduled = app.totalScheduled > 0 ? ` ${app.totalScheduled} round scheduled.` : "";
    return {
      title: "In Interview",
      body: `Interview process is underway.${progress}${scheduled}`,
      tone: "info",
    };
  }
  if (app.stage === "offered") {
    const od = app.offerDetails;
    const body =
      od && od.salary > 0
        ? `${od.jobTitle} \u2014 Salary: ${od.salary.toLocaleString()} per ${od.salaryPeriod}. Start date: ${od.startDate}.${od.message ? ` Note: ${od.message}` : ""}`
        : "The employer has extended a job offer. Review the details with your employer.";
    return { title: "Offer Received", body, tone: "warn" };
  }
  if (app.stage === "offer_accepted") {
    return {
      title: "Offer Accepted",
      body: "You accepted this offer. The employer will confirm your hire and create your workspace.",
      tone: "info",
    };
  }
  if (app.stage === "hired")
    return {
      title: "Moved to Career Workspace",
      body: "This application is complete. Open your Career Workspace to view employment status and updates.",
      tone: "info",
    };
  if (app.stage === "rejected") {
    const hadInterview = app.totalScheduled > 0 || app.currentRound > 0;
    const title = hadInterview ? "Not Selected" : "Not Shortlisted";
    const reason = app.rejectionReason ? ` Reason: ${app.rejectionReason}` : "";
    return {
      title,
      body: `This application was not successful this time. The employer has decided to move forward with other candidates.${reason}`,
      tone: "bad",
    };
  }
  if (app.stage === "offer_declined")
    return {
      title: "Offer Declined",
      body: "You declined this job offer. This is separate from withdrawing an application.",
      tone: "bad",
    };
  if (app.stage === "withdrawn")
    return { title: "Withdrawn", body: "You withdrew this application.", tone: "bad" };
  return null;
}

/* ------------------------------------------------ */
/* KPI + Tab count helpers                          */
/* ------------------------------------------------ */
export function computeKpi(apps: AppLite[]): KpiCounts {
  let applied = 0;
  let shortlisted = 0;
  let confirmed = 0;
  for (const a of apps) {
    if (a.stage === "applied") applied++;
    else if (a.stage === "shortlisted") shortlisted++;
    else if (a.stage === "hired") confirmed++;
  }
  return { applied, shortlisted, confirmed };
}

export function computeTabCounts(apps: AppLite[]): TabCounts {
  let active = 0;
  let interview = 0;
  let offers = 0;
  let closed = 0;
  for (const a of apps) {
    const t = stageToTab(a.stage);
    if (t === "active") active++;
    else if (t === "interview") interview++;
    else if (t === "offers") offers++;
    else if (t === "closed") closed++;
  }
  return { active, interview, offers, closed, all: apps.length };
}

export { getAppsSnapshot, subscribeApps } from "./careerApplicationHelpers.snapshot";
