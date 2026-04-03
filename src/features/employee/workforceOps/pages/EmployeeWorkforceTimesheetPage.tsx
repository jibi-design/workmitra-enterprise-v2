// src/features/employee/workforceOps/pages/EmployeeWorkforceTimesheetPage.tsx
//
// Workforce Ops Hub — Employee Timesheet.
// Monthly view with Days/Hours toggle preference.
// Per-group breakdown, month navigation, preference saved to localStorage.

import { useMemo, useState, useCallback } from "react";
import { employeeWorkforceHelpers } from "../services/employeeWorkforceHelpers";
import { IconBack } from "../../../employer/workforceOps/components/workforceIcons";
import { AMBER, AMBER_BG } from "../../../employer/workforceOps/components/workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Preference Storage                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

type TimesheetMode = "days" | "hours";
const PREF_KEY = "wm_employee_timesheet_mode_v1";

function readMode(): TimesheetMode {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw === "hours" ? "hours" : "days";
  } catch {
    return "days";
  }
}

function writeMode(mode: TimesheetMode): void {
  try {
    localStorage.setItem(PREF_KEY, mode);
  } catch {
    // ignore
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  onBack: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Month Names                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Time Formatter                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const monthNavStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
};

const navBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--wm-er-border)",
  borderRadius: 8,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 800,
  color: AMBER,
};

const entryCardStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmployeeWorkforceTimesheetPage({ onBack }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [mode, setMode] = useState<TimesheetMode>(readMode);

  const timesheet = useMemo(
    () => employeeWorkforceHelpers.getMyTimesheet(year, month),
    [year, month],
  );

  const goToPrevMonth = useCallback(() => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }, [month]);

  const toggleMode = useCallback(() => {
    const next: TimesheetMode = mode === "days" ? "hours" : "days";
    setMode(next);
    writeMode(next);
  }, [mode]);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  /* Group entries by group for breakdown */
  const groupedByGroup = useMemo(() => {
    const map = new Map<string, {
      groupName: string;
      totalHours: number;
      uniqueDays: Set<string>;
      entries: typeof timesheet.entries;
    }>();

    for (const entry of timesheet.entries) {
      const existing = map.get(entry.groupId);
      const dayKey = new Date(entry.signInAt).toDateString();
      if (existing) {
        existing.entries.push(entry);
        existing.totalHours += entry.hoursWorked ?? 0;
        existing.uniqueDays.add(dayKey);
      } else {
        const days = new Set<string>();
        days.add(dayKey);
        map.set(entry.groupId, {
          groupName: entry.groupName,
          totalHours: entry.hoursWorked ?? 0,
          uniqueDays: days,
          entries: [entry],
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalHours - a.totalHours);
 }, [timesheet]);

  /* Primary metric based on mode */
  const primaryValue = mode === "days" ? timesheet.totalDays : timesheet.totalHours;
  const primaryLabel = mode === "days" ? "Days Worked" : "Total Hours";
  const switchLabel = mode === "days" ? "Switch to Hours" : "Switch to Days";

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Header */}
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: AMBER, padding: 4, borderRadius: 6, display: "inline-flex", alignItems: "center" }}>
          <IconBack />
        </button>
        <div style={{ flex: 1 }}>
          <div className="wm-pageTitle">My Timesheet</div>
          <div className="wm-pageSub">Monthly attendance summary</div>
        </div>
      </div>

      {/* Month Navigation */}
      <div style={{ ...monthNavStyle, marginTop: 14 }}>
        <button type="button" onClick={goToPrevMonth} style={navBtnStyle}>◀</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>
            {MONTH_NAMES[month]} {year}
          </div>
          {isCurrentMonth && (
            <div style={{ fontSize: 10, color: AMBER, fontWeight: 700, marginTop: 2 }}>Current Month</div>
          )}
        </div>
        <button
          type="button"
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          style={{ ...navBtnStyle, opacity: isCurrentMonth ? 0.3 : 1, cursor: isCurrentMonth ? "default" : "pointer" }}
        >
          ▶
        </button>
      </div>

      {/* Primary KPI + Mode Toggle */}
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            padding: "20px 16px",
            borderRadius: "var(--wm-radius-14)",
            background: AMBER_BG,
            border: `1px solid ${AMBER}`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 900, color: AMBER, letterSpacing: -1 }}>
            {primaryValue}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 4 }}>
            {primaryLabel}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {MONTH_NAMES[month]} {year}
          </div>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={toggleMode}
            style={{
              marginTop: 10,
              padding: "6px 16px",
              borderRadius: 999,
              border: `1px solid ${AMBER}`,
              background: "#fff",
              color: AMBER,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {switchLabel}
          </button>
        </div>
      </div>

      {/* Per-Group Breakdown */}
      {groupedByGroup.length > 0 ? (
        <div style={{ marginTop: 16, display: "grid", gap: 14, marginBottom: 24 }}>
          {groupedByGroup.map((group) => {
            const groupPrimaryValue = mode === "days"
              ? group.uniqueDays.size
              : Math.round(group.totalHours * 10) / 10;
            const groupPrimaryUnit = mode === "days"
              ? `day${group.uniqueDays.size !== 1 ? "s" : ""}`
              : "hours";

            return (
              <div key={group.groupName} className="wm-er-card">
                {/* Group Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: AMBER }}>{group.groupName}</div>
                    <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                      {group.entries.length} shift{group.entries.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: AMBER }}>
                      {groupPrimaryValue}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>{groupPrimaryUnit}</div>
                  </div>
                </div>

                {/* Shift Entries */}
                <div style={{ display: "grid", gap: 6 }}>
                  {group.entries.map((entry, idx) => (
                    <div key={idx} style={entryCardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
                            {entry.date}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                            {entry.shiftName} · In: {fmtTime(entry.signInAt)}
                            {entry.signOutAt ? ` · Out: ${fmtTime(entry.signOutAt)}` : " · Still active"}
                          </div>
                        </div>
                        {mode === "hours" && (
                          <div style={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: entry.hoursWorked !== null ? AMBER : "var(--wm-er-muted)",
                          }}>
                            {entry.hoursWorked !== null ? `${entry.hoursWorked.toFixed(1)}h` : "—"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="wm-er-card" style={{ marginTop: 16, marginBottom: 24 }}>
          <div style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
              No attendance records
            </div>
            <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 4, maxWidth: 280, margin: "4px auto 0", lineHeight: 1.5 }}>
              {isCurrentMonth
                ? "No shifts recorded this month yet. Sign in to your shifts from the group page."
                : `No work recorded in ${MONTH_NAMES[month]} ${year}.`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}