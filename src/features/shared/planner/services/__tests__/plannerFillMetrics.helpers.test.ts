/**
 * Job Mitra | plannerFillMetrics.helpers.test.ts
 * P-SEP-3 — fill metrics from plan slots + apps (no Shift posts).
 */

import { describe, expect, it } from "vitest";
import { computePlanFillMetrics, countConfirmedForSlot } from "../plannerFillMetrics.helpers";
import type { DemandPlan } from "../../../../employer/planner/storage/demandPlannerStorage";
import type { EmployeeShiftApplication } from "../../ports/plannerLegacyShiftBridge";

function makePlan(overrides?: Partial<DemandPlan>): DemandPlan {
  return {
    id: "plan_1",
    schemaVersion: 2,
    name: "Test",
    status: "active",
    companyName: "Co",
    locationName: "City",
    category: "General",
    experience: "helper",
    startDate: "2026-07-01",
    endDate: "2026-07-02",
    workingDays: [1, 2],
    epochDays: 30,
    legalEntityMlId: "ML-ER-1",
    milestoneCursor: 0,
    slots: [
      { date: "2026-07-01", workers: 2, payPerDay: 1000, slotId: "slot_a", postId: "post_a" },
      { date: "2026-07-02", workers: 1, payPerDay: 1000, slotId: "slot_b" },
    ],
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function makeApp(
  partial: Partial<EmployeeShiftApplication> & Pick<EmployeeShiftApplication, "id" | "postId">,
): EmployeeShiftApplication {
  return {
    planId: "plan_1",
    status: "confirmed",
    createdAt: 1,
    profileSnapshot: { uniqueId: "ML-W-1", fullName: "W" },
    ...partial,
  } as EmployeeShiftApplication;
}

describe("plannerFillMetrics.helpers", () => {
  it("counts confirmed per slot from apps without Shift posts", () => {
    const plan = makePlan();
    const apps = [
      makeApp({ id: "a1", postId: "post_a" }),
      makeApp({ id: "a2", postId: "post_a" }),
      makeApp({ id: "a3", postId: "slot_b", selectedDates: ["2026-07-02"] }),
    ];
    expect(countConfirmedForSlot(apps, plan.slots[0]!)).toBe(2);
    expect(countConfirmedForSlot(apps, plan.slots[1]!)).toBe(1);
    expect(computePlanFillMetrics(plan, apps)).toEqual({
      confirmed: 3,
      needed: 3,
      pct: 100,
    });
  });

  it("caps confirmed at slot.workers", () => {
    const plan = makePlan({
      slots: [
        { date: "2026-07-01", workers: 1, payPerDay: 500, slotId: "slot_a", postId: "post_a" },
      ],
    });
    const apps = [makeApp({ id: "a1", postId: "post_a" }), makeApp({ id: "a2", postId: "post_a" })];
    expect(computePlanFillMetrics(plan, apps).confirmed).toBe(1);
  });
});
