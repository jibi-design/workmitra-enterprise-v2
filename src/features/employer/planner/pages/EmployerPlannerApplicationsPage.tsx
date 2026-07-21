/** Job Mitra | EmployerPlannerApplicationsPage.tsx | Batch Approval Engine (Hybrid A2 S4) */

import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  getEmployerShiftPosts,
  statusLabel,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { useEmployerBatchApprovalState } from "../hooks/useEmployerBatchApprovalState";
import type { PlannerApplicationBatch } from "../services/plannerBatchApproval.service";

export function EmployerPlannerApplicationsPage() {
  const {
    batches,
    pendingCount,
    filter,
    setFilter,
    busyBatchId,
    toast,
    clearToast,
    approveBatch,
    rejectBatch,
  } = useEmployerBatchApprovalState();

  return (
    <div className="wm-ee-vPlanner wm-planner-page" data-testid="planner-employer-applications">
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
          Hybrid A2 · Batch Approval Engine
        </div>
        <h1 className="wm-pageTitle" style={{ margin: 0 }}>
          Plan Applications
        </h1>
        <p className="wm-pageSub" style={{ marginTop: 6 }}>
          Bulk approve or reject multi-day batches — no per-day Shift confirm screens.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          <Link
            to={ROUTE_PATHS.employerPlannerHome}
            data-testid="planner-employer-applications-back"
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
            to={ROUTE_PATHS.employerPlannerRoster}
            data-testid="planner-employer-applications-roster"
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
            Open Roster
          </Link>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          data-testid="planner-batch-filter-pending"
          onClick={() => setFilter("pending")}
          style={filterChipStyle(filter === "pending")}
        >
          Needs review ({pendingCount})
        </button>
        <button
          type="button"
          data-testid="planner-batch-filter-all"
          onClick={() => setFilter("all")}
          style={filterChipStyle(filter === "all")}
        >
          All batches
        </button>
      </div>

      {batches.length === 0 ? (
        <section
          data-testid="planner-employer-applications-empty"
          style={{
            padding: 28,
            borderRadius: 18,
            border: "1px dashed rgba(8,145,178,0.35)",
            textAlign: "center",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
            {filter === "pending" ? "No batches waiting" : "No plan applications yet"}
          </div>
          <p style={{ color: "#64748b", marginTop: 8, marginBottom: 16 }}>
            When workers submit pick-and-choose applications, batches appear here for one-tap
            approval.
          </p>
          <Link
            to={ROUTE_PATHS.employerPlannerPlans}
            data-testid="planner-employer-applications-empty-cta"
            className="wm-planner-btnPrimary"
            style={{
              display: "inline-flex",
              padding: "10px 16px",
              borderRadius: 12,
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
            <BatchCard
              key={batch.planApplyBatchId}
              batch={batch}
              busy={busyBatchId === batch.planApplyBatchId}
              onApprove={() => void approveBatch(batch.planApplyBatchId)}
              onReject={() => rejectBatch(batch.planApplyBatchId)}
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
            background: "#0f172a",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "0 12px 28px rgba(15,23,42,0.28)",
            cursor: "pointer",
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function BatchCard({
  batch,
  busy,
  onApprove,
  onReject,
}: {
  batch: PlannerApplicationBatch;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const canAct = batch.pendingCount > 0 && !busy;

  return (
    <article
      data-testid="planner-batch-card"
      data-batch-id={batch.planApplyBatchId}
      data-plan-id={batch.planId}
      data-review-status={batch.reviewStatus}
      style={{
        borderRadius: 18,
        border: "1px solid rgba(8,145,178,0.22)",
        background: "#fff",
        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(226,232,240,0.9)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#0891b2" }}>
          {batch.dayCount} day batch · {batch.reviewStatus}
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>{batch.planName}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          {batch.workerName}
          {batch.workerMlId ? ` · ${batch.workerMlId}` : ""} · {batch.companyName}
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11 }}>
          <span>Pending {batch.pendingCount}</span>
          <span>Confirmed {batch.confirmedCount}</span>
          <span>Closed {batch.rejectedCount}</span>
        </div>
      </div>

      <div style={{ padding: 12, display: "grid", gap: 6 }}>
        {batch.applications.map((app) => {
          const post = getEmployerShiftPosts().find((p) => p.id === app.postId);
          const dayLabel =
            post && "planSlotDate" in post && typeof post.planSlotDate === "string"
              ? post.planSlotDate
              : post?.startAt
                ? new Date(post.startAt).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                : app.postId.slice(-8);
          return (
            <div
              key={app.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(248,250,252,0.95)",
                fontSize: 12,
              }}
            >
              <span style={{ fontWeight: 700 }}>{dayLabel}</span>
              <span style={{ color: "#475569" }}>{statusLabel(app.status)}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, padding: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          data-testid="planner-batch-approve"
          disabled={!canAct}
          onClick={onApprove}
          className="wm-planner-btnPrimary"
          style={{
            flex: 1,
            minHeight: 44,
            opacity: canAct ? 1 : 0.45,
            cursor: canAct ? "pointer" : "not-allowed",
            fontWeight: 900,
          }}
        >
          {busy ? "Approving…" : "Approve batch"}
        </button>
        <button
          type="button"
          data-testid="planner-batch-reject"
          disabled={!canAct}
          onClick={onReject}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: 12,
            border: "1px solid rgba(220,38,38,0.35)",
            background: "rgba(254,242,242,0.95)",
            color: "#b91c1c",
            fontWeight: 900,
            opacity: canAct ? 1 : 0.45,
            cursor: canAct ? "pointer" : "not-allowed",
          }}
        >
          Reject batch
        </button>
      </div>
    </article>
  );
}

function filterChipStyle(active: boolean): CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 999,
    border: active ? "1px solid #0891b2" : "1px solid rgba(226,232,240,0.95)",
    background: active ? "rgba(8,145,178,0.12)" : "#fff",
    color: active ? "#0e7490" : "#64748b",
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer",
  };
}
