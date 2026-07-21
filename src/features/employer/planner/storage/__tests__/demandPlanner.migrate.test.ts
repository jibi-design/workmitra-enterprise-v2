/** Hybrid A2 S2 — DemandPlan schema v2 migrator unit gate */

import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PLANNER_EPOCH_DAYS,
  DEMAND_PLAN_SCHEMA_VERSION,
  DEMAND_PLANS_STORAGE_KEY,
} from "../demandPlanner.schema";
import {
  ensureDaySlotIdentities,
  migrateDemandPlanList,
  migrateDemandPlanToV2,
} from "../demandPlanner.migrate";
import { demandPlannerStorage } from "../demandPlannerStorage";

describe("demandPlanner schema v2 migrator (Hybrid A2 S2)", () => {
  beforeEach(() => {
    localStorage.removeItem(DEMAND_PLANS_STORAGE_KEY);
  });

  it("migrates legacy v1 plan to schemaVersion 2 with epoch defaults + slotIds", () => {
    const legacy = {
      id: "dp_legacy_001",
      name: "Hospital Roster",
      companyName: "Agency Co",
      locationName: "Kochi",
      category: "Healthcare",
      experience: "experienced",
      startDate: "2026-08-01",
      endDate: "2026-10-31",
      workingDays: [1, 2, 3, 4, 5],
      slots: [
        { date: "2026-08-01", workers: 2, payPerDay: 900, postId: "sp_old_1" },
        { date: "2026-08-02", workers: 2, payPerDay: 900 },
      ],
      status: "active",
      createdAt: 1000,
      updatedAt: 2000,
      schemaVersion: 1,
    };

    const migrated = migrateDemandPlanToV2(legacy);
    expect(migrated).not.toBeNull();
    expect(migrated!.schemaVersion).toBe(DEMAND_PLAN_SCHEMA_VERSION);
    expect(migrated!.legalEntityMlId).toBe("");
    expect(migrated!.epochDays).toBe(DEFAULT_PLANNER_EPOCH_DAYS);
    expect(migrated!.milestoneCursor).toBe(0);
    expect(migrated!.slots[0]?.slotId).toBe("sl_dp_legacy_001_2026-08-01");
    expect(migrated!.slots[0]?.postId).toBe("sp_old_1");
    expect(migrated!.slots[1]?.slotId).toBe("sl_dp_legacy_001_2026-08-02");
  });

  it("is idempotent for already-v2 plans", () => {
    const once = migrateDemandPlanToV2({
      id: "dp_v2",
      name: "N",
      companyName: "C",
      locationName: "L",
      category: "Cat",
      experience: "experienced",
      startDate: "2026-08-01",
      endDate: "2026-08-10",
      workingDays: [1],
      slots: [{ date: "2026-08-01", workers: 1, payPerDay: 500, slotId: "sl_custom" }],
      status: "draft",
      createdAt: 1,
      updatedAt: 1,
      schemaVersion: 2,
      legalEntityMlId: "ML-ENT-001",
      epochDays: 30,
      milestoneCursor: 2,
    });
    const twice = migrateDemandPlanToV2(once);
    expect(twice).toEqual(once);
    expect(twice!.slots[0]?.slotId).toBe("sl_custom");
    expect(twice!.legalEntityMlId).toBe("ML-ENT-001");
    expect(twice!.milestoneCursor).toBe(2);
  });

  it("migrateDemandPlanList reports migratedCount and persists via storage read", () => {
    const legacyList = [
      {
        id: "dp_a",
        name: "A",
        companyName: "C",
        locationName: "L",
        category: "Cat",
        experience: "experienced",
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        workingDays: [1],
        slots: [{ date: "2026-08-01", workers: 1, payPerDay: 100 }],
        status: "draft",
        createdAt: 1,
        updatedAt: 1,
      },
    ];
    const result = migrateDemandPlanList(legacyList);
    expect(result.changed).toBe(true);
    expect(result.migratedCount).toBe(1);
    expect(result.plans[0]?.schemaVersion).toBe(2);

    localStorage.setItem(DEMAND_PLANS_STORAGE_KEY, JSON.stringify(legacyList));
    const fromStore = demandPlannerStorage.getAll();
    expect(fromStore).toHaveLength(1);
    expect(fromStore[0]?.schemaVersion).toBe(2);
    expect(fromStore[0]?.epochDays).toBe(30);

    const rawAfter = JSON.parse(localStorage.getItem(DEMAND_PLANS_STORAGE_KEY) ?? "[]") as Array<{
      schemaVersion?: number;
    }>;
    expect(rawAfter[0]?.schemaVersion).toBe(2);
  });

  it("create writes schema v2 with epoch defaults and slotIds", () => {
    const id = demandPlannerStorage.create({
      name: "New Plan",
      companyName: "Agency",
      locationName: "Kochi",
      category: "Construction",
      experience: "experienced",
      startDate: "2026-09-01",
      endDate: "2026-09-05",
      workingDays: [1, 2, 3, 4, 5],
      slots: [{ date: "2026-09-01", workers: 3, payPerDay: 1200 }],
    });

    const plan = demandPlannerStorage.getById(id);
    expect(plan?.schemaVersion).toBe(2);
    expect(plan?.epochDays).toBe(DEFAULT_PLANNER_EPOCH_DAYS);
    expect(plan?.milestoneCursor).toBe(0);
    expect(plan?.legalEntityMlId).toBe("");
    expect(plan?.slots[0]?.slotId).toBe(`sl_${id}_2026-09-01`);
  });

  it("ensureDaySlotIdentities backfills missing slotIds only", () => {
    const slots = ensureDaySlotIdentities("dp_x", [
      { date: "2026-01-01", workers: 1, payPerDay: 1, slotId: "keep-me" },
      { date: "2026-01-02", workers: 1, payPerDay: 1 },
    ]);
    expect(slots[0]?.slotId).toBe("keep-me");
    expect(slots[1]?.slotId).toBe("sl_dp_x_2026-01-02");
  });

  it("draft create → reload → edit preserves v2 fields (S2 E2E gate)", () => {
    const id = demandPlannerStorage.create({
      name: "Draft",
      companyName: "Co",
      locationName: "City",
      category: "Ops",
      experience: "experienced",
      startDate: "2026-09-01",
      endDate: "2026-09-10",
      workingDays: [1, 2, 3],
      slots: [],
      legalEntityMlId: "ML-LEGAL-9",
      epochDays: 30,
    });

    const reloaded = demandPlannerStorage.getById(id);
    expect(reloaded?.legalEntityMlId).toBe("ML-LEGAL-9");

    demandPlannerStorage.updatePlan(id, {
      name: "Draft Updated",
      slots: [{ date: "2026-09-01", workers: 2, payPerDay: 800 }],
    });

    const edited = demandPlannerStorage.getById(id);
    expect(edited?.name).toBe("Draft Updated");
    expect(edited?.schemaVersion).toBe(2);
    expect(edited?.legalEntityMlId).toBe("ML-LEGAL-9");
    expect(edited?.slots[0]?.slotId).toBe(`sl_${id}_2026-09-01`);
    // No Shift post materialization in S2 — postId stays unset
    expect(edited?.slots[0]?.postId).toBeUndefined();
  });
});
