/** Hybrid A2 Phase-2 P2.5 — RTW tracker + escalation unit gate */

import { beforeEach, describe, expect, it } from "vitest";
import { DEMAND_PLANS_STORAGE_KEY } from "../../../../employer/planner/storage/demandPlanner.schema";
import { demandPlannerStorage } from "../../../../employer/planner/storage/demandPlannerStorage";
import {
  PLANNER_AUDIT_LOG_KEY,
  getPlannerAuditLogForPlan,
} from "../../../../employer/planner/storage/plannerAuditLog.storage";
import {
  DEFAULT_PLANNER_RTW_WARN_DAYS,
  PLANNER_RTW_STORAGE_KEY,
  __clearPlannerRtwForTests,
  getPlannerRtwWarnDays,
  setPlannerRtwWarnDays,
  upsertPlannerRtwRecord,
} from "../../../../employer/planner/storage/plannerRtw.storage";
import { employerNotificationsStorage } from "../../../../employer/notifications/storage/employerNotifications.storage";
import { usePulseStore } from "../../../../pulse/pulseStore";
import { getPlannerEscalation } from "../../plannerEscalationRegistry";
import {
  __clearPlannerRtwFiredForTests,
  detectRtwFlags,
  fireRtwEscalations,
  getPlannerRtwFlagLevel,
} from "../plannerRtw.service";

const APPS_KEY = "wm_employee_shift_applications_v1";
const POSTS_KEY = "wm_employer_shift_posts_v1";
const NOW = Date.parse("2026-07-21T12:00:00");

describe("Hybrid A2 P2.5 — planner RTW tracker", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(POSTS_KEY, "[]");
    localStorage.setItem(APPS_KEY, "[]");
    localStorage.setItem(DEMAND_PLANS_STORAGE_KEY, "[]");
    localStorage.setItem(PLANNER_AUDIT_LOG_KEY, "[]");
    __clearPlannerRtwForTests();
    __clearPlannerRtwFiredForTests();
    employerNotificationsStorage.clearAll();
    usePulseStore.getState().setChain([]);
  });

  it("stores configurable warn window (default 30)", () => {
    expect(getPlannerRtwWarnDays()).toBe(DEFAULT_PLANNER_RTW_WARN_DAYS);
    expect(setPlannerRtwWarnDays(14)).toBe(14);
    expect(getPlannerRtwWarnDays()).toBe(14);
    expect(localStorage.getItem(PLANNER_RTW_STORAGE_KEY)).toContain("14");
  });

  it("flags warning and expired levels relative to warnDaysBefore", () => {
    upsertPlannerRtwRecord({
      workerMlId: "ML-RTW-1",
      expiresOn: "2026-07-25",
      documentKind: "visa",
    });
    setPlannerRtwWarnDays(30);
    expect(getPlannerRtwFlagLevel("ML-RTW-1", NOW).level).toBe("warning");

    upsertPlannerRtwRecord({
      workerMlId: "ML-RTW-2",
      expiresOn: "2026-07-10",
      documentKind: "right_to_work",
    });
    expect(getPlannerRtwFlagLevel("ML-RTW-2", NOW).level).toBe("expired");
    expect(getPlannerRtwFlagLevel("ML-MISSING", NOW).level).toBe("missing");
  });

  it("detects roster RTW flags, audits rtw_flagged, fires bell+pulse once", () => {
    const planId = demandPlannerStorage.create({
      name: "RTW Plan",
      companyName: "RTW Co",
      locationName: "Kochi",
      category: "Security",
      experience: "experienced",
      startDate: "2026-07-01",
      endDate: "2026-07-30",
      workingDays: [1, 2, 3, 4, 5],
      slots: [{ date: "2026-07-20", workers: 1, payPerDay: 800, slotId: "sl_rtw_1" }],
    });
    demandPlannerStorage.submit(planId, {});
    const slotId = demandPlannerStorage.getById(planId)!.slots[0]!.slotId!;

    localStorage.setItem(
      APPS_KEY,
      JSON.stringify([
        {
          id: "app_rtw_1",
          postId: slotId,
          createdAt: 1,
          status: "confirmed",
          planId,
          profileSnapshot: { uniqueId: "ML-RTW-W1", fullName: "RTW Worker" },
          selectedDates: ["2026-07-20"],
          mustHaveAnswers: {},
          goodToHaveAnswers: {},
          notes: {},
        },
      ]),
    );

    upsertPlannerRtwRecord({
      workerMlId: "ML-RTW-W1",
      workerName: "RTW Worker",
      expiresOn: "2026-07-28",
      documentKind: "visa",
    });

    const flags = detectRtwFlags(NOW, planId);
    expect(flags.length).toBe(1);
    expect(flags[0]?.level).toBe("warning");

    const fired = fireRtwEscalations(NOW, planId);
    expect(fired).toBe(1);
    expect(fireRtwEscalations(NOW, planId)).toBe(0);

    const audit = getPlannerAuditLogForPlan(planId);
    expect(audit.some((e) => e.action === "rtw_flagged")).toBe(true);
    expect(audit[0]?.meta?.notNmcClinical).toBe(true);

    const bells = employerNotificationsStorage
      .getByDomain("shift")
      .filter((n) => n.title.includes("RTW"));
    expect(bells.length).toBe(1);

    const pulseId = getPlannerEscalation("PLANNER_RTW_EXPIRING").pulseNodeId!;
    expect(usePulseStore.getState().chain[0]).toBe(pulseId);
  });
});
