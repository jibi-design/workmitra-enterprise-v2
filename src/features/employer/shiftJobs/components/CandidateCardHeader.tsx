import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";
import { fmtTime } from "../helpers/dashboardHelpers";
import { CandidateStatusPill } from "./CandidateStatusPills";
import { PriorityBadge } from "./ShiftDashboardComponents";

export function CandidateCardHeader({
  workerId,
  workerName,
  createdAt,
  priorityTag,
  isConfirmed,
  showPlanBatch,
  showCommitmentStreak,
  onOpenDetail,
}: {
  workerId: string;
  workerName: string;
  createdAt: number;
  priorityTag: EmployeeShiftApplication["priorityTag"];
  isConfirmed: boolean;
  showPlanBatch?: boolean;
  showCommitmentStreak?: boolean;
  onOpenDetail: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: 9 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0, flex: 1, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div className="wm-shift-avatar" aria-hidden="true">
            {shiftWorkerInitials(workerName)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--wm-er-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.25,
              }}
            >
              {workerName}
            </div>

            <button
              type="button"
              className="wm-shift-tap"
              onClick={onOpenDetail}
              style={{
                marginTop: 6,
                fontWeight: 800,
                fontSize: 12,
                color: "var(--wm-er-accent-shift)",
                background: "rgba(22,163,74,0.08)",
                border: "1px solid rgba(22,163,74,0.16)",
                borderRadius: "var(--wm-radius-pill)",
                padding: "0 12px",
                cursor: "pointer",
                fontFamily: "monospace",
                letterSpacing: 0.35,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {workerId}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 900 }}>Applied</div>
          <div style={{ marginTop: 3, fontSize: 11, color: "var(--wm-er-muted)", fontWeight: 850 }}>
            {fmtTime(createdAt)}
          </div>
        </div>
      </div>

      {(priorityTag || isConfirmed || showPlanBatch || showCommitmentStreak) && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <PriorityBadge tag={priorityTag} />
          {isConfirmed ? <CandidateStatusPill text="CONFIRMED" /> : null}
          {showPlanBatch ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "4px 8px",
                borderRadius: "var(--wm-radius-pill)",
                background: "rgba(8,145,178,0.12)",
                color: "#0e7490",
              }}
            >
              ?? Plan batch
            </span>
          ) : null}
          {showCommitmentStreak ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "4px 8px",
                borderRadius: "var(--wm-radius-pill)",
                background: "rgba(180,83,9,0.12)",
                color: "#b45309",
              }}
            >
              ?? Commitment Streak
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function CompareSelector({
  appId,
  selected,
  disabled,
  onToggleCompare,
}: {
  appId: string;
  selected: boolean;
  disabled: boolean;
  onToggleCompare: (appId: string) => void;
}) {
  return (
    <label
      style={{
        marginTop: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 11,
        fontWeight: 900,
        color: selected ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)",
        padding: "9px 10px",
        borderRadius: "var(--wm-radius-chip)",
        background: selected ? "rgba(22,163,74,0.09)" : "rgba(248,250,252,0.98)",
        border: selected ? "1px solid rgba(22,163,74,0.18)" : "1px solid rgba(226,232,240,0.9)",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={() => onToggleCompare(appId)}
      />
      {selected ? "Selected for comparison" : "Select for comparison"}
    </label>
  );
}

function shiftWorkerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "WM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
