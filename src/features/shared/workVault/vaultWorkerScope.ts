/**
 * Worker-keyed Work Vault localStorage keys.
 * Pattern: wm_employee_{workerScopeId}_vault_{kind}_v*
 *
 * Employer career vault review must pass the candidate worker id explicitly.
 * Legacy unscoped keys migrate once into the *current* worker bucket only.
 */

import { resolveActorStorageId } from "../../../app/identity/identity.adapter";
import { employeeProfileStorage } from "../../employee/profile/storage/employeeProfile.storage";

export type VaultWorkerStorageKind = "folders_v1" | "documents_v1" | "profile_v2";

const LEGACY_BY_KIND: Record<VaultWorkerStorageKind, string> = {
  folders_v1: "wm_employee_vault_folders_v1",
  documents_v1: "wm_employee_vault_documents_v1",
  profile_v2: "wm_employee_vault_profile_v2",
};

export function sanitizeVaultWorkerScopeId(raw: string): string {
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  return cleaned || "unknown_worker";
}

/** Active employee vault owner id (profile uniqueId → actor storage id). */
export function getCurrentVaultWorkerScopeId(): string {
  try {
    const uniqueId = employeeProfileStorage.get().uniqueId?.trim();
    if (uniqueId) return sanitizeVaultWorkerScopeId(uniqueId);
  } catch {
    /* fall through */
  }

  try {
    return sanitizeVaultWorkerScopeId(resolveActorStorageId("employee", "employee_demo"));
  } catch {
    return "unknown_worker";
  }
}

export function vaultWorkerScopedKey(kind: VaultWorkerStorageKind, workerScopeId: string): string {
  const cleaned = sanitizeVaultWorkerScopeId(workerScopeId);
  if (kind === "profile_v2") {
    return `wm_employee_${cleaned}_vault_profile_v2`;
  }
  return `wm_employee_${cleaned}_vault_${kind}`;
}

function migratedFlagKey(scopedKey: string): string {
  return `${scopedKey}__migrated_v1`;
}

/**
 * Resolve vault key for a worker.
 * Legacy migrate-once only when reading/writing the *current* employee vault
 * (never when an employer peeks at another worker id).
 */
export function resolveVaultWorkerScopedKey(
  kind: VaultWorkerStorageKind,
  workerScopeId?: string,
): string {
  const current = getCurrentVaultWorkerScopeId();
  const target = sanitizeVaultWorkerScopeId(workerScopeId?.trim() || current);
  const scoped = vaultWorkerScopedKey(kind, target);

  if (target === current) {
    migrateLegacyVaultKeyOnce(kind, scoped);
  }

  return scoped;
}

export function migrateLegacyVaultKeyOnce(kind: VaultWorkerStorageKind, scopedKey: string): void {
  if (typeof localStorage === "undefined") return;

  try {
    const flag = migratedFlagKey(scopedKey);
    if (localStorage.getItem(flag) === "1") return;

    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]" && scopedRaw !== "{}") {
      localStorage.setItem(flag, "1");
      return;
    }

    const legacyRaw = localStorage.getItem(LEGACY_BY_KIND[kind]);
    if (legacyRaw && legacyRaw !== "[]" && legacyRaw !== "{}") {
      localStorage.setItem(scopedKey, legacyRaw);
    }

    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

export const VAULT_WORKER_LEGACY_KEYS = { ...LEGACY_BY_KIND } as const;
