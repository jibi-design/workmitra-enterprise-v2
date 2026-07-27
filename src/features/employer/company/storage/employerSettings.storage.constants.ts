import type { EmployerProfile } from "./employerSettings.storage.types";

/** Canonical storage key (MIG-004). Legacy colon key migrated on read. */
export const STORAGE_KEY = "wm_employer_profile_v1";
export const LEGACY_STORAGE_KEY = "wm:employer-profile";
/** CustomEvent name — not a localStorage key. */
export const CHANGE_EVENT = "wm:employer-profile-changed";

export const EMPTY_PROFILE: EmployerProfile = {
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
