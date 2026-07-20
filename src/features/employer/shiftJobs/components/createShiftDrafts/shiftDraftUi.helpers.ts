// App name: Job Mitra
// File name: shiftDraftUi.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\createShiftDrafts\shiftDraftUi.helpers.ts

export function formatDraftTime(value: number): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
