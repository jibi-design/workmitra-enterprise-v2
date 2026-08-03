import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";
import { isRec, num, readAnswerMap, readNotesMap, str } from "./dashboardHelpers.parsing";
import { WORKER_APPS_PROJECTION_KEY } from "../../../shared/shift/shiftTenantProjection";

/** @deprecated Use getEmployerApplicationsKey() for employer reads. */
export const EMPLOYEE_APPS_KEY = WORKER_APPS_PROJECTION_KEY;

export function safeParseEmployeeApps(raw: string | null): EmployeeShiftApplication[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: EmployeeShiftApplication[] = [];
    for (const item of parsed) {
      if (!isRec(item)) continue;
      const id = str(item, "id");
      const postId = str(item, "postId");
      const createdAt = num(item, "createdAt");
      const status = str(item, "status");
      if (!id || !postId || createdAt === undefined || !status) continue;
      const valid = [
        "applied",
        "shortlisted",
        "waiting",
        "confirmed",
        "rejected",
        "withdrawn",
        "replaced",
        "exited",
      ];
      if (!valid.includes(status)) continue;
      const snap = isRec(item["profileSnapshot"])
        ? {
            uniqueId: str(item["profileSnapshot"], "uniqueId") || undefined,
            fullName: str(item["profileSnapshot"], "fullName") || undefined,
            city: str(item["profileSnapshot"], "city") || undefined,
            experience: str(item["profileSnapshot"], "experience") || undefined,
            skills: Array.isArray(item["profileSnapshot"]["skills"])
              ? (item["profileSnapshot"]["skills"] as string[]).filter((x) => typeof x === "string")
              : undefined,
            languages: Array.isArray(item["profileSnapshot"]["languages"])
              ? (item["profileSnapshot"]["languages"] as string[]).filter(
                  (x) => typeof x === "string",
                )
              : undefined,
          }
        : undefined;
      out.push({
        id,
        postId,
        createdAt,
        status: status as EmployeeShiftApplication["status"],
        profileSnapshot: snap,
        mustHaveAnswers: readAnswerMap(item["mustHaveAnswers"]),
        goodToHaveAnswers: readAnswerMap(item["goodToHaveAnswers"]),
        notes: readNotesMap(item["notes"]),
        withdrawnAt: num(item, "withdrawnAt"),
        replacedAt: num(item, "replacedAt"),
        replacedReason: (["no_show", "schedule_change", "quality_issue", "other"].includes(
          item["replacedReason"] as string,
        )
          ? item["replacedReason"]
          : undefined) as EmployeeShiftApplication["replacedReason"],
      });
    }
    out.sort((a, b) => b.createdAt - a.createdAt);
    return out;
  } catch {
    return [];
  }
}
