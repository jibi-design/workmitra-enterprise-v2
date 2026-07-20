// App name: Job Mitra
// File name: employerCareerRecords.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\employerCareerRecords.helpers.ts

import type { CareerEmploymentFeedbackTask } from "../../myStaff/storage/careerEmploymentFeedback.storage";
import type { StaffRecord, StaffStatus } from "../../myStaff/storage/myStaff.storage";

export type FeedbackStatusFilter = "all" | "pending" | "completed" | "none";

export type ActiveWorkspaceStatusFilter =
  "all" | "joining_pending" | "active" | "probation" | "resignation_pending" | "notice_period";

export function formatStaffDate(timestamp?: number): string {
  if (!timestamp) return "Not recorded";

  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Not recorded";
  }
}

export function getStaffStatusLabel(status: StaffStatus): string {
  if (status === "joining_pending") return "Joining Pending";
  if (status === "probation") return "Probation";
  if (status === "resignation_pending") return "Resignation Pending";
  if (status === "notice_period") return "Notice Period";
  if (status === "exited") return "Exited";
  return "Currently Working";
}

export function getStaffStatusStyle(status: StaffStatus): React.CSSProperties {
  if (status === "resignation_pending" || status === "notice_period") {
    return {
      color: "#b45309",
      background: "rgba(217,119,6,0.08)",
    };
  }

  if (status === "exited") {
    return {
      color: "rgba(15,23,42,0.62)",
      background: "rgba(15,23,42,0.055)",
    };
  }

  return {
    color: "#1e3a8a",
    background: "rgba(29,78,216,0.08)",
  };
}

export function needsEmployerAction(record: StaffRecord): boolean {
  return record.status === "joining_pending" || record.status === "resignation_pending";
}

export function getRecordDepartmentLabel(record: StaffRecord): string {
  return record.departmentName || record.category || "No department";
}

export function getActiveWorkspaceDepartments(records: StaffRecord[]): string[] {
  const departments = records
    .map(getRecordDepartmentLabel)
    .filter((value) => value && value !== "No department");

  return Array.from(new Set(departments)).sort((a, b) => a.localeCompare(b));
}

export function filterActiveWorkspaceRecords(params: {
  records: StaffRecord[];
  query: string;
  status: ActiveWorkspaceStatusFilter;
  department: string;
}): StaffRecord[] {
  const normalizedQuery = params.query.trim().toLowerCase();
  const normalizedDepartment = params.department.trim().toLowerCase();

  return params.records.filter((record) => {
    if (params.status !== "all" && record.status !== params.status) {
      return false;
    }

    const departmentLabel = getRecordDepartmentLabel(record);

    if (normalizedDepartment && departmentLabel.toLowerCase() !== normalizedDepartment) {
      return false;
    }

    if (!normalizedQuery) return true;

    const searchBody = [
      record.employeeName,
      record.employeeUniqueId,
      record.jobTitle,
      record.departmentName,
      record.category,
      record.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchBody.includes(normalizedQuery);
  });
}

export function getFeedbackTaskForStaff(
  record: StaffRecord,
  tasks: CareerEmploymentFeedbackTask[],
): CareerEmploymentFeedbackTask | null {
  return tasks.find((task) => task.staffId === record.id) ?? null;
}

export function getFeedbackStatusForStaff(
  record: StaffRecord,
  tasks: CareerEmploymentFeedbackTask[],
): "pending" | "completed" | "none" {
  const task = getFeedbackTaskForStaff(record, tasks);

  if (!task) return "none";
  if (task.state === "completed") return "completed";

  return "pending";
}

export function getFeedbackStatusLabel(status: "pending" | "completed" | "none"): string {
  if (status === "completed") return "Feedback saved";
  if (status === "pending") return "Feedback pending";
  return "No feedback yet";
}

export function filterCompletedCareerRecords(params: {
  records: StaffRecord[];
  tasks: CareerEmploymentFeedbackTask[];
  query: string;
  feedbackStatus: FeedbackStatusFilter;
  department: string;
}): StaffRecord[] {
  const normalizedQuery = params.query.trim().toLowerCase();
  const normalizedDepartment = params.department.trim().toLowerCase();

  return params.records.filter((record) => {
    const feedbackStatus = getFeedbackStatusForStaff(record, params.tasks);
    const departmentLabel = getRecordDepartmentLabel(record);

    if (params.feedbackStatus !== "all" && feedbackStatus !== params.feedbackStatus) {
      return false;
    }

    if (normalizedDepartment && departmentLabel.toLowerCase() !== normalizedDepartment) {
      return false;
    }

    if (!normalizedQuery) return true;

    const searchBody = [
      record.employeeName,
      record.employeeUniqueId,
      record.jobTitle,
      record.departmentName,
      record.category,
      record.exitReason,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchBody.includes(normalizedQuery);
  });
}
