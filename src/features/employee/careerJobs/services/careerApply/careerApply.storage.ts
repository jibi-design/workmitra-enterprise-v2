// Career apply — localStorage read/write + employee identity helpers.

import { getCurrentActorId, identityBridge } from "../../../../../app/identity/identity.adapter";
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

export function readAllApps(): CareerApplication[] {
  const raw = localStorage.getItem(CAREER_APPS_KEY);
  return safeParse<CareerApplication>(raw);
}

export function writeAllApps(apps: CareerApplication[]): CareerStorageWriteResult {
  const result = safeWrite(CAREER_APPS_KEY, apps);
  if (!result.ok) return result;
  notifyCareerAppsChanged();
  return { ok: true };
}

export function getCurrentEmployeeId(): string {
  const profile = employeeProfileStorage.get();
  const legacyId = profile.uniqueId?.trim() || "employee_demo";
  const actor = getCurrentActorId("employee");
  const realLegacy = profile.uniqueId?.trim();
  if (actor.source === "auth" && actor.authUserId && realLegacy) {
    identityBridge.upsert("employee", realLegacy, actor.authUserId);
  }
  return legacyId;
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
