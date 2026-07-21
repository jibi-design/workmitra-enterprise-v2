/** Hybrid A2 Phase-2 P2.1 — planner audit log FIFO + CSV */

import { beforeEach, describe, expect, it } from "vitest";
import {
  PLANNER_AUDIT_LOG_KEY,
  PLANNER_AUDIT_MAX_PER_PLAN,
  appendPlannerAudit,
  getPlannerAuditLogForPlan,
  clearPlannerAuditForPlan,
} from "../plannerAuditLog.storage";
import {
  buildPlannerAuditCsv,
  plannerAuditCsvFilename,
} from "../../helpers/plannerAuditCsv.helpers";

describe("Hybrid A2 P2.1 — planner audit log", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(PLANNER_AUDIT_LOG_KEY, "[]");
  });

  it("appends entries newest-first per plan", () => {
    appendPlannerAudit({
      planId: "dp_a",
      action: "published",
      summary: "Published A",
      at: 1000,
    });
    appendPlannerAudit({
      planId: "dp_a",
      action: "batch_approved",
      summary: "Approved batch",
      at: 2000,
    });
    appendPlannerAudit({
      planId: "dp_b",
      action: "cancelled",
      summary: "Cancelled B",
      at: 1500,
    });

    const a = getPlannerAuditLogForPlan("dp_a");
    expect(a).toHaveLength(2);
    expect(a[0]?.action).toBe("batch_approved");
    expect(a[1]?.action).toBe("published");
    expect(getPlannerAuditLogForPlan("dp_b")).toHaveLength(1);
  });

  it("FIFO-trims to 200 entries per plan", () => {
    for (let i = 0; i < PLANNER_AUDIT_MAX_PER_PLAN + 25; i += 1) {
      appendPlannerAudit({
        planId: "dp_fifo",
        action: "draft_saved",
        summary: `Save ${i}`,
        at: 1000 + i,
      });
    }
    const rows = getPlannerAuditLogForPlan("dp_fifo");
    expect(rows).toHaveLength(PLANNER_AUDIT_MAX_PER_PLAN);
    expect(rows[0]?.summary).toBe(`Save ${PLANNER_AUDIT_MAX_PER_PLAN + 24}`);
    expect(rows[rows.length - 1]?.summary).toBe("Save 25");
  });

  it("builds CSV with header and escapes commas", () => {
    appendPlannerAudit({
      planId: "dp_csv",
      action: "published",
      summary: "Published, wind-down",
      actorMlId: "ML-ENT",
      meta: { childPostCount: 0, windDownNative: true },
      at: Date.parse("2026-07-21T12:00:00Z"),
    });
    const csv = buildPlannerAuditCsv(getPlannerAuditLogForPlan("dp_csv"));
    expect(csv.split("\n")[0]).toContain("planId");
    expect(csv).toContain("published");
    expect(csv).toContain('"Published, wind-down"');
    expect(plannerAuditCsvFilename("dp_csv", Date.parse("2026-07-21T12:00:00Z"))).toBe(
      "planner-audit_dp_csv_2026-07-21.csv",
    );
  });

  it("clearPlannerAuditForPlan removes only that plan", () => {
    appendPlannerAudit({ planId: "dp_x", action: "published", summary: "x" });
    appendPlannerAudit({ planId: "dp_y", action: "published", summary: "y" });
    clearPlannerAuditForPlan("dp_x");
    expect(getPlannerAuditLogForPlan("dp_x")).toHaveLength(0);
    expect(getPlannerAuditLogForPlan("dp_y")).toHaveLength(1);
  });
});
