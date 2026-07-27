import { clampApplicationStage } from "../../../career/helpers/careerStoragePublic";
import { CAREER_APPS_CHANGED, CAREER_APPS_KEY } from "../../../career/helpers/careerStoragePublic";
import type { AppLite, ScheduledInterviewSummary } from "../types/careerApplicationTypes";

type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function str(r: Rec, k: string): string | undefined {
  const v = r[k];
  return typeof v === "string" ? v : undefined;
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
      let totalPassed = 0;
      let totalScheduled = 0;
      let nextScheduledInterview: AppLite["nextScheduledInterview"];

      for (const rr of roundResults) {
        if (!isRec(rr)) continue;

        if (rr["status"] === "passed") totalPassed++;

        if (rr["status"] === "scheduled") {
          totalScheduled++;

          const scheduledDate = str(rr, "scheduledDate") ?? "";
          const scheduledTime = str(rr, "scheduledTime") ?? "";

          if (scheduledDate && scheduledTime) {
            const round = num(rr, "round") ?? totalScheduled;
            const rsvpRaw = rr["rsvpStatus"];
            const rsvpStatus =
              rsvpRaw === "pending" || rsvpRaw === "accepted" || rsvpRaw === "declined"
                ? rsvpRaw
                : undefined;

            const scheduledInterview: ScheduledInterviewSummary = {
              round,
              label: str(rr, "label") ?? `Round ${round}`,
              mode: str(rr, "interviewMode") ?? "interview",
              scheduledDate,
              scheduledTime,
              location: str(rr, "location"),
              meetingLink: str(rr, "meetingLink"),
              rsvpStatus,
            };

            if (!nextScheduledInterview || round < nextScheduledInterview.round) {
              nextScheduledInterview = scheduledInterview;
            }
          }
        }
      }
      out.push({
        id,
        jobId,
        stage: clampApplicationStage(x["stage"]),
        appliedAt,
        updatedAt: num(x, "updatedAt") ?? appliedAt,
        currentRound: num(x, "currentRound") ?? 0,
        totalPassed,
        totalScheduled,
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
        nextScheduledInterview,
      });
    }
    return out.sort((a, b) => b.appliedAt - a.appliedAt);
  } catch {
    return [];
  }
}

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
