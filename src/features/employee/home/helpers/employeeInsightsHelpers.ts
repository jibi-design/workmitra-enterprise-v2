// App name: Job Mitra
// File name: employeeInsightsHelpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\home\helpers\employeeInsightsHelpers.ts

export function getEmployeeRatingDisplay(): string {
  try {
    const raw = localStorage.getItem("wm_worker_points_v1");
    if (!raw) return "\u2014";

    const parsed: unknown = JSON.parse(raw);
    const points =
      typeof parsed === "number"
        ? parsed
        : typeof parsed === "object" && parsed !== null
          ? Number((parsed as Record<string, unknown>)["total"] ?? 0)
          : 0;

    if (points <= 0) return "\u2014";
    if (points >= 600) return "4.5\u2605";
    if (points >= 300) return "4.0\u2605";
    if (points >= 100) return "3.5\u2605";

    return "3.0\u2605";
  } catch {
    return "\u2014";
  }
}
