/** Job Mitra | employmentService.ts | Phase 16 — employee/career employment list (DB + LS cache) */

import { employmentStorage } from "../../../shared/employment/employmentStorage";
import type { EmploymentRecord } from "../../../shared/employment/employmentTypes";
import { hydrateEmploymentsFromDb } from "./employmentDbTruth.service";
import { isCareerApiSyncEnabled } from "./careerGateApi.service";

/**
 * List employments: DB-authoritative when auth on (hydrate → LS cache), else LS-only.
 */
export async function listEmployments(
  role: "employee" | "employer" = "employee",
): Promise<EmploymentRecord[]> {
  if (isCareerApiSyncEnabled()) {
    await hydrateEmploymentsFromDb(role);
  }
  return employmentStorage.getAll();
}

export async function listEmployeeEmployments(): Promise<EmploymentRecord[]> {
  return listEmployments("employee");
}

export async function listEmployerEmployments(): Promise<EmploymentRecord[]> {
  return listEmployments("employer");
}
