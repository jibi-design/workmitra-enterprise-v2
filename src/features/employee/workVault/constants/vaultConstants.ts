// WARNING DEC-012 / MIG-008: Client OTP stores hash only (never plaintext).
// Server OTP path (Argon2 hashed) exists at server/modules/vault/

/** localStorage keys for Work Vault. */
export const VAULT_STORAGE_KEYS = {
  folders: "wm_employee_vault_folders_v1",
  documents: "wm_employee_vault_documents_v1",
  /** Auth off only — hashed OTP challenge (never plaintext). Unused when AUTH_BACKEND_ENABLED. */
  otp: "wm_employee_vault_otp_v1",
  /** Auth on — otpId + expiresAt only (never the code). */
  otpPending: "wm_employee_vault_otp_pending_v1",
  accessLog: "wm_employee_vault_access_log_v1",
  sessions: "wm_employee_vault_sessions_v1",
  /** Auth on — employer active vault session_id cache. */
  employerSessionId: "wm_employer_vault_session_id_v1",
} as const;

/**
 * Domain accent — CSS token (theme / dark-mode overridable).
 * For soft washes use vaultAccentMix(); do not append hex alpha to this string.
 */
export const VAULT_ACCENT = "var(--wm-vault-accent)" as const;

/** Soft wash of vault accent into transparent (percent 0–100). */
export function vaultAccentMix(percent: number): string {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return `color-mix(in srgb, var(--wm-vault-accent) ${p}%, transparent)`;
}

/** OTP validity duration in milliseconds (5 minutes). */
export const OTP_VALIDITY_MS = 5 * 60 * 1000;

/** OTP code length. */
export const OTP_CODE_LENGTH = 6;

/** Vault session duration in milliseconds (30 minutes). */
export const SESSION_DURATION_MS = 30 * 60 * 1000;

/** Maximum documents per folder. */
export const MAX_DOCUMENTS_PER_FOLDER = 20;

/** Maximum folders per employee. */
export const MAX_FOLDERS = 15;

/** Maximum document file size in bytes (Global Docs D3). */
export const MAX_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024;

/** Maximum cumulative vault storage per user in bytes (Global Docs D3). */
export const MAX_VAULT_STORAGE_BYTES = 10 * 1024 * 1024;

/** Human-readable max file size for UI copy. */
export const MAX_DOCUMENT_SIZE_MB = MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024);

/** Human-readable total vault cap for UI copy. */
export const MAX_VAULT_STORAGE_MB = MAX_VAULT_STORAGE_BYTES / (1024 * 1024);

/** Allowed document file types. */
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

/**
 * Default folders for new vaults — region-neutral international career terminology (Global Docs D1).
 * Icon keys stay stable for UI; names may change without changing icons.
 */
export const DEFAULT_FOLDER_SUGGESTIONS: readonly { name: string; icon: string }[] = [
  { name: "Educational Records", icon: "edu" },
  { name: "Professional Certificates", icon: "cert" },
  { name: "Skills & Professional Licenses", icon: "license" },
  { name: "Work Experience Letters", icon: "id" },
  { name: "Other Career Documents", icon: "other" },
] as const;

/** Legacy default folder names — still treated as system folders for existing local vaults. */
export const LEGACY_SYSTEM_FOLDER_NAMES: readonly string[] = [
  "Identity Documents",
  "Work Certificates",
  "Education",
  "Skills & Licenses",
  "Other Documents",
] as const;

/** True if folder name is a current or legacy system default (non-deletable). */
export function isSystemFolderName(name: string): boolean {
  const trimmed = name.trim();
  if (DEFAULT_FOLDER_SUGGESTIONS.some((s) => s.name === trimmed)) return true;
  return LEGACY_SYSTEM_FOLDER_NAMES.includes(trimmed);
}

/** Region-neutral education level labels (enum keys unchanged for storage). */
export const EDUCATION_LEVEL_LABELS = {
  none: "Not specified",
  high_school: "Secondary School Certificate / High School Diploma",
  diploma: "Diploma / Vocational Certification",
  degree: "Bachelor's Degree",
  masters: "Master's Degree",
  phd: "Doctoral Degree",
} as const;

/**
 * Exact sensitive-upload disclaimer body (after the bold "Notice:" label).
 * Shown on all document upload surfaces — Global Docs D2.
 */
export const VAULT_SENSITIVE_UPLOAD_NOTICE =
  "Please do not upload sensitive government-issued photo identity documents (passports, national IDs, driver's licenses) or financial statements. Upload only relevant educational and professional career records.";
