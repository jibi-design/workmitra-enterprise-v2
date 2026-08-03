// src/features/employee/workVault/services/vaultDocumentService.ts
// B-P0-3: document payloads sealed at rest; plaintext only after authorized decrypt.

import type { VaultDocument, VaultFileType } from "../types/vaultTypes";
import { readStorage, writeStorage, generateVaultEntityId } from "../helpers/vaultStorageUtils";
import { normalizeDocuments } from "../helpers/vaultNormalizers";
import { estimateDataUrlBytes, validateVaultStorageQuota } from "../helpers/vaultValidation";
import { withVaultDocumentsLock } from "../helpers/vaultWriteLock";
import {
  getCurrentVaultWorkerScopeId,
  resolveVaultWorkerScopedKey,
  sanitizeVaultWorkerScopeId,
} from "../../../shared/workVault/vaultWorkerScope";
import { docAccessSessionStorage } from "../../../../shared/docAccess/docAccessSessionStorage";
import {
  getActiveSession as getVaultHrAccessSession,
  isSessionValid as isVaultHrSessionValid,
} from "./vaultAccessService";
import {
  isVaultPayloadPlaintext,
  isVaultPayloadSealed,
  openVaultPayloadAsync,
  openVaultPayloadSync,
  redactVaultPayloads,
  sealVaultPayloadAsync,
  sealVaultPayloadSync,
} from "../helpers/vaultDocumentPayloadCrypto";
import { ensurePiiCryptoReady } from "../../../../shared/security/piiCrypto";

/** In-memory plaintext mirror keyed by storage key (never written to LS). */
const plaintextMirror = new Map<string, VaultDocument[]>();

function documentsKey(workerScopeId?: string): string {
  return resolveVaultWorkerScopedKey("documents_v1", workerScopeId);
}

function targetWorkerId(workerScopeId?: string): string {
  return sanitizeVaultWorkerScopeId(workerScopeId?.trim() || getCurrentVaultWorkerScopeId());
}

/**
 * Owner may always decrypt. Employer may decrypt when:
 * - HMAC Doc Access session is bound to this workerMlId, OR
 * - HR Work Vault OTP session is active (EmployerVaultViewPage path).
 */
export function canRevealVaultDocumentPayloads(workerScopeId?: string): boolean {
  const target = targetWorkerId(workerScopeId);
  const current = getCurrentVaultWorkerScopeId();
  if (target === current) return true;

  const docAccess = docAccessSessionStorage.getActiveSession();
  if (docAccess && docAccess.workerMlId === target) return true;

  const hrSession = getVaultHrAccessSession();
  if (hrSession && isVaultHrSessionValid(hrSession.id)) return true;

  return false;
}

function sealDocumentForPersist(doc: VaultDocument): VaultDocument {
  return {
    ...doc,
    base64Data: sealVaultPayloadSync(doc.base64Data),
    thumbnailBase64: sealVaultPayloadSync(doc.thumbnailBase64),
  };
}

function decryptDocumentSync(doc: VaultDocument): VaultDocument | null {
  const base64Data = openVaultPayloadSync(doc.base64Data ?? "");
  const thumbnailBase64 = openVaultPayloadSync(doc.thumbnailBase64 ?? "");
  if (base64Data === null || thumbnailBase64 === null) return null;
  return { ...doc, base64Data, thumbnailBase64 };
}

function estimateStoredPayloadBytes(value: string): number {
  if (!value) return 0;
  if (isVaultPayloadSealed(value)) {
    // Ciphertext length ≈ sealed storage cost (quota accounting).
    return Math.ceil(value.length * 0.75);
  }
  return estimateDataUrlBytes(value);
}

function readRawDocuments(workerScopeId?: string): VaultDocument[] {
  return normalizeDocuments(readStorage(documentsKey(workerScopeId)));
}

function persistSealedDocuments(docs: VaultDocument[], workerScopeId?: string): void {
  const sealed = docs.map(sealDocumentForPersist);
  const result = writeStorage(documentsKey(workerScopeId), sealed);
  if (!result.ok) {
    throw new Error(
      "Browser storage is full or unavailable. The document was not saved. Free space and try again.",
    );
  }
}

/**
 * Re-seal any legacy plaintext payloads found in LS (owner bucket only).
 */
function migratePlaintextPayloadsIfNeeded(workerScopeId?: string): void {
  const target = targetWorkerId(workerScopeId);
  if (target !== getCurrentVaultWorkerScopeId()) return;

  const raw = readRawDocuments(workerScopeId);
  let dirty = false;
  const next = raw.map((doc) => {
    const needsSeal =
      isVaultPayloadPlaintext(doc.base64Data ?? "") ||
      isVaultPayloadPlaintext(doc.thumbnailBase64 ?? "");
    if (!needsSeal) return doc;
    dirty = true;
    return sealDocumentForPersist({
      ...doc,
      base64Data: doc.base64Data ?? "",
      thumbnailBase64: doc.thumbnailBase64 ?? "",
    });
  });

  if (dirty) {
    const result = writeStorage(documentsKey(workerScopeId), next);
    if (result.ok) {
      plaintextMirror.delete(documentsKey(workerScopeId));
    }
  }
}

/**
 * Reads all documents. Payload fields are plaintext only when authorized;
 * otherwise redacted. LocalStorage always holds sealed envelopes after migrate.
 */
export function getAllDocuments(workerScopeId?: string): VaultDocument[] {
  migratePlaintextPayloadsIfNeeded(workerScopeId);

  const key = documentsKey(workerScopeId);
  const authorized = canRevealVaultDocumentPayloads(workerScopeId);

  if (!authorized) {
    return readRawDocuments(workerScopeId).map((doc) =>
      redactVaultPayloads({
        ...doc,
        base64Data: doc.base64Data ?? "",
        thumbnailBase64: doc.thumbnailBase64 ?? "",
      }),
    );
  }

  const mirrored = plaintextMirror.get(key);
  if (mirrored) return mirrored.map((d) => ({ ...d }));

  const raw = readRawDocuments(workerScopeId);
  const decrypted: VaultDocument[] = [];
  let needsAsyncHydrate = false;

  for (const doc of raw) {
    const opened = decryptDocumentSync({
      ...doc,
      base64Data: doc.base64Data ?? "",
      thumbnailBase64: doc.thumbnailBase64 ?? "",
    });
    if (opened) {
      decrypted.push(opened);
      if (
        isVaultPayloadSealed(doc.base64Data ?? "") &&
        (doc.base64Data ?? "").startsWith("wmenc2:")
      ) {
        needsAsyncHydrate = true;
      }
    } else if (isVaultPayloadSealed(doc.base64Data ?? "")) {
      needsAsyncHydrate = true;
      decrypted.push(
        redactVaultPayloads({
          ...doc,
          base64Data: doc.base64Data ?? "",
          thumbnailBase64: doc.thumbnailBase64 ?? "",
        }),
      );
    } else {
      decrypted.push({
        ...doc,
        base64Data: doc.base64Data ?? "",
        thumbnailBase64: doc.thumbnailBase64 ?? "",
      });
    }
  }

  if (needsAsyncHydrate) {
    void hydrateVaultDocumentsPlaintext(workerScopeId);
  } else {
    plaintextMirror.set(key, decrypted);
  }

  return decrypted.map((d) => ({ ...d }));
}

/**
 * Async hydrate — decrypts wmenc2 payloads into the memory mirror (owner / session).
 */
export async function hydrateVaultDocumentsPlaintext(workerScopeId?: string): Promise<void> {
  if (!canRevealVaultDocumentPayloads(workerScopeId)) return;

  await ensurePiiCryptoReady();
  const key = documentsKey(workerScopeId);
  const raw = readRawDocuments(workerScopeId);
  const decrypted: VaultDocument[] = [];
  let reseal = false;

  for (const doc of raw) {
    const base64Data = (await openVaultPayloadAsync(doc.base64Data ?? "")) ?? "";
    const thumbnailBase64 = (await openVaultPayloadAsync(doc.thumbnailBase64 ?? "")) ?? "";

    // Upgrade plaintext leftovers → AES-GCM
    if (
      isVaultPayloadPlaintext(doc.base64Data ?? "") ||
      isVaultPayloadPlaintext(doc.thumbnailBase64 ?? "") ||
      (doc.base64Data ?? "").startsWith("wmenc1:") ||
      (doc.thumbnailBase64 ?? "").startsWith("wmenc1:")
    ) {
      reseal = true;
    }

    decrypted.push({
      ...doc,
      base64Data,
      thumbnailBase64,
    });
  }

  plaintextMirror.set(key, decrypted);

  if (reseal) {
    const sealed = await Promise.all(
      decrypted.map(async (doc) => ({
        ...doc,
        base64Data: await sealVaultPayloadAsync(doc.base64Data),
        thumbnailBase64: await sealVaultPayloadAsync(doc.thumbnailBase64),
      })),
    );
    writeStorage(key, sealed);
  }
}

/**
 * Writes all documents to storage (payloads sealed). Throws when write fails.
 */
function saveDocuments(docs: VaultDocument[], workerScopeId?: string): void {
  const key = documentsKey(workerScopeId);
  persistSealedDocuments(docs, workerScopeId);
  if (canRevealVaultDocumentPayloads(workerScopeId)) {
    plaintextMirror.set(
      key,
      docs.map((d) => ({
        ...d,
        base64Data: d.base64Data ?? "",
        thumbnailBase64: d.thumbnailBase64 ?? "",
      })),
    );
  } else {
    plaintextMirror.delete(key);
  }

  // Prefer AES-GCM envelopes asynchronously.
  void (async () => {
    try {
      await ensurePiiCryptoReady();
      const sealed = await Promise.all(
        docs.map(async (doc) => ({
          ...doc,
          base64Data: await sealVaultPayloadAsync(doc.base64Data ?? ""),
          thumbnailBase64: await sealVaultPayloadAsync(doc.thumbnailBase64 ?? ""),
        })),
      );
      writeStorage(key, sealed);
    } catch {
      /* sync sealed copy already persisted */
    }
  })();
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
 * Uses sealed ciphertext size from LS so quota reflects storage reality.
 */
export function getVaultStorageUsedBytes(): number {
  return readRawDocuments().reduce(
    (sum, doc) =>
      sum +
      estimateStoredPayloadBytes(doc.base64Data ?? "") +
      estimateStoredPayloadBytes(doc.thumbnailBase64 ?? ""),
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

/** Test/diagnostic: inspect whether LS payloads are sealed (no plaintext data-URLs). */
export function vaultDocumentsAreSealedAtRest(workerScopeId?: string): boolean {
  const raw = readRawDocuments(workerScopeId);
  if (raw.length === 0) return true;
  return raw.every((doc) => {
    const b = doc.base64Data ?? "";
    const t = doc.thumbnailBase64 ?? "";
    const baseOk = !b || isVaultPayloadSealed(b);
    const thumbOk = !t || isVaultPayloadSealed(t);
    return baseOk && thumbOk;
  });
}
