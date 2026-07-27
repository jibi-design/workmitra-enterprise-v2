import type { HRCandidateRecord } from "../types/hrManagement.types";
import {
  readAll,
  writeAll,
  genId,
  pushStatusChange,
  hrGetById,
  hrUpdate,
  hrFindByApplication,
} from "./hrStorage.core";
import { assertValidHrEmployeeUniqueId } from "./hrStorageKeys";
import { notifyEmployeePromoted, notifyEmployeeTransferred } from "./hrEmploymentNotifications";

export function hrCreateDirectRecord(data: {
  careerPostId: string;
  applicationId: string;
  employeeUniqueId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  location: string;
}): string {
  const employeeUniqueId = assertValidHrEmployeeUniqueId(data.employeeUniqueId);
  const existing = hrFindByApplication(data.careerPostId, data.applicationId);
  if (existing) return existing.id;

  const now = Date.now();
  const record: HRCandidateRecord = {
    id: genId(),
    careerPostId: data.careerPostId,
    applicationId: data.applicationId,
    employeeUniqueId,
    employeeName: data.employeeName,
    jobTitle: data.jobTitle,
    department: data.department,
    location: data.location,
    status: "active",
    employmentPhase: "confirmed",
    confirmedAt: now,
    statusHistory: [
      {
        id: genId(),
        from: "manually_added",
        to: "active (confirmed)",
        changedAt: now,
        changedBy: "employer",
        note: "Staff added manually – direct active status",
      },
    ],
    movedToHRAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const all = readAll();
  writeAll([record, ...all]);
  return record.id;
}

export function hrApplyPromotion(
  id: string,
  data: { newTitle: string; newDepartment?: string },
): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active") return false;

  const patch: Partial<HRCandidateRecord> = {
    jobTitle: data.newTitle,
    statusHistory: pushStatusChange(
      rec,
      `title: ${rec.jobTitle}`,
      `title: ${data.newTitle}`,
      "employer",
      `Promoted to ${data.newTitle}`,
    ),
  };

  if (data.newDepartment) {
    patch.department = data.newDepartment;
  }

  const updated = hrUpdate(id, patch);
  if (updated) {
    notifyEmployeePromoted(data.newTitle, rec.location);
  }

  return updated;
}

export function hrApplyTransfer(
  id: string,
  data: { newLocation?: string; newDepartment?: string },
): boolean {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "active") return false;

  const changes: string[] = [];
  const patch: Partial<HRCandidateRecord> = {};

  if (data.newLocation) {
    patch.location = data.newLocation;
    changes.push(`location → ${data.newLocation}`);
  }
  if (data.newDepartment) {
    patch.department = data.newDepartment;
    changes.push(`department → ${data.newDepartment}`);
  }

  if (changes.length === 0) return false;

  patch.statusHistory = pushStatusChange(
    rec,
    `location: ${rec.location || "–"}`,
    changes.join(", "),
    "employer",
    `Transferred: ${changes.join(", ")}`,
  );

  const updated = hrUpdate(id, patch);
  if (updated) {
    notifyEmployeeTransferred(rec.location, changes.join(", "));
  }

  return updated;
}
