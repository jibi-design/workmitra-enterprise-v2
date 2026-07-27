// App name: Job Mitra
// File name: ReplaceCandidateReasonModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ReplaceCandidateReasonModal.tsx

import { useState } from "react";
import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";

type ReplacementReason = NonNullable<EmployeeShiftApplication["replacedReason"]>;

type ReplaceCandidateReasonModalProps = {
  readonly open: boolean;
  readonly candidateName: string;
  readonly isBusy: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: (reason: ReplacementReason) => void;
};

const REASONS: readonly {
  readonly value: ReplacementReason;
  readonly title: string;
  readonly helper: string;
}[] = [
  {
    value: "no_show",
    title: "No-show / not reachable",
    helper: "Use when the worker did not arrive or cannot be contacted.",
  },
  {
    value: "schedule_change",
    title: "Schedule changed",
    helper: "Use when shift timing, need, or staffing plan changed.",
  },
  {
    value: "quality_issue",
    title: "Quality or fit issue",
    helper: "Use when the worker is no longer suitable for this assignment.",
  },
  {
    value: "other",
    title: "Other reason",
    helper: "Use when none of the above reasons match.",
  },
];

export function ReplaceCandidateReasonModal({
  open,
  candidateName,
  isBusy,
  onCancel,
  onConfirm,
}: ReplaceCandidateReasonModalProps) {
  if (!open) {
    return null;
  }

  return (
    <ReplaceCandidateReasonDialog
      candidateName={candidateName}
      isBusy={isBusy}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

function ReplaceCandidateReasonDialog({
  candidateName,
  isBusy,
  onCancel,
  onConfirm,
}: Omit<ReplaceCandidateReasonModalProps, "open">) {
  const [reason, setReason] = useState<ReplacementReason>("other");

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(15,23,42,0.48)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 14,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Replace confirmed worker"
        style={{
          width: "100%",
          maxWidth: 430,
          borderRadius: "var(--wm-radius-employer-card)",
          background: "#ffffff",
          boxShadow: "0 24px 70px rgba(15,23,42,0.28)",
          border: "1px solid rgba(148,163,184,0.25)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 18px 14px",
            borderBottom: "1px solid rgba(148,163,184,0.18)",
            background: "linear-gradient(180deg, rgba(255,247,237,0.9), rgba(255,255,255,0.98))",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 950, color: "#0f172a" }}>
            Replace confirmed worker?
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 750,
              color: "#64748b",
              lineHeight: 1.5,
            }}
          >
            {candidateName} will be moved out of the confirmed list. Select the reason for local
            records and employee status.
          </div>
        </div>

        <div style={{ padding: 14, display: "grid", gap: 9 }}>
          {REASONS.map((item) => {
            const selected = item.value === reason;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setReason(item.value)}
                disabled={isBusy}
                style={{
                  width: "100%",
                  textAlign: "left",
                  borderRadius: "var(--wm-radius-chip)",
                  border: selected
                    ? "1.5px solid rgba(180,83,9,0.42)"
                    : "1px solid rgba(148,163,184,0.18)",
                  background: selected ? "rgba(255,251,235,0.86)" : "#ffffff",
                  padding: "11px 12px",
                  cursor: isBusy ? "not-allowed" : "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "var(--wm-radius-pill)",
                      border: selected ? "5px solid #b45309" : "2px solid rgba(148,163,184,0.8)",
                      flexShrink: 0,
                      boxSizing: "border-box",
                    }}
                  />

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 950, color: "#0f172a" }}>
                      {item.title}
                    </div>

                    <div
                      style={{
                        marginTop: 3,
                        fontSize: 11,
                        fontWeight: 750,
                        color: "#64748b",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.helper}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          <div
            style={{
              padding: "10px 11px",
              borderRadius: "var(--wm-radius-chip)",
              border: "1px solid rgba(217,119,6,0.16)",
              background: "rgba(255,251,235,0.7)",
              color: "#92400e",
              fontSize: 11,
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            Backup candidates will not be auto-confirmed. After replacement, review Backup and
            confirm manually if needed.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 9,
            padding: 14,
            borderTop: "1px solid rgba(148,163,184,0.18)",
            background: "#ffffff",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            style={{
              flex: 1,
              borderRadius: "var(--wm-radius-chip)",
              border: "1px solid rgba(148,163,184,0.28)",
              background: "#ffffff",
              color: "#475569",
              padding: 13,
              fontSize: 13,
              fontWeight: 900,
              cursor: isBusy ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={isBusy}
            style={{
              flex: 1.2,
              borderRadius: "var(--wm-radius-chip)",
              border: "none",
              background: isBusy ? "rgba(180,83,9,0.45)" : "#b45309",
              color: "#ffffff",
              padding: 13,
              fontSize: 13,
              fontWeight: 950,
              cursor: isBusy ? "not-allowed" : "pointer",
              boxShadow: "0 10px 22px rgba(180,83,9,0.22)",
            }}
          >
            Replace Worker
          </button>
        </div>
      </div>
    </div>
  );
}
