// src/features/employer/managerConsole/helpers/managerConsoleData.ts
//
// Computes live summary counts for Manager Console cards.

import { hrManagementStorage } from "../../hrManagement/storage/hrManagement.storage";
import { attendanceLogStorage } from "../../hrManagement/storage/attendanceLog.storage";
import { taskAssignmentStorage } from "../../hrManagement/storage/taskAssignment.storage";
import { staffAvailabilityStorage } from "../../hrManagement/storage/staffAvailability.storage";
import { companyNoticeStorage } from "../../hrManagement/storage/companyNotice.storage";
import { rosterPlannerStorage } from "../../hrManagement/storage/rosterPlanner.storage";
import { incidentReportStorage } from "../../hrManagement/storage/incidentReport.storage";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type ConsoleStats = {
  /* Command Center */
  totalActive: number;
  presentToday: number;
  absentToday: number;
  alertCount: number;
  /* Attendance */
  markedToday: number;
  totalStaff: number;
  /* Tasks */
  activeTasks: number;
  overdueTasks: number;
  /* Roster */
  tomorrowAssignments: number;
  /* Availability */
  pendingRequests: number;
  /* Notices */
  sentThisWeek: number;
  /* Incidents */
  openIncidents: number;
};

/* ------------------------------------------------ */
/* Date helpers                                     */
/* ------------------------------------------------ */
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekAgoMs(): number {
  return Date.now() - 7 * 86400000;
}

/* ------------------------------------------------ */
/* Compute                                          */
/* ------------------------------------------------ */
export function getConsoleStats(): ConsoleStats {
  const activeEmployees = hrManagementStorage.getAll().filter((r) => r.status === "active");
  const totalStaff = activeEmployees.length;
  const today = todayStr();
  const tomorrow = tomorrowStr();

  /* Attendance — count marked today */
  let markedToday = 0;
  let presentToday = 0;
  for (const emp of activeEmployees) {
    const logs = attendanceLogStorage.getAllForCandidate(emp.id);
     const todayLog = logs.find((l) => l.dateKey === today);
    if (todayLog) {
      markedToday++;
      if (todayLog.status === "present") {
        presentToday++;
      }
    }
  }
  const absentToday = totalStaff - presentToday;

  /* Tasks — count active + overdue */
  let activeTasks = 0;
  let overdueTasks = 0;
  const nowMs = Date.now();
  for (const emp of activeEmployees) {
    const tasks = taskAssignmentStorage.getActiveTasks(emp.id);
    activeTasks += tasks.length;
    for (const t of tasks) {
      if (t.dueDate) {
        const dueMs = new Date(t.dueDate + "T23:59:59").getTime();
        if (dueMs < nowMs && t.status !== "completed") {
          overdueTasks++;
        }
      }
    }
  }

  /* Roster — tomorrow assignments */
  const allRoster = rosterPlannerStorage.getAll();
  const tomorrowAssignments = allRoster.filter((r) => r.date === tomorrow).length;

  /* Availability — open/pending requests */
  const pendingRequests = staffAvailabilityStorage.getOpen().length;

  /* Notices — sent this week */
  const weekAgo = weekAgoMs();
  const allNotices = companyNoticeStorage.getAll();
  const sentThisWeek = allNotices.filter((n) => n.createdAt >= weekAgo).length;

  /* Incidents — open */
  const allIncidents = incidentReportStorage.getAll();
  const openIncidents = allIncidents.filter((i) => i.status === "reported" || i.status === "acknowledged" || i.status === "in_progress").length;
  /* Alert count = overdue + open incidents + pending availability */
  const alertCount = overdueTasks + openIncidents + pendingRequests;

  return {
    totalActive: totalStaff,
    presentToday,
    absentToday,
    alertCount,
    markedToday,
    totalStaff,
    activeTasks,
    overdueTasks,
    tomorrowAssignments,
    pendingRequests,
    sentThisWeek,
    openIncidents,
  };
}