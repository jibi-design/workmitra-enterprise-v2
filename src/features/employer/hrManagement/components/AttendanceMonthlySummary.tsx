// src/features/employer/hrManagement/components/AttendanceMonthlySummary.tsx
//
// Monthly summary card for Employer Attendance Log.
// Root Map Rule: "Simple counts only — NO averages, NO percentages, NO progress bars"
// Shows: Days Present, Days Absent, Leave, Off, Total Hours.

import { useAttendanceSummary } from "../helpers/attendanceHooks";
import { ATT_STATUS_CONFIG } from "../helpers/attendanceConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type MonthlySummaryProps = {
  hrCandidateId: string;
  year: number;
  month: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AttendanceMonthlySummary({ hrCandidateId, year, month }: MonthlySummaryProps) {
  const summary = useAttendanceSummary(hrCandidateId, year, month);

  const totalEntries = summary.daysPresent + summary.daysAbsent + summary.daysLeave + summary.daysOff;

  // Don't render if no entries exist for this month
  if (totalEntries === 0) return null;

  const stats = [
    { label: "Present", value: summary.daysPresent, color: ATT_STATUS_CONFIG.present.color, icon: ATT_STATUS_CONFIG.present.icon },
    { label: "Absent",  value: summary.daysAbsent,  color: ATT_STATUS_CONFIG.absent.color,  icon: ATT_STATUS_CONFIG.absent.icon },
    { label: "Leave",   value: summary.daysLeave,   color: ATT_STATUS_CONFIG.leave.color,   icon: ATT_STATUS_CONFIG.leave.icon },
    { label: "Off",     value: summary.daysOff,     color: ATT_STATUS_CONFIG.off.color,     icon: ATT_STATUS_CONFIG.off.icon },
  ];

  return (
    <div
      style={{
        padding: 14,
        background: "#f8fafc",
        borderRadius: 10,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontWeight: 800,
          fontSize: 12,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 10,
        }}
      >
        Monthly Summary
      </div>

      {/* Count Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>{s.label}:</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Total Hours */}
      {summary.totalHours > 0 && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid var(--wm-er-border, #e5e7eb)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>⏱</span>
          <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>Total Hours:</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
            {summary.totalHours}h
          </span>
        </div>
      )}
    </div>
  );
}