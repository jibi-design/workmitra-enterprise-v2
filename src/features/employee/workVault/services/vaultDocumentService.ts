// src/features/employee/workVault/services/vaultDocumentService.ts

import type { VaultDocument, VaultFileType } from "../types/vaultTypes";
import { VAULT_STORAGE_KEYS } from "../constants/vaultConstants";
import { readStorage, writeStorage, generateVaultEntityId } from "../helpers/vaultStorageUtils";
import { normalizeDocuments } from "../helpers/vaultNormalizers";

/**
 * Reads all documents from storage.
 */
export function getAllDocuments(): VaultDocument[] {
  return normalizeDocuments(readStorage(VAULT_STORAGE_KEYS.documents));
}

/**
 * Writes all documents to storage.
 */
function saveDocuments(docs: VaultDocument[]): void {
  writeStorage(VAULT_STORAGE_KEYS.documents, docs);
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
 * Adds a new document to a folder.
 */
export function addDocument(
  folderId: string,
  name: string,
  fileType: VaultFileType,
  base64Data: string,
  thumbnailBase64: string,
  expiryDate: string | null,
): VaultDocument {
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
}

/**
 * Deletes a single document.
 */
export function deleteDocument(docId: string): boolean {
  const docs = getAllDocuments();
  const filtered = docs.filter((d) => d.id !== docId);
  if (filtered.length === docs.length) return false;

  saveDocuments(filtered);
  return true;
}

/**
 * Deletes all documents in a folder (used when folder is deleted).
 */
export function deleteDocumentsByFolder(folderId: string): number {
  const docs = getAllDocuments();
  const filtered = docs.filter((d) => d.folderId !== folderId);
  const deletedCount = docs.length - filtered.length;

  if (deletedCount > 0) {
    saveDocuments(filtered);
  }
  return deletedCount;
}

/**
 * Renames a document.
 */
export function renameDocument(docId: string, newName: string): boolean {
  const docs = getAllDocuments();
  const index = docs.findIndex((d) => d.id === docId);
  if (index === -1) return false;

  docs[index] = { ...docs[index], name: newName.trim() };
  saveDocuments(docs);
  return true;
}

/**
 * Updates the expiry date of a document.
 */
export function updateDocumentExpiry(docId: string, expiryDate: string | null): boolean {
  const docs = getAllDocuments();
  const index = docs.findIndex((d) => d.id === docId);
  if (index === -1) return false;

  docs[index] = { ...docs[index], expiryDate };
  saveDocuments(docs);
  return true;
}