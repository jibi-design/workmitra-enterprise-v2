// Phase 14: sessions dual-path — DB-authoritative when AUTH_BACKEND_ENABLED; LS cache.
// src/features/employee/workVault/services/vaultAccessService.ts

export type { CreateSessionResult } from "./vaultAccessService.sessions";

export {
  hydrateVaultSessionsFromDb,
  createSession,
  createSessionFromApiResult,
  getStoredEmployerSessionId,
  clearStoredEmployerSessionId,
  getActiveSession,
  isSessionValid,
  getSessionRemainingMs,
  revokeSession,
  endEmployerLocalSession,
  revokeSessionSync,
  expireOldSessions,
} from "./vaultAccessService.sessions";

export { getAccessLog, getAccessLogSorted } from "./vaultAccessService.accessLog";
