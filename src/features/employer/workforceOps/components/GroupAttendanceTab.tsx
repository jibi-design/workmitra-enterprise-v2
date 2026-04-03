// src/features/employer/workforceOps/components/GroupAttendanceTab.tsx
//
// Attendance tab for Group Detail page.
// Shows sign-in/out status per member per shift, progress bars.

import { useMemo } from "react";
import type {
  WorkforceGroup,
  WorkforceGroupMember,
  AttendanceRecord,
} from "../types/workforceTypes";
import {
  WF_ATTENDANCE_KEY,
} from "../helpers/workforceStorageUtils";
import { readAttendance } from "../helpers/workforceNormalizers";
import { AMBER } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  group: WorkforceGroup;
  members: WorkforceGroupMember[];
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Time Formatter                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatHours(hours: number | null): string {
  if (hours === null) return "—";
  return `${hours.toFixed(1)}h`;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Status Badge                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

type AttendanceStatus = "not_started" | "signed_in" | "signed_out" | "missed";

function getAttendanceStatus(record: AttendanceRecord | undefined): AttendanceStatus {
  if (!record) return "not_started";
  if (record.signOutAt) return "signed_out";
  if (record.signOutType === "auto") return "missed";
  return "signed_in";
}

function statusLabel(status: AttendanceStatus): string {
  switch (status) {
    case "not_started": return "Pending";
    case "signed_in": return "Signed In";
    case "signed_out": return "Done";
    case "missed": return "Missed Sign-Out";
  }
}

function statusDotColor(status: AttendanceStatus): string {
  switch (status) {
    case "not_started": return "var(--wm-er-muted)";
    case "signed_in": return "var(--wm-success)";
    case "signed_out": return AMBER;
    case "missed": return "var(--wm-error)";
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function GroupAttendanceTab({ group, members }: Props) {
  const activeMembers = useMemo(() => members.filter((m) => m.status === "active"), [members]);

  const attendance = useMemo(
    () => readAttendance(WF_ATTENDANCE_KEY).filter((a) => a.groupId === group.id),
    [group.id],
  );

  /* Build lookup: memberId-shiftId → AttendanceRecord */
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const rec of attendance) {
      map.set(`${rec.memberId}__${rec.shiftId}`, rec);
    }
    return map;
  }, [attendance]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {group.shifts.map((shift) => {
        const shiftMembers = activeMembers.filter((m) => m.assignedShiftIds.includes(shift.id));
        const signedInCount = shiftMembers.filter((m) => {
          const rec = attendanceMap.get(`${m.id}__${shift.id}`);
          const status = getAttendanceStatus(rec);
          return status === "signed_in" || status === "signed_out";
        }).length;

        const progress = shiftMembers.length > 0 ? (signedInCount / shiftMembers.length) * 100 : 0;

        return (
          <div key={shift.id} className="wm-er-card">
            {/* Shift Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: AMBER }}>
                  {shift.name}
                  {shift.hasBreak && (
                    <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, color: AMBER, padding: "1px 6px", borderRadius: 999, background: "rgba(180,83,9,0.08)" }}>
                      BREAK
                    </span>
                  )}
                </div>
                {shift.hasBreak ? (
                  <div style={{ fontSize: 10, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
                    Duty 1: {shift.startTime} – {shift.breakStartTime} · Break: {shift.breakStartTime} – {shift.breakEndTime} · Duty 2: {shift.breakEndTime} – {shift.endTime}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>{shift.startTime} — {shift.endTime}</div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: signedInCount === shiftMembers.length && shiftMembers.length > 0 ? "var(--wm-success)" : AMBER }}>
                  {signedInCount}/{shiftMembers.length}
                </div>
                <div style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>checked in</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ height: 4, borderRadius: 2, background: "var(--wm-er-border)", marginBottom: 10 }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: progress === 100 ? "var(--wm-success)" : AMBER,
                  borderRadius: 2,
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Member Rows */}
            {shiftMembers.length > 0 ? (
              <div style={{ display: "grid", gap: 6 }}>
                {shiftMembers.map((member) => {
                  const rec = attendanceMap.get(`${member.id}__${shift.id}`);
                  const status = getAttendanceStatus(rec);

                  return (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: status === "signed_in" ? "rgba(22,163,74,0.04)" : "var(--wm-er-bg)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        {/* Status dot */}
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: statusDotColor(status),
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {member.employeeName}
                          </div>
                          {rec && (
                            <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 1 }}>
                              {shift.hasBreak ? "D1 " : ""}In: {formatTime(rec.signInAt)}
                              {rec.signOutAt && ` · ${shift.hasBreak ? "D1 " : ""}Out: ${formatTime(rec.signOutAt)}`}
                              {rec.hoursWorked !== null && ` · ${formatHours(rec.hoursWorked)}`}
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: statusDotColor(status),
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {statusLabel(status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", textAlign: "center", padding: 8 }}>
                No members assigned to this shift
              </div>
            )}
          </div>
        );
      })}

      {group.shifts.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--wm-er-muted)", textAlign: "center", padding: 16 }}>
          No shifts defined for this group
        </div>
      )}
    </div>
  );
}