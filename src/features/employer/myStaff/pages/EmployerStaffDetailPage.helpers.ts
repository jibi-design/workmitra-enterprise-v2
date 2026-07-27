import { careerEmploymentFeedbackStorage } from "../storage/careerEmploymentFeedback.storage";
import { myStaffStorage, type StaffRecord } from "../storage/myStaff.storage";

export const DAY_MS = 86_400_000;

export function formatDateLabel(timestamp: number | null | undefined): string {
  if (!timestamp) return "Not set";

  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Not set";
  }
}

export function getDaysLeft(
  lastWorkingDay: number | null | undefined,
  nowMs: number,
): number | null {
  if (!lastWorkingDay) return null;

  return Math.max(0, Math.ceil((lastWorkingDay - nowMs) / DAY_MS));
}

export function createPendingFeedbackTask(record: StaffRecord, companyName: string): void {
  careerEmploymentFeedbackStorage.createPending({
    staffId: record.id,
    careerPostId: record.careerPostId,
    employeeUniqueId: record.employeeUniqueId,
    employeeName: record.employeeName,
    jobTitle: record.jobTitle,
    companyName,
  });
}

type StaffDetailSnapshot = {
  records: StaffRecord[];
  departments: ReturnType<typeof myStaffStorage.getDepartments>;
};

let cachedSnapshot: StaffDetailSnapshot = { records: [], departments: [] };
let cachedSnapshotKey = "";

export function getStaffDetailSnapshot(): StaffDetailSnapshot {
  const fresh: StaffDetailSnapshot = {
    records: myStaffStorage.getAll(),
    departments: myStaffStorage.getDepartments(),
  };

  const freshKey = JSON.stringify(fresh);

  if (freshKey !== cachedSnapshotKey) {
    cachedSnapshot = fresh;
    cachedSnapshotKey = freshKey;
  }

  return cachedSnapshot;
}
