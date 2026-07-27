/** Job Mitra | hrEmploymentService.ts | Phase 16 — HR staff employments from DB */

import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import type { EmploymentRecord } from "../../../../shared/employment/employmentTypes";
import { hydrateEmploymentsFromDb } from "../../../career/services/employmentDbTruth.service";
import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.service";

/**
 * Employer HR/staff employment list: GET /employer/career/staff when auth on,
 * merged into shared employment LS cache (notes/prefs stay local-side in details).
 */
export async function listHrStaffEmployments(): Promise<EmploymentRecord[]> {
  if (isCareerApiSyncEnabled()) {
    await hydrateEmploymentsFromDb("employer");
  }
  return employmentStorage.getAll();
}

export function getHrEmploymentByCareerPostId(careerPostId: string): EmploymentRecord | null {
  return employmentStorage.getByPostId(careerPostId);
}
