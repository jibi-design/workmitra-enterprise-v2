/**
 * Job Mitra | EmployeePlannerEarningsPage.tsx
 * Hybrid A2 S7 — native planner earnings (no MyShift earnings soft-wrap).
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { listPlannerRosterAssignments } from "../../../shared/planner/services/plannerRoster.helpers";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";

function readWorkerMlId(): string {
  return employeeProfileStorage.get().uniqueId?.trim() || "";
}

export function EmployeePlannerEarningsPage() {
  const workerMlId = useMemo(() => readWorkerMlId(), []);
  const assignments = useMemo(
    () =>
      listPlannerRosterAssignments({
        workerMlId: workerMlId || undefined,
        confirmedOnly: true,
      }),
    [workerMlId],
  );

  const totalDays = assignments.reduce((n, a) => n + a.days.length, 0);
  const totalPay = assignments.reduce(
    (sum, a) => sum + a.days.reduce((s, d) => s + (d.payPerDay || 0), 0),
    0,
  );

  return (
    <div className="wm-ee-vPlanner wm-planner-page" data-testid="planner-employee-earnings">
      <section
        style={{
          marginBottom: 16,
          padding: 16,
          borderRadius: 18,
          border: "1px solid rgba(8,145,178,0.2)",
          background: "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(255,255,255,0.98) 50%)",
        }}
      >
        <h1 className="wm-pageTitle" style={{ margin: 0 }}>
          Project Earnings
        </h1>
        <p className="wm-pageSub" style={{ marginTop: 6 }}>
          Confirmed Gig Project days only — not mixed with green Shift earnings.
        </p>
        <Link
          to={ROUTE_PATHS.employeePlannerWorkspaceHub}
          data-testid="planner-earnings-workspace-cta"
          className="wm-primarybtn"
          style={{
            display: "inline-flex",
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Open roster workspace
        </Link>
      </section>

      {totalDays === 0 ? (
        <section
          data-testid="planner-earnings-empty"
          style={{
            padding: 28,
            borderRadius: 18,
            border: "1px dashed rgba(8,145,178,0.35)",
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: 900 }}>No confirmed project days yet</div>
          <p style={{ color: "#64748b", marginTop: 8 }}>
            Earnings appear after batch approval places you on a roster.
          </p>
          <Link to={ROUTE_PATHS.employeePlannerBrowse}>Browse Projects</Link>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div
            data-testid="planner-earnings-summary"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: "#fff",
                border: "1px solid rgba(8,145,178,0.18)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0891b2" }}>Confirmed days</div>
              <div style={{ fontSize: 22, fontWeight: 950 }}>{totalDays}</div>
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: "#fff",
                border: "1px solid rgba(8,145,178,0.18)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0891b2" }}>Est. total</div>
              <div style={{ fontSize: 22, fontWeight: 950 }}>
                ₹{totalPay.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {assignments.map((a) => (
            <article
              key={a.planId}
              data-testid="planner-earnings-plan-row"
              style={{
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(226,232,240,0.95)",
                background: "#fff",
              }}
            >
              <div style={{ fontWeight: 900 }}>{a.planName}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {a.days.length} days · ₹
                {a.days.reduce((s, d) => s + d.payPerDay, 0).toLocaleString("en-IN")}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
