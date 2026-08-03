import { generateAndRegisterId } from "../../../../shared/identity/registry/idRegistry";
import {
  computeVerificationLevel,
  generateEmployerOrgId,
  slugifyPublicHandle,
  syncVerificationAudit,
} from "../helpers/employerIdentity.helpers";
import type { EmployerProfile, ValidationResult } from "./employerSettings.storage.types";
import {
  CHANGE_EVENT,
  EMPTY_PROFILE,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
} from "./employerSettings.storage.constants";
import { piiSecureStorage } from "../../../../shared/security/piiSecureStorage";

function syncHandleHistory(existing: EmployerProfile, nextHandle: string): string[] {
  const previous = [...(existing.previousHandles ?? [])];
  const oldHandle = existing.publicHandle?.trim();
  if (oldHandle && oldHandle !== nextHandle && !previous.includes(oldHandle)) {
    previous.push(oldHandle);
  }
  return previous;
}

function migrateProfile(parsed: Partial<EmployerProfile>): EmployerProfile {
  const merged: EmployerProfile = {
    ...EMPTY_PROFILE,
    ...parsed,
    businessAdminIds: parsed.businessAdminIds ?? [],
    previousHandles: parsed.previousHandles ?? [],
    transferStatus: parsed.transferStatus ?? "none",
    contactVerified: parsed.contactVerified ?? false,
  };

  if (merged.uniqueId && !merged.companyUniqueId) {
    merged.companyUniqueId = merged.uniqueId;
  }

  if (merged.companyUniqueId) {
    merged.uniqueId = merged.employerOrgId ?? merged.companyUniqueId;
  } else if (merged.employerOrgId) {
    merged.uniqueId = merged.employerOrgId;
  }

  if (merged.ownerUniqueId && !merged.ownerUserId) {
    merged.ownerUserId = merged.ownerUniqueId;
  }

  if (merged.ownerUserId && !merged.ownerUniqueId) {
    merged.ownerUniqueId = merged.ownerUserId;
  }

  if (!merged.employerOrgId) {
    const legacy = merged.companyUniqueId?.trim() || merged.uniqueId?.trim();
    if (legacy) {
      merged.employerOrgId = legacy;
    }
  }

  if (!merged.publicHandle?.trim() && merged.companyName.trim()) {
    merged.publicHandle = slugifyPublicHandle(merged.companyName);
  }

  const verificationAudit = syncVerificationAudit(
    merged.verificationAudit ?? parsed.verificationAudit,
    merged.registrationNo,
  );
  merged.verificationAudit = verificationAudit;
  merged.verificationLevel = computeVerificationLevel({
    registrationNo: merged.registrationNo,
    contactVerified: merged.contactVerified,
    verificationAudit,
  });

  return merged;
}

export function readProfile(): EmployerProfile {
  try {
    let raw = piiSecureStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = piiSecureStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        piiSecureStorage.setItem(STORAGE_KEY, raw);
        piiSecureStorage.removeItem(LEGACY_STORAGE_KEY);
        try {
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
    }
    if (!raw) return { ...EMPTY_PROFILE };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { ...EMPTY_PROFILE };
    return migrateProfile(parsed as Partial<EmployerProfile>);
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export function writeProfile(profile: EmployerProfile): void {
  piiSecureStorage.setJson(STORAGE_KEY, profile);
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearProfile(): void {
  piiSecureStorage.removeItem(STORAGE_KEY);
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function finalizeIdentity(
  existing: EmployerProfile,
  profile: EmployerProfile,
): EmployerProfile {
  const now = Date.now();
  let ownerUniqueId = existing.ownerUniqueId ?? existing.ownerUserId;
  let ownerUserId = existing.ownerUserId ?? existing.ownerUniqueId;
  // Prefer explicitly provided ids (QA assume / transfer) over regenerating.
  let employerOrgId = profile.employerOrgId?.trim() || existing.employerOrgId;
  let companyUniqueId =
    profile.companyUniqueId?.trim() || existing.companyUniqueId || existing.uniqueId;
  let publicHandle = profile.publicHandle?.trim() || existing.publicHandle?.trim();
  let previousHandles = [...(existing.previousHandles ?? [])];

  if (!ownerUniqueId && profile.fullName.trim()) {
    const ownerResult = generateAndRegisterId(profile.fullName.trim(), "employer-owner");
    if (ownerResult.success) {
      ownerUniqueId = ownerResult.id;
      ownerUserId = ownerResult.id;
    }
  }

  if (!employerOrgId && profile.companyName.trim()) {
    employerOrgId = generateEmployerOrgId();
  }

  if (!companyUniqueId && profile.companyName.trim()) {
    const companyResult = generateAndRegisterId("BIZ", "employer");
    if (companyResult.success) {
      companyUniqueId = companyResult.id;
    }
  }

  const nextHandle =
    publicHandle || (profile.companyName.trim() ? slugifyPublicHandle(profile.companyName) : "");

  if (nextHandle) {
    previousHandles = syncHandleHistory(existing, nextHandle);
    publicHandle = nextHandle;
  }

  const verificationAudit = syncVerificationAudit(
    profile.verificationAudit ?? existing.verificationAudit,
    profile.registrationNo,
  );

  const verificationLevel = computeVerificationLevel({
    registrationNo: profile.registrationNo,
    contactVerified: profile.contactVerified ?? existing.contactVerified,
    verificationAudit,
  });

  const uniqueId = employerOrgId ?? companyUniqueId;

  return {
    ...profile,
    ownerUniqueId,
    ownerUserId,
    employerOrgId,
    companyUniqueId,
    uniqueId,
    publicHandle,
    previousHandles,
    verificationAudit,
    verificationLevel,
    pendingTransfer: Object.hasOwn(profile, "pendingTransfer")
      ? profile.pendingTransfer
      : existing.pendingTransfer,
    ownershipAuditLog: profile.ownershipAuditLog ?? existing.ownershipAuditLog ?? [],
    transferStatus: profile.transferStatus ?? existing.transferStatus ?? "none",
    businessAdminIds: profile.businessAdminIds ?? existing.businessAdminIds ?? [],
    contactVerified: profile.contactVerified ?? existing.contactVerified ?? false,
    createdAt: existing.createdAt ?? now,
    updatedAt: now,
  };
}

export function validateProfile(profile: EmployerProfile): ValidationResult {
  const errors: string[] = [];

  if (!profile.companyName.trim()) {
    errors.push("Business name is required.");
  }
  if (!profile.fullName.trim()) {
    errors.push("Your name is required.");
  }
  if (profile.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.push("Email format is invalid.");
  }
  if (profile.phone.trim() && !/^\d{7,15}$/.test(profile.phone.trim().replace(/[\s\-+()]/g, ""))) {
    errors.push("Phone number format is invalid.");
  }
  if (profile.companyDescription.length > 200) {
    errors.push("Company Description must be 200 characters or less.");
  }

  const handle = profile.publicHandle?.trim();
  if (handle && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle)) {
    errors.push("Public profile link may only use lowercase letters, numbers, and hyphens.");
  }

  return { valid: errors.length === 0, errors };
}
