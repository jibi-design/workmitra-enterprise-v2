// App name: Job Mitra
// File name: employmentStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\employment\employmentStorage.ts

// Shared Career employment storage.
// Source-of-truth target for Career employment status, timeline, resignation, completion, and rating flags.

import type { EmploymentRecord, EmploymentStatus, NoticePeriodDays } from "./employmentTypes";
import {
  CHANGE_EVENT,
  EMPLOYMENT_KEY,
  readAll,
  writeAllChecked,
  findRecordIndex,
} from "./employmentStorageHelpers";

function makeEmploymentId(careerPostId: string): string {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  const hex = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  return `emp_${careerPostId}_${hex}`;
}

export { employmentActions } from "./employmentActions";

export const employmentStorage = {
  getAll: readAll,

  getByPostId(careerPostId: string): EmploymentRecord | null {
    return readAll().find((record) => record.careerPostId === careerPostId) ?? null;
  },

  getByEmployee(employeeId: string): EmploymentRecord[] {
    return readAll().filter((record) => record.employeeId === employeeId);
  },

  getActiveByEmployee(employeeId: string): EmploymentRecord[] {
    const active: EmploymentStatus[] = ["selected", "working", "notice", "resigned"];

    return readAll().filter(
      (record) => record.employeeId === employeeId && active.includes(record.status),
    );
  },

  hasActiveEmployment(employeeId: string): boolean {
    return readAll().some(
      (record) =>
        record.employeeId === employeeId &&
        (record.status === "working" || record.status === "notice"),
    );
  },

  create(params: {
    careerPostId: string;
    employeeId: string;
    employeeName: string;
    employeeWmId: string;
    employerId: string;
    companyName: string;
    employerWmId: string;
    jobTitle: string;
    department: string;
    salaryMin: number;
    salaryMax: number;
    salaryPeriod: string;
    noticePeriodDays: NoticePeriodDays;
  }): EmploymentRecord | null {
    const existing = readAll().find(
      (record) =>
        record.careerPostId === params.careerPostId && record.employeeId === params.employeeId,
    );

    if (existing) return existing;

    const now = Date.now();

    const record: EmploymentRecord = {
      id: makeEmploymentId(params.careerPostId),
      careerPostId: params.careerPostId,
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      employeeWmId: params.employeeWmId,
      employerId: params.employerId,
      companyName: params.companyName,
      employerWmId: params.employerWmId,
      jobTitle: params.jobTitle,
      department: params.department,
      salaryMin: params.salaryMin,
      salaryMax: params.salaryMax,
      salaryPeriod: params.salaryPeriod,
      status: "selected",
      offeredAt: now,
      acceptedAt: now,
      joinedAt: null,
      resignedAt: null,
      completedAt: null,
      noticePeriodDays: params.noticePeriodDays,
      lastWorkingDay: null,
      exitType: null,
      exitReason: null,
      exitNotes: "",
      wasWithdrawn: false,
      withdrawnAt: null,
      forceCompleted: false,
      workDurationDays: null,
      workDurationDisplay: "",
      timeline: [
        {
          status: "selected",
          timestamp: now,
          actor: "system",
          note: "Career employment record created",
        },
      ],
      employeeRated: false,
      employerRated: false,
    };

    const write = writeAllChecked([record, ...readAll()]);
    if (!write.ok) return null;

    return record;
  },

  markEmployeeRated(careerPostId: string): void {
    const all = readAll();
    const index = findRecordIndex(all, careerPostId);

    if (index === -1) return;

    all[index].employeeRated = true;
    writeAllChecked(all);
  },

  markEmployerRated(careerPostId: string): void {
    const all = readAll();
    const index = findRecordIndex(all, careerPostId);

    if (index === -1) return;

    all[index].employerRated = true;
    writeAllChecked(all);
  },

  subscribe(callback: () => void): () => void {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === EMPLOYMENT_KEY || event.key === null) {
        callback();
      }
    };

    window.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CHANGE_EVENT, callback);
      window.removeEventListener("storage", handleStorage);
    };
  },
} as const;
