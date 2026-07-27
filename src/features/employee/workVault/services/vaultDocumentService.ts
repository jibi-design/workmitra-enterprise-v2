// src/features/employee/workVault/services/vaultDocumentService.ts

import type { VaultDocument, VaultFileType } from "../types/vaultTypes";
import { VAULT_STORAGE_KEYS } from "../constants/vaultConstants";
import { readStorage, writeStorage, generateVaultEntityId } from "../helpers/vaultStorageUtils";
import { normalizeDocuments } from "../helpers/vaultNormalizers";
import { estimateDataUrlBytes, validateVaultStorageQuota } from "../helpers/vaultValidation";
import { withVaultDocumentsLock } from "../helpers/vaultWriteLock";

/**
 * Reads all documents from storage.
 */
export function getAllDocuments(): VaultDocument[] {
  return normalizeDocuments(readStorage(VAULT_STORAGE_KEYS.documents));
}

/**
 * Writes all documents to storage. Throws when browser storage write fails.
 */
function saveDocuments(docs: VaultDocument[]): void {
  const result = writeStorage(VAULT_STORAGE_KEYS.documents, docs);
  if (!result.ok) {
    throw new Error(
      "Browser storage is full or unavailable. The document was not saved. Free space and try again.",
    );
  }
}

/**
 * Gets all documents for a specific folder.
 */
export function getDocumentsByFolder(folderId: string): VaultDocument[] {
  return getAllDocuments().filter((d) => d.folderId === folderId);
}

/**
 * Gets a single document by ID.
 */
export function getDocumentById(docId: string): VaultDocument | null {
  return getAllDocuments().find((d) => d.id === docId) ?? null;
}

/**
 * Gets the document count for a folder.
 */
export function getDocumentCount(folderId: string): number {
  return getAllDocuments().filter((d) => d.folderId === folderId).length;
}

/**
 * Sum of estimated binary payload bytes across all vault documents (Global Docs D3).
 */
export function getVaultStorageUsedBytes(): number {
  return getAllDocuments().reduce(
    (sum, doc) =>
      sum + estimateDataUrlBytes(doc.base64Data) + estimateDataUrlBytes(doc.thumbnailBase64),
    0,
  );
}

/**
 * Adds a new document to a folder.
 * @throws Error when the per-user storage cap would be exceeded, lock busy, or write fails.
 */
export function addDocument(
  folderId: string,
  name: string,
  fileType: VaultFileType,
  base64Data: string,
  thumbnailBase64: string,
  expiryDate: string | null,
): VaultDocument {
  return withVaultDocumentsLock(() => {
    const incomingBytes = estimateDataUrlBytes(base64Data) + estimateDataUrlBytes(thumbnailBase64);
    // Re-read under lock so concurrent tabs cannot both pass a stale quota check (P1-3).
    const quota = validateVaultStorageQuota(incomingBytes, getVaultStorageUsedBytes());

    if (!quota.valid) {
      throw new Error(quota.reason);
    }

    const doc: VaultDocument = {
      id: generateVaultEntityId(),
      folderId,
      name: name.trim(),
      fileType,
      base64Data,
      thumbnailBase64,
      expiryDate,
      uploadedAt: Date.now(),
    };

    const docs = getAllDocuments();
    saveDocuments([...docs, doc]);
    return doc;
  });
}

/**
 * Deletes a single document.
 */
export function deleteDocument(docId: string): boolean {
  return withVaultDocumentsLock(() => {
    const docs = getAllDocuments();
    const filtered = docs.filter((d) => d.id !== docId);
    if (filtered.length === docs.length) return false;

    saveDocuments(filtered);
    return true;
  });
}

/**
 * Deletes all documents in a folder (used when folder is deleted).
 */
export function deleteDocumentsByFolder(folderId: string): number {
  return withVaultDocumentsLock(() => {
    const docs = getAllDocuments();
    const filtered = docs.filter((d) => d.folderId !== folderId);
    const deletedCount = docs.length - filtered.length;

    if (deletedCount > 0) {
      saveDocuments(filtered);
    }
    return deletedCount;
  });
}

/**
 * Renames a document.
 */
export function renameDocument(docId: string, newName: string): boolean {
  return withVaultDocumentsLock(() => {
    const docs = getAllDocuments();
    const index = docs.findIndex((d) => d.id === docId);
    if (index === -1) return false;

    docs[index] = { ...docs[index], name: newName.trim() };
    saveDocuments(docs);
    return true;
  });
}

/**
 * Updates the expiry date of a document.
 */
export function updateDocumentExpiry(docId: string, expiryDate: string | null): boolean {
  return withVaultDocumentsLock(() => {
    const docs = getAllDocuments();
    const index = docs.findIndex((d) => d.id === docId);
    if (index === -1) return false;

    docs[index] = { ...docs[index], expiryDate };
    saveDocuments(docs);
    return true;
  });
}
