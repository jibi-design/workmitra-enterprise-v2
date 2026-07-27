// src/features/employee/workforceOps/services/employeeWorkforceHelpers.timesheet.ts

import {
  WF_ATTENDANCE_KEY,
  WF_GROUPS_KEY,
  WF_MEMBERS_KEY,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import {
  readAttendance,
  readGroups,
  readMembers,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";
import { getEmployeeUniqueId } from "./employeeWorkforceHelpers.internal.helpers";

export function getMyTimesheet(
  year: number,
  month: number,
): {
  totalDays: number;
  totalHours: number;
  avgHoursPerDay: number;
  entries: Array<{
    groupId: string;
    groupName: string;
    date: string;
    shiftName: string;
    signInAt: number;
    signOutAt: number | null;
    hoursWorked: number | null;
  }>;
} {
  const myId = getEmployeeUniqueId();
  if (!myId) return { totalDays: 0, totalHours: 0, avgHoursPerDay: 0, entries: [] };

  const allAttendance = readAttendance(WF_ATTENDANCE_KEY);
  const allMembers = readMembers(WF_MEMBERS_KEY);
  const allGroups = readGroups(WF_GROUPS_KEY);

  const myMemberIds = new Set(
    allMembers.filter((m) => m.employeeUniqueId === myId).map((m) => m.id),
  );

  const monthStart = new Date(year, month, 1).getTime();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

  const myRecords = allAttendance.filter(
    (a) => myMemberIds.has(a.memberId) && a.signInAt >= monthStart && a.signInAt <= monthEnd,
  );

  const groupMap = new Map<string, string>();
  for (const g of allGroups) groupMap.set(g.id, g.name);

  const shiftMap = new Map<string, string>();
  for (const g of allGroups) {
    for (const s of g.shifts) shiftMap.set(`${g.id}__${s.id}`, s.name);
  }

  const entries = myRecords
    .map((rec) => ({
      groupId: rec.groupId,
      groupName: groupMap.get(rec.groupId) ?? "Unknown",
      date: new Date(rec.signInAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      shiftName: shiftMap.get(`${rec.groupId}__${rec.shiftId}`) ?? "Shift",
      signInAt: rec.signInAt,
      signOutAt: rec.signOutAt,
      hoursWorked: rec.hoursWorked,
    }))
    .sort((a, b) => b.signInAt - a.signInAt);

  let totalHours = 0;
  const uniqueDays = new Set<string>();
  for (const e of entries) {
    if (e.hoursWorked !== null) totalHours += e.hoursWorked;
    uniqueDays.add(new Date(e.signInAt).toDateString());
  }

  const totalDays = uniqueDays.size;
  const avgHoursPerDay = totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0;
  totalHours = Math.round(totalHours * 10) / 10;

  return { totalDays, totalHours, avgHoursPerDay, entries };
}
