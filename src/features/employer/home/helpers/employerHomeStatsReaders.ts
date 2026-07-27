// App name: Job Mitra
// File name: employerHomeStatsReaders.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\home\helpers\employerHomeStatsReaders.ts

function readArrayCount(storageKey: string): number {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function countByStatus(storageKey: string, statuses: string[]): number {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;

    return parsed.filter((item) => {
      if (typeof item !== "object" || item === null) return false;
      const status = (item as Record<string, unknown>)["status"];
      return typeof status === "string" && statuses.includes(status);
    }).length;
  } catch {
    return 0;
  }
}

export function getEmployerRatingDisplay(): string {
  try {
    // MIG-004: canonical writer key is wm_ratings_worker_to_employer_v1 (stars)
    const raw = localStorage.getItem("wm_ratings_worker_to_employer_v1");
    if (!raw) return "\u2014";
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return "\u2014";

    let total = 0;
    let count = 0;

    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const stars = (item as Record<string, unknown>)["stars"];
      if (typeof stars === "number" && stars > 0) {
        total += stars;
        count += 1;
      }
    }

    if (count === 0) return "\u2014";
    return `${(total / count).toFixed(1)}\u2605`;
  } catch {
    return "\u2014";
  }
}

export function getHRStats() {
  return {
    totalRecords: readArrayCount("wm_hr_management_v1"),
    activeStaff: countByStatus("wm_hr_management_v1", [
      "active",
      "active (confirmed)",
      "active (probation)",
    ]),
    onboarding: countByStatus("wm_hr_management_v1", [
      "onboarding",
      "hired",
      "offered",
      "offer_pending",
    ]),
  };
}

export function getConsoleStats() {
  return {
    tasks: readArrayCount("wm_task_assignment_v1"),
    leave: readArrayCount("wm_hr_leave_requests_v1"),
    incidents: readArrayCount("wm_incident_reports_v1"),
  };
}
