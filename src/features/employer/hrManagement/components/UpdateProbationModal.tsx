// src/features/employer/hrManagement/components/UpdateProbationModal.tsx

import { useState } from "react";
import type { HRCandidateRecord, StatusChangeEntry } from "../types/hrManagement.types";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { CenterModal } from "../../../../shared/components/CenterModal";

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/* ------------------------------------------------ */
/* Update Probation Modal                           */
/* ------------------------------------------------ */
type UpdateProbationModalProps = {
  open: boolean;
  record: HRCandidateRecord;
  onClose: () => void;
};

export function UpdateProbationModal({ open, record, onClose }: UpdateProbationModalProps) {
  const [days, setDays] = useState(String(record.probationDurationDays ?? 90));

  const parsed = parseInt(days, 10);
  const isValid = !Number.isNaN(parsed) && parsed >= 7 && parsed <= 365;

  const handleSave = () => {
    if (!isValid) return;
    hrManagementStorage.updateProbationPeriod(record.id, parsed);
    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Update Probation Period" maxWidth={400}>
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
          Update Probation Period
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, marginBottom: 14 }}>
          Change the probation duration for {record.employeeName}. New end date will be calculated from their joining date.
        </div>

        <label style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", display: "block", marginBottom: 4 }}>
          Probation Duration (days)
        </label>
        <input
          type="number"
          min={7} max={365}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", fontSize: 13,
            border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 8,
            outline: "none", background: "#fff", color: "var(--wm-er-text)", boxSizing: "border-box",
          }}
        />
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
          Minimum 7 days, maximum 365 days.
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Cancel</button>
          <button className="wm-primarybtn" type="button" disabled={!isValid} onClick={handleSave}
            style={{ opacity: isValid ? 1 : 0.5 }}>
            Save
          </button>
        </div>
      </div>
    </CenterModal>
  );
}

/* ------------------------------------------------ */
/* Status History                                   */
/* ------------------------------------------------ */
type StatusHistoryProps = {
  entries: StatusChangeEntry[];
};

export function StatusHistory({ entries }: StatusHistoryProps) {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => b.changedAt - a.changedAt);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 900, fontSize: 13, color: "var(--wm-er-text)", marginBottom: 8 }}>
        Status History
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: "8px 10px", borderRadius: 8,
              background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)",
              fontSize: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontWeight: 800, color: "var(--wm-er-text)" }}>
                {entry.from} → {entry.to}
              </span>
              <span style={{ color: "var(--wm-er-muted)", fontSize: 10, flexShrink: 0 }}>
                {formatDate(entry.changedAt)}
              </span>
            </div>
            {entry.note && (
              <div style={{ color: "var(--wm-er-muted)", marginTop: 2, lineHeight: 1.4 }}>
                {entry.note}
              </div>
            )}
            <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
              By: {entry.changedBy === "system" ? "System" : "Employer"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
