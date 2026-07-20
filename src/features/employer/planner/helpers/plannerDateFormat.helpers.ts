// Job Mitra | plannerDateFormat.helpers.ts — pure date formatting (no storage deps)

export function fmtPlanDate(dateStr: string): string {
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
