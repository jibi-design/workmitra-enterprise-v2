// src/features/employer/company/storage/employerSettings.storage.ts

import { generateAndRegisterId } from "../../../../shared/identity/registry/idRegistry";
import {
  computeVerificationLevel,
  generateEmployerOrgId,
  slugifyPublicHandle,
  syncVerificationAudit,
} from "../helpers/employerIdentity.helpers";
import type {
  EmployerTransferStatus,
  EmployerVerificationAudit,
  EmployerVerificationLevel,
  EmployerPendingTransfer,
  OwnershipAuditEntry,
} from "../helpers/employerIdentity.types";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export interface EmployerProfile {
  /** Stable random business org key — ratings, posts, audit. Never from company name. */
  employerOrgId?: string;
  /** Owner person pointer — mutable only via governed transfer. */
  ownerUserId?: string;
  /** @deprecated Use companyUniqueId — kept for backward compatibility with stored demos. */
  uniqueId?: string;
  /** Owner personal Mitra Labs ID. Private — settings/auth only. */
  ownerUniqueId?: string;
  /** Public ML-format display id on job posts (random block, not tied to name). */
  companyUniqueId?: string;
  /** Public profile slug / share link. */
  publicHandle?: string;
  /** Prior handles that redirect to current publicHandle. */
  previousHandles?: string[];
  transferStatus?: EmployerTransferStatus;
  businessAdminIds?: string[];
  contactVerified?: boolean;
  verificationLevel?: EmployerVerificationLevel;
  verificationAudit?: EmployerVerificationAudit;
  pendingTransfer?: EmployerPendingTransfer;
  ownershipAuditLog?: OwnershipAuditEntry[];
  createdAt?: number;
  updatedAt?: number;

  /** Company details */
  companyName: string;
  /** GST, CIN, or local trade license number for business verification. */
  registrationNo: string;
  /** Base64 data URL for company logo (max 2MB source file). */
  companyLogo?: string;
  industryType: string;
  companySize: string;
  locationCity: string;
  locationState: string;
  companyDescription: string;

  /** Account info */
  fullName: string;
  email: string;
  phone: string;

  /** Preferences */
  notificationsEnabled: boolean;
  hrManagementEnabled: boolean;
  language: string;
  hapticFeedback: boolean;
  globalMute: boolean;
  quietHoursEnabled: boolean;
  quietFrom: string;
  quietTo: string;
}

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const STORAGE_KEY = "wm:employer-profile";
const CHANGE_EVENT = "wm:employer-profile-changed";

const EMPTY_PROFILE: EmployerProfile = {
  companyName: "",
  registrationNo: "",
  industryType: "",
  companySize: "",
  locationCity: "",
  locationState: "",
  companyDescription: "",
  fullName: "",
  email: "",
  phone: "",
  notificationsEnabled: true,
  hrManagementEnabled: false,
  language: "en",
  hapticFeedback: true,
  globalMute: false,
  quietHoursEnabled: false,
  quietFrom: "22:00",
  quietTo: "07:00",
  transferStatus: "none",
  businessAdminIds: [],
  previousHandles: [],
  contactVerified: false,
  verificationLevel: 0,
};

/* ------------------------------------------------ */
/* Industry + Size options                          */
/* ------------------------------------------------ */
export const INDUSTRY_OPTIONS: readonly string[] = [
  "IT & Software",
  "Healthcare",
  "Construction",
  "Retail",
  "Food & Beverage",
  "Manufacturing",
  "Education",
  "Logistics & Transport",
  "Hospitality",
  "Agriculture",
  "Finance & Banking",
  "Real Estate",
  "Others",
] as const;

export const COMPANY_SIZE_OPTIONS: readonly string[] = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "500+",
] as const;

export const LANGUAGE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ml", label: "മലയാളം (Malayalam)" },
] as const;

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
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

function read(): EmployerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { ...EMPTY_PROFILE };
    return migrateProfile(parsed as Partial<EmployerProfile>);
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

function write(profile: EmployerProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function clear(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function finalizeIdentity(existing: EmployerProfile, profile: EmployerProfile): EmployerProfile {
  const now = Date.now();
  let ownerUniqueId = existing.ownerUniqueId ?? existing.ownerUserId;
  let ownerUserId = existing.ownerUserId ?? existing.ownerUniqueId;
  let employerOrgId = existing.employerOrgId;
  let companyUniqueId = existing.companyUniqueId ?? existing.uniqueId;
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

/* ------------------------------------------------ */
/* Validation                                       */
/* ------------------------------------------------ */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validate(profile: EmployerProfile): ValidationResult {
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

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const employerSettingsStorage = {
  get: read,

  save(profile: EmployerProfile): void {
    const existing = read();
    write(finalizeIdentity(existing, profile));
  },

  savePartial(patch: Partial<EmployerProfile>): EmployerProfile {
    const existing = read();
    const merged = finalizeIdentity(existing, { ...existing, ...patch });
    write(merged);
    return merged;
  },

  clear,
  validate,

  subscribe(callback: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, callback);
    return () => window.removeEventListener(CHANGE_EVENT, callback);
  },

  EMPTY_PROFILE,
} as const;
