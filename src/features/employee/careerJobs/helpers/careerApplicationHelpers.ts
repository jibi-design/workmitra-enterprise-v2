// src/features/employee/careerJobs/helpers/careerApplicationHelpers.ts
//
// Pure helpers + stable-reference cache for EmployeeCareerApplicationsPage.

import type { CareerApplicationStage } from "../../../employer/careerJobs/types/careerTypes";
import {
  CAREER_APPS_KEY,
  CAREER_APPS_CHANGED,
} from "../../../employer/careerJobs/helpers/careerStorageUtils";
import { clampApplicationStage } from "../../../employer/careerJobs/helpers/careerNormalizers";
import type {
  Tab, BadgeTone, AppLite, KpiCounts, TabCounts, ExplanationResult,
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
  if (stage === "offered" || stage === "hired") return "offers";
  if (stage === "rejected" || stage === "withdrawn") return "closed";
  return "active";
}

/* ------------------------------------------------ */
/* Label helpers                                    */
/* ------------------------------------------------ */
export function stageLabel(s: CareerApplicationStage): string {
  const map: Record<CareerApplicationStage, string> = {
    applied: "Applied", shortlisted: "Shortlisted",
    interview: "In Interview", offered: "Offer Received",
    hired: "Hired", rejected: "Rejected", withdrawn: "Withdrawn",
  };
  return map[s] ?? s;
}

export function toneForStage(s: CareerApplicationStage): BadgeTone {
  if (s === "hired") return "good";
  if (s === "offered") return "warn";
  if (s === "shortlisted" || s === "interview") return "info";
  if (s === "rejected" || s === "withdrawn") return "bad";
  return "neutral";
}

export function badgeColors(tone: BadgeTone): { bg: string; border: string; color: string } {
  if (tone === "good") return { bg: "rgba(22,163,74,0.10)", border: "rgba(22,163,74,0.30)", color: "#166534" };
  if (tone === "warn") return { bg: "rgba(217,119,6,0.10)", border: "rgba(217,119,6,0.30)", color: "#92400e" };
  if (tone === "info") return { bg: "rgba(29,78,216,0.10)", border: "rgba(29,78,216,0.30)", color: "#1e40af" };
  if (tone === "bad") return { bg: "rgba(220,38,38,0.10)", border: "rgba(220,38,38,0.30)", color: "#991b1b" };
  return { bg: "rgba(17,24,39,0.04)", border: "rgba(17,24,39,0.10)", color: "#6b7280" };
}

export function cardLeftColor(stage: CareerApplicationStage): string {
  if (stage === "hired") return "#16a34a";
  if (stage === "offered") return "#d97706";
  if (stage === "rejected" || stage === "withdrawn") return "#ef4444";
  return "#1d4ed8";
}

export function cardBgTint(stage: CareerApplicationStage): string {
  if (stage === "hired") return "rgba(22,163,74,0.04)";
  if (stage === "offered") return "rgba(217,119,6,0.04)";
  if (stage === "rejected" || stage === "withdrawn") return "rgba(220,38,38,0.03)";
  return "rgba(29,78,216,0.03)";
}

export function fmtDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

export function explanationForStage(app: AppLite, totalRounds: number): ExplanationResult | null {
  if (app.stage === "applied") return { title: "Under Review", body: "Your application is being reviewed by the employer.", tone: "neutral" };
  if (app.stage === "shortlisted") return { title: "Shortlisted", body: "You have been shortlisted. Interview scheduling may follow.", tone: "info" };
  if (app.stage === "interview") {
    const progress = totalRounds > 0 ? ` ${app.totalPassed}/${totalRounds} rounds passed.` : "";
    const scheduled = app.totalScheduled > 0 ? ` ${app.totalScheduled} round scheduled.` : "";
    return { title: "In Interview", body: `Interview process is underway.${progress}${scheduled}`, tone: "info" };
  }
  if (app.stage === "offered") {
    const od = app.offerDetails;
    const body = od && od.salary > 0
      ? `${od.jobTitle} \u2014 Salary: ${od.salary.toLocaleString()} per ${od.salaryPeriod}. Start date: ${od.startDate}.${od.message ? ` Note: ${od.message}` : ""}`
      : "The employer has extended a job offer. Review the details with your employer.";
    return { title: "Offer Received", body, tone: "warn" };
  }
  if (app.stage === "hired") return { title: "Hired", body: "You have been hired! Check your Career Workspaces for details.", tone: "good" };
  if (app.stage === "rejected") {
    const reason = app.rejectionReason ? ` Reason: ${app.rejectionReason}` : "";
    return { title: "Not Selected", body: `Your application was not successful.${reason}`, tone: "bad" };
  }
  if (app.stage === "withdrawn") return { title: "Withdrawn", body: "You withdrew this application.", tone: "bad" };
  return null;
}

/* ------------------------------------------------ */
/* KPI + Tab count helpers                          */
/* ------------------------------------------------ */
export function computeKpi(apps: AppLite[]): KpiCounts {
  let applied = 0; let shortlisted = 0; let confirmed = 0;
  for (const a of apps) {
    if (a.stage === "applied") applied++;
    else if (a.stage === "shortlisted") shortlisted++;
    else if (a.stage === "hired" || a.stage === "offered") confirmed++;
  }
  return { applied, shortlisted, confirmed };
}

export function computeTabCounts(apps: AppLite[]): TabCounts {
  let active = 0; let interview = 0; let offers = 0; let closed = 0;
  for (const a of apps) {
    const t = stageToTab(a.stage);
    if (t === "active") active++;
    else if (t === "interview") interview++;
    else if (t === "offers") offers++;
    else if (t === "closed") closed++;
  }
  return { active, interview, offers, closed, all: apps.length };
}

/* ------------------------------------------------ */
/* Parse helpers                                    */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function str(r: Rec, k: string): string | undefined {
  const v = r[k]; return typeof v === "string" ? v : undefined;
}

function num(r: Rec, k: string): number | undefined {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function parseAppsLite(raw: string | null): AppLite[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: AppLite[] = [];
    for (const x of parsed) {
      if (!isRec(x)) continue;
      const id = str(x, "id");
      const jobId = str(x, "jobId");
      const appliedAt = num(x, "appliedAt");
      if (!id || !jobId || appliedAt === undefined) continue;
      const roundResults = Array.isArray(x["roundResults"]) ? (x["roundResults"] as Rec[]) : [];
      let totalPassed = 0; let totalScheduled = 0;
      for (const rr of roundResults) {
        if (!isRec(rr)) continue;
        if (rr["status"] === "passed") totalPassed++;
        if (rr["status"] === "scheduled") totalScheduled++;
      }
      out.push({
        id, jobId, stage: clampApplicationStage(x["stage"]),
        appliedAt, updatedAt: num(x, "updatedAt") ?? appliedAt,
        currentRound: num(x, "currentRound") ?? 0,
        totalPassed, totalScheduled,
        employeeName: str(x, "employeeName") ?? "Applicant",
        coverNote: str(x, "coverNote") ?? "",
        noticePeriod: str(x, "noticePeriod") ?? "Immediate",
        expectedSalary: num(x, "expectedSalary") ?? 0,
        rejectionReason: str(x, "rejectionReason"),
        rejectedAt: num(x, "rejectedAt"),
        offeredAt: num(x, "offeredAt"),
        hiredAt: num(x, "hiredAt"),
        withdrawnAt: num(x, "withdrawnAt"),
        offerDetails: (() => {
          const od = x["offerDetails"];
          if (!isRec(od)) return undefined;
          const salary = num(od, "salary") ?? 0;
          if (salary <= 0) return undefined;
          return {
            jobTitle: str(od, "jobTitle") ?? "",
            salary,
            salaryPeriod: str(od, "salaryPeriod") ?? "monthly",
            startDate: str(od, "startDate") ?? "",
            message: str(od, "message"),
          };
        })(),
      });
    }
    return out.sort((a, b) => b.appliedAt - a.appliedAt);
  } catch { return []; }
}

/* ------------------------------------------------ */
/* Stable-reference cache                           */
/* ------------------------------------------------ */
let _appsCacheRaw: string | null = "__init__";
let _appsCacheList: AppLite[] = [];

export function getAppsSnapshot(): AppLite[] {
  const raw = localStorage.getItem(CAREER_APPS_KEY);
  if (raw !== _appsCacheRaw) {
    _appsCacheRaw = raw;
    _appsCacheList = parseAppsLite(raw);
  }
  return _appsCacheList;
}

export function subscribeApps(cb: () => void): () => void {
  const handler = () => cb();
  const events = ["storage", "focus", CAREER_APPS_CHANGED];
  for (const ev of events) window.addEventListener(ev, handler);
  document.addEventListener("visibilitychange", handler);
  return () => {
    for (const ev of events) window.removeEventListener(ev, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}