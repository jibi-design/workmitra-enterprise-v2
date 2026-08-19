/** Job Mitra | eventDayCoach.session.ts | One-shot Event day coach (session only) */

const KEY = "wm_er_event_day_coach_v1";

export function isEventDayCoachDismissed(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissEventDayCoach(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Fail-silent
  }
}
