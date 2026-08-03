// src/features/employer/hrManagement/components/RosterMonthlyGrid.tsx
// Monthly calendar grid for Roster Planner — memoized maps (Wave 3 P2-2/P2-5)

import { useMemo } from "react";
import type { RosterAssignment } from "../types/rosterPlanner.types";
import {
  getSiteColor,
  DAY_SHORT_LABELS,
  ROSTER_MUTED_BG,
  ROSTER_MUTED_FG,
  ROSTER_OFF_BG,
  ROSTER_SURFACE,
  ROSTER_TODAY_BG,
  ROSTER_TODAY_BORDER,
  ROSTER_TODAY_FG,
} from "../helpers/rosterPlannerConstants";
import { isToday, fromDateKey } from "../helpers/rosterPlannerUtils";
import { companyConfigStorage } from "../../company/storage/companyConfig.storage";

type Props = {
  calendarDates: string[];
  currentMonth: number;
  assignments: RosterAssignment[];
  onDayClick: (date: string) => void;
};

export function RosterMonthlyGrid({ calendarDates, currentMonth, assignments, onDayClick }: Props) {
  const { byDate, countByDate } = useMemo(() => {
    const sites = new Map<string, Map<string, number>>();
    const counts = new Map<string, number>();
    for (const a of assignments) {
      if (!sites.has(a.date)) sites.set(a.date, new Map());
      const siteMap = sites.get(a.date)!;
      siteMap.set(a.site, (siteMap.get(a.site) ?? 0) + 1);
      counts.set(a.date, (counts.get(a.date) ?? 0) + 1);
    }
    return { byDate: sites, countByDate: counts };
  }, [assignments]);

  const offDayByDate = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const dateKey of calendarDates) {
      map.set(dateKey, companyConfigStorage.isOffDay(dateKey));
    }
    return map;
  }, [calendarDates]);

  const headerDays = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}
      >
        {headerDays.map((dayIdx) => (
          <div
            key={dayIdx}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--wm-er-muted)",
              padding: "5px 0",
              textTransform: "uppercase",
            }}
          >
            {DAY_SHORT_LABELS[dayIdx]}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {calendarDates.map((dateKey) => {
          const d = fromDateKey(dateKey);
          const isCurrentMonth = d.getMonth() === currentMonth;
          const today = isToday(dateKey);
          const isOff = offDayByDate.get(dateKey) ?? false;
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
                border: today
                  ? `2px solid ${ROSTER_TODAY_BORDER}`
                  : "1px solid var(--wm-er-border)",
                background: !isCurrentMonth
                  ? ROSTER_MUTED_BG
                  : today
                    ? ROSTER_TODAY_BG
                    : isOff
                      ? ROSTER_OFF_BG
                      : ROSTER_SURFACE,
                cursor: "pointer",
                opacity: isCurrentMonth ? 1 : 0.35,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 2px",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: today ? 900 : 600,
                    color: today ? ROSTER_TODAY_FG : isOff ? ROSTER_MUTED_FG : "var(--wm-er-text)",
                  }}
                >
                  {d.getDate()}
                </span>
                {totalStaff > 0 && (
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      color: "#b45309",
                      background: "var(--wm-amber-50)",
                      padding: "1px 4px",
                      borderRadius: 4,
                    }}
                  >
                    {totalStaff}
                  </span>
                )}
              </div>

              {sitesMap && sitesMap.size > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {Array.from(sitesMap.entries())
                    .slice(0, 2)
                    .map(([siteName, count]) => {
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
                    <div
                      style={{
                        fontSize: 8,
                        color: "var(--wm-er-muted)",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
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
