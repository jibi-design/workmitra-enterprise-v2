// src/features/employee/workVault/services/vaultAccessService.ts

import type { VaultSession, VaultAccessEntry } from "../types/vaultTypes";
import { VAULT_STORAGE_KEYS, SESSION_DURATION_MS } from "../constants/vaultConstants";
import { readStorage, writeStorage, generateVaultEntityId } from "../helpers/vaultStorageUtils";
import { normalizeSessions, normalizeAccessLog } from "../helpers/vaultNormalizers";
import { getVisibleFolders } from "./vaultFolderService";

/* ------------------------------------------------ */
/* Sessions                                         */
/* ------------------------------------------------ */

/**
 * Reads all sessions from storage.
 */
function getAllSessions(): VaultSession[] {
  return normalizeSessions(readStorage(VAULT_STORAGE_KEYS.sessions));
}

/**
 * Writes all sessions to storage.
 */
function saveSessions(sessions: VaultSession[]): void {
  writeStorage(VAULT_STORAGE_KEYS.sessions, sessions);
}

/**
 * Creates a new viewing session after successful OTP verification.
 * Snapshots the currently visible folder IDs.
 */
export function createSession(
  employerIdentifier: string,
  employerName: string,
): VaultSession {
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
  saveSessions([...sessions, session]);

  addAccessLogEntry(session);

  return session;
}

/**
 * Gets the currently active session (if any).
 */
export function getActiveSession(): VaultSession | null {
  const now = Date.now();
  const sessions = getAllSessions();

  const active = sessions.find(
    (s) => s.status === "active" && now <= s.expiresAt,
  );

  if (!active) return null;
  return active;
}

/**
 * Checks if a session is still valid.
 */
export function isSessionValid(sessionId: string): boolean {
  const sessions = getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return false;
  if (session.status !== "active") return false;
  return Date.now() <= session.expiresAt;
}

/**
 * Returns remaining time in milliseconds for a session.
 */
export function getSessionRemainingMs(sessionId: string): number {
  const sessions = getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== "active") return 0;

  const remaining = session.expiresAt - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * Revokes a session immediately (employee-initiated).
 */
export function revokeSession(sessionId: string): boolean {
  const sessions = getAllSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return false;

  sessions[index] = { ...sessions[index], status: "revoked" };
  saveSessions(sessions);

  updateAccessLogStatus(sessionId, "revoked");
  return true;
}

/**
 * Expires all sessions that have passed their expiry time.
 * Should be called periodically or on page load.
 */
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

/* ------------------------------------------------ */
/* Access Log                                       */
/* ------------------------------------------------ */

/**
 * Reads the full access log.
 */
export function getAccessLog(): VaultAccessEntry[] {
  return normalizeAccessLog(readStorage(VAULT_STORAGE_KEYS.accessLog));
}

/**
 * Adds a new entry to the access log (called when session is created).
 */
function addAccessLogEntry(session: VaultSession): void {
  const log = getAccessLog();

  const entry: VaultAccessEntry = {
    id: session.id,
    employerName: session.employerName,
    employerIdentifier: session.employerIdentifier,
    accessedAt: session.startedAt,
    expiredAt: session.expiresAt,
    visibleFolderIds: session.visibleFolderIds,
    status: session.status,
  };

  writeStorage(VAULT_STORAGE_KEYS.accessLog, [...log, entry]);
}

/**
 * Updates the status of an access log entry.
 */
function updateAccessLogStatus(sessionId: string, status: VaultAccessEntry["status"]): void {
  const log = getAccessLog();
  const index = log.findIndex((e) => e.id === sessionId);
  if (index === -1) return;

  log[index] = { ...log[index], status };
  writeStorage(VAULT_STORAGE_KEYS.accessLog, log);
}

/**
 * Returns the access log sorted by most recent first.
 */
export function getAccessLogSorted(): VaultAccessEntry[] {
  return getAccessLog().sort((a, b) => b.accessedAt - a.accessedAt);
}