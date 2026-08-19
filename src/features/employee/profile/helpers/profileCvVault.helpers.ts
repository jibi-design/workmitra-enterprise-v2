/** Job Mitra | profileCvVault.helpers.ts | Profile CV upload writes WorkVault only */

import {
  estimateDataUrlBytes,
  validateDocumentLimit,
  validateFile,
  validateVaultStorageQuota,
} from "../../workVault/helpers/vaultValidation";
import {
  addDocument,
  getAllDocuments,
  getDocumentCount,
  getVaultStorageUsedBytes,
} from "../../workVault/services/vaultDocumentService";
import { createFolder, initializeDefaultFolders } from "../../workVault/services/vaultFolderService";
import type { VaultDocument, VaultFileType } from "../../workVault/types/vaultTypes";

export const PROFILE_CV_VAULT_CHANGED = "wm:employee-vault-cv-changed";
export const CV_FOLDER_NAME = "Other Career Documents";

const CV_NAME = /\b(cv|resume|curriculum)\b/i;

export function isCvDocumentName(name: string): boolean {
  return CV_NAME.test(name.trim());
}

export function isVaultCvDocument(doc: VaultDocument): boolean {
  return isCvDocumentName(doc.name);
}

export function listVaultCvDocuments(): VaultDocument[] {
  return getAllDocuments().filter(isVaultCvDocument);
}

export function hasVaultCvDocument(): boolean {
  return listVaultCvDocuments().length > 0;
}

export function ensureCvVaultFolderId(): string {
  const folders = initializeDefaultFolders();
  const existing = folders.find((f) => f.name === CV_FOLDER_NAME);
  if (existing) return existing.id;
  try {
    return createFolder(CV_FOLDER_NAME, "other").id;
  } catch {
    if (folders[0]) return folders[0].id;
    throw new Error("Work Vault has no folder for this CV.");
  }
}

function detectFileType(file: File): VaultFileType {
  return file.type === "application/pdf" ? "pdf" : "image";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("File read failed."));
    reader.readAsDataURL(file);
  });
}

export type ProfileCvUploadResult =
  | { readonly ok: true; readonly name: string }
  | { readonly ok: false; readonly reason: string };

export async function uploadProfileCvToVault(file: File): Promise<ProfileCvUploadResult> {
  const fileCheck = validateFile(file);
  if (!fileCheck.valid) return { ok: false, reason: fileCheck.reason };

  const folderId = ensureCvVaultFolderId();
  const limitCheck = validateDocumentLimit(getDocumentCount(folderId));
  if (!limitCheck.valid) return { ok: false, reason: limitCheck.reason };

  let base64Data = "";
  try {
    base64Data = await readFileAsDataUrl(file);
  } catch {
    return { ok: false, reason: "Could not read that file." };
  }

  const incomingBytes = estimateDataUrlBytes(base64Data);
  const quota = validateVaultStorageQuota(incomingBytes, getVaultStorageUsedBytes());
  if (!quota.valid) return { ok: false, reason: quota.reason };

  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ").trim() || "CV";
  const name = isCvDocumentName(baseName) ? baseName.slice(0, 60) : `CV ${baseName}`.slice(0, 60);

  try {
    addDocument(folderId, name, detectFileType(file), base64Data, "", null);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Could not save this document.";
    return { ok: false, reason };
  }

  try {
    window.dispatchEvent(new Event(PROFILE_CV_VAULT_CHANGED));
  } catch {
    /* demo-safe */
  }

  return { ok: true, name };
}

export function subscribeVaultCv(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key && !event.key.includes("vault")) return;
    onChange();
  };
  window.addEventListener(PROFILE_CV_VAULT_CHANGED, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PROFILE_CV_VAULT_CHANGED, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
