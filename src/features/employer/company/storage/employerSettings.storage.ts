// src/features/employer/company/storage/employerSettings.storage.ts — facade

export type { EmployerProfile, ValidationResult } from "./employerSettings.storage.types";

export {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "./employerSettings.storage.constants";

import type { EmployerProfile } from "./employerSettings.storage.types";
import { CHANGE_EVENT, EMPTY_PROFILE } from "./employerSettings.storage.constants";
import {
  clearProfile,
  finalizeIdentity,
  readProfile,
  validateProfile,
  writeProfile,
} from "./employerSettings.storage.internal";

export const employerSettingsStorage = {
  get: readProfile,

  save(profile: EmployerProfile): void {
    const existing = readProfile();
    writeProfile(finalizeIdentity(existing, profile));
  },

  savePartial(patch: Partial<EmployerProfile>): EmployerProfile {
    const existing = readProfile();
    const merged = finalizeIdentity(existing, { ...existing, ...patch });
    writeProfile(merged);
    return merged;
  },

  clear: clearProfile,
  validate: validateProfile,

  subscribe(callback: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, callback);
    return () => window.removeEventListener(CHANGE_EVENT, callback);
  },

  EMPTY_PROFILE,
} as const;
