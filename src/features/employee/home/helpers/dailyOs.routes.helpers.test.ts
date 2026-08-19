import { describe, expect, it } from "vitest";
import {
  activityLaneFallback,
  careerFunnelStageRoute,
  criticalTapRoute,
  sanitizeEmployeeRoute,
  shiftActivityRoute,
} from "./dailyOs.routes.helpers";
import { resolveDailyOsViewState } from "./dailyOs.viewState.helpers";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";

function action(partial: Partial<PendingActionItem> & Pick<PendingActionItem, "id">): PendingActionItem {
  return {
    domain: "career",
    label: "x",
    detail: "",
    count: 1,
    ctaLabel: "Open",
    onAction: () => undefined,
    ...partial,
  };
}

describe("dailyOs tap-through + view state", () => {
  it("maps funnel stages to career application tabs", () => {
    expect(careerFunnelStageRoute("applied")).toContain("tab=active");
    expect(careerFunnelStageRoute("shortlisted")).toContain("tab=active");
    expect(careerFunnelStageRoute("interview")).toContain("tab=interview");
    expect(careerFunnelStageRoute("offer")).toContain("tab=offers");
  });

  it("routes critical cards to domain pages, not mutate handlers", () => {
    expect(criticalTapRoute(action({ id: "career-interview-rsvp-1" }))).toContain("tab=interview");
    expect(criticalTapRoute(action({ id: "career-offer-response-1" }))).toContain("tab=offers");
    expect(criticalTapRoute(action({ id: "shift-attendance-1", domain: "shift" }))).toContain(
      "/employee/shift/applications",
    );
    expect(criticalTapRoute(null)).toContain("/employee/review-center");
  });

  it("keeps activity routes on employee paths", () => {
    expect(sanitizeEmployeeRoute("/employee/career", "/employee")).toBe("/employee/career");
    expect(sanitizeEmployeeRoute("https://evil.example", "/employee/shift")).toBe("/employee/shift");
    expect(activityLaneFallback("planner")).toContain("/employee/planner/applications");
    expect(shiftActivityRoute({ planner: true, planId: "p1" })).toContain("/plan/p1");
  });

  it("orders loading, error, empty, then active", () => {
    expect(resolveDailyOsViewState({ ready: false, error: null, isEmpty: true })).toBe("loading");
    expect(resolveDailyOsViewState({ ready: true, error: "x", isEmpty: true })).toBe("error");
    expect(resolveDailyOsViewState({ ready: true, error: null, isEmpty: true })).toBe("empty");
    expect(resolveDailyOsViewState({ ready: true, error: null, isEmpty: false })).toBe("active");
  });
});
