/**
 * Employee-safe Shift reads for dual-context AUTH sessions.
 * Employer-scoped SoT keys require employer tenant bind — never call those
 * while activeMode/role is employee (Play Store dual-role reviewer path).
 */

import { useAuthStore } from "../../../shared/store/authStore";
import {
  getEmployerShiftPosts as getEmployerShiftPostsScoped,
} from "../../employer/shiftJobs/storage/employerShift.postActions";
import {
  readEmployeeApplications as readEmployeeApplicationsScoped,
  readWorkerApplicationProjection,
  writeEmployeeApplications as writeEmployeeApplicationsScoped,
  writeWorkerApplicationProjection,
  type ApplicationWriteResult,
} from "../../employer/shiftJobs/storage/employerShift.employeeApplications";
import type {
  EmployeeShiftApplication,
  ShiftPost,
} from "../../employer/shiftJobs/storage/employerShift.types";
import { EMPLOYEE_SEARCH_POSTS_KEY } from "./shiftTenantProjection";

function isEmployeeActiveSession(): boolean {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  if (user.activeMode === "employee") return true;
  if (user.activeMode === "employer") return false;
  return user.role === "employee";
}

function readEmployeeSearchPosts(): ShiftPost[] {
  try {
    const raw = localStorage.getItem(EMPLOYEE_SEARCH_POSTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ShiftPost => {
      if (typeof item !== "object" || item === null) return false;
      return typeof (item as { id?: unknown }).id === "string";
    });
  } catch {
    return [];
  }
}

/** Marketplace / employer posts — employee sessions use search projection only. */
export function getEmployerShiftPosts(): ShiftPost[] {
  if (isEmployeeActiveSession()) {
    return readEmployeeSearchPosts();
  }
  return getEmployerShiftPostsScoped();
}

/** Applications — employee sessions use worker projection across employers. */
export function readEmployeeApplications(): EmployeeShiftApplication[] {
  if (isEmployeeActiveSession()) {
    return readWorkerApplicationProjection();
  }
  return readEmployeeApplicationsScoped();
}

/**
 * Employer writes stay scoped. Employee sessions update the worker projection
 * so server hydrate (shortlist/confirm) can land on My Applications.
 */
export function writeEmployeeApplications(
  apps: EmployeeShiftApplication[],
): ApplicationWriteResult {
  if (isEmployeeActiveSession()) {
    return writeWorkerApplicationProjection(apps);
  }
  return writeEmployeeApplicationsScoped(apps);
}
