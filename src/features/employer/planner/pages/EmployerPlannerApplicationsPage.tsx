/** Job Mitra | EmployerPlannerApplicationsPage.tsx | Batch Approval Engine (Hybrid A2 S4) */

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { PlannerApplicationBatchCard } from "../components/PlannerApplicationBatchCard";
import { useEmployerBatchApprovalState } from "../hooks/useEmployerBatchApprovalState";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";

export function EmployerPlannerApplicationsPage() {
  const {
    batches,
    pendingCount,
    shortlistedCount,
    filter,
    setFilter,
    busyBatchId,
    toast,
    clearToast,
    approveBatch,
    rejectBatch,
    shortlistBatch,
    moveToWaiting,
    approveAllShortlisted,
    assignBatchToRoleGroup,
    fillByPlan,
    confirm,
    resolveConfirm,
  } = useEmployerBatchApprovalState();

  const roleGroupsByPlan = useMemo(() => {
    const map = new Map<string, { id: string; label: string }[]>();
    for (const batch of batches) {
      if (map.has(batch.planId)) continue;
      const plan = demandPlannerStorage.getById(batch.planId);
      map.set(
        batch.planId,
        (plan?.roleGroups ?? []).map((g) => ({ id: g.id, label: g.label })),
      );
    }
    return map;
  }, [batches]);

  return (
    <div
      className="wm-er-vPlanner wm-planner-page wm-planner-obsidianShell"
      data-testid="planner-employer-applications"
    >
      <section className="wm-planner-card wm-planner-card--obsidian" style={{ marginTop: 0 }}>
        <div className="wm-planner-sectionLabel">Hybrid A2 · Batch Approval Engine</div>
        <h1 className="wm-planner-sectionTitle" style={{ margin: 0, fontSize: 22 }}>
          Plan Applications
        </h1>
        <p style={{ marginTop: 6, fontSize: 13, color: "rgba(226,232,240,0.72)" }}>
          Bulk approve, shortlist, or reject multi-day batches — no per-day Shift confirm screens.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          <Link
            to={ROUTE_PATHS.employerPlannerHome}
            data-testid="planner-employer-applications-back"
            className="wm-planner-btnGhost wm-planner-btnGhost--obsidian"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 14px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Planner Home
          </Link>
          <Link
            to={ROUTE_PATHS.employerPlannerRoster}
            data-testid="planner-employer-applications-roster"
            className="wm-planner-btnPrimary wm-planner-btnPrimary--glow"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 14px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Open Roster
          </Link>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 14,
          marginTop: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {(
          [
            ["all", "All"],
            ["pending", `Needs review (${pendingCount})`],
            ["shortlisted", `Shortlisted (${shortlistedCount})`],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            data-testid={`planner-batch-filter-${key}`}
            onClick={() => setFilter(key)}
            style={filterChipStyle(filter === key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <button
          type="button"
          data-testid="planner-approve-all-shortlisted"
          className="wm-planner-btnPrimary wm-planner-btnPrimary--glow"
          disabled={busyBatchId != null || shortlistedCount === 0}
          onClick={() => void approveAllShortlisted()}
          style={{ fontWeight: 800 }}
        >
          Approve All Shortlisted
        </button>
      </div>

      {batches.length === 0 ? (
        <section
          className="wm-planner-card wm-planner-card--obsidian"
          data-testid="planner-employer-applications-empty"
          style={{ textAlign: "center" }}
        >
          <div style={{ fontSize: 16, fontWeight: 900 }}>
            {filter === "pending" ? "No batches waiting" : "No plan applications in this filter"}
          </div>
          <p style={{ color: "rgba(148,163,184,0.95)", marginTop: 8, marginBottom: 16 }}>
            When workers submit pick-and-choose applications, batches appear here for one-tap
            approval.
          </p>
          <Link
            to={ROUTE_PATHS.employerPlannerPlans}
            data-testid="planner-employer-applications-empty-cta"
            className="wm-planner-btnPrimary wm-planner-btnPrimary--glow"
            style={{
              display: "inline-flex",
              padding: "10px 16px",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            View plans
          </Link>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {batches.map((batch) => (
            <PlannerApplicationBatchCard
              key={batch.planApplyBatchId}
              batch={batch}
              busy={busyBatchId === batch.planApplyBatchId}
              roleGroups={roleGroupsByPlan.get(batch.planId) ?? []}
              fill={fillByPlan.get(batch.planId)}
              onApprove={() => void approveBatch(batch.planApplyBatchId)}
              onReject={() => rejectBatch(batch.planApplyBatchId)}
              onShortlist={() => shortlistBatch(batch.planApplyBatchId)}
              onWaiting={() => moveToWaiting(batch.planApplyBatchId)}
              onAssignRole={(roleGroupId) =>
                assignBatchToRoleGroup(batch.planApplyBatchId, roleGroupId)
              }
            />
          ))}
        </div>
      )}

      {toast ? (
        <div
          role="status"
          data-testid="planner-batch-toast"
          onClick={clearToast}
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 24,
            zIndex: 40,
            margin: "0 auto",
            maxWidth: 420,
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(15,23,42,0.94)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "0 12px 28px rgba(15,23,42,0.4)",
            cursor: "pointer",
          }}
        >
          {toast}
        </div>
      ) : null}

      <ConfirmModal
        confirm={confirm}
        onConfirm={() => resolveConfirm(true)}
        onCancel={() => resolveConfirm(false)}
        variant="obsidian"
      />
    </div>
  );
}

function filterChipStyle(active: boolean): CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 999,
    border: active ? "1px solid rgba(34,211,238,0.55)" : "1px solid rgba(255,255,255,0.12)",
    background: active ? "rgba(8,145,178,0.28)" : "rgba(15,23,42,0.55)",
    color: active ? "#a5f3fc" : "#94a3b8",
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  };
}
