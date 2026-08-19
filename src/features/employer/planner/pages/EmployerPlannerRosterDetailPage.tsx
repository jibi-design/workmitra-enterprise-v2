/**
 * Job Mitra | EmployerPlannerRosterDetailPage.tsx
 * Hybrid A2 S7 — plan-scoped roster console.
 * Hybrid A2 P2.4 — no-show / miss check-in PulseTargetCard.
 * Hybrid A2 P2.5 — Visa / Right-to-Work expiry badge + PulseTargetCard.
 * Track T1-2 — remove stub testids; missing-plan empty; employer chrome cleanup.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { StatusBadge, TrustStrip } from "../../../../shared/components/enterprise";
import { PulseTargetCard } from "../../../pulse/PulseTarget";
import { getPlannerEscalation } from "../../../shared/planner/plannerEscalationRegistry";
import { getVaultPlannerHistory } from "../../../shared/planner/plannerVault";
import { getPlannerExecutionPort } from "../../../shared/planner/ports/plannerExecutionPort";
import {
  fireNoShowEscalations,
  listNoShowWorkerMlIdsForPlan,
} from "../../../shared/planner/services/plannerEscalationTriggers.service";
import {
  getAssignmentEpochProgress,
  runPlannerMilestoneEngine,
} from "../../../shared/planner/services/plannerMilestone.engine";
import { listPlannerRosterAssignments } from "../../../shared/planner/services/plannerRoster.helpers";
import {
  fireRtwEscalations,
  getPlannerRtwFlagLevel,
  listRtwFlaggedWorkerMlIdsForPlan,
} from "../../../shared/planner/services/plannerRtw.service";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import {
  getPlannerRtwRecord,
  getPlannerRtwWarnDays,
  setPlannerRtwWarnDays,
  upsertPlannerRtwRecord,
} from "../storage/plannerRtw.storage";
import { PlannerRosterDragBoard } from "../components/PlannerRosterDragBoard";
import { PlannerCrewBroadcastPanel } from "../components/PlannerCrewBroadcastPanel";
import { PlannerRosterSlotEditor } from "../components/PlannerRosterSlotEditor";

const linkBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 700,
} as const;

export function EmployerPlannerRosterDetailPage() {
  const { planId = "" } = useParams();

  const plan = useMemo(() => {
    if (planId) runPlannerMilestoneEngine({ planId });
    return planId ? demandPlannerStorage.getById(planId) : null;
  }, [planId]);

  const assignments = useMemo(
    () => (planId ? listPlannerRosterAssignments({ planId, confirmedOnly: true }) : []),
    [planId],
  );

  const milestones = useMemo(
    () => (planId ? getVaultPlannerHistory().filter((e) => e.planId === planId) : []),
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

  if (!planId || !plan) {
    return (
      <div
        className="wm-er-vPlanner wm-planner-page"
        data-testid="planner-employer-roster-detail"
        data-plan-found="0"
      >
        <section
          className="wm-planner-card wm-planner-empty"
          data-testid="planner-employer-roster-detail-missing"
        >
          <div className="wm-planner-empty__icon" aria-hidden="true">
            R
          </div>
          <div className="wm-planner-empty__copy">
            <div className="wm-planner-empty__title">
              {!planId ? "Missing plan id" : "Plan not found"}
            </div>
            <div className="wm-planner-empty__sub">
              Open roster detail from an active plan on the roster console. No workers or RTW tools
              are shown without a valid plan.
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            <Link
              to={ROUTE_PATHS.employerPlannerRoster}
              className="wm-planner-btnPrimary"
              data-testid="planner-employer-roster-detail-back"
              style={{ ...linkBtnStyle }}
            >
              Back to Roster
            </Link>
            <Link
              to={ROUTE_PATHS.employerPlannerPlans}
              className="wm-outlineBtn"
              data-testid="planner-employer-roster-detail-plans"
              style={{ ...linkBtnStyle }}
            >
              All plans
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className="wm-er-vPlanner wm-planner-page"
      data-testid="planner-employer-roster-detail"
      data-plan-found="1"
      data-plan-id={planId}
    >
      <section className="wm-planner-card" data-testid="planner-employer-roster-detail-hero">
        <div className="wm-planner-sectionLabel">Roster console</div>
        <h1 className="wm-pageTitle" style={{ margin: "6px 0 0" }}>
          {plan.name}
        </h1>
        <p className="wm-pageSub" style={{ marginTop: 6 }}>
          {plan.companyName || "Employer"} · {plan.epochDays ?? 30}-day window
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          <Link
            to={ROUTE_PATHS.employerPlannerRoster}
            data-testid="planner-employer-roster-detail-back"
            className="wm-outlineBtn"
            style={{ ...linkBtnStyle }}
          >
            Back to Roster
          </Link>
          <Link
            to={ROUTE_PATHS.employerPlannerDetail.replace(":planId", planId)}
            data-testid="planner-employer-roster-detail-plan"
            className="wm-outlineBtn"
            style={{ ...linkBtnStyle }}
          >
            Open plan detail
          </Link>
        </div>
      </section>

      <PlannerRosterDragBoard planId={planId} />
      <PlannerCrewBroadcastPanel planId={planId} />
      <PlannerRosterSlotEditor plan={plan} />

      <section className="wm-planner-card" data-testid="planner-roster-rtw-settings-wrap">
        <div
          data-testid="planner-roster-rtw-settings"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            fontSize: 12,
          }}
        >
          <span style={{ fontWeight: 700 }}>RTW warn (days before expiry)</span>
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
          <span className="wm-pageSub" style={{ margin: 0 }}>
            Visa / Right-to-Work only — not clinical NMC.
          </span>
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
          className="wm-planner-card wm-planner-empty"
          data-testid="planner-roster-detail-empty"
          style={{ marginTop: 12 }}
        >
          <div className="wm-planner-empty__icon" aria-hidden="true">
            W
          </div>
          <div className="wm-planner-empty__copy">
            <div className="wm-planner-empty__title">No confirmed workers yet</div>
            <div className="wm-planner-empty__sub">
              Approve batches to place workers on this roster.
            </div>
          </div>
          <Link
            to={ROUTE_PATHS.employerPlannerApplications}
            className="wm-planner-btnPrimary"
            data-testid="planner-roster-detail-empty-cta"
            style={{ ...linkBtnStyle, marginTop: 12 }}
          >
            Open Batch Approval
          </Link>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
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
                className="wm-planner-card"
                data-testid="planner-roster-worker-card"
                data-worker={assignment.workerMlId}
                data-noshow={isNoShow ? "1" : "0"}
                data-rtw={isRtw ? "1" : "0"}
                data-rtw-level={rtwStatus.level}
                style={{ marginBottom: 0 }}
              >
                <div style={{ fontWeight: 900 }}>{assignment.workerName}</div>
                <div className="wm-pageSub" style={{ marginTop: 4 }}>
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
                      {day.payPerDay ? ` · ${day.payPerDay}` : ""}
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

      <section
        className="wm-planner-card"
        style={{ marginTop: 12 }}
        data-testid="planner-roster-milestones"
      >
        <div className="wm-planner-sectionLabel">Committed milestones</div>
        {milestones.length === 0 ? (
          <p
            className="wm-pageSub"
            style={{ marginTop: 8 }}
            data-testid="planner-roster-milestones-empty"
          >
            No period summaries committed yet. They appear when a 30-day window completes.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {milestones.map((m) => (
              <div
                key={m.id}
                className="wm-planner-card"
                data-testid="planner-roster-milestone-row"
                style={{ marginBottom: 0, fontSize: 12 }}
              >
                {m.employeeName} · period {m.epochIndex + 1} · {m.daysCompleted}/{m.daysScheduled}{" "}
                days · {m.attendanceRate}% attendance
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
