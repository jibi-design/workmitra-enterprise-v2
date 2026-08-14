/** Job Mitra | shiftApplications.smartResume.ts | Employee My Applications landing */

import type {
  ApplicationTab,
  ShiftApplicationData,
} from "../../shiftJobs/types/shiftApplicationTypes";

export function resolveEmployeeShiftApplicationsTab(
  apps: readonly ShiftApplicationData[],
): ApplicationTab {
  const needsAttendance = apps.some(
    (app) => app.status === "confirmed" && app.attendanceConfirmedAt === undefined,
  );
  if (needsAttendance) return "confirmed";
  if (apps.some((app) => app.status === "shortlisted")) return "active";
  if (apps.some((app) => app.status === "applied" || app.status === "waiting")) return "active";
  return "all";
}

export function employeeShiftApplicationsBannerCopy(apps: readonly ShiftApplicationData[]): {
  readonly title: string;
  readonly message: string;
} | null {
  const attendance = apps.filter(
    (app) => app.status === "confirmed" && app.attendanceConfirmedAt === undefined,
  ).length;
  if (attendance > 0) {
    return {
      title: `${attendance} confirmed shift${attendance === 1 ? "" : "s"} need attendance intent`,
      message: "Open Confirmed and save attendance intent before the shift starts.",
    };
  }
  const shortlisted = apps.filter((app) => app.status === "shortlisted").length;
  if (shortlisted > 0) {
    return {
      title: `${shortlisted} shortlist${shortlisted === 1 ? "" : "s"} waiting`,
      message: "You are on a shortlist. Stay available — the employer still needs to confirm.",
    };
  }
  return null;
}
