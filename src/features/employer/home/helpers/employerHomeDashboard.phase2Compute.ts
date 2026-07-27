/** Phase-2 HR / Manager Console stats — loaded only when showPhase2Features. */

import { hrManagementStorage } from "../../hrManagement/storage/hrManagement.storage";
import { attendanceLogStorage } from "../../hrManagement/storage/attendanceLog.storage";
import { taskAssignmentStorage } from "../../hrManagement/storage/taskAssignment.storage";
import { incidentReportStorage } from "../../hrManagement/storage/incidentReport.storage";

export const PHASE2_STORAGE_KEYS = [
  "wm_hr_management_v1",
  "wm_attendance_log_v1",
  "wm_task_assignment_v1",
  "wm_incident_reports_v1",
] as const;

export type Phase2DashboardSlice = {
  hrTotal: number;
  hrActive: number;
  hrPending: number;
  hrExited: number;
  consolePresentToday: number;
  consoleAbsentToday: number;
  consoleActiveTasks: number;
  consoleAlerts: number;
};

export function computePhase2DashboardSlice(): Phase2DashboardSlice {
  const hrAll = hrManagementStorage.getAll();
  const hrTotal = hrAll.length;
  const hrActive = hrAll.filter((record) => record.status === "active").length;
  const hrPending = hrAll.filter(
    (record) =>
      record.status === "offer_pending" ||
      record.status === "offered" ||
      record.status === "onboarding",
  ).length;
  const hrExited = hrAll.filter((record) => record.status === "exit_processing").length;

  const activeStaff = hrAll.filter((record) => record.status === "active");
  const todayKey = attendanceLogStorage.toDateKey(new Date());

  let consolePresentToday = 0;
  let consoleAbsentToday = 0;
  let consoleActiveTasks = 0;

  for (const employee of activeStaff) {
    const entry = attendanceLogStorage.getDayEntry(employee.id, todayKey);
    if (entry?.status === "present") consolePresentToday++;
    if (entry?.status === "absent") consoleAbsentToday++;
    consoleActiveTasks += taskAssignmentStorage.getActiveTasks(employee.id).length;
  }

  return {
    hrTotal,
    hrActive,
    hrPending,
    hrExited,
    consolePresentToday,
    consoleAbsentToday,
    consoleActiveTasks,
    consoleAlerts: incidentReportStorage.getPendingCount(),
  };
}
