// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnounceDashStats.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceAnnounceDashStats.tsx

import type { CSSProperties } from "react";
import type { WorkforceAnnouncement } from "../../../../shared/domains/workforce/types/workforceTypes";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  announcement: WorkforceAnnouncement;
  categoryMap: Map<string, string>;
  totalVacancy: number;
  appliedCount: number;
  selectedCount: number;
};

const detailRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "6px 0",
  borderBottom: "1px solid var(--wm-er-border)",
};

export function EmployerWorkforceAnnounceDashStats({
  announcement,
  categoryMap,
  totalVacancy,
  appliedCount,
  selectedCount,
}: Props) {
  const detailRows = [
    {
      label: "Work Date",
      value: announcement.date
        ? new Date(announcement.date + "T00:00:00").toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
    },
    ...(announcement.time ? [{ label: "Time", value: announcement.time }] : []),
    ...(announcement.location ? [{ label: "Location", value: announcement.location }] : []),
    { label: "Shifts", value: announcement.shifts.map((shift) => shift.name).join(", ") },
    {
      label: "Categories",
      value: announcement.targetCategories.map((id) => categoryMap.get(id) ?? id).join(", "),
    },
    { label: "Auto-Replace", value: announcement.autoReplace ? "ON" : "OFF" },
  ];

  return (
    <>
      <div className="wm-er-tiles" style={{ marginTop: 14 }}>
        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Vacancies</div>
          <div className="wm-er-tileValue" style={{ color: AMBER }}>
            {totalVacancy}
          </div>
        </div>

        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Applied</div>
          <div className="wm-er-tileValue">{appliedCount}</div>
        </div>

        <div className="wm-er-tile">
          <div className="wm-er-tileLabel">Selected</div>
          <div
            className="wm-er-tileValue"
            style={{ color: selectedCount > 0 ? "var(--wm-success)" : undefined }}
          >
            {selectedCount}
          </div>
        </div>
      </div>

      <div className="wm-er-card" style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 8 }}>
          Details
        </div>

        {detailRows.map((row, index) => (
          <div
            key={row.label}
            style={{
              ...detailRowStyle,
              borderBottom: index === detailRows.length - 1 ? "none" : detailRowStyle.borderBottom,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
              {row.value}
            </span>
          </div>
        ))}

        {announcement.description && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            {announcement.description}
          </div>
        )}
      </div>
    </>
  );
}
