// src/features/employer/hrManagement/components/RosterMonthlyGrid.tsx
//
// Monthly calendar grid for Roster Planner (Root Map Section 7.4.15) — ENHANCED.
// Site name chips with staff count per day, readable font sizes,
// today prominent highlight, weekend auto-grey.

import type { RosterAssignment } from "../types/rosterPlanner.types";
import { getSiteColor, DAY_SHORT_LABELS } from "../helpers/rosterPlannerConstants";
import { isToday, fromDateKey } from "../helpers/rosterPlannerUtils";
import { companyConfigStorage } from "../../company/storage/companyConfig.storage";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  calendarDates: string[];
  currentMonth: number;
  assignments: RosterAssignment[];
  onDayClick: (date: string) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RosterMonthlyGrid({ calendarDates, currentMonth, assignments, onDayClick }: Props) {
  // Group by date → unique sites with staff count
  const byDate = new Map<string, Map<string, number>>();
  const countByDate = new Map<string, number>();
  for (const a of assignments) {
    if (!byDate.has(a.date)) byDate.set(a.date, new Map());
    const siteMap = byDate.get(a.date)!;
    siteMap.set(a.site, (siteMap.get(a.site) ?? 0) + 1);
    countByDate.set(a.date, (countByDate.get(a.date) ?? 0) + 1);
  }

  // Header: Mon - Sun
  const headerDays = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div>
      {/* Day Headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
        {headerDays.map((dayIdx) => (
          <div
            key={dayIdx}
            style={{
              textAlign: "center", fontSize: 11, fontWeight: 700,
              color: "var(--wm-er-muted)", padding: "5px 0", textTransform: "uppercase",
            }}
          >
            {DAY_SHORT_LABELS[dayIdx]}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {calendarDates.map((dateKey) => {
          const d = fromDateKey(dateKey);
          const isCurrentMonth = d.getMonth() === currentMonth;
          const today = isToday(dateKey);
          const isOff = companyConfigStorage.isOffDay(dateKey);
          const sitesMap = byDate.get(dateKey);
          const totalStaff = countByDate.get(dateKey) ?? 0;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onDayClick(dateKey)}
              style={{
                minHeight: 60,
                padding: "4px 3px",
                borderRadius: 8,
                border: today ? "2px solid #0369a1" : "1px solid var(--wm-er-border, #e5e7eb)",
                background: !isCurrentMonth
                  ? "#f9fafb"
                  : today
                    ? "#eff6ff"
                    : isOff ? "#f3f4f6" : "#fff",
                cursor: "pointer",
                opacity: isCurrentMonth ? 1 : 0.35,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 2,
                overflow: "hidden",
              }}
            >
              {/* Day Number */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 2px",
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: today ? 900 : 600,
                  color: today ? "#0369a1" : isOff ? "#9ca3af" : "var(--wm-er-text)",
                }}>
                  {d.getDate()}
                </span>
                {totalStaff > 0 && (
                  <span style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: "#b45309",
                    background: "#fffbeb",
                    padding: "1px 4px",
                    borderRadius: 4,
                  }}>
                    {totalStaff}
                  </span>
                )}
              </div>

              {/* Site Chips */}
              {sitesMap && sitesMap.size > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {Array.from(sitesMap.entries()).slice(0, 2).map(([siteName, count]) => {
                    const sc = getSiteColor(siteName);
                    return (
                      <div
                        key={siteName}
                        style={{
                          padding: "2px 4px",
                          borderRadius: 4,
                          background: sc.bg,
                          fontSize: 8,
                          fontWeight: 700,
                          color: sc.color,
                          textAlign: "center",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {siteName.length > 7 ? siteName.slice(0, 6) + "…" : siteName} ({count})
                      </div>
                    );
                  })}
                  {sitesMap.size > 2 && (
                    <div style={{
                      fontSize: 8,
                      color: "var(--wm-er-muted)",
                      textAlign: "center",
                      fontWeight: 700,
                    }}>
                      +{sitesMap.size - 2} more
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
