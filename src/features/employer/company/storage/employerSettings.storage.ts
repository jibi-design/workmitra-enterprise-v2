// src/features/employer/company/storage/employerSettings.storage.ts

import { generateAndRegisterId } from "../../../../shared/identity/registry/idRegistry";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export interface EmployerProfile {
  /** Unique WorkMitra ID for this employer. */
  uniqueId?: string;

  /** Company details */
  companyName: string;
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
}

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const STORAGE_KEY = "wm:employer-profile";
const CHANGE_EVENT = "wm:employer-profile-changed";

const EMPTY_PROFILE: EmployerProfile = {
  companyName: "",
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
function read(): EmployerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { ...EMPTY_PROFILE };
    return { ...EMPTY_PROFILE, ...(parsed as Partial<EmployerProfile>) };
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
    errors.push("Company Name is required.");
  }
  if (!profile.fullName.trim()) {
    errors.push("Full Name is required.");
  }
  if (
    profile.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())
  ) {
    errors.push("Email format is invalid.");
  }
  if (
    profile.phone.trim() &&
    !/^\d{7,15}$/.test(profile.phone.trim().replace(/[\s\-+()]/g, ""))
  ) {
    errors.push("Phone number format is invalid.");
  }
  if (profile.companyDescription.length > 200) {
    errors.push("Company Description must be 200 characters or less.");
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

    let uniqueId = existing.uniqueId;

    if (!uniqueId && profile.companyName.trim()) {
      const result = generateAndRegisterId(profile.companyName, "employer");
      if (result.success) {
        uniqueId = result.id;
      }
    }

    write({ ...profile, uniqueId });
  },

  clear,
  validate,

  subscribe(callback: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, callback);
    return () => window.removeEventListener(CHANGE_EVENT, callback);
  },

  EMPTY_PROFILE,
} as const;