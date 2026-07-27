import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";

export function getWorkerMlId(app: EmployeeShiftApplication): string {
  return app.profileSnapshot?.uniqueId?.trim() || app.id;
}

export function getWorkerName(app: EmployeeShiftApplication): string {
  return app.profileSnapshot?.fullName?.trim() || `Worker ${app.id.slice(-4).toUpperCase()}`;
}
