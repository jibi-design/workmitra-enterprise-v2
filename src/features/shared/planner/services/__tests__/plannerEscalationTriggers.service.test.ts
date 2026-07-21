/** Hybrid A2 Phase-2 P2.4 — escalation triggers unit gate */

import { beforeEach, describe, expect, it } from "vitest";
import { DEMAND_PLANS_STORAGE_KEY } from "../../../../employer/planner/storage/demandPlanner.schema";
import { demandPlannerStorage } from "../../../../employer/planner/storage/demandPlannerStorage";
import { employerNotificationsStorage } from "../../../../employer/notifications/storage/employerNotifications.storage";
import { usePulseStore } from "../../../../pulse/pulseStore";
import {
  PLANNER_ESCALATION_FIRED_KEY,
  UNDERSTAFF_NEAR_START_DAYS,
  __clearPlannerEscalationFiredForTests,
  detectNoShowMisses,
  detectUnderstaffRisks,
  fireUnderstaffEscalations,
  notifyPublishFailed,
} from "../plannerEscalationTriggers.service";
import { getPlannerEscalation } from "../../plannerEscalationRegistry";

const APPS_KEY = "wm_employee_shift_applications_v1";
const POSTS_KEY = "wm_employer_shift_posts_v1";

/** Fixed noon so ISO today is stable across CI TZ. */
const NOW = Date.parse("2026-07-21T12:00:00");

describe("Hybrid A2 P2.4 — planner escalation triggers", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(POSTS_KEY, "[]");
    localStorage.setItem(APPS_KEY, "[]");
    localStorage.setItem(DEMAND_PLANS_STORAGE_KEY, "[]");
    __clearPlannerEscalationFiredForTests();
    employerNotificationsStorage.clearAll();
    usePulseStore.getState().setChain([]);
  });

  it("detects understaff when near-start slots are underfilled", () => {
    const planId = demandPlannerStorage.create({
      name: "Understaff Plan",
      companyName: "Risk Co",
      locationName: "Kochi",
      category: "Security",
      experience: "experienced",
      startDate: "2026-07-21",
      endDate: "2026-07-23",
      workingDays: [2, 3, 4],
      slots: [
        { date: "2026-07-21", workers: 2, payPerDay: 800, slotId: "sl_u_1" },
        { date: "2026-07-22", workers: 2, payPerDay: 800, slotId: "sl_u_2" },
      ],
    });
    demandPlannerStorage.submit(planId, {});

    const risks = detectUnderstaffRisks(NOW);
    expect(risks.length).toBe(1);
    expect(risks[0]?.planId).toBe(planId);
    expect(risks[0]?.openNearStartSlots).toBe(2);
    expect(risks[0]?.fillRatio).toBe(0);
    expect(UNDERSTAFF_NEAR_START_DAYS).toBeGreaterThanOrEqual(1);
  });

  it("fires understaff bell once and activates catalog pulse node", () => {
    const planId = demandPlannerStorage.create({
      name: "Bell Understaff",
      companyName: "Risk Co",
      locationName: "Kochi",
      category: "Security",
      experience: "experienced",
      startDate: "2026-07-21",
      endDate: "2026-07-22",
      workingDays: [2, 3],
      slots: [{ date: "2026-07-21", workers: 3, payPerDay: 900, slotId: "sl_bell_1" }],
    });
    demandPlannerStorage.submit(planId, {});

    const first = fireUnderstaffEscalations(NOW);
    expect(first).toBe(1);
    const pulseId = getPlannerEscalation("PLANNER_UNDERSTAFF_RISK").pulseNodeId!;
    expect(usePulseStore.getState().chain[0]).toBe(pulseId);

    const shiftNotes = employerNotificationsStorage.getByDomain("shift");
    expect(shiftNotes.some((n) => n.title.includes("Understaff risk"))).toBe(true);

    const second = fireUnderstaffEscalations(NOW);
    expect(second).toBe(0);
    expect(localStorage.getItem(PLANNER_ESCALATION_FIRED_KEY)).toContain(planId);
  });

  it("detects no-show when past confirmed day lacks ExecutionPort check-in", () => {
    const planId = demandPlannerStorage.create({
      name: "NoShow Plan",
      companyName: "Risk Co",
      locationName: "Kochi",
      category: "Security",
      experience: "experienced",
      startDate: "2026-07-18",
      endDate: "2026-07-20",
      workingDays: [6, 0, 1],
      slots: [{ date: "2026-07-20", workers: 1, payPerDay: 700, slotId: "sl_ns_1" }],
    });
    demandPlannerStorage.submit(planId, {});
    const plan = demandPlannerStorage.getById(planId)!;
    const slotId = plan.slots[0]!.slotId!;

    localStorage.setItem(
      APPS_KEY,
      JSON.stringify([
        {
          id: "app_ns_1",
          postId: slotId,
          createdAt: 1,
          status: "confirmed",
          planId,
          profileSnapshot: {
            uniqueId: "ML-NS-1",
            fullName: "Missed Worker",
          },
          selectedDates: ["2026-07-20"],
          mustHaveAnswers: {},
          goodToHaveAnswers: {},
          notes: {},
        },
      ]),
    );

    const misses = detectNoShowMisses(NOW);
    expect(misses.length).toBe(1);
    expect(misses[0]?.workerMlId).toBe("ML-NS-1");
    expect(misses[0]?.missedDates).toContain("2026-07-20");
  });

  it("notifyPublishFailed is bell-only and deduped", () => {
    notifyPublishFailed("dp_fail", "Fail Plan");
    notifyPublishFailed("dp_fail", "Fail Plan");

    const matching = employerNotificationsStorage
      .getByDomain("shift")
      .filter((n) => n.title.includes("Publish failed"));
    expect(matching.length).toBe(1);
    expect(matching[0]?.route).toContain("/employer/planner/");
    expect(getPlannerEscalation("PLANNER_PUBLISH_FAILED").channel).toBe("bell");
    expect(usePulseStore.getState().chain).toHaveLength(0);
  });
});
