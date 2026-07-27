// Job Mitra | EmployerPlannerDetailPage.tsx — facade

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { plannerPublicIndex } from "../storage/plannerPublicIndex.storage";
import { computePlanFillMetrics } from "../../../shared/planner/services/plannerFillMetrics.helpers";
import { broadcastToPlanCrew } from "../services/planBroadcast.service";
import { cancelActivePlan } from "../services/plannerCancel.service";
import { markPlanCompletedSaga } from "../services/plannerComplete.service";
import { planBroadcastGroupStorage } from "../storage/planBroadcastGroup.storage";
import {
  PlannerDetailBroadcastSection,
  PlannerDetailBudgetSection,
  PlannerDetailDaysSection,
} from "./EmployerPlannerDetailPage.parts";
import { PlannerDetailActivitySection } from "../components/PlannerDetailActivitySection";
import { PlannerCrewBroadcastPanel } from "../components/PlannerCrewBroadcastPanel";
import { PlannerRosterSlotEditor } from "../components/PlannerRosterSlotEditor";
import { EnterpriseResponsiveGrid, SlideOver } from "../../../../shared/components/enterprise";

type ConfirmKind = "cancel" | "complete" | null;

export function EmployerPlannerDetailPage() {
  const { planId = "" } = useParams();
  const nav = useNavigate();
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [auditOpen, setAuditOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const subscribe = useMemo(
    () => (cb: () => void) => {
      const u1 = demandPlannerStorage.subscribe(cb);
      const u2 = planBroadcastGroupStorage.subscribe(cb);
      return () => {
        u1();
        u2();
      };
    },
    [],
  );

  const plan = useSyncExternalStore(
    subscribe,
    () => demandPlannerStorage.getById(planId),
    () => demandPlannerStorage.getById(planId),
  );

  const crewCount = planBroadcastGroupStorage.getByPlanId(planId)?.memberWorkerMlIds.length ?? 0;
  const publicEntry = plannerPublicIndex.getByPlanId(planId);
  const estBudget = plan?.slots.reduce((sum, s) => sum + s.workers * s.payPerDay, 0) ?? 0;

  const fill = useMemo(() => {
    if (!plan) return { confirmed: 0, needed: 0, pct: 0 };
    return computePlanFillMetrics(plan);
  }, [plan]);

  if (!plan) {
    return (
      <div className="wm-er-vPlanner wm-planner-page">
        <div className="wm-planner-card wm-planner-errorBox">
          <div style={{ fontWeight: 800 }}>Plan not found</div>
          <button
            type="button"
            className="wm-planner-btnPrimary"
            style={{ marginTop: 12 }}
            onClick={() => nav(ROUTE_PATHS.employerPlannerHome)}
          >
            Back to Planner Home
          </button>
        </div>
      </div>
    );
  }

  function runCancelConfirmed() {
    setConfirmBusy(true);
    const result = cancelActivePlan(planId, "Cancelled by employer");
    setConfirmBusy(false);
    setConfirmKind(null);
    if (!result.ok) return;
    nav(ROUTE_PATHS.employerPlannerHome);
  }

  function runCompleteConfirmed() {
    setConfirmBusy(true);
    const result = markPlanCompletedSaga(planId);
    setConfirmBusy(false);
    setConfirmKind(null);
    if (!result.ok) {
      setBroadcastMsg(
        result.reason === "not_active"
          ? "Only active plans can be marked completed."
          : "Could not complete this plan. Try again.",
      );
      return;
    }
    setBroadcastMsg("Plan marked completed. Review Center updated.");
    nav(ROUTE_PATHS.employerPlannerHome);
  }

  function handleBroadcast() {
    const result = broadcastToPlanCrew(
      planId,
      broadcastTitle.trim() || "Project update",
      broadcastBody.trim(),
    );
    if (!result.ok) {
      setBroadcastMsg(
        result.reason === "no_members"
          ? "Confirm workers first before broadcasting to the project crew."
          : "Broadcast failed. Please try again.",
      );
      return;
    }
    setBroadcastMsg(`Broadcast sent to ${result.delivered} workspace(s).`);
  }

  return (
    <div className="wm-er-vPlanner wm-planner-page">
      <section className="wm-planner-hero">
        <div className="wm-planner-badge">{plan.status}</div>
        <div className="wm-planner-heroTitle" style={{ marginTop: 8 }}>
          {plan.name}
        </div>
        <div className="wm-planner-heroSub">
          {plan.startDate} → {plan.endDate} · {fill.pct}% filled · Crew {crewCount}
        </div>
        {publicEntry ? (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              fontWeight: 700,
              color: "var(--wm-planner-accent-strong)",
            }}
          >
            Workers see this as 1 Mega Project Card · {publicEntry.openDayCount} open days
          </div>
        ) : plan.status === "active" ? (
          <div
            className="wm-planner-errorBox"
            style={{ marginTop: 8, fontSize: 11, fontWeight: 700 }}
          >
            Public index missing — republish or contact support
          </div>
        ) : null}
      </section>

      <div className="wm-planner-card">
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Plan actions</div>
        <EnterpriseResponsiveGrid minItemWidth={140} gap={8} testId="planner-detail-actions-grid">
          <button
            type="button"
            className="wm-planner-commandTile wm-planner-commandTile--primary"
            onClick={() => nav(ROUTE_PATHS.employerPlannerApplications)}
          >
            <span className="wm-planner-commandTile__body">
              <span className="wm-planner-commandTile__label">Applications</span>
              <span className="wm-planner-commandTile__sep" />
              <span className="wm-planner-commandTile__desc">Review &amp; confirm crew</span>
            </span>
          </button>
          <button
            type="button"
            className="wm-planner-commandTile wm-planner-commandTile--primary"
            onClick={() => nav(ROUTE_PATHS.employerPlannerRosterDetail.replace(":planId", plan.id))}
          >
            <span className="wm-planner-commandTile__body">
              <span className="wm-planner-commandTile__label">Roster</span>
              <span className="wm-planner-commandTile__sep" />
              <span className="wm-planner-commandTile__desc">Assign roles &amp; days</span>
            </span>
          </button>
          <button
            type="button"
            className="wm-planner-commandTile"
            data-testid="planner-detail-audit-drawer-open"
            onClick={() => setAuditOpen(true)}
          >
            <span className="wm-planner-commandTile__body">
              <span className="wm-planner-commandTile__label">Activity drawer</span>
              <span className="wm-planner-commandTile__sep" />
              <span className="wm-planner-commandTile__desc">Audit trail</span>
            </span>
          </button>
          <button
            type="button"
            className="wm-planner-commandTile"
            onClick={() => nav(ROUTE_PATHS.employerPlannerFinance.replace(":planId", plan.id))}
          >
            <span className="wm-planner-commandTile__body">
              <span className="wm-planner-commandTile__label">Finance</span>
              <span className="wm-planner-commandTile__sep" />
              <span className="wm-planner-commandTile__desc">Preview costs</span>
            </span>
          </button>
        </EnterpriseResponsiveGrid>
      </div>

      <PlannerDetailBudgetSection estBudget={estBudget} />
      <PlannerDetailDaysSection plan={plan} onNavigate={nav} />
      <PlannerRosterSlotEditor plan={plan} />
      <PlannerDetailActivitySection planId={plan.id} />
      <PlannerCrewBroadcastPanel planId={plan.id} />
      <PlannerDetailBroadcastSection
        broadcastTitle={broadcastTitle}
        broadcastBody={broadcastBody}
        broadcastMsg={broadcastMsg}
        onBroadcastTitleChange={setBroadcastTitle}
        onBroadcastBodyChange={setBroadcastBody}
        onBroadcast={handleBroadcast}
      />

      <div className="wm-planner-card" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="wm-planner-btnGhost"
          onClick={() => nav(ROUTE_PATHS.employerPlannerFinance.replace(":planId", plan.id))}
        >
          Finance
        </button>
        {plan.status === "active" && (
          <button
            type="button"
            className="wm-planner-btnPrimary"
            data-testid="planner-detail-mark-completed"
            onClick={() => setConfirmKind("complete")}
          >
            Mark as Completed
          </button>
        )}
        {plan.status === "active" && (
          <button
            type="button"
            className="wm-planner-btnGhost"
            onClick={() => setConfirmKind("cancel")}
          >
            Cancel plan
          </button>
        )}
        <button
          type="button"
          className="wm-planner-btnGhost"
          onClick={() => nav(ROUTE_PATHS.employerPlannerHome)}
        >
          Planner Home
        </button>
      </div>

      <SlideOver
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        title="Plan activity"
        subtitle={plan.name}
        testId="planner-audit-slideover"
        variant="obsidian"
        footer={
          <button type="button" className="wm-outlineBtn" onClick={() => setAuditOpen(false)}>
            Close
          </button>
        }
      >
        <PlannerDetailActivitySection planId={plan.id} />
      </SlideOver>

      <SlideOver
        open={confirmKind === "cancel"}
        onClose={() => (confirmBusy ? undefined : setConfirmKind(null))}
        title="Cancel Plan?"
        subtitle="This action cannot be undone."
        testId="planner-cancel-confirm-slideover"
        variant="obsidian"
        footer={
          <>
            <button
              type="button"
              className="wm-dangerBtn"
              disabled={confirmBusy}
              onClick={runCancelConfirmed}
            >
              Confirm Cancel
            </button>
            <button
              type="button"
              className="wm-outlineBtn"
              disabled={confirmBusy}
              onClick={() => setConfirmKind(null)}
            >
              Keep Plan
            </button>
          </>
        }
      >
        <p style={{ fontSize: 13, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          All unfilled days will close. Pending applications will be rejected. Confirmed workers
          will be notified.
        </p>
      </SlideOver>

      <SlideOver
        open={confirmKind === "complete"}
        onClose={() => (confirmBusy ? undefined : setConfirmKind(null))}
        title="Mark plan completed?"
        subtitle={plan.name}
        testId="planner-complete-confirm-slideover"
        variant="obsidian"
        footer={
          <>
            <button
              type="button"
              className="wm-planner-btnPrimary"
              disabled={confirmBusy}
              onClick={runCompleteConfirmed}
            >
              Confirm Completed
            </button>
            <button
              type="button"
              className="wm-outlineBtn"
              disabled={confirmBusy}
              onClick={() => setConfirmKind(null)}
            >
              Keep Active
            </button>
          </>
        }
      >
        <p style={{ fontSize: 13, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          Confirmed workers will get review requests and vault history will close for this plan.
        </p>
      </SlideOver>
    </div>
  );
}
