// src/features/employer/workforceOps/components/AnnounceApplicationCard.tsx
//
// Reusable application card for Announcement Dashboard.
// Shows applicant info, rating, shifts, conflict warning, action buttons.

import type { WorkforceApplication, AnnouncementShift } from "../types/workforceTypes";
import { IconStar } from "./workforceIcons";
import { AMBER } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  application: WorkforceApplication;
  categoryName: string;
  shifts: AnnouncementShift[];
  rank?: number;
  onSelect?: () => void;
  onReject?: () => void;
  onMoveToWaiting?: () => void;
  isSelectable?: boolean;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Status Colors                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function statusColor(status: WorkforceApplication["status"]): string {
  switch (status) {
    case "applied": return "var(--wm-er-muted)";
    case "selected": return "var(--wm-success)";
    case "waiting": return "var(--wm-warning)";
    case "not_selected": return "var(--wm-error)";
    case "confirmed": return AMBER;
    case "cancelled": return "var(--wm-error)";
  }
}

function statusLabel(status: WorkforceApplication["status"]): string {
  switch (status) {
    case "applied": return "Applied";
    case "selected": return "Selected";
    case "waiting": return "Waiting List";
    case "not_selected": return "Not Selected";
    case "confirmed": return "Confirmed";
    case "cancelled": return "Cancelled";
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function AnnounceApplicationCard({
  application,
  categoryName,
  shifts,
  rank,
  onSelect,
  onReject,
  onMoveToWaiting,
  isSelectable = false,
}: Props) {
  const shiftNames = application.shiftIds
    .map((sid) => shifts.find((s) => s.id === sid)?.name ?? sid)
    .join(", ");

  const isActionable = isSelectable && application.status === "applied";

  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "var(--wm-radius-10)",
        border: `1px solid ${application.status === "selected" ? "var(--wm-success)" : "var(--wm-er-border)"}`,
        background: application.status === "selected" ? "rgba(22,163,74,0.04)" : "var(--wm-er-card)",
      }}
    >
      {/* Top Row: Rank + Name + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, minWidth: 0, flex: 1 }}>
          {/* Rank Badge */}
          {rank !== undefined && (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                background: rank <= 3 ? AMBER : "var(--wm-er-border)",
                color: rank <= 3 ? "#fff" : "var(--wm-er-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {rank}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {application.employeeName}
            </div>
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
              {categoryName} · {shiftNames}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: statusColor(application.status),
            padding: "2px 8px",
            borderRadius: 999,
            background: `${statusColor(application.status)}15`,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {statusLabel(application.status)}
        </span>
      </div>

      {/* Rating */}
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
        {application.rating !== null ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: AMBER }}>
            <IconStar /> {application.rating.toFixed(1)}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>No rating</span>
        )}

        {/* Date Conflict Warning */}
        {application.hasDateConflict && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "var(--wm-warning)",
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(217,119,6,0.1)",
            }}
          >
            Date Conflict
          </span>
        )}
      </div>

      {/* Action Buttons */}
      {isActionable && (
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          {onSelect && (
            <button
              type="button"
              onClick={onSelect}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 8,
                border: "none",
                background: "var(--wm-success)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Select
            </button>
          )}
          {onMoveToWaiting && (
            <button
              type="button"
              onClick={onMoveToWaiting}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid var(--wm-warning)",
                background: "rgba(217,119,6,0.06)",
                color: "var(--wm-warning)",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Waiting List
            </button>
          )}
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid var(--wm-er-border)",
                background: "var(--wm-er-bg)",
                color: "var(--wm-er-muted)",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Reject
            </button>
          )}
        </div>
      )}

      {/* Cancel Info */}
      {application.status === "cancelled" && application.cancelReason && (
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-error)" }}>
          Reason: {application.cancelReason}{application.cancelNote ? ` — ${application.cancelNote}` : ""}
        </div>
      )}
    </div>
  );
}