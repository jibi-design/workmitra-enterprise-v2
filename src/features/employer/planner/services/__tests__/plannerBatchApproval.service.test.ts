/** Hybrid A2 S4 — Batch Approval Engine unit gate */

import { beforeEach, describe, expect, it } from "vitest";
import { DEMAND_PLANS_STORAGE_KEY } from "../../storage/demandPlanner.schema";
import {
  listPlannerApplicationBatches,
  rejectPlannerApplicationBatch,
} from "../plannerBatchApproval.service";

const APPS_KEY = "wm_employee_shift_applications_v1";
const POSTS_KEY = "wm_employer_shift_posts_v1";

function seedPlanAndBatch(): void {
  const planId = "dp_batch_s4";
  const batchId = "pb_s4_batch_001";

  localStorage.setItem(
    DEMAND_PLANS_STORAGE_KEY,
    JSON.stringify([
      {
        id: planId,
        name: "Batch Gate Plan",
        companyName: "Batch Co",
        locationName: "City A",
        category: "Security",
        experience: "experienced",
        startDate: "2026-09-01",
        endDate: "2026-09-03",
        workingDays: [1, 2, 3],
        slots: [
          { date: "2026-09-01", workers: 1, payPerDay: 800, postId: "sp_s4_1", slotId: "sl_1" },
          { date: "2026-09-02", workers: 1, payPerDay: 800, postId: "sp_s4_2", slotId: "sl_2" },
          { date: "2026-09-03", workers: 1, payPerDay: 800, postId: "sp_s4_3", slotId: "sl_3" },
        ],
        status: "active",
        createdAt: 1,
        updatedAt: 1,
        schemaVersion: 2,
        legalEntityMlId: "ML-ENT-S4",
        epochDays: 30,
        milestoneCursor: 0,
      },
    ]),
  );

  localStorage.setItem(
    POSTS_KEY,
    JSON.stringify([
      {
        id: "sp_s4_1",
        companyName: "Batch Co",
        jobName: "Batch Gate Plan",
        category: "Security",
        experience: "experienced",
        payPerDay: 800,
        locationName: "City A",
        startAt: Date.parse("2026-09-01T09:00:00"),
        endAt: Date.parse("2026-09-01T18:00:00"),
        vacancies: 1,
        waitingBuffer: 0,
        analysisStatus: "not_started",
        shortlistIds: [],
        waitingIds: [],
        confirmedIds: [],
        rejectedIds: [],
        status: "active",
        mustHave: [],
        goodToHave: [],
        isHiddenFromSearch: true,
        source: "planner",
        planId,
        planSlotDate: "2026-09-01",
      },
      {
        id: "sp_s4_2",
        companyName: "Batch Co",
        jobName: "Batch Gate Plan",
        category: "Security",
        experience: "experienced",
        payPerDay: 800,
        locationName: "City A",
        startAt: Date.parse("2026-09-02T09:00:00"),
        endAt: Date.parse("2026-09-02T18:00:00"),
        vacancies: 1,
        waitingBuffer: 0,
        analysisStatus: "not_started",
        shortlistIds: [],
        waitingIds: [],
        confirmedIds: [],
        rejectedIds: [],
        status: "active",
        mustHave: [],
        goodToHave: [],
        isHiddenFromSearch: true,
        source: "planner",
        planId,
        planSlotDate: "2026-09-02",
      },
      {
        id: "sp_s4_3",
        companyName: "Batch Co",
        jobName: "Batch Gate Plan",
        category: "Security",
        experience: "experienced",
        payPerDay: 800,
        locationName: "City A",
        startAt: Date.parse("2026-09-03T09:00:00"),
        endAt: Date.parse("2026-09-03T18:00:00"),
        vacancies: 1,
        waitingBuffer: 0,
        analysisStatus: "not_started",
        shortlistIds: [],
        waitingIds: [],
        confirmedIds: [],
        rejectedIds: [],
        status: "active",
        mustHave: [],
        goodToHave: [],
        isHiddenFromSearch: true,
        source: "planner",
        planId,
        planSlotDate: "2026-09-03",
      },
    ]),
  );

  localStorage.setItem(
    APPS_KEY,
    JSON.stringify([
      {
        id: "app_s4_1",
        postId: "sp_s4_1",
        createdAt: 10,
        status: "applied",
        mustHaveAnswers: {},
        goodToHaveAnswers: {},
        notes: {},
        planId,
        planApplyBatchId: batchId,
        profileSnapshot: { uniqueId: "ML-W-S4", fullName: "Batch Worker" },
      },
      {
        id: "app_s4_2",
        postId: "sp_s4_2",
        createdAt: 11,
        status: "applied",
        mustHaveAnswers: {},
        goodToHaveAnswers: {},
        notes: {},
        planId,
        planApplyBatchId: batchId,
        profileSnapshot: { uniqueId: "ML-W-S4", fullName: "Batch Worker" },
      },
      {
        id: "app_s4_3",
        postId: "sp_s4_3",
        createdAt: 12,
        status: "applied",
        mustHaveAnswers: {},
        goodToHaveAnswers: {},
        notes: {},
        planId,
        planApplyBatchId: batchId,
        profileSnapshot: { uniqueId: "ML-W-S4", fullName: "Batch Worker" },
      },
    ]),
  );
}

describe("plannerBatchApproval.service (Hybrid A2 S4)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("groups day applications by planApplyBatchId for employer plans", () => {
    seedPlanAndBatch();
    const batches = listPlannerApplicationBatches();
    expect(batches).toHaveLength(1);
    expect(batches[0]?.planApplyBatchId).toBe("pb_s4_batch_001");
    expect(batches[0]?.dayCount).toBe(3);
    expect(batches[0]?.pendingCount).toBe(3);
    expect(batches[0]?.reviewStatus).toBe("pending");
    expect(batches[0]?.workerName).toBe("Batch Worker");
  });

  it("rejects an entire pending batch without per-day Shift UI", () => {
    seedPlanAndBatch();
    const result = rejectPlannerApplicationBatch("pb_s4_batch_001");
    expect(result.ok).toBe(true);
    expect(result.processed).toBe(3);

    const batches = listPlannerApplicationBatches();
    expect(batches[0]?.pendingCount).toBe(0);
    expect(batches[0]?.reviewStatus).toBe("rejected");
  });
});
