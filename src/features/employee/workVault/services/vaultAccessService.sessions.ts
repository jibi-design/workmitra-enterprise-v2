// vaultAccessService.sessions.ts

import type { VaultSession } from "../types/vaultTypes";
import { VAULT_STORAGE_KEYS, SESSION_DURATION_MS } from "../constants/vaultConstants";
import {
  readStorage,
  writeStorage,
  generateVaultEntityId,
  removeStorage,
} from "../helpers/vaultStorageUtils";
import { getVisibleFolders } from "./vaultFolderService";
import { isVaultApiSyncEnabled, vaultGateApi } from "./vaultGateApi.service";
import {
  addAccessLogEntry,
  getAllSessions,
  mapServerSessionToAccessEntry,
  mapServerSessionToLocal,
  saveSessions,
  updateAccessLogStatus,
} from "./vaultAccessService.session.helpers";

export type CreateSessionResult =
  { ok: true; session: VaultSession } | { ok: false; reason: "storage_error" };

export async function hydrateVaultSessionsFromDb(): Promise<void> {
  if (!isVaultApiSyncEnabled()) return;

  try {
    const sessions = await vaultGateApi.listSessions();
    const localSessions = sessions.map(mapServerSessionToLocal);
    saveSessions(localSessions);
    writeStorage(VAULT_STORAGE_KEYS.accessLog, sessions.map(mapServerSessionToAccessEntry));
  } catch {
    // Keep LS cache on network failure.
  }
}

export function createSession(
  employerIdentifier: string,
  employerName: string,
): CreateSessionResult {
  const now = Date.now();
  const visibleFolderIds = getVisibleFolders().map((f) => f.id);

  const session: VaultSession = {
    id: generateVaultEntityId(),
    employerIdentifier,
    employerName: employerName.trim(),
    startedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
    visibleFolderIds,
    status: "active",
  };

  const sessions = getAllSessions();
  if (!saveSessions([...sessions, session])) {
    return { ok: false, reason: "storage_error" };
  }

  if (!addAccessLogEntry(session)) {
    saveSessions(sessions);
    return { ok: false, reason: "storage_error" };
  }

  return { ok: true, session };
}

export function createSessionFromApiResult(params: {
  sessionId: string;
  employerIdentifier: string;
  employerName: string;
  visibleFolderIds: string[];
  expiresAt: number;
}): CreateSessionResult {
  const now = Date.now();
  const session: VaultSession = {
    id: params.sessionId,
    employerIdentifier: params.employerIdentifier,
    employerName: params.employerName.trim(),
    startedAt: now,
    expiresAt: params.expiresAt,
    visibleFolderIds: params.visibleFolderIds,
    status: "active",
  };

  const sessions = getAllSessions().filter((s) => s.id !== session.id);
  if (!saveSessions([...sessions, session])) {
    return { ok: false, reason: "storage_error" };
  }

  writeStorage(VAULT_STORAGE_KEYS.employerSessionId, params.sessionId);

  addAccessLogEntry(session);

  return { ok: true, session };
}

export function getStoredEmployerSessionId(): string | null {
  const raw = readStorage<string>(VAULT_STORAGE_KEYS.employerSessionId);
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export function clearStoredEmployerSessionId(): void {
  removeStorage(VAULT_STORAGE_KEYS.employerSessionId);
}

export function getActiveSession(): VaultSession | null {
  const now = Date.now();
  const sessions = getAllSessions();

  const active = sessions.find((s) => s.status === "active" && now <= s.expiresAt);

  if (!active) return null;
  return active;
}

export function isSessionValid(sessionId: string): boolean {
  const sessions = getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return false;
  if (session.status !== "active") return false;
  return Date.now() <= session.expiresAt;
}

export function getSessionRemainingMs(sessionId: string): number {
  const sessions = getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== "active") return 0;

  const remaining = session.expiresAt - Date.now();
  return remaining > 0 ? remaining : 0;
}

export async function revokeSession(sessionId: string): Promise<boolean> {
  if (isVaultApiSyncEnabled()) {
    try {
      await vaultGateApi.revokeSession(sessionId);
    } catch {
      return false;
    }
  }

  const sessions = getAllSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    updateAccessLogStatus(sessionId, "revoked");
    return true;
  }

  sessions[index] = { ...sessions[index], status: "revoked" };
  if (!saveSessions(sessions)) return false;

  updateAccessLogStatus(sessionId, "revoked");

  const stored = getStoredEmployerSessionId();
  if (stored === sessionId) clearStoredEmployerSessionId();

  return true;
}

export function endEmployerLocalSession(sessionId: string): void {
  const sessions = getAllSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], status: "revoked" };
    saveSessions(sessions);
  }
  updateAccessLogStatus(sessionId, "revoked");
  clearStoredEmployerSessionId();
}

export function revokeSessionSync(sessionId: string): boolean {
  if (isVaultApiSyncEnabled()) {
    void vaultGateApi.revokeSession(sessionId).catch(() => undefined);
  }

  const sessions = getAllSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    updateAccessLogStatus(sessionId, "revoked");
    if (getStoredEmployerSessionId() === sessionId) clearStoredEmployerSessionId();
    return true;
  }

  sessions[index] = { ...sessions[index], status: "revoked" };
  if (!saveSessions(sessions)) return false;

  updateAccessLogStatus(sessionId, "revoked");
  if (getStoredEmployerSessionId() === sessionId) clearStoredEmployerSessionId();
  return true;
}

export function expireOldSessions(): void {
  const now = Date.now();
  const sessions = getAllSessions();
  let changed = false;

  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].status === "active" && now > sessions[i].expiresAt) {
      sessions[i] = { ...sessions[i], status: "expired" };
      updateAccessLogStatus(sessions[i].id, "expired");
      changed = true;
    }
  }

  if (changed) {
    saveSessions(sessions);
  }
}
