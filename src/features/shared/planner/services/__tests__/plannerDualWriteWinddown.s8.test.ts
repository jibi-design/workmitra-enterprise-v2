/** Hybrid A2 S8 — dual-write wind-down unit gate */

import { beforeEach, describe, expect, it } from "vitest";
import { DEMAND_PLANS_STORAGE_KEY } from "../../../../employer/planner/storage/demandPlanner.schema";
import { demandPlannerStorage } from "../../../../employer/planner/storage/demandPlannerStorage";
import { plannerPublicIndex } from "../../../../employer/planner/storage/plannerPublicIndex.storage";
import {
  approvePlannerApplicationBatch,
  listPlannerApplicationBatches,
} from "../../../../employer/planner/services/plannerBatchApproval.service";
import { multiApplyGroup } from "../../ports/plannerLegacyShiftBridge";
import { listPlannerRosterAssignments } from "../plannerRoster.helpers";

const APPS_KEY = "wm_employee_shift_applications_v1";
const POSTS_KEY = "wm_employer_shift_posts_v1";
const INDEX_KEY = "wm_planner_public_index_v1";

describe("Hybrid A2 S8 — dual-write wind-down", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(POSTS_KEY, "[]");
    localStorage.setItem(APPS_KEY, "[]");
    localStorage.setItem(INDEX_KEY, "[]");
    localStorage.setItem(DEMAND_PLANS_STORAGE_KEY, "[]");
  });

  it("publishes plan index without creating Shift child posts", () => {
    const planId = demandPlannerStorage.create({
      name: "S8 Native Plan",
      companyName: "S8 Co",
      locationName: "Kochi",
      category: "Security",
      experience: "experienced",
      startDate: "2026-10-01",
      endDate: "2026-10-02",
      workingDays: [4, 5],
      slots: [
        { date: "2026-10-01", workers: 2, payPerDay: 900 },
        { date: "2026-10-02", workers: 1, payPerDay: 900 },
      ],
      description: "wind-down",
    });

    const submitted = demandPlannerStorage.submit(planId, {});
    expect(submitted).toBeTruthy();
    expect(submitted!.slots.every((s) => !s.postId)).toBe(true);
    expect(submitted!.slots.every((s) => Boolean(s.slotId))).toBe(true);

    plannerPublicIndex.publishFromPlan(submitted!);
    const entry = plannerPublicIndex.getByPlanId(planId);
    expect(entry?.dayCount).toBe(2);
    expect(entry?.openDayCount).toBe(2);
    expect(Object.keys(entry?.postIdsByDate ?? {})).toHaveLength(0);
    expect(Object.keys(entry?.slotIdsByDate ?? {})).toHaveLength(2);

    const posts = JSON.parse(localStorage.getItem(POSTS_KEY) ?? "[]") as unknown[];
    expect(posts).toHaveLength(0);
  });

  it("native apply + batch approve lands on roster without Shift posts", async () => {
    const planId = demandPlannerStorage.create({
      name: "S8 Approve Plan",
      companyName: "S8 Co",
      locationName: "Kochi",
      category: "Security",
      experience: "experienced",
      startDate: "2026-10-06",
      endDate: "2026-10-07",
      workingDays: [2, 3],
      slots: [
        { date: "2026-10-06", workers: 1, payPerDay: 800 },
        { date: "2026-10-07", workers: 1, payPerDay: 800 },
      ],
    });
    const submitted = demandPlannerStorage.submit(planId, {});
    plannerPublicIndex.publishFromPlan(submitted!);

    localStorage.setItem(
      "wm_employee_profile_v1",
      JSON.stringify({
        uniqueId: "ML-S8-WORKER",
        fullName: "S8 Worker",
        city: "Kochi",
        skills: ["security"],
        experience: "helper",
        languages: ["en"],
        preferShiftJobs: true,
        preferCareerJobs: false,
        availability: {
          weekdays: true,
          weekends: true,
          morning: true,
          afternoon: true,
          evening: true,
        },
      }),
    );

    const slotIds = submitted!.slots.map((s) => s.slotId!).filter(Boolean);
    const batchId = `pb_${planId}_s8`;
    const count = multiApplyGroup(slotIds, {
      planId,
      planApplyBatchId: batchId,
      selectedDates: submitted!.slots.map((s) => s.date),
    });
    expect(count).toBe(2);

    const result = await approvePlannerApplicationBatch(batchId);
    expect(result.ok).toBe(true);
    expect(result.processed).toBe(2);

    const batches = listPlannerApplicationBatches();
    expect(batches[0]?.reviewStatus).toBe("confirmed");

    const roster = listPlannerRosterAssignments({ planId, confirmedOnly: true });
    expect(roster).toHaveLength(1);
    expect(roster[0]?.days).toHaveLength(2);
    expect(roster[0]?.workerMlId).toBe("ML-S8-WORKER");
  });
});
