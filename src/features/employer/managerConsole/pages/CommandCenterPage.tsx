// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CommandCenterPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\managerConsole\pages\CommandCenterPage.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { CommandCenterCard } from "../../hrManagement/components/CommandCenterCard";
import { attendanceLogStorage } from "../../hrManagement/storage/attendanceLog.storage";
import { hrManagementStorage } from "../../hrManagement/storage/hrManagement.storage";
import { incidentReportStorage } from "../../hrManagement/storage/incidentReport.storage";
import { leaveManagementStorage } from "../../hrManagement/storage/leaveManagement.storage";
import { rosterPlannerStorage } from "../../hrManagement/storage/rosterPlanner.storage";
import { taskAssignmentStorage } from "../../hrManagement/storage/taskAssignment.storage";
import {
  CommandCenterAssignmentsSection,
  type CommandCenterSiteGroup,
} from "../components/CommandCenterAssignmentsSection";
import { CommandCenterHeader } from "../components/CommandCenterHeader";
import {
  CommandCenterNeedsAttentionSection,
  type CommandCenterAlertItem,
} from "../components/CommandCenterNeedsAttentionSection";

export function CommandCenterPage() {
  const nav = useNavigate();
  const [, setTick] = useState(0);

  const [snapshot] = useState(() => {
    const date = new Date();

    return {
      now: date.getTime(),
      todayKey: attendanceLogStorage.toDateKey(date),
      todayIso:
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0"),
    };
  });

  const refresh = useCallback(() => setTick((tick) => tick + 1), []);

  useEffect(() => {
    const unsubscribeHr = hrManagementStorage.subscribe(refresh);
    const unsubscribeAttendance = attendanceLogStorage.subscribe(refresh);
    const unsubscribeLeave = leaveManagementStorage.subscribe(refresh);
    const unsubscribeTasks = taskAssignmentStorage.subscribe(refresh);
    const unsubscribeRoster = rosterPlannerStorage.subscribe(refresh);
    const unsubscribeIncidents = incidentReportStorage.subscribe(refresh);

    return () => {
      unsubscribeHr();
      unsubscribeAttendance();
      unsubscribeLeave();
      unsubscribeTasks();
      unsubscribeRoster();
      unsubscribeIncidents();
    };
  }, [refresh]);

  const alerts = useMemo<CommandCenterAlertItem[]>(() => {
    const activeEmployees = hrManagementStorage
      .getAll()
      .filter((record) => record.status === "active");

    const pendingLeave = leaveManagementStorage
      .getAllRequests()
      .filter((request) => request.status === "pending").length;

    let overdueTasks = 0;

    for (const employee of activeEmployees) {
      const tasks = taskAssignmentStorage.getActiveTasks(employee.id);

      for (const task of tasks) {
        if (task.dueDate < snapshot.now && task.status !== "completed") {
          overdueTasks += 1;
        }
      }
    }

    let unmarked = 0;

    for (const employee of activeEmployees) {
      const entry = attendanceLogStorage.getDayEntry(employee.id, snapshot.todayKey);

      if (!entry) {
        unmarked += 1;
      }
    }

    const openIncidents = incidentReportStorage.getPendingCount();

    return [
      {
        id: "leave",
        label: "Pending leave requests",
        count: pendingLeave,
        color: "#d97706",
        bg: "rgba(245,158,11,0.06)",
        route: ROUTE_PATHS.employerHRManagement,
      },
      {
        id: "overdue",
        label: "Overdue tasks",
        count: overdueTasks,
        color: "#dc2626",
        bg: "rgba(220,38,38,0.06)",
        route: ROUTE_PATHS.employerConsoleTaskAssign,
      },
      {
        id: "unmarked",
        label: "Attendance not marked",
        count: unmarked,
        color: "#6b7280",
        bg: "rgba(107,114,128,0.06)",
        route: ROUTE_PATHS.employerConsoleAttendance,
      },
      {
        id: "incidents",
        label: "Open incident reports",
        count: openIncidents,
        color: "#dc2626",
        bg: "rgba(220,38,38,0.06)",
        route: ROUTE_PATHS.employerConsoleIncidents,
      },
    ];
  }, [snapshot]);

  const siteGroups = useMemo<CommandCenterSiteGroup[]>(() => {
    const assignments = rosterPlannerStorage.getForDate(snapshot.todayIso);

    if (assignments.length === 0) return [];

    const map = new Map<string, { name: string; shift: string }[]>();

    for (const assignment of assignments) {
      const site = assignment.site || "Unassigned";

      if (!map.has(site)) {
        map.set(site, []);
      }

      map.get(site)?.push({
        name: assignment.employeeName,
        shift:
          assignment.shiftStart && assignment.shiftEnd
            ? `${assignment.shiftStart} – ${assignment.shiftEnd}`
            : "Full day",
      });
    }

    return [...map.entries()]
      .map(([site, staff]) => ({ site, staff }))
      .sort((a, b) => b.staff.length - a.staff.length);
  }, [snapshot]);

  return (
    <div>
      <CommandCenterHeader />

      <CommandCenterCard />

      <div style={{ marginTop: 14 }}>
        <CommandCenterNeedsAttentionSection alerts={alerts} onNavigate={(route) => nav(route)} />
      </div>

      <div style={{ marginTop: 14 }}>
        <CommandCenterAssignmentsSection groups={siteGroups} />
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}
