// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceTimesheetGroups.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceTimesheetGroups.tsx

import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";
import type { TimesheetGroup, TimesheetMode } from "../types/timesheetForm.types";

type Props = {
  mode: TimesheetMode;
  groupedByGroup: TimesheetGroup[];
};

const entryCardStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "var(--wm-radius-10)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
};

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function EmployeeWorkforceTimesheetGroups({ mode, groupedByGroup }: Props) {
  return (
    <div style={{ marginTop: 16, display: "grid", gap: 14, marginBottom: 24 }}>
      {groupedByGroup.map((group) => {
        const groupPrimaryValue =
          mode === "days" ? group.uniqueDays.size : Math.round(group.totalHours * 10) / 10;

        const groupPrimaryUnit =
          mode === "days" ? `day${group.uniqueDays.size !== 1 ? "s" : ""}` : "hours";

        return (
          <div key={group.groupName} className="wm-er-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
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

            <div style={{ display: "grid", gap: 6 }}>
              {group.entries.map((entry, index) => (
                <div key={`${entry.groupId}-${entry.signInAt}-${index}`} style={entryCardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
                        {entry.date}
                      </div>

                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                        {entry.shiftName} · In: {fmtTime(entry.signInAt)}
                        {entry.signOutAt
                          ? ` · Out: ${fmtTime(entry.signOutAt)}`
                          : " · Still active"}
                      </div>
                    </div>

                    {mode === "hours" && (
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 900,
                          color: entry.hoursWorked !== null ? AMBER : "var(--wm-er-muted)",
                        }}
                      >
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
  );
}
