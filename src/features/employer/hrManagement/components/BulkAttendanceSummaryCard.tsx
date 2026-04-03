// src/features/employer/hrManagement/components/BulkAttendanceSummaryCard.tsx
//
// Top summary card for Bulk Attendance page.

import type { AttendanceSummary } from "../helpers/bulkAttendanceHelpers";

const STATS: { key: keyof AttendanceSummary; label: string; color: string; bg: string; border: string }[] = [
  { key: "present", label: "Present", color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  { key: "absent",  label: "Absent",  color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
  { key: "leave",   label: "Leave",   color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
  { key: "off",     label: "Off",     color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
];

type Props = { summary: AttendanceSummary };

export function BulkAttendanceSummaryCard({ summary }: Props) {
  if (summary.total === 0) return null;

  return (
    <div style={{
      padding: "12px 16px", background: "#fff", borderRadius: 10,
      border: "1px solid var(--wm-er-border, #e5e7eb)", boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    }}>
      <div style={{ fontWeight: 800, fontSize: 11, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Summary — {summary.total} Employees
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {STATS.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.bg, border: `1px solid ${s.border}` }} />
            <span style={{ color: "var(--wm-er-muted)" }}>{s.label}:</span>
            <span style={{ fontWeight: 800, color: s.color }}>{summary[s.key]}</span>
          </div>
        ))}
      </div>
      {summary.notMarked > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#dc2626", fontWeight: 800 }}>
          {summary.notMarked} employee{summary.notMarked > 1 ? "s" : ""} not marked yet
        </div>
      )}
    </div>
  );
}