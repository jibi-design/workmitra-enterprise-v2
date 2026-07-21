/**
 * Job Mitra | EmployeePlannerWorkspaceDayPage.tsx
 * Hybrid A2 S7 — native day/assignment detail (replaces ShiftWorkspacePage under /planner).
 */

import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getPlannerExecutionPort,
  type PlannerCheckInResult,
} from "../../../shared/planner/ports/plannerExecutionPort";
import {
  readEmployeeApplications,
  shiftWorkspacesStorage,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { getEmployerShiftPosts } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { runPlannerMilestoneEngine } from "../../../shared/planner/services/plannerMilestone.engine";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";

function readWorkerMlId(): string {
  return employeeProfileStorage.get().uniqueId?.trim() || "";
}

export function EmployeePlannerWorkspaceDayPage() {
  const { workspaceId = "" } = useParams();
  const nav = useNavigate();
  const [checkResult, setCheckResult] = useState<PlannerCheckInResult | null>(null);

  const workspace = useMemo(
    () => shiftWorkspacesStorage.getAll().find((w) => w.id === workspaceId) ?? null,
    [workspaceId],
  );

  const app = useMemo(() => {
    if (!workspace?.appId) return null;
    return readEmployeeApplications().find((a) => a.id === workspace.appId) ?? null;
  }, [workspace]);

  const post = useMemo(() => {
    if (!workspace?.postId) return null;
    return getEmployerShiftPosts().find((p) => p.id === workspace.postId) ?? null;
  }, [workspace]);

  const planId = app?.planId ?? post?.planId ?? "";
  const slotDate =
    post?.planSlotDate ?? (post?.startAt ? new Date(post.startAt).toISOString().slice(0, 10) : "");

  const status = useMemo(() => {
    if (!planId || !slotDate) return null;
    return getPlannerExecutionPort().getDayExecutionStatus({
      planId,
      slotDate,
      workerMlId: readWorkerMlId() || workspace?.workerMlId || "",
      postId: workspace?.postId,
    });
  }, [planId, slotDate, workspace]);

  function handleCheckIn() {
    const workerMlId = readWorkerMlId() || workspace?.workerMlId || "";
    if (!planId || !slotDate || !workerMlId) {
      setCheckResult({ ok: false, reason: "missing_ids" });
      return;
    }
    const result = getPlannerExecutionPort().recordDailyCheckIn({
      planId,
      slotDate,
      workerMlId,
      postId: workspace?.postId,
      applicationId: app?.id,
      workspaceId: workspace?.id,
    });
    setCheckResult(result);
    if (result.ok) runPlannerMilestoneEngine({ workerMlId, planId });
  }

  if (!workspace) {
    return (
      <div className="wm-ee-vPlanner wm-planner-page" data-testid="planner-workspace-day-missing">
        <h1 className="wm-pageTitle">Day not found</h1>
        <p className="wm-pageSub">This roster day is unavailable.</p>
        <Link to={ROUTE_PATHS.employeePlannerWorkspaceHub} data-testid="planner-workspace-day-back">
          Back to workspace hub
        </Link>
      </div>
    );
  }

  return (
    <div className="wm-ee-vPlanner wm-planner-page" data-testid="planner-workspace-day">
      <Link
        to={ROUTE_PATHS.employeePlannerWorkspaceHub}
        data-testid="planner-workspace-day-back"
        className="wm-outlineBtn"
        style={{
          display: "inline-flex",
          marginBottom: 14,
          padding: "8px 12px",
          borderRadius: 10,
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        ← Roster workspace
      </Link>

      <section
        style={{
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(8,145,178,0.22)",
          background: "#fff",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, color: "#0891b2" }}>
          Gig Project day · {slotDate || "—"}
        </div>
        <h1 className="wm-pageTitle" style={{ marginTop: 6 }}>
          {workspace.jobName}
        </h1>
        <p className="wm-pageSub">
          {workspace.companyName} · {workspace.locationName}
        </p>
        <div style={{ marginTop: 10, fontSize: 13 }}>
          Status: <strong>{workspace.status}</strong>
          {status?.attendanceConfirmed ? " · Checked in" : " · Not checked in"}
        </div>
        {planId ? (
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>Plan {planId}</div>
        ) : null}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          <button
            type="button"
            data-testid="planner-workspace-day-checkin"
            className="wm-planner-btnPrimary"
            onClick={handleCheckIn}
            style={{ padding: "10px 14px", fontWeight: 800 }}
          >
            Check in this day
          </button>
          <button
            type="button"
            className="wm-outlineBtn"
            onClick={() => nav(ROUTE_PATHS.employeePlannerApplications)}
            style={{ padding: "10px 14px", fontWeight: 700 }}
          >
            My applications
          </button>
        </div>

        {checkResult ? (
          <p
            data-testid="planner-workspace-day-checkin-result"
            data-ok={checkResult.ok ? "true" : "false"}
            style={{ marginTop: 12, color: checkResult.ok ? "#047857" : "#b91c1c", fontSize: 13 }}
          >
            {checkResult.ok ? `Checked in via ${checkResult.via}` : `Failed: ${checkResult.reason}`}
          </p>
        ) : null}
      </section>
    </div>
  );
}
