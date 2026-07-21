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

/** Domain accent color for Work Vault. */
export const VAULT_ACCENT = "#7c3aed" as const;

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

/** Maximum document file size in bytes (1 MB for Phase-0). */
export const MAX_DOCUMENT_SIZE_BYTES = 1_000_000;

/** Allowed document file types. */
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

/** Default folder suggestions for new vaults. */
export const DEFAULT_FOLDER_SUGGESTIONS: readonly { name: string; icon: string }[] = [
  { name: "Identity Documents", icon: "id" },
  { name: "Work Certificates", icon: "cert" },
  { name: "Education", icon: "edu" },
  { name: "Skills & Licenses", icon: "license" },
  { name: "Other Documents", icon: "other" },
] as const;
