// src/features/employer/hrManagement/components/RosterConflictBanner.tsx
//
// Conflict banner for Roster Planner (Root Map Section 7.4.15).
// Shows when same employee is assigned to 2+ different sites on same day.

import type { RosterConflict } from "../types/rosterPlanner.types";
import { formatDateShort } from "../helpers/rosterPlannerUtils";

type Props = {
  conflicts: RosterConflict[];
};

export function RosterConflictBanner({ conflicts }: Props) {
  if (conflicts.length === 0) return null;

  return (
    <div style={{
      padding: "10px 14px",
      borderRadius: 10,
      background: "#fef2f2",
      border: "1px solid #fecaca",
      marginBottom: 10,
    }}>
      <div style={{ fontWeight: 800, fontSize: 12, color: "#dc2626", marginBottom: 6 }}>
        ⚠️ Schedule Conflicts ({conflicts.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {conflicts.map((c) => (
          <div
            key={`${c.hrCandidateId}-${c.date}`}
            style={{ fontSize: 12, color: "#991b1b", lineHeight: 1.5 }}
          >
            <strong>{c.employeeName}</strong> on {formatDateShort(c.date)} —
            assigned to {c.assignments.map((a) => a.site).join(" & ")}
          </div>
        ))}
      </div>
    </div>
  );
}