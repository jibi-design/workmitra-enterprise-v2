// App name: Job Mitra
// File name: employerShiftDashboardRatingFlags.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\helpers\employerShiftDashboardRatingFlags.ts

export function getRatingDoneFlag(postId: string): boolean {
  try {
    return localStorage.getItem(`wm_shift_rated_${postId}`) === "1";
  } catch {
    return false;
  }
}

export function setRatingDoneFlag(postId: string): void {
  try {
    localStorage.setItem(`wm_shift_rated_${postId}`, "1");
  } catch {
    // Phase-0 localStorage-safe fallback.
  }
}
