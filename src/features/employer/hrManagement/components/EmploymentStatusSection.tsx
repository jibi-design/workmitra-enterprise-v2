// src/features/employer/hrManagement/components/EmploymentStatusSection.tsx
//
// Employment status management for active employees.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { ConfirmEmployeeModal } from "./ConfirmEmployeeModal";
import { UpdateProbationModal, StatusHistory } from "./UpdateProbationModal";

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function daysRemaining(endDate: number, now: number): number {
  return Math.max(0, Math.ceil((endDate - now) / 86400000));
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  record: HRCandidateRecord;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmploymentStatusSection({ record }: Props) {
  const [nowMs] = useState(() => Date.now());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProbationModal, setShowProbationModal] = useState(false);

  const isProbation = record.employmentPhase === "probation";
  const isConfirmed = record.employmentPhase === "confirmed";

  const probationEndDate = record.probationEndDate;
  const daysLeft = probationEndDate ? daysRemaining(probationEndDate, nowMs) : 0;
  const isOverdue = probationEndDate ? probationEndDate <= nowMs : false;
  const probationProgressPct = record.probationDurationDays && probationEndDate
    ? Math.min(100, Math.round(((record.probationDurationDays * 86400000 - (probationEndDate - nowMs)) / (record.probationDurationDays * 86400000)) * 100))
    : 0;

  return (
    <div
      style={{
        padding: 16, background: "#fff", borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 12 }}>
        Employment Status
      </div>

      {/* Phase Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span
          style={{
            fontSize: 11, fontWeight: 900, padding: "3px 10px", borderRadius: 999,
            background: isProbation ? "rgba(217, 119, 6, 0.08)" : "rgba(22, 163, 74, 0.08)",
            color: isProbation ? "#d97706" : "#16a34a",
            border: `1px solid ${isProbation ? "rgba(217, 119, 6, 0.2)" : "rgba(22, 163, 74, 0.2)"}`,
          }}
        >
          {isProbation ? "Probation" : "Confirmed"}
        </span>
        {isConfirmed && record.confirmedAt && (
          <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            since {formatDate(record.confirmedAt)}
          </span>
        )}
      </div>

      {/* Probation Progress */}
      {isProbation && probationEndDate && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>Probation Progress</span>
            <span style={{ fontWeight: 800, color: isOverdue ? "#dc2626" : "#d97706" }}>
              {isOverdue ? "Overdue" : `${daysLeft} days remaining`}
            </span>
          </div>

          <div style={{ height: 6, borderRadius: 999, background: "var(--wm-er-border, #e5e7eb)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%", width: `${Math.min(100, probationProgressPct)}%`,
                borderRadius: 999, background: isOverdue ? "#dc2626" : "#d97706",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--wm-er-muted)", marginTop: 4 }}>
            <span>{record.probationDurationDays} days total</span>
            <span>Ends: {formatDate(probationEndDate)}</span>
          </div>

          {isOverdue && (
            <div
              style={{
                marginTop: 8, padding: 8, borderRadius: 8,
                background: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.15)",
                fontSize: 11, color: "#991b1b", fontWeight: 700, lineHeight: 1.4,
              }}
            >
              Probation period has ended. Please confirm or extend the probation for this employee.
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {isProbation && (
          <>
            <button className="wm-primarybtn" type="button" onClick={() => setShowConfirmModal(true)}
              style={{ fontSize: 12, background: "#16a34a" }}>
              Confirm Employee
            </button>
            <button className="wm-outlineBtn" type="button" onClick={() => setShowProbationModal(true)}
              style={{ fontSize: 12 }}>
              Change Probation Period
            </button>
          </>
        )}
        {isConfirmed && (
          <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 800 }}>
            ✓ This employee is permanently confirmed.
          </div>
        )}
      </div>

      {/* Status History */}
      <StatusHistory entries={record.statusHistory ?? []} />

      {/* Modals */}
      <ConfirmEmployeeModal open={showConfirmModal} record={record} onClose={() => setShowConfirmModal(false)} />
      <UpdateProbationModal open={showProbationModal} record={record} onClose={() => setShowProbationModal(false)} />
    </div>
  );
}
