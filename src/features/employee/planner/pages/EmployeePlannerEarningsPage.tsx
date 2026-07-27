/**
 * Job Mitra | EmployeePlannerEarningsPage.tsx
 * Hybrid A2 S7 — native planner earnings (no MyShift earnings soft-wrap).
 * P-UI-1 — DomainHero + soft glass KPI tiles.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
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
      <DomainHero
        variant="planner"
        audience="employee"
        eyebrow="Earnings"
        title="Project Earnings"
        subtitle="Confirmed Gig Project days only — not mixed with green Shift earnings."
        trailing={
          <Link
            to={ROUTE_PATHS.employeePlannerWorkspaceHub}
            data-testid="planner-earnings-workspace-cta"
            className="wm-planner-btnPrimary"
            style={{
              textDecoration: "none",
              minHeight: 36,
              padding: "6px 12px",
              fontSize: 12,
            }}
          >
            Open roster
          </Link>
        }
      />

      {totalDays === 0 ? (
        <section
          data-testid="planner-earnings-empty"
          className="wm-planner-card"
          style={{ marginTop: 14 }}
        >
          <div style={{ fontWeight: 900, textAlign: "center" }}>No confirmed project days yet</div>
          <p style={{ color: "#64748b", marginTop: 8, textAlign: "center" }}>
            Earnings appear after batch approval places you on a roster.
          </p>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Link
              to={ROUTE_PATHS.employeePlannerBrowse}
              className="wm-planner-btnGhost"
              style={{ textDecoration: "none" }}
            >
              Browse Projects
            </Link>
          </div>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <div
            data-testid="planner-earnings-summary"
            className="wm-planner-kpiStrip"
            style={{ marginTop: 0 }}
          >
            <div className="wm-planner-kpiTile">
              <div className="wm-planner-kpiLabel">Confirmed days</div>
              <div className="wm-planner-kpiValue">{totalDays}</div>
            </div>
            <div className="wm-planner-kpiTile">
              <div className="wm-planner-kpiLabel">Est. total</div>
              <div className="wm-planner-kpiValue">₹{totalPay.toLocaleString("en-IN")}</div>
            </div>
          </div>

          {assignments.map((a) => (
            <article
              key={a.planId}
              data-testid="planner-earnings-plan-row"
              className="wm-planner-card"
              style={{ marginTop: 0 }}
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
