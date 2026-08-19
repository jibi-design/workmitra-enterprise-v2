/** Hybrid A2 S7 — milestone engine unit gate */

import { beforeEach, describe, expect, it } from "vitest";
import { DEMAND_PLANS_STORAGE_KEY } from "../../../../employer/planner/storage/demandPlanner.schema";
import { demandPlannerStorage } from "../../../../employer/planner/storage/demandPlannerStorage";
import {
  getCurrentEpochIndex,
  getEpochWindow,
  runPlannerMilestoneEngine,
} from "../plannerMilestone.engine";
import { VAULT_PLANNER_HISTORY_KEY } from "../../../../employee/workVault/storage/vaultPlannerHistory.storage";
import { PLANNER_DAILY_CHECKINS_KEY } from "../../ports/plannerCheckIn.ledger";

const PLAN = "dp_s7_mile";
const WORKER = "ML-S7-WORKER";
const DAY_MS = 86_400_000;

function seedAssignment(joinedAt: number): void {
  localStorage.setItem(
    DEMAND_PLANS_STORAGE_KEY,
    JSON.stringify([
      {
        id: PLAN,
        name: "Milestone Plan",
        companyName: "Mile Co",
        locationName: "City A",
        category: "Security",
        experience: "experienced",
        startDate: "2026-01-01",
        endDate: "2026-06-01",
        workingDays: [1, 2, 3, 4, 5],
        slots: [
          { date: "2026-01-05", workers: 1, payPerDay: 800, postId: "sp_s7_1", slotId: "sl1" },
          { date: "2026-01-06", workers: 1, payPerDay: 800, postId: "sp_s7_2", slotId: "sl2" },
          { date: "2026-02-10", workers: 1, payPerDay: 800, postId: "sp_s7_3", slotId: "sl3" },
        ],
        status: "active",
        createdAt: joinedAt,
        updatedAt: joinedAt,
        schemaVersion: 2,
        legalEntityMlId: "ML-ENT-S7",
        epochDays: 30,
        milestoneCursor: 0,
      },
    ]),
  );

  localStorage.setItem(
    "wm_employer_shift_posts_v1",
    JSON.stringify([
      {
        id: "sp_s7_1",
        companyName: "Mile Co",
        jobName: "Milestone Plan",
        category: "Security",
        experience: "experienced",
        payPerDay: 800,
        locationName: "City A",
        startAt: Date.parse("2026-01-05T09:00:00"),
        endAt: Date.parse("2026-01-05T18:00:00"),
        vacancies: 1,
        waitingBuffer: 0,
        analysisStatus: "not_started",
        shortlistIds: [],
        waitingIds: [],
        confirmedIds: ["app_s7_1"],
        rejectedIds: [],
        status: "active",
        mustHave: [],
        goodToHave: [],
        isHiddenFromSearch: true,
        source: "planner",
        planId: PLAN,
        planSlotDate: "2026-01-05",
      },
      {
        id: "sp_s7_2",
        companyName: "Mile Co",
        jobName: "Milestone Plan",
        category: "Security",
        experience: "experienced",
        payPerDay: 800,
        locationName: "City A",
        startAt: Date.parse("2026-01-06T09:00:00"),
        endAt: Date.parse("2026-01-06T18:00:00"),
        vacancies: 1,
        waitingBuffer: 0,
        analysisStatus: "not_started",
        shortlistIds: [],
        waitingIds: [],
        confirmedIds: ["app_s7_2"],
        rejectedIds: [],
        status: "active",
        mustHave: [],
        goodToHave: [],
        isHiddenFromSearch: true,
        source: "planner",
        planId: PLAN,
        planSlotDate: "2026-01-06",
      },
      {
        id: "sp_s7_3",
        companyName: "Mile Co",
        jobName: "Milestone Plan",
        category: "Security",
        experience: "experienced",
        payPerDay: 800,
        locationName: "City A",
        startAt: Date.parse("2026-02-10T09:00:00"),
        endAt: Date.parse("2026-02-10T18:00:00"),
        vacancies: 1,
        waitingBuffer: 0,
        analysisStatus: "not_started",
        shortlistIds: [],
        waitingIds: [],
        confirmedIds: ["app_s7_3"],
        rejectedIds: [],
        status: "active",
        mustHave: [],
        goodToHave: [],
        isHiddenFromSearch: true,
        source: "planner",
        planId: PLAN,
        planSlotDate: "2026-02-10",
      },
    ]),
  );

  localStorage.setItem(
    "wm_employee_shift_applications_v1",
    JSON.stringify([
      {
        id: "app_s7_1",
        postId: "sp_s7_1",
        createdAt: joinedAt,
        status: "confirmed",
        mustHaveAnswers: {},
        goodToHaveAnswers: {},
        notes: {},
        planId: PLAN,
        planApplyBatchId: "pb_s7",
        profileSnapshot: { uniqueId: WORKER, fullName: "Mile Worker" },
      },
      {
        id: "app_s7_2",
        postId: "sp_s7_2",
        createdAt: joinedAt + 1,
        status: "confirmed",
        mustHaveAnswers: {},
        goodToHaveAnswers: {},
        notes: {},
        planId: PLAN,
        planApplyBatchId: "pb_s7",
        profileSnapshot: { uniqueId: WORKER, fullName: "Mile Worker" },
      },
      {
        id: "app_s7_3",
        postId: "sp_s7_3",
        createdAt: joinedAt + 2,
        status: "confirmed",
        mustHaveAnswers: {},
        goodToHaveAnswers: {},
        notes: {},
        planId: PLAN,
        planApplyBatchId: "pb_s7",
        profileSnapshot: { uniqueId: WORKER, fullName: "Mile Worker" },
      },
    ]),
  );

  localStorage.setItem("wm_employee_shift_workspaces_v1", JSON.stringify([]));
}

describe("plannerMilestone.engine (Hybrid A2 S7)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("computes plan-local epoch windows from joinedAt", () => {
    const joinedAt = Date.parse("2026-01-01T00:00:00Z");
    const window0 = getEpochWindow(joinedAt, 0, 30);
    expect(window0.epochIndex).toBe(0);
    expect(getCurrentEpochIndex(joinedAt, joinedAt + 29 * DAY_MS, 30)).toBe(0);
    expect(getCurrentEpochIndex(joinedAt, joinedAt + 30 * DAY_MS, 30)).toBe(1);
  });

  it("commits completed epoch summaries idempotently into vault", () => {
    const joinedAt = Date.parse("2026-01-01T00:00:00Z");
    seedAssignment(joinedAt);

    localStorage.setItem(
      PLANNER_DAILY_CHECKINS_KEY,
      JSON.stringify([
        {
          planId: PLAN,
          slotDate: "2026-01-05",
          workerMlId: WORKER,
          checkedInAt: joinedAt + DAY_MS,
        },
      ]),
    );

    const afterEpoch0 = joinedAt + 31 * DAY_MS;
    const first = runPlannerMilestoneEngine({ now: afterEpoch0, planId: PLAN });
    expect(first.committed.length).toBeGreaterThanOrEqual(1);
    expect(first.committed[0]?.epochIndex).toBe(0);
    expect(first.committed[0]?.daysScheduled).toBe(2);
    expect(first.committed[0]?.daysCompleted).toBe(1);

    const raw = localStorage.getItem(VAULT_PLANNER_HISTORY_KEY);
    expect(raw).toContain(PLAN);
    expect(raw).toContain('"vaultFinalized":false');

    const second = runPlannerMilestoneEngine({ now: afterEpoch0, planId: PLAN });
    expect(second.committed).toHaveLength(0);

    const plan = demandPlannerStorage.getById(PLAN);
    expect(plan?.milestoneCursor).toBeGreaterThanOrEqual(1);
  });

  it("finalizes on 60-day inactivity", () => {
    const joinedAt = Date.parse("2026-01-01T00:00:00Z");
    seedAssignment(joinedAt);
    // Last confirmed day in seed is 2026-02-10 (~40d after join). Jump far past 60d inactivity.
    const farFuture = Date.parse("2026-05-01T00:00:00Z");
    const result = runPlannerMilestoneEngine({ now: farFuture, planId: PLAN });
    expect(result.inactivityFinalized).toBeGreaterThanOrEqual(1);
    const raw = localStorage.getItem(VAULT_PLANNER_HISTORY_KEY) ?? "[]";
    expect(raw).toContain("inactivity");
  });
});
