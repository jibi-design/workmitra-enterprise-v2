// src/features/employer/hrManagement/components/BulkAttendanceFilterTabs.tsx
//
// Filter tabs for Bulk Attendance — All/Present/Absent/Leave/Off/Not Marked.

import type { FilterTab, AttendanceSummary } from "../helpers/bulkAttendanceHelpers";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent" },
  { key: "leave", label: "Leave" },
  { key: "off", label: "Off" },
  { key: "not_marked", label: "Not Marked" },
];

type Props = {
  activeFilter: FilterTab;
  summary: AttendanceSummary;
  onChange: (tab: FilterTab) => void;
};

export function BulkAttendanceFilterTabs({ activeFilter, summary, onChange }: Props) {
  const counts: Record<FilterTab, number> = {
    all: summary.total,
    present: summary.present,
    absent: summary.absent,
    leave: summary.leave,
    off: summary.off,
    not_marked: summary.notMarked,
  };

  return (
    <div style={{
      display: "flex", gap: 0, overflowX: "auto",
      borderBottom: "2px solid var(--wm-er-border, #e5e7eb)",
    }} className="wm-hideScrollbar">
      {TABS.map((tab) => {
        const isActive = activeFilter === tab.key;
        const count = counts[tab.key];
        return (
          <button key={tab.key} type="button" onClick={() => onChange(tab.key)} style={{
            flex: "0 0 auto", padding: "8px 12px", fontSize: 12,
            fontWeight: isActive ? 900 : 600,
            color: isActive ? "var(--wm-er-accent-console, #0369a1)" : "var(--wm-er-muted)",
            background: isActive ? "rgba(3, 105, 161,0.06)" : "transparent",
            border: "none",
            borderBottom: isActive ? "3px solid var(--wm-er-accent-console, #0369a1)" : "3px solid transparent",
            borderRadius: isActive ? "6px 6px 0 0" : "0",
            marginBottom: -2, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {tab.label}
            {count > 0 && (
              <span style={{
                marginLeft: 4, fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 999,
                background: isActive ? "rgba(3, 105, 161,0.1)" : "rgba(107,114,128,0.08)",
                color: isActive ? "var(--wm-er-accent-console)" : "var(--wm-er-muted)",
              }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
