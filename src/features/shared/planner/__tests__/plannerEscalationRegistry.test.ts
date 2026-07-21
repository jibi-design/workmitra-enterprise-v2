/** Hybrid A2 Phase-2 P2.3 — planner escalation registry contract */

import { describe, expect, it } from "vitest";
import {
  PLANNER_ESCALATION_IDS,
  PLANNER_ESCALATION_REGISTRY,
  getPlannerEscalation,
  isPlannerEscalationActionRequired,
  listPlannerEscalations,
  plannerEscalationIncludesBell,
  plannerEscalationIncludesPulse,
  resolvePlannerEscalationNextStep,
  type PlannerEscalationId,
} from "../plannerEscalationRegistry";

const FORBIDDEN_DOMAIN_TOKENS = ["career", "admin", "employment", "nmc", "clinical"] as const;

describe("plannerEscalationRegistry (Hybrid A2 P2.3)", () => {
  it("exposes every catalog id as a complete entry", () => {
    expect(PLANNER_ESCALATION_IDS.length).toBeGreaterThanOrEqual(5);
    for (const id of PLANNER_ESCALATION_IDS) {
      const entry = getPlannerEscalation(id);
      expect(entry.id).toBe(id);
      expect(entry.summary.length).toBeGreaterThan(0);
      expect(entry.nextAction.length).toBeGreaterThan(0);
      expect(entry.nextRoute.startsWith("/")).toBe(true);
      expect(["info", "warning", "urgent"]).toContain(entry.severity);
      expect(["bell", "pulse", "bell_and_pulse"]).toContain(entry.channel);
      expect(["employer", "employee"]).toContain(entry.audience);
    }
  });

  it("maps Pulse escalations to nextAction/nextRoute + pulse surface (Zero Dead-End)", () => {
    for (const entry of listPlannerEscalations()) {
      if (!plannerEscalationIncludesPulse(entry.channel)) continue;
      expect(isPlannerEscalationActionRequired(entry)).toBe(true);
      expect(entry.pulseNodeId?.length).toBeGreaterThan(0);
      expect(entry.pulseSurface === "card" || entry.pulseSurface === "button").toBe(true);
      const step = resolvePlannerEscalationNextStep(entry.id);
      expect(step.nextAction).toBe(entry.nextAction);
      expect(step.nextRoute).toBe(entry.nextRoute);
    }
  });

  it("keeps Bell-only publish failure without pulse spam", () => {
    const failed = getPlannerEscalation("PLANNER_PUBLISH_FAILED");
    expect(failed.channel).toBe("bell");
    expect(plannerEscalationIncludesBell(failed.channel)).toBe(true);
    expect(plannerEscalationIncludesPulse(failed.channel)).toBe(false);
    expect(failed.pulseNodeId).toBeUndefined();
    expect(failed.nextRoute).toContain("/employer/planner/");
  });

  it("keeps nextRoute under /planner/* (no Career/Admin/Employment mix)", () => {
    for (const entry of listPlannerEscalations()) {
      const route = entry.nextRoute.toLowerCase();
      expect(route.includes("/planner/")).toBe(true);
      expect(route.includes("/career")).toBe(false);
      expect(route.includes("/admin")).toBe(false);
      expect(route.includes("/employment")).toBe(false);

      const blob = `${entry.id} ${entry.summary} ${entry.pulseNodeId ?? ""}`.toLowerCase();
      for (const token of FORBIDDEN_DOMAIN_TOKENS) {
        if (token === "clinical" || token === "nmc") {
          // Allowed only as explicit "not NMC clinical" wording in RTW summary.
          if (blob.includes(token)) {
            expect(blob.includes("not nmc") || blob.includes("not a clinical")).toBe(true);
          }
          continue;
        }
        expect(blob.includes(token)).toBe(false);
      }
    }
  });

  it("registers P2.4 trigger ids and P2.5 RTW as catalog-ready", () => {
    const p24: PlannerEscalationId[] = [
      "PLANNER_UNDERSTAFF_RISK",
      "PLANNER_NO_SHOW_CHECKIN",
      "PLANNER_PUBLISH_FAILED",
    ];
    for (const id of p24) {
      expect(PLANNER_ESCALATION_REGISTRY[id].triggerSection).toBe("P2.4");
    }
    expect(getPlannerEscalation("PLANNER_RTW_EXPIRING").triggerSection).toBe("P2.5");
    expect(getPlannerEscalation("PLANNER_PLAN_CANCELLED").triggerSection).toBe("legacy");
  });

  it("understaff uses bell_and_pulse; no-show uses pulse-only", () => {
    expect(getPlannerEscalation("PLANNER_UNDERSTAFF_RISK").channel).toBe("bell_and_pulse");
    expect(getPlannerEscalation("PLANNER_NO_SHOW_CHECKIN").channel).toBe("pulse");
    expect(getPlannerEscalation("PLANNER_NO_SHOW_CHECKIN").pulseSurface).toBe("card");
  });
});
