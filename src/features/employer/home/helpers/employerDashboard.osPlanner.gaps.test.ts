/** Job Mitra | employerDashboard.osPlanner.gaps.test.ts */

import { describe, expect, it } from "vitest";
import {
  buildPlannerBudgetRows,
  buildPlannerGapRows,
  countUnfilledPlanSeats,
  estimatePlanBudget,
} from "./employerDashboard.osPlanner";
import type { DemandPlan } from "../../planner/storage/demandPlanner.schema";

function plan(partial: Partial<DemandPlan> & Pick<DemandPlan, "id" | "slots">): DemandPlan {
  return {
    name: "Week A",
    companyName: "Co",
    locationName: "",
    category: "general",
    experience: "fresher_ok",
    startDate: "2026-08-01",
    endDate: "2026-08-07",
    workingDays: [1, 2, 3, 4, 5],
    status: "active",
    createdAt: 1,
    updatedAt: 2,
    schemaVersion: 2,
    legalEntityMlId: "org-1",
    epochDays: 30,
    milestoneCursor: 0,
    ...partial,
  };
}

describe("planner lane insight rows", () => {
  it("counts unfilled seats when a slot has no assignment", () => {
    const item = plan({
      id: "p1",
      slots: [
        { date: "2026-08-03", workers: 4, payPerDay: 800 },
        { date: "2026-08-04", workers: 2, payPerDay: 800, assignmentId: "a1" },
      ],
    });
    expect(countUnfilledPlanSeats(item)).toBe(4);
    expect(estimatePlanBudget(item)).toBe(4 * 800 + 2 * 800);
    expect(buildPlannerGapRows([item])).toHaveLength(1);
    expect(buildPlannerBudgetRows([item])[0]?.badge).toBe("Budget");
  });
});
