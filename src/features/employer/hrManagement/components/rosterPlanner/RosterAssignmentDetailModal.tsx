// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterAssignmentDetailModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\rosterPlanner\RosterAssignmentDetailModal.tsx

import { formatDateShort } from "../../helpers/rosterPlannerUtils";
import type { RosterAssignment } from "../../types/rosterPlanner.types";

type Props = {
  assignment: RosterAssignment;
  onClose: () => void;
  onDelete: () => void;
};

export function RosterAssignmentDetailModal({ assignment, onClose, onDelete }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          maxWidth: 360,
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--wm-er-text)", marginBottom: 8 }}>
          {assignment.employeeName}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 12,
            color: "var(--wm-er-muted)",
            marginBottom: 12,
          }}
        >
          <span>Date: {formatDateShort(assignment.date)}</span>
          <span>Site: {assignment.site}</span>
          <span>
            Time: {assignment.shiftStart} to {assignment.shiftEnd}
          </span>
          {assignment.note && <span>Note: {assignment.note}</span>}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={onDelete}
            style={{
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: "#dc2626",
              background: "none",
              border: "1px solid #fecaca",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Remove
          </button>

          <div style={{ flex: 1 }} />

          <button className="wm-outlineBtn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
