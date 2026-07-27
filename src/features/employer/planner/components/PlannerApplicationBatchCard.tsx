/** Job Mitra | PlannerApplicationBatchCard.tsx | Batch row for employer applications */

import type { PlannerApplicationBatch } from "../services/plannerBatchApproval.service";
import {
  getEmployerShiftPosts,
  statusLabel,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";

type Props = {
  batch: PlannerApplicationBatch;
  busy: boolean;
  roleGroups: { id: string; label: string }[];
  fill?: { confirmed: number; needed: number; pct: number };
  onApprove: () => void;
  onReject: () => void;
  onShortlist: () => void;
  onWaiting: () => void;
  onAssignRole: (roleGroupId: string) => void;
};

export function PlannerApplicationBatchCard({
  batch,
  busy,
  roleGroups,
  fill,
  onApprove,
  onReject,
  onShortlist,
  onWaiting,
  onAssignRole,
}: Props) {
  const canAct = batch.pendingCount > 0 && !busy;
  const hasShortlistable = batch.applications.some(
    (a) => a.status === "applied" || a.status === "waiting",
  );
  const showShortlistedBadge = batch.applications.some((a) => a.status === "shortlisted");

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
          {showShortlistedBadge ? (
            <span
              data-testid="planner-batch-shortlisted-badge"
              style={{
                marginLeft: 8,
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(234,179,8,0.18)",
                color: "#a16207",
                fontWeight: 800,
              }}
            >
              Shortlisted
            </span>
          ) : null}
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
        {fill ? (
          <div style={{ marginTop: 8 }} data-testid="planner-batch-fill-bar">
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0e7490" }}>
              {fill.confirmed} / {fill.needed} filled ({fill.pct}%)
            </div>
            <div
              style={{
                marginTop: 4,
                height: 6,
                borderRadius: 999,
                background: "rgba(8,145,178,0.15)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, fill.pct)}%`,
                  height: "100%",
                  background: "#0891b2",
                }}
              />
            </div>
          </div>
        ) : null}
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
          const shortlisted = app.status === "shortlisted";
          return (
            <div
              key={app.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 10,
                background: shortlisted ? "rgba(254,249,195,0.85)" : "rgba(248,250,252,0.95)",
                fontSize: 12,
              }}
            >
              <span style={{ fontWeight: 700 }}>{dayLabel}</span>
              <span
                style={{
                  color: shortlisted ? "#a16207" : "#475569",
                  fontWeight: shortlisted ? 800 : 400,
                }}
              >
                {shortlisted ? "Shortlisted" : statusLabel(app.status)}
              </span>
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
          data-testid="planner-batch-shortlist"
          disabled={!hasShortlistable || busy}
          onClick={onShortlist}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: 12,
            border: "1px solid rgba(202,138,4,0.45)",
            background: "rgba(254,249,195,0.95)",
            color: "#a16207",
            fontWeight: 900,
            opacity: hasShortlistable && !busy ? 1 : 0.45,
            cursor: hasShortlistable && !busy ? "pointer" : "not-allowed",
          }}
        >
          Shortlist
        </button>
        <button
          type="button"
          data-testid="planner-batch-waiting"
          disabled={!canAct}
          onClick={onWaiting}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: 12,
            border: "1px solid rgba(100,116,139,0.45)",
            background: "rgba(248,250,252,0.95)",
            color: "#475569",
            fontWeight: 900,
            opacity: canAct ? 1 : 0.45,
            cursor: canAct ? "pointer" : "not-allowed",
          }}
        >
          Waiting list
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
        {roleGroups.length > 0 && batch.workerMlId ? (
          <select
            className="wm-input"
            data-testid="planner-batch-assign-role"
            defaultValue=""
            disabled={busy}
            onChange={(e) => {
              const v = e.target.value;
              e.target.value = "";
              if (v) onAssignRole(v);
            }}
            style={{ flex: "1 1 100%", minHeight: 40 }}
          >
            <option value="">Assign to role group…</option>
            {roleGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </article>
  );
}
