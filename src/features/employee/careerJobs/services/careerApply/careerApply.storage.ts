// Career apply — localStorage read/write + employee identity helpers.
// Candidate-side draft/app persistence: XSS-sanitize free text on read/write.

import { resolveActorStorageId } from "../../../../../app/identity/identity.adapter";
import {
  CAREER_APPS_KEY,
  notifyCareerAppsChanged,
  safeParse,
  safeWrite,
  type CareerStorageWriteResult,
} from "../../../../career/helpers/careerStoragePublic";
import { employeeProfileStorage } from "../../../profile/storage/employeeProfile.storage";
import type {
  CareerApplication,
  CareerApplicationProfileSnapshot,
} from "../../../../career/types/careerDomainTypes";
import { sanitizeUserText } from "../../../../../shared/security/sanitizeUserText";

function sanitizeApp(app: CareerApplication): CareerApplication {
  return {
    ...app,
    employeeName: sanitizeUserText(app.employeeName ?? "", 200),
    employeePhone: sanitizeUserText(app.employeePhone ?? "", 40),
    employeeEmail: sanitizeUserText(app.employeeEmail ?? "", 200),
    resumeSummary: sanitizeUserText(app.resumeSummary ?? "", 2000),
    coverNote: sanitizeUserText(app.coverNote ?? "", 600),
    employerNotes: sanitizeUserText(app.employerNotes ?? "", 4000),
  };
}

export function readAllApps(): CareerApplication[] {
  const raw = localStorage.getItem(CAREER_APPS_KEY);
  return safeParse<CareerApplication>(raw).map(sanitizeApp);
}

export function writeAllApps(apps: CareerApplication[]): CareerStorageWriteResult {
  const result = safeWrite(CAREER_APPS_KEY, apps.map(sanitizeApp));
  if (!result.ok) return result;
  notifyCareerAppsChanged();
  return { ok: true };
}

export function getCurrentEmployeeId(): string {
  return resolveActorStorageId("employee", "employee_demo");
}

export function buildProfileSnapshot(): CareerApplicationProfileSnapshot {
  const profile = employeeProfileStorage.get();

  return {
    uniqueId: profile.uniqueId || undefined,
    fullName: profile.fullName.trim() || undefined,
    city: profile.city.trim() || undefined,
    experience: profile.experience || undefined,
    skills: profile.skills.length > 0 ? profile.skills : undefined,
    languages: profile.languages.length > 0 ? profile.languages : undefined,
  };
}
