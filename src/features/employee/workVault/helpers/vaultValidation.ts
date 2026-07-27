// WARNING DEC-012 / MIG-008: Client-side OTP path (plaintext)
// Server OTP path (Argon2 hashed) exists at server/modules/vault/
// This client path MUST BE REMOVED before production cutover
// See architecture-audits/Phase-DB-Migration-Readiness-Audit-001.md
// src/features/employee/workVault/helpers/vaultValidation.ts

import {
  MAX_FOLDERS,
  MAX_DOCUMENTS_PER_FOLDER,
  MAX_DOCUMENT_SIZE_BYTES,
  MAX_DOCUMENT_SIZE_MB,
  MAX_VAULT_STORAGE_BYTES,
  MAX_VAULT_STORAGE_MB,
  ALLOWED_FILE_TYPES,
  OTP_CODE_LENGTH,
} from "../constants/vaultConstants";

export type ValidationResult = { valid: true } | { valid: false; reason: string };

/**
 * Validates a folder name.
 */
export function validateFolderName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, reason: "Folder name cannot be empty." };
  }
  if (trimmed.length > 40) {
    return { valid: false, reason: "Folder name must be 40 characters or less." };
  }
  return { valid: true };
}

/**
 * Validates whether a new folder can be added.
 */
export function validateFolderLimit(currentCount: number): ValidationResult {
  if (currentCount >= MAX_FOLDERS) {
    return { valid: false, reason: `Maximum ${MAX_FOLDERS} folders allowed.` };
  }
  return { valid: true };
}

/**
 * Validates a document name.
 */
export function validateDocumentName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, reason: "Document name cannot be empty." };
  }
  if (trimmed.length > 60) {
    return { valid: false, reason: "Document name must be 60 characters or less." };
  }
  return { valid: true };
}

/**
 * Validates document count within a folder.
 */
export function validateDocumentLimit(currentCount: number): ValidationResult {
  if (currentCount >= MAX_DOCUMENTS_PER_FOLDER) {
    return { valid: false, reason: `Maximum ${MAX_DOCUMENTS_PER_FOLDER} documents per folder.` };
  }
  return { valid: true };
}

/**
 * Estimates binary byte size from a data-URL or raw base64 payload.
 */
export function estimateDataUrlBytes(dataUrl: string): number {
  if (!dataUrl) return 0;
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  if (!b64) return 0;
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

/**
 * Validates a file before upload (per-file size + format).
 */
export function validateFile(file: File): ValidationResult {
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { valid: false, reason: `File size must be under ${MAX_DOCUMENT_SIZE_MB} MB.` };
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
    return { valid: false, reason: "Only JPEG, PNG, WebP, and PDF files are allowed." };
  }
  return { valid: true };
}

/**
 * Validates that adding `incomingBytes` stays within the per-user vault storage cap.
 */
export function validateVaultStorageQuota(
  incomingBytes: number,
  currentUsedBytes: number,
): ValidationResult {
  if (incomingBytes < 0 || currentUsedBytes < 0) {
    return { valid: false, reason: "Invalid storage size." };
  }
  if (currentUsedBytes + incomingBytes > MAX_VAULT_STORAGE_BYTES) {
    const remaining = Math.max(0, MAX_VAULT_STORAGE_BYTES - currentUsedBytes);
    const remainingMb = (remaining / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      reason: `Vault storage limit is ${MAX_VAULT_STORAGE_MB} MB total. About ${remainingMb} MB remaining.`,
    };
  }
  return { valid: true };
}

/**
 * Validates an OTP code format.
 */
export function validateOtpFormat(code: string): ValidationResult {
  const trimmed = code.trim();
  if (trimmed.length !== OTP_CODE_LENGTH) {
    return { valid: false, reason: `OTP must be exactly ${OTP_CODE_LENGTH} digits.` };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, reason: "OTP must contain only digits." };
  }
  return { valid: true };
}
