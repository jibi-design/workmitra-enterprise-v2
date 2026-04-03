// src/features/employee/profile/components/ProfileCompletionCard.tsx

import type { ChecklistRow, ChecklistId } from "../types/profileTypes";
import { SectionHead, IconChecklist } from "./ProfilePageIcons";

type Props = {
  doneCount: number;
  totalCount: number;
  rows: ChecklistRow[];
  onScrollTo: (id: ChecklistId) => void;
};

export function ProfileCompletionCard({ doneCount, totalCount, rows, onScrollTo }: Props) {
  const allDone = doneCount === totalCount;

  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }}>
      <SectionHead icon={<IconChecklist />} title="Profile Completion" sub={`${doneCount} of ${totalCount} completed`} />

      <div style={{ marginTop: 4, display: "grid", gap: 6 }}>
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => (!row.done ? onScrollTo(row.id) : undefined)}
            disabled={row.done}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "4px 0",
              border: 0, background: "transparent", cursor: row.done ? "default" : "pointer",
              textAlign: "left", width: "100%",
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 999,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 900, flexShrink: 0,
              border: row.done ? "1.5px solid rgba(22, 163, 74, 0.30)" : "1.5px solid rgba(17, 24, 39, 0.18)",
              background: row.done ? "rgba(22, 163, 74, 0.10)" : "transparent",
              color: row.done ? "var(--wm-success)" : "var(--wm-emp-muted)",
            }}>
              {row.done ? "\u2713" : ""}
            </div>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: row.done ? "var(--wm-emp-muted)" : "var(--wm-emp-text)",
              textDecoration: row.done ? "line-through" : "none",
            }}>
              {row.label}
            </span>
          </button>
        ))}
      </div>

      {allDone && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-success)", fontWeight: 700 }}>
          All core profile items are complete.
        </div>
      )}
    </section>
  );
}