/**
 * Job Mitra | EmployerPlannerRosterDetailPage.tsx
 * Hybrid A2 S7 — plan-scoped roster console.
 */

import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { getPlannerExecutionPort } from "../../../shared/planner/ports/plannerExecutionPort";
import {
  getAssignmentEpochProgress,
  runPlannerMilestoneEngine,
} from "../../../shared/planner/services/plannerMilestone.engine";
import { listPlannerRosterAssignments } from "../../../shared/planner/services/plannerRoster.helpers";
import { getVaultPlannerHistory } from "../../../shared/planner/plannerVault";

export function EmployerPlannerRosterDetailPage() {
  const { planId = "" } = useParams();

  const plan = useMemo(() => {
    if (planId) runPlannerMilestoneEngine({ planId });
    return planId ? demandPlannerStorage.getById(planId) : null;
  }, [planId]);

  const assignments = useMemo(
    () => listPlannerRosterAssignments({ planId, confirmedOnly: true }),
    [planId],
  );

  const milestones = useMemo(
    () => getVaultPlannerHistory().filter((e) => e.planId === planId),
    [planId],
  );

  if (!planId) {
    return (
      <div data-testid="planner-employer-roster-detail">
        <p>Missing plan id.</p>
        <Link to={ROUTE_PATHS.employerPlannerRoster}>Back to Roster</Link>
      </div>
    );
  }

  return (
    <div className="wm-ee-vPlanner wm-planner-page" data-testid="planner-employer-roster-detail">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <Link
          to={ROUTE_PATHS.employerPlannerRoster}
          data-testid="planner-employer-roster-detail-stub-back"
          className="wm-outlineBtn"
          style={{
            display: "inline-flex",
            padding: "10px 14px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Back to Roster
        </Link>
        <Link
          to={ROUTE_PATHS.employerPlannerDetail.replace(":planId", planId)}
          style={{
            display: "inline-flex",
            padding: "10px 14px",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 700,
            border: "1px solid rgba(8,145,178,0.3)",
          }}
        >
          Open plan detail
        </Link>
      </div>

      <section
        style={{
          marginBottom: 16,
          padding: 16,
          borderRadius: 18,
          border: "1px solid rgba(8,145,178,0.2)",
          background: "#fff",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0e7490" }}>Roster console</div>
        <h1 className="wm-pageTitle" style={{ margin: "6px 0 0" }}>
          {plan?.name ?? `Plan ${planId}`}
        </h1>
        <p className="wm-pageSub" style={{ marginTop: 6 }}>
          {plan?.companyName ?? "Employer"} · epoch {plan?.epochDays ?? 30} days · cursor{" "}
          {plan?.milestoneCursor ?? 0}
        </p>
      </section>

      {assignments.length === 0 ? (
        <section
          data-testid="planner-roster-detail-empty"
          style={{
            padding: 24,
            borderRadius: 16,
            border: "1px dashed rgba(8,145,178,0.35)",
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: 900 }}>No confirmed workers yet</div>
          <p style={{ color: "#64748b", marginTop: 8 }}>
            Approve batches to place workers on this roster.
          </p>
          <Link to={ROUTE_PATHS.employerPlannerApplications}>Open Batch Approval</Link>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {assignments.map((assignment) => {
            const progress = getAssignmentEpochProgress(assignment);
            const dayStatuses = getPlannerExecutionPort().listPlanDayStatuses(
              assignment.planId,
              assignment.workerMlId,
            );
            const checked = dayStatuses.filter((d) => d.attendanceConfirmed).length;
            return (
              <article
                key={assignment.workerMlId}
                data-testid="planner-roster-worker-card"
                data-worker={assignment.workerMlId}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid rgba(8,145,178,0.2)",
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 900 }}>{assignment.workerName}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {assignment.workerMlId} · {assignment.days.length} days · check-ins {checked}
                </div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  Epoch {progress.currentEpochIndex + 1}: {progress.daysCompleted}/
                  {progress.daysScheduled} ({progress.attendanceRate}%)
                </div>
                <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
                  {assignment.days.map((day) => (
                    <div
                      key={day.appId}
                      style={{
                        fontSize: 11,
                        padding: "6px 8px",
                        borderRadius: 8,
                        background: "rgba(248,250,252,0.95)",
                      }}
                    >
                      {day.date} · {day.status}
                      {day.payPerDay ? ` · ₹${day.payPerDay}` : ""}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section style={{ marginTop: 18 }} data-testid="planner-roster-milestones">
        <h2 style={{ fontSize: 15, fontWeight: 900 }}>Committed milestones</h2>
        {milestones.length === 0 ? (
          <p style={{ fontSize: 13, color: "#64748b" }}>
            No epoch summaries committed yet. They appear when a 30-day window completes.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {milestones.map((m) => (
              <div
                key={m.id}
                data-testid="planner-roster-milestone-row"
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(226,232,240,0.95)",
                  fontSize: 12,
                }}
              >
                {m.employeeName} · Epoch {m.epochIndex + 1} · {m.attendanceRate}% ·{" "}
                {m.vaultFinalized ? "finalized" : "active summary"}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
