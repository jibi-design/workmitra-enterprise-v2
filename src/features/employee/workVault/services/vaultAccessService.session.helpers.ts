// vaultAccessService.session.helpers.ts

import type { VaultSession, VaultAccessEntry } from "../types/vaultTypes";
import { VAULT_STORAGE_KEYS } from "../constants/vaultConstants";
import { readStorage, writeStorage } from "../helpers/vaultStorageUtils";
import { normalizeSessions, normalizeAccessLog } from "../helpers/vaultNormalizers";
import type { VaultServerSessionDto } from "./vaultGateApi.service";

export function getAllSessions(): VaultSession[] {
  return normalizeSessions(readStorage(VAULT_STORAGE_KEYS.sessions));
}

export function saveSessions(sessions: VaultSession[]): boolean {
  return writeStorage(VAULT_STORAGE_KEYS.sessions, sessions).ok;
}

export function mapServerSessionToLocal(s: VaultServerSessionDto): VaultSession {
  return {
    id: s.id,
    employerIdentifier: s.employerMlId || s.employerId,
    employerName: s.employerName,
    startedAt: s.startedAt,
    expiresAt: s.expiresAt,
    visibleFolderIds: s.visibleFolderIds,
    status: s.status,
  };
}

export function mapServerSessionToAccessEntry(s: VaultServerSessionDto): VaultAccessEntry {
  return {
    id: s.id,
    employerName: s.employerName,
    employerIdentifier: s.employerMlId || s.employerId,
    accessedAt: s.startedAt,
    expiredAt: s.expiresAt,
    visibleFolderIds: s.visibleFolderIds,
    status: s.status,
  };
}

export function getAccessLog(): VaultAccessEntry[] {
  return normalizeAccessLog(readStorage(VAULT_STORAGE_KEYS.accessLog));
}

export function addAccessLogEntry(session: VaultSession): boolean {
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

  return writeStorage(VAULT_STORAGE_KEYS.accessLog, [...log, entry]).ok;
}

export function updateAccessLogStatus(sessionId: string, status: VaultAccessEntry["status"]): void {
  const log = getAccessLog();
  const index = log.findIndex((e) => e.id === sessionId);
  if (index === -1) return;

  log[index] = { ...log[index], status };
  writeStorage(VAULT_STORAGE_KEYS.accessLog, log);
}
