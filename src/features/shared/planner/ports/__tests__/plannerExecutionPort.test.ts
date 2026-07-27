/** Hybrid A2 S3 — PlannerExecutionPort + import boundary gates */

import { beforeEach, describe, expect, it } from "vitest";
import {
  PLANNER_DAILY_CHECKINS_KEY,
  getPlannerExecutionPort,
  setPlannerExecutionPort,
} from "../../ports";
import { createShiftPlannerExecutionAdapter } from "../../ports/adapters/shiftPlannerExecutionAdapter";

const SOFT_WRAP_DEBT = new Set<string>([
  // Soft-wrap UI debt cleared through S7 (workspaces/earnings/browse/applications).
]);

const plannerSources = {
  ...import.meta.glob("../../../employer/planner/**/*.{ts,tsx}", {
    eager: true,
    query: "?raw",
    import: "default",
  }),
  ...import.meta.glob("../../../employee/planner/**/*.{ts,tsx}", {
    eager: true,
    query: "?raw",
    import: "default",
  }),
} as Record<string, string>;

/** employer/shiftJobs sources — scanned for reverse planner coupling (SEP-SJB-1). */
const shiftJobsSources = import.meta.glob("../../../employer/shiftJobs/**/*.{ts,tsx}", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

describe("PlannerExecutionPort (Hybrid A2 S3)", () => {
  beforeEach(() => {
    localStorage.clear();
    setPlannerExecutionPort(createShiftPlannerExecutionAdapter());
  });

  it("records daily check-in via port without requiring Shift UI routes", () => {
    const port = getPlannerExecutionPort();
    const first = port.recordDailyCheckIn({
      planId: "dp_port_1",
      slotDate: "2026-09-01",
      workerMlId: "ML-WORKER-1",
    });
    expect(first.ok).toBe(true);
    if (first.ok) {
      expect(first.via).toBe("planner_ledger");
      expect(first.checkedInAt).toBeGreaterThan(0);
    }

    const raw = localStorage.getItem(PLANNER_DAILY_CHECKINS_KEY);
    expect(raw).toBeTruthy();
    expect(raw!).toContain("dp_port_1");

    const second = port.recordDailyCheckIn({
      planId: "dp_port_1",
      slotDate: "2026-09-01",
      workerMlId: "ML-WORKER-1",
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe("already_checked_in");
  });

  it("exposes day execution status after check-in", () => {
    const port = getPlannerExecutionPort();
    port.recordDailyCheckIn({
      planId: "dp_port_2",
      slotDate: "2026-09-02",
      workerMlId: "ML-WORKER-2",
    });
    const status = port.getDayExecutionStatus({
      planId: "dp_port_2",
      slotDate: "2026-09-02",
      workerMlId: "ML-WORKER-2",
    });
    expect(status?.attendanceConfirmed).toBe(true);
    expect(status?.checkedInAt).toBeTruthy();
  });
});

describe("Planner → shiftJobs import boundary (Hybrid A2 S3)", () => {
  it("forbids direct shiftJobs imports outside soft-wrap debt allowlist", () => {
    const importRe =
      /from\s+["'][^"']*shiftJobs[^"']*["']|from\s+["'][^"']*\/shift\/availability\.reader["']|from\s+["'][^"']*shiftEmployerPublic["']|from\s+["'][^"']*\/shiftOps\/[^"']*["']/;
    const violations: string[] = [];

    for (const [filePath, src] of Object.entries(plannerSources)) {
      const base = filePath.split("/").pop() ?? filePath;
      if (SOFT_WRAP_DEBT.has(base)) continue;
      if (typeof src !== "string") continue;
      if (importRe.test(src)) violations.push(filePath);
    }

    expect(violations, `Direct Shift imports found:\n${violations.join("\n")}`).toEqual([]);
  });
});

describe("shiftJobs → planner import boundary (SEP-SJB-1 / P0-B)", () => {
  it("forbids direct employer/planner imports; use plannerShiftJobsBridge or shared bridges", () => {
    // Relative ../../planner/... or absolute .../employer/planner/...
    // Does NOT match ../../../shared/planner/...
    const importRe =
      /from\s+["']\.\.\/\.\.\/planner\/[^"']*["']|from\s+["'][^"']*\/employer\/planner\/[^"']*["']/;
    const violations: string[] = [];

    for (const [filePath, src] of Object.entries(shiftJobsSources)) {
      if (typeof src !== "string") continue;
      if (importRe.test(src)) violations.push(filePath);
    }

    expect(
      violations,
      `Direct planner imports from shiftJobs (use plannerShiftJobsBridge):\n${violations.join("\n")}`,
    ).toEqual([]);
  });
});

describe("shiftJobs → shiftOps import boundary (SEP-SJO-1 / P0-C)", () => {
  it("forbids direct features/shiftOps imports; use shiftJobsMembershipBridge", () => {
    // Matches ../../../shiftOps/... but NOT ../../../shared/shiftOps/...
    const importRe =
      /from\s+["'](?:\.\.\/)+shiftOps\/[^"']*["']|from\s+["'][^"']*\/features\/shiftOps\/[^"']*["']/;
    const violations: string[] = [];

    for (const [filePath, src] of Object.entries(shiftJobsSources)) {
      if (typeof src !== "string") continue;
      if (importRe.test(src)) violations.push(filePath);
    }

    expect(
      violations,
      `Direct shiftOps imports from shiftJobs (use shiftJobsMembershipBridge):\n${violations.join("\n")}`,
    ).toEqual([]);
  });
});
