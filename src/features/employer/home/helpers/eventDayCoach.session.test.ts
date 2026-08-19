import { describe, expect, it } from "vitest";
import { dismissEventDayCoach, isEventDayCoachDismissed } from "./eventDayCoach.session";

describe("eventDayCoach.session", () => {
  it("starts visible and hides after dismiss", () => {
    sessionStorage.removeItem("wm_er_event_day_coach_v1");
    expect(isEventDayCoachDismissed()).toBe(false);
    dismissEventDayCoach();
    expect(isEventDayCoachDismissed()).toBe(true);
  });
});
