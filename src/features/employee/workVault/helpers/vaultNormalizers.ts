// src/features/employee/workVault/helpers/vaultNormalizers.ts

import type {
  VaultFolder,
  VaultDocument,
  VaultOTP,
  VaultSession,
  VaultAccessEntry,
} from "../types/vaultTypes";

/**
 * Safely normalizes a raw array into VaultFolder[].
 */
export function normalizeFolders(raw: unknown): VaultFolder[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is VaultFolder =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as VaultFolder).id === "string" &&
      typeof (item as VaultFolder).name === "string" &&
      typeof (item as VaultFolder).createdAt === "number",
  );
}

/**
 * Safely normalizes a raw array into VaultDocument[].
 */
export function normalizeDocuments(raw: unknown): VaultDocument[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is VaultDocument =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as VaultDocument).id === "string" &&
      typeof (item as VaultDocument).folderId === "string" &&
      typeof (item as VaultDocument).name === "string" &&
      typeof (item as VaultDocument).uploadedAt === "number",
  );
}

/**
 * Safely normalizes raw data into VaultOTP or null.
 */
export function normalizeOtp(raw: unknown): VaultOTP | null {
  if (!raw || typeof raw !== "object") return null;
  const otp = raw as Partial<VaultOTP>;
  if (
    typeof otp.code !== "string" ||
    typeof otp.generatedAt !== "number" ||
    typeof otp.expiresAt !== "number"
  ) {
    return null;
  }
  return {
    code: otp.code,
    generatedAt: otp.generatedAt,
    expiresAt: otp.expiresAt,
    used: otp.used === true,
  };
}

/**
 * Safely normalizes a raw array into VaultSession[].
 */
export function normalizeSessions(raw: unknown): VaultSession[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is VaultSession =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as VaultSession).id === "string" &&
      typeof (item as VaultSession).startedAt === "number",
  );
}

/**
 * Safely normalizes a raw array into VaultAccessEntry[].
 */
export function normalizeAccessLog(raw: unknown): VaultAccessEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is VaultAccessEntry =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as VaultAccessEntry).id === "string" &&
      typeof (item as VaultAccessEntry).accessedAt === "number",
  );
}