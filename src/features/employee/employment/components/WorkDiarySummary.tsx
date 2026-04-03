// src/features/employee/employment/components/WorkDiarySummary.tsx
//
// Monthly summary for Work Diary. Simple counts only.
// Root Map: "NO averages, NO percentages, NO progress bars"

import { useWorkDiarySummary } from "../helpers/workDiaryHooks";
import { WD_STATUS_CONFIG } from "../helpers/workDiaryConstants";

type Props = {
  employmentId: string;
  year: number;
  month: number;
};

export function WorkDiarySummary({ employmentId, year, month }: Props) {
  const summary = useWorkDiarySummary(employmentId, year, month);
  const total = summary.daysWorked + summary.daysLeave + summary.daysOff;

  if (total === 0) return null;

  const stats = [
    { label: "Worked", value: summary.daysWorked, color: WD_STATUS_CONFIG.worked.color, icon: WD_STATUS_CONFIG.worked.icon },
    { label: "Leave",  value: summary.daysLeave,  color: WD_STATUS_CONFIG.leave.color,  icon: WD_STATUS_CONFIG.leave.icon },
    { label: "Off",    value: summary.daysOff,    color: WD_STATUS_CONFIG.off.color,    icon: WD_STATUS_CONFIG.off.icon },
  ];

  return (
    <div style={{
      padding: 14, background: "#f8fafc", borderRadius: 10,
      border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
    }}>
      <div style={{
        fontWeight: 800, fontSize: 12,
        color: "var(--wm-emp-muted, var(--wm-er-muted))",
        textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10,
      }}>
        Monthly Summary
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <span style={{ color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>{s.label}:</span>
            <span style={{ fontWeight: 800, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
      {summary.totalHours > 0 && (
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>⏱</span>
          <span style={{ fontSize: 12, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>Total Hours:</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))" }}>{summary.totalHours}h</span>
        </div>
      )}
    </div>
  );
}