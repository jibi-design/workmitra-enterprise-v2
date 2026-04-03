// src/features/employee/workVault/helpers/vaultValidation.ts

import {
  MAX_FOLDERS,
  MAX_DOCUMENTS_PER_FOLDER,
  MAX_DOCUMENT_SIZE_BYTES,
  ALLOWED_FILE_TYPES,
  OTP_CODE_LENGTH,
} from "../constants/vaultConstants";

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

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
 * Validates a file before upload.
 */
export function validateFile(file: File): ValidationResult {
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    const maxMB = MAX_DOCUMENT_SIZE_BYTES / 1_000_000;
    return { valid: false, reason: `File size must be under ${maxMB} MB.` };
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    return { valid: false, reason: "Only JPEG, PNG, WebP, and PDF files are allowed." };
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