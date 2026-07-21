/** Hybrid A2 S1 — Route Contract unit gate */

import { describe, expect, it } from "vitest";
import {
  PLANNER_EMPLOYEE_CRAWL_PATHS,
  PLANNER_EMPLOYER_CRAWL_PATHS,
  PLANNER_ROUTE_CONTRACT,
  PLANNER_STATUS_NEXT_STEP,
  resolvePlannerStatusNextStep,
  type PlannerStatusTag,
} from "../plannerRouteContract";

describe("plannerRouteContract (Hybrid A2 S1)", () => {
  it("exposes canonical employee discover + workspace hub paths", () => {
    expect(PLANNER_ROUTE_CONTRACT.employee.discover).toBe("/employee/planner/discover");
    expect(PLANNER_ROUTE_CONTRACT.employee.workspaceHub).toBe("/employee/planner/workspace");
  });

  it("exposes canonical employer create + applications + roster paths", () => {
    expect(PLANNER_ROUTE_CONTRACT.employer.create).toBe("/employer/planner/create");
    expect(PLANNER_ROUTE_CONTRACT.employer.applications).toBe("/employer/planner/applications");
    expect(PLANNER_ROUTE_CONTRACT.employer.roster).toBe("/employer/planner/roster");
    expect(PLANNER_ROUTE_CONTRACT.employer.rosterDetail).toBe("/employer/planner/roster/:planId");
  });

  it("maps every status tag to an explicit nextRoute (Zero Dead-End)", () => {
    const tags = Object.keys(PLANNER_STATUS_NEXT_STEP) as PlannerStatusTag[];
    expect(tags.length).toBeGreaterThanOrEqual(8);
    for (const tag of tags) {
      const step = resolvePlannerStatusNextStep(tag);
      expect(step.nextAction.length).toBeGreaterThan(0);
      expect(step.nextRoute.startsWith("/")).toBe(true);
    }
  });

  it("crawl path lists stay under /planner/* only", () => {
    for (const path of PLANNER_EMPLOYEE_CRAWL_PATHS) {
      expect(path.startsWith("/employee/planner/")).toBe(true);
    }
    for (const path of PLANNER_EMPLOYER_CRAWL_PATHS) {
      expect(path.startsWith("/employer/planner/")).toBe(true);
    }
  });
});
