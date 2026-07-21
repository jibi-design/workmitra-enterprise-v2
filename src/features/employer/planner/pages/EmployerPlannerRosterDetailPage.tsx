/**
 * Job Mitra | EmployerPlannerRosterDetailPage.tsx
 * Hybrid A2 S7 — plan-scoped roster console.
 * Hybrid A2 P2.4 — no-show / miss check-in PulseTargetCard.
 * Hybrid A2 P2.5 — Visa / Right-to-Work expiry badge + PulseTargetCard.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { PulseTargetCard } from "../../../pulse/PulseTarget";
import { getPlannerEscalation } from "../../../shared/planner/plannerEscalationRegistry";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import {
  getPlannerRtwRecord,
  getPlannerRtwWarnDays,
  setPlannerRtwWarnDays,
  upsertPlannerRtwRecord,
} from "../storage/plannerRtw.storage";
import { getPlannerExecutionPort } from "../../../shared/planner/ports/plannerExecutionPort";
import {
  getAssignmentEpochProgress,
  runPlannerMilestoneEngine,
} from "../../../shared/planner/services/plannerMilestone.engine";
import {
  fireNoShowEscalations,
  listNoShowWorkerMlIdsForPlan,
} from "../../../shared/planner/services/plannerEscalationTriggers.service";
import {
  fireRtwEscalations,
  getPlannerRtwFlagLevel,
  listRtwFlaggedWorkerMlIdsForPlan,
} from "../../../shared/planner/services/plannerRtw.service";
import { listPlannerRosterAssignments } from "../../../shared/planner/services/plannerRoster.helpers";
import { getVaultPlannerHistory } from "../../../shared/planner/plannerVault";
import { StatusBadge, TrustStrip } from "../../../../shared/components/enterprise";

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

  const [warnDays, setWarnDays] = useState(() => getPlannerRtwWarnDays());
  const [rtwDrafts, setRtwDrafts] = useState<Record<string, string>>({});
  const [rtwTick, setRtwTick] = useState(0);

  // rtwTick re-reads storage after Save RTW / warn-days updates.
  void rtwTick;
  const noShowWorkers = planId ? listNoShowWorkerMlIdsForPlan(planId) : new Set<string>();
  const rtwWorkers = planId ? listRtwFlaggedWorkerMlIdsForPlan(planId) : new Set<string>();

  const noshowPulseId =
    getPlannerEscalation("PLANNER_NO_SHOW_CHECKIN").pulseNodeId ?? "employer-planner-roster-noshow";
  const rtwPulseId =
    getPlannerEscalation("PLANNER_RTW_EXPIRING").pulseNodeId ?? "employer-planner-roster-rtw";

  useEffect(() => {
    if (!planId) return;
    fireNoShowEscalations(undefined, planId);
    fireRtwEscalations(undefined, planId);
  }, [planId, rtwTick]);

  function handleSaveRtw(workerMlId: string, workerName: string) {
    const expiresOn = (
      rtwDrafts[workerMlId] ??
      getPlannerRtwRecord(workerMlId)?.expiresOn ??
      ""
    ).trim();
    if (!expiresOn) return;
    upsertPlannerRtwRecord({
      workerMlId,
      workerName,
      expiresOn,
      documentKind: "right_to_work",
    });
    setRtwTick((n) => n + 1);
  }

  function handleWarnDaysSave() {
    setWarnDays(setPlannerRtwWarnDays(warnDays));
    setRtwTick((n) => n + 1);
  }

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
        <div
          data-testid="planner-roster-rtw-settings"
          style={{
            marginTop: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            fontSize: 12,
          }}
        >
          <span style={{ fontWeight: 700, color: "#0f172a" }}>RTW warn (days before expiry)</span>
          <input
            type="number"
            min={1}
            max={365}
            value={warnDays}
            data-testid="planner-roster-rtw-warn-days"
            onChange={(e) => setWarnDays(Number(e.target.value) || 1)}
            style={{ width: 72, padding: "6px 8px", borderRadius: 8, border: "1px solid #cbd5e1" }}
          />
          <button
            type="button"
            className="wm-outlineBtn"
            data-testid="planner-roster-rtw-warn-save"
            onClick={handleWarnDaysSave}
            style={{ padding: "6px 10px", borderRadius: 8, fontWeight: 700 }}
          >
            Save
          </button>
          <span style={{ color: "#64748b" }}>Visa / Right-to-Work only — not clinical NMC.</span>
        </div>
        {rtwWorkers.size > 0 ? (
          <div style={{ marginTop: 12 }}>
            <TrustStrip
              kind="rtw"
              tone="warning"
              title="RTW review needed"
              message={`${rtwWorkers.size} worker(s) on this roster have Visa / Right-to-Work expiry warnings.`}
              badgeLabel="RTW"
              testId="planner-roster-rtw-trust"
            />
          </div>
        ) : null}
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
            const isNoShow = noShowWorkers.has(assignment.workerMlId);
            const isRtw = rtwWorkers.has(assignment.workerMlId);
            const rtwStatus = getPlannerRtwFlagLevel(assignment.workerMlId);
            const storedExpiry = rtwStatus.record?.expiresOn ?? "";
            const draftExpiry = rtwDrafts[assignment.workerMlId] ?? storedExpiry;

            const article = (
              <article
                data-testid="planner-roster-worker-card"
                data-worker={assignment.workerMlId}
                data-noshow={isNoShow ? "1" : "0"}
                data-rtw={isRtw ? "1" : "0"}
                data-rtw-level={rtwStatus.level}
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
                  {isNoShow ? " · missed check-in" : ""}
                </div>
                {(rtwStatus.level === "warning" || rtwStatus.level === "expired") && (
                  <div data-testid="planner-roster-rtw-badge" style={{ marginTop: 8 }}>
                    <StatusBadge
                      accent="planner"
                      tone={rtwStatus.level === "expired" ? "critical" : "warning"}
                      label={
                        rtwStatus.daysRemaining !== null
                          ? rtwStatus.level === "expired"
                            ? `RTW expired · ${Math.abs(rtwStatus.daysRemaining)}d overdue`
                            : `RTW warning · ${rtwStatus.daysRemaining}d left`
                          : `RTW ${rtwStatus.level}`
                      }
                    />
                  </div>
                )}
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  Epoch {progress.currentEpochIndex + 1}: {progress.daysCompleted}/
                  {progress.daysScheduled} ({progress.attendanceRate}%)
                </div>
                <div
                  data-testid="planner-roster-rtw-editor"
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <label style={{ fontWeight: 700 }}>
                    RTW expiry
                    <input
                      type="date"
                      value={draftExpiry}
                      data-testid="planner-roster-rtw-date"
                      onChange={(e) =>
                        setRtwDrafts((prev) => ({
                          ...prev,
                          [assignment.workerMlId]: e.target.value,
                        }))
                      }
                      style={{
                        marginLeft: 8,
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="wm-outlineBtn"
                    data-testid="planner-roster-rtw-save"
                    onClick={() => handleSaveRtw(assignment.workerMlId, assignment.workerName)}
                    style={{ padding: "6px 10px", borderRadius: 8, fontWeight: 700 }}
                  >
                    Save RTW
                  </button>
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

            const pulseId = isNoShow ? noshowPulseId : isRtw ? rtwPulseId : null;
            if (!pulseId) {
              return <div key={assignment.workerMlId}>{article}</div>;
            }

            return (
              <PulseTargetCard key={assignment.workerMlId} pulseId={pulseId} radius="16px">
                {article}
              </PulseTargetCard>
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
                {m.employeeName} · epoch {m.epochIndex + 1} · {m.daysCompleted}/{m.daysScheduled}{" "}
                days · {m.attendanceRate}% attendance
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
