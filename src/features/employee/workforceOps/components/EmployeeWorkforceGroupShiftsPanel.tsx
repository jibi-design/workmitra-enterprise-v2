// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceGroupShiftsPanel.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceGroupShiftsPanel.tsx

import type {
  AttendanceRecord,
  WorkforceGroup,
  WorkforceGroupMember,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  group: WorkforceGroup;
  myMember: WorkforceGroupMember;
  getMyAttendance: (shiftId: string) => AttendanceRecord | undefined;
  onSignIn: (shiftId: string) => void;
  onSignOut: (shiftId: string) => void;
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function EmployeeWorkforceGroupShiftsPanel({
  group,
  myMember,
  getMyAttendance,
  onSignIn,
  onSignOut,
}: Props) {
  return (
    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
        My Assigned Shifts
      </div>

      {myMember.assignedShiftIds.map((shiftId) => {
        const shift = group.shifts.find((item) => item.id === shiftId);

        if (!shift) return null;

        const record = getMyAttendance(shiftId);
        const isSignedIn = Boolean(record && !record.signOutAt);
        const isComplete = record?.signOutAt !== undefined && record?.signOutAt !== null;

        return (
          <div
            key={shiftId}
            style={{
              padding: "12px 14px",
              borderRadius: "var(--wm-radius-10)",
              border: isSignedIn ? "2px solid var(--wm-success)" : "1px solid var(--wm-er-border)",
              background: isSignedIn ? "rgba(22,163,74,0.04)" : "var(--wm-er-card)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
                  {shift.name}
                  {shift.hasBreak && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 9,
                        fontWeight: 800,
                        color: AMBER,
                        padding: "1px 6px",
                        borderRadius: "var(--wm-radius-pill)",
                        background: AMBER_BG,
                      }}
                    >
                      BREAK
                    </span>
                  )}
                </div>

                {shift.hasBreak ? (
                  <div style={{ fontSize: 10, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
                    Duty 1: {shift.startTime} – {shift.breakStartTime} · Break:{" "}
                    {shift.breakStartTime} – {shift.breakEndTime} · Duty 2: {shift.breakEndTime} –{" "}
                    {shift.endTime}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                    {shift.startTime} — {shift.endTime}
                  </div>
                )}
              </div>

              {!record && group.status === "active" && (
                <button
                  className="wm-primarybtn"
                  type="button"
                  onClick={() => onSignIn(shiftId)}
                  style={{ background: "var(--wm-success)", fontSize: 12, padding: "6px 14px" }}
                >
                  Sign In
                </button>
              )}

              {isSignedIn && (
                <button
                  className="wm-primarybtn"
                  type="button"
                  onClick={() => onSignOut(shiftId)}
                  style={{ background: AMBER, fontSize: 12, padding: "6px 14px" }}
                >
                  Sign Out
                </button>
              )}

              {isComplete && (
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-success)" }}>
                  ✓ Done
                </span>
              )}
            </div>

            {record && (
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
                In: {formatTime(record.signInAt)}
                {record.signOutAt && ` · Out: ${formatTime(record.signOutAt)}`}
                {record.hoursWorked !== null && ` · ${record.hoursWorked.toFixed(1)}h`}
              </div>
            )}
          </div>
        );
      })}

      {myMember.assignedShiftIds.length === 0 && (
        <div
          style={{ fontSize: 12, color: "var(--wm-er-muted)", textAlign: "center", padding: 16 }}
        >
          No shifts assigned to you
        </div>
      )}
    </div>
  );
}
