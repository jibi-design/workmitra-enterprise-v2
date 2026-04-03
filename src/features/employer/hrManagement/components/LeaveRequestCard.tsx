// src/features/employer/hrManagement/components/LeaveRequestCard.tsx
//
// Single leave request card.
// Shows type, dates, status, and actions (approve/reject for employer, cancel for employee).

import { useState } from "react";
import type { LeaveRequest } from "../types/leaveManagement.types";
import { LEAVE_TYPE_LABELS } from "../types/leaveManagement.types";
import { leaveManagementStorage } from "../storage/leaveManagement.storage";
import { CenterModal } from "../../../../shared/components/CenterModal";

type Props = {
  request: LeaveRequest;
  mode: "employer" | "employee";
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const statusColors: Record<string, { color: string; bg: string }> = {
  pending: { color: "#d97706", bg: "rgba(217, 119, 6, 0.08)" },
  approved: { color: "#16a34a", bg: "rgba(22, 163, 74, 0.08)" },
  rejected: { color: "#dc2626", bg: "rgba(220, 38, 38, 0.08)" },
  cancelled: { color: "#64748b", bg: "rgba(100, 116, 139, 0.08)" },
};

export function LeaveRequestCard({ request, mode }: Props) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const sc = statusColors[request.status] ?? statusColors.pending;
  const isPending = request.status === "pending";

  const handleApprove = () => {
    leaveManagementStorage.approveLeave(request.id);
  };

  const handleReject = () => {
    leaveManagementStorage.rejectLeave(request.id, rejectComment.trim() || "No reason provided");
    setShowRejectModal(false);
    setRejectComment("");
  };

  const handleCancel = () => {
    leaveManagementStorage.cancelLeave(request.id);
  };

  return (
    <>
      <div
        style={{
          padding: 14,
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--wm-er-border, #e5e7eb)",
          borderLeft: `4px solid ${sc.color}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 13, color: "var(--wm-er-text)" }}>
              {LEAVE_TYPE_LABELS[request.leaveType]}
            </div>
            {mode === "employer" && (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>{request.employeeName}</div>
            )}
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
              {formatDate(request.fromDate)} — {formatDate(request.toDate)} ({request.totalDays} day{request.totalDays !== 1 ? "s" : ""})
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 4 }}>{request.reason}</div>
          </div>
          <span
            style={{
              fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 999,
              background: sc.bg, color: sc.color, border: `1px solid ${sc.color}22`, flexShrink: 0,
            }}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>

        {request.responseComment && (request.status === "approved" || request.status === "rejected") && (
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
            Employer: "{request.responseComment}"
          </div>
        )}

        {isPending && (
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            {mode === "employer" && (
              <>
                <button className="wm-primarybtn" type="button" onClick={handleApprove} style={{ fontSize: 11, padding: "6px 14px", background: "#16a34a" }}>Approve</button>
                <button className="wm-outlineBtn" type="button" onClick={() => setShowRejectModal(true)} style={{ fontSize: 11, padding: "6px 14px", color: "#dc2626", borderColor: "#dc2626" }}>Reject</button>
              </>
            )}
            {mode === "employee" && (
              <button className="wm-outlineBtn" type="button" onClick={handleCancel} style={{ fontSize: 11, padding: "6px 14px" }}>Cancel Request</button>
            )}
          </div>
        )}

        <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 8 }}>
          Applied: {formatDate(request.appliedAt)}
          {request.respondedAt && ` · Responded: ${formatDate(request.respondedAt)}`}
        </div>
      </div>

      <CenterModal open={showRejectModal} onBackdropClose={() => setShowRejectModal(false)} ariaLabel="Reject Leave" maxWidth={400}>
        <div style={{ padding: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: "#dc2626" }}>Reject Leave Request</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, marginBottom: 14 }}>
            {request.employeeName} — {LEAVE_TYPE_LABELS[request.leaveType]} ({request.totalDays} days)
          </div>
          <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", display: "block", marginBottom: 4 }}>Reason for rejection *</label>
          <textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder="Why is this leave being rejected?"
            maxLength={300}
            rows={3}
            style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 8, outline: "none", background: "#fff", color: "var(--wm-er-text)", boxSizing: "border-box", resize: "vertical" }}
          />
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="wm-outlineBtn" type="button" onClick={() => setShowRejectModal(false)}>Cancel</button>
            <button className="wm-primarybtn" type="button" onClick={handleReject} disabled={rejectComment.trim().length === 0} style={{ background: "#dc2626", opacity: rejectComment.trim().length > 0 ? 1 : 0.5 }}>Reject</button>
          </div>
        </div>
      </CenterModal>
    </>
  );
}