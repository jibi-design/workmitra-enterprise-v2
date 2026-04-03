// src/shared/employment/employmentStorage.ts
// Session 17: Employment lifecycle storage — queries, create, flags.

import type {
  EmploymentRecord,
  EmploymentStatus,
  NoticePeriodDays,
} from "./employmentTypes";
import { CHANGE_EVENT, readAll, writeAll, findRecordIndex } from "./employmentStorageHelpers";

/* ── Re-export actions for single import point ── */
export { employmentActions } from "./employmentActions";

/* ── Public API ── */
export const employmentStorage = {

  /* ── Query ── */
  getAll: readAll,

  getByPostId(careerPostId: string): EmploymentRecord | null {
    return readAll().find((r) => r.careerPostId === careerPostId) ?? null;
  },

  getByEmployee(employeeId: string): EmploymentRecord[] {
    return readAll().filter((r) => r.employeeId === employeeId);
  },

  getActiveByEmployee(employeeId: string): EmploymentRecord[] {
    const active: EmploymentStatus[] = ["selected", "working", "notice", "resigned"];
    return readAll().filter((r) => r.employeeId === employeeId && active.includes(r.status));
  },

  /** Check if employee has any "working" or "notice" status employment. */
  hasActiveEmployment(employeeId: string): boolean {
    return readAll().some(
      (r) => r.employeeId === employeeId && (r.status === "working" || r.status === "notice"),
    );
  },

  /* ── Create ── */
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
  }): EmploymentRecord {
    const now = Date.now();
    const record: EmploymentRecord = {
      id: `emp_${params.careerPostId}_${now}`,
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
      workDurationDays: null,
      workDurationDisplay: "",
      timeline: [{ status: "selected", timestamp: now, actor: "system", note: "Offer accepted" }],
      employeeRated: false,
      employerRated: false,
    };

    const all = readAll();
    all.push(record);
    writeAll(all);
    return record;
  },

  /* ── Rating Flags ── */
  markEmployeeRated(careerPostId: string): void {
    const all = readAll();
    const idx = findRecordIndex(all, careerPostId);
    if (idx === -1) return;
    all[idx].employeeRated = true;
    writeAll(all);
  },

  markEmployerRated(careerPostId: string): void {
    const all = readAll();
    const idx = findRecordIndex(all, careerPostId);
    if (idx === -1) return;
    all[idx].employerRated = true;
    writeAll(all);
  },

  /* ── Subscribe ── */
  subscribe(callback: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, callback);
    return () => window.removeEventListener(CHANGE_EVENT, callback);
  },
} as const;