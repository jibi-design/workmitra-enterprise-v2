/**
 * Job Mitra | EmployeePlannerWorkspaceHubPage.tsx
 * Hybrid A2 S7 — native candidate roster workspace hub (no Shift soft-wrap).
 */

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getPlannerExecutionPort,
  type PlannerCheckInResult,
} from "../../../shared/planner/ports/plannerExecutionPort";
import {
  getAssignmentEpochProgress,
  runPlannerMilestoneEngine,
} from "../../../shared/planner/services/plannerMilestone.engine";
import { listPlannerRosterAssignments } from "../../../shared/planner/services/plannerRoster.helpers";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readWorkerMlId(): string {
  return employeeProfileStorage.get().uniqueId?.trim() || "";
}

export function EmployeePlannerWorkspaceHubPage() {
  const nav = useNavigate();
  const workerMlId = useMemo(() => readWorkerMlId(), []);
  const [tick, setTick] = useState(0);
  const [planId, setPlanId] = useState("");
  const [slotDate, setSlotDate] = useState(todayIsoDate);
  const [lastResult, setLastResult] = useState<PlannerCheckInResult | null>(null);

  const assignments = useMemo(() => {
    void tick;
    runPlannerMilestoneEngine({ workerMlId: workerMlId || undefined });
    return listPlannerRosterAssignments({
      workerMlId: workerMlId || undefined,
      confirmedOnly: true,
    });
  }, [workerMlId, tick]);

  const resolvedPlanId = planId.trim() || assignments[0]?.planId || "";

  function handleCheckIn() {
    if (!workerMlId) {
      setLastResult({ ok: false, reason: "missing_ids" });
      return;
    }
    const result = getPlannerExecutionPort().recordDailyCheckIn({
      planId: resolvedPlanId || "demo-plan",
      slotDate: slotDate.trim() || todayIsoDate(),
      workerMlId,
    });
    setLastResult(result);
    if (result.ok) {
      setTick((n) => n + 1);
    }
  }

  return (
    <div className="wm-ee-vPlanner wm-planner-page" data-testid="planner-employee-workspace-hub">
      <section
        style={{
          marginBottom: 16,
          padding: 16,
          borderRadius: 18,
          border: "1px solid rgba(8,145,178,0.2)",
          background:
            "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(255,255,255,0.98) 50%, rgba(236,254,255,0.88))",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#0e7490",
            marginBottom: 6,
          }}
        >
          Hybrid A2 · Roster Workspace
        </div>
        <h1 className="wm-pageTitle" style={{ margin: 0 }}>
          Candidate Roster Workspace
        </h1>
        <p className="wm-pageSub" style={{ marginTop: 6 }}>
          Active schedules, daily check-ins, and 30-day epoch progress — all under /planner.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          <Link
            to={ROUTE_PATHS.employeePlannerHome}
            data-testid="planner-employee-workspace-hub-back"
            className="wm-outlineBtn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Planner Home
          </Link>
          <Link
            to={ROUTE_PATHS.employeePlannerBrowse}
            data-testid="planner-employee-workspace-hub-discover"
            className="wm-primarybtn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Discover projects
          </Link>
        </div>
      </section>

      <div
        data-testid="planner-execution-checkin-panel"
        style={{
          marginBottom: 16,
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(8,145,178,0.25)",
          background: "#fff",
        }}
      >
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Daily check-in (Execution Port)</h2>
        <label style={{ display: "block", marginBottom: 8, fontSize: 13 }}>
          Plan ID
          <input
            data-testid="planner-checkin-plan-id"
            value={planId || resolvedPlanId}
            onChange={(e) => setPlanId(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
          Slot date
          <input
            data-testid="planner-checkin-slot-date"
            type="date"
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>
        <button
          type="button"
          data-testid="planner-checkin-submit"
          className="wm-primarybtn"
          onClick={handleCheckIn}
          style={{ padding: "10px 14px", borderRadius: 10, fontWeight: 700 }}
        >
          Check in today
        </button>
        {lastResult ? (
          <p
            data-testid="planner-checkin-result"
            data-ok={lastResult.ok ? "true" : "false"}
            style={{ marginTop: 12, fontSize: 13, color: lastResult.ok ? "#047857" : "#b91c1c" }}
          >
            {lastResult.ok
              ? `Checked in via ${lastResult.via} at ${new Date(lastResult.checkedInAt).toLocaleString()}`
              : `Check-in failed: ${lastResult.reason}`}
          </p>
        ) : null}
      </div>

      {assignments.length === 0 ? (
        <section
          data-testid="planner-workspace-hub-empty"
          style={{
            padding: 28,
            borderRadius: 18,
            border: "1px dashed rgba(8,145,178,0.35)",
            textAlign: "center",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900 }}>No active roster assignments</div>
          <p style={{ color: "#64748b", marginTop: 8 }}>
            When an employer batch-approves your plan application, assignments appear here.
          </p>
          <button
            type="button"
            className="wm-planner-btnPrimary"
            onClick={() => nav(ROUTE_PATHS.employeePlannerBrowse)}
            style={{ marginTop: 8, padding: "10px 16px", fontWeight: 800 }}
          >
            Browse Projects
          </button>
        </section>
      ) : (
        <div data-testid="planner-workspace-assignment-list" style={{ display: "grid", gap: 12 }}>
          {assignments.map((assignment) => {
            const progress = getAssignmentEpochProgress(assignment);
            return (
              <article
                key={`${assignment.planId}_${assignment.workerMlId}`}
                data-testid="planner-workspace-assignment-card"
                data-plan-id={assignment.planId}
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(8,145,178,0.22)",
                  background: "#fff",
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0891b2" }}>
                  Epoch {progress.currentEpochIndex + 1} · {progress.attendanceRate}% attendance
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>
                  {assignment.planName}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {assignment.companyName} · {assignment.days.length} confirmed days
                </div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  This epoch: {progress.daysCompleted}/{progress.daysScheduled} days checked in
                </div>
                <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                  {assignment.days.slice(0, 8).map((day) => (
                    <button
                      key={day.appId}
                      type="button"
                      data-testid="planner-workspace-day-link"
                      onClick={() => {
                        if (day.workspaceId) {
                          nav(
                            ROUTE_PATHS.employeePlannerWorkspace.replace(
                              ":workspaceId",
                              day.workspaceId,
                            ),
                          );
                        } else {
                          setPlanId(assignment.planId);
                          setSlotDate(day.date);
                        }
                      }}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(226,232,240,0.95)",
                        background: "rgba(248,250,252,0.95)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {day.date} · {day.status}
                      {day.workspaceId ? " · Open day →" : ""}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
