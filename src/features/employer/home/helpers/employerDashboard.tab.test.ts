import { describe, expect, it } from "vitest";
import {
  EMPLOYER_EVENT_DAY_TAB,
  parseEmployerDashboardTab,
  writeEmployerDashboardTabParam,
} from "./employerDashboard.tab";

describe("employerDashboard.tab", () => {
  it("treats event-day and legacy utilities as the Event day tab", () => {
    expect(parseEmployerDashboardTab("event-day")).toBe("event-day");
    expect(parseEmployerDashboardTab("utilities")).toBe("event-day");
    expect(parseEmployerDashboardTab(null)).toBe("operations");
    expect(parseEmployerDashboardTab("ops")).toBe("operations");
  });

  it("writes event-day and strips operations", () => {
    const written = writeEmployerDashboardTabParam(new URLSearchParams("x=1"), "event-day");
    expect(written.get("tab")).toBe(EMPLOYER_EVENT_DAY_TAB);
    const cleared = writeEmployerDashboardTabParam(new URLSearchParams("tab=event-day"), "operations");
    expect(cleared.get("tab")).toBeNull();
  });
});
