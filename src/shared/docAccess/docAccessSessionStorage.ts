// App: Job Mitra / WorkMitra_Enterprise_v2
// File: docAccessSessionStorage.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\docAccessSessionStorage.ts

//
// Document Access Session Storage — Shift Jobs + Career Jobs.
// 30 minute session after OTP verified.
// B-P0-2: HMAC-signed + bound to (employerScopeId, workerMlId); forgeable LS rejected.

import { DOC_ACCESS_SESSION_DURATION_MS } from "./docAccessConstants";
import { docAccessOtpService } from "./docAccessOtpService";
import { signDocAccessSession, verifyDocAccessSessionSignature } from "./docAccessSessionCrypto";

/* ------------------------------------------------ */
/* Storage Keys                                     */
/* ------------------------------------------------ */
const SESSION_KEY = "wm_doc_access_session_v1";
const ACCESS_LOG_KEY = "wm_doc_access_log_v1";
const CHANGED_EVENT = "wm:doc-access-session-changed";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type DocAccessSession = {
  id: string;
  /** Tenant bind — same as employerScopeId when scoped. */
  employerId: string;
  employerScopeId: string;
  employerName: string;
  workerMlId: string;
  domain: "shift" | "career";
  startedAt: number;
  expiresAt: number;
  revoked: boolean;
  /** OTP challenge hash binding. */
  challengeHash: string;
  /** HMAC-SHA256 hex over canonical session payload. */
  sig: string;
  /** Auth UUID HMAC-bound when AUTH backend is on (STEP 2 ACL). */
  authUserId?: string;
};

export type DocAccessLogEntry = {
  id: string;
  employerId: string;
  employerName: string;
  workerMlId: string;
  domain: "shift" | "career";
  accessedAt: number;
  status: "viewed" | "expired" | "revoked";
};

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function uid(): string {
  return `das_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function pickWorkerMlId(rec: Record<string, unknown>): string {
  const ml = rec.workerMlId;
  if (typeof ml === "string" && ml.trim()) return ml;
  const legacy = rec.workerWmId;
  return typeof legacy === "string" ? legacy : "";
}

function normalizeSession(raw: unknown): DocAccessSession | null {
  if (typeof raw !== "object" || raw === null) return null;
  const rec = raw as Record<string, unknown>;
  const workerMlId = pickWorkerMlId(rec);
  if (!workerMlId) return null;

  const employerId = typeof rec.employerId === "string" ? rec.employerId : "";
  const employerScopeId =
    typeof rec.employerScopeId === "string" && rec.employerScopeId.trim()
      ? rec.employerScopeId.trim()
      : employerId;
  const challengeHash = typeof rec.challengeHash === "string" ? rec.challengeHash : "";
  const sig = typeof rec.sig === "string" ? rec.sig : "";
  const authUserId =
    typeof rec.authUserId === "string" && rec.authUserId.trim() ? rec.authUserId.trim() : undefined;

  // Unsigned / legacy sessions are never trusted (B-P0-2).
  if (!challengeHash || !sig || !employerScopeId) return null;
  if (typeof rec.id !== "string" || !rec.id) return null;

  return {
    id: rec.id,
    employerId: employerId || employerScopeId,
    employerScopeId,
    employerName: typeof rec.employerName === "string" ? rec.employerName : "",
    workerMlId,
    domain: rec.domain === "shift" || rec.domain === "career" ? rec.domain : "career",
    startedAt: typeof rec.startedAt === "number" ? rec.startedAt : 0,
    expiresAt: typeof rec.expiresAt === "number" ? rec.expiresAt : 0,
    revoked: rec.revoked === true,
    challengeHash,
    sig,
    ...(authUserId ? { authUserId } : {}),
  };
}

function isSessionSignatureValid(session: DocAccessSession): boolean {
  return verifyDocAccessSessionSignature(
    {
      id: session.id,
      employerScopeId: session.employerScopeId,
      workerMlId: session.workerMlId,
      domain: session.domain,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      challengeHash: session.challengeHash,
      ...(session.authUserId ? { authUserId: session.authUserId } : {}),
    },
    session.sig,
  );
}

function normalizeLogEntry(raw: unknown): DocAccessLogEntry | null {
  if (typeof raw !== "object" || raw === null) return null;
  const rec = raw as Record<string, unknown>;
  const workerMlId = pickWorkerMlId(rec);
  if (!workerMlId) return null;
  return { ...(raw as DocAccessLogEntry), workerMlId };
}

function safeReadSession(): DocAccessSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return normalizeSession(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function safeWriteSession(session: DocAccessSession | null) {
  try {
    if (session === null) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    // Safe localStorage guard for Phase-0 demo mode.
  }
}

function readLog(): DocAccessLogEntry[] {
  try {
    const raw = localStorage.getItem(ACCESS_LOG_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeLogEntry).filter((e): e is DocAccessLogEntry => e !== null);
  } catch {
    return [];
  }
}

function writeLog(entries: DocAccessLogEntry[]) {
  try {
    localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(entries.slice(0, 100)));
  } catch {
    // Safe localStorage guard for Phase-0 demo mode.
  }
}

function pushLog(entry: Omit<DocAccessLogEntry, "id">) {
  const existing = readLog();
  writeLog([{ id: uid(), ...entry }, ...existing]);
}

function pushEmployeeNotification(title: string, body: string, domain: "shift" | "career") {
  try {
    const key = "wm_employee_notifications_v1";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as object[];

    const note = {
      id: `n_das_${Date.now().toString(16)}`,
      domain,
      title,
      body,
      createdAt: Date.now(),
      isRead: false,
      route: "/employee/vault",
    };

    localStorage.setItem(key, JSON.stringify([note, ...existing].slice(0, 100)));
    window.dispatchEvent(new Event("wm:employee-notifications-changed"));
  } catch {
    // Safe localStorage guard for Phase-0 demo mode.
  }
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const docAccessSessionStorage = {
  /**
   * Create a signed session. Requires a pending OTP grant from docAccessOtpService.verify.
   * Returns null if grant missing/mismatched (no forgeable session).
   */
  createSession(params: {
    employerId: string;
    employerScopeId: string;
    employerName: string;
    workerMlId: string;
    domain: "shift" | "career";
    /** Required when AUTH backend is on — bound into HMAC for server ACL. */
    authUserId?: string;
  }): DocAccessSession | null {
    const employerScopeId = params.employerScopeId.trim() || params.employerId.trim();
    const workerMlId = params.workerMlId.trim();
    if (!employerScopeId || !workerMlId) return null;

    const grant = docAccessOtpService.consumeSessionGrant({
      employerScopeId,
      workerMlId,
      domain: params.domain,
    });
    if (!grant) return null;

    const now = Date.now();
    const id = uid();
    const expiresAt = Math.min(grant.expiresAt, now + DOC_ACCESS_SESSION_DURATION_MS);
    const authUserId = params.authUserId?.trim() || undefined;

    const signPayload = {
      id,
      employerScopeId,
      workerMlId,
      domain: params.domain,
      startedAt: now,
      expiresAt,
      challengeHash: grant.challengeHash,
      ...(authUserId ? { authUserId } : {}),
    };

    const session: DocAccessSession = {
      id,
      employerId: params.employerId.trim() || employerScopeId,
      employerScopeId,
      employerName: params.employerName,
      workerMlId,
      domain: params.domain,
      startedAt: now,
      expiresAt,
      revoked: false,
      challengeHash: grant.challengeHash,
      sig: signDocAccessSession(signPayload),
      ...(authUserId ? { authUserId } : {}),
    };

    safeWriteSession(session);

    pushEmployeeNotification(
      "Documents being viewed",
      `${params.employerName} is viewing your documents. Access expires in 30 minutes. Go to Work Vault to revoke.`,
      params.domain,
    );

    pushLog({
      employerId: session.employerId,
      employerName: params.employerName,
      workerMlId,
      domain: params.domain,
      accessedAt: now,
      status: "viewed",
    });

    return session;
  },

  getActiveSession(): DocAccessSession | null {
    const session = safeReadSession();

    if (!session) return null;
    if (session.revoked) return null;

    if (Date.now() > session.expiresAt) {
      this.expireSession();
      return null;
    }

    if (!isSessionSignatureValid(session)) {
      safeWriteSession(null);
      return null;
    }

    return session;
  },

  isSessionValid(): boolean {
    return this.getActiveSession() !== null;
  },

  getRemainingMs(): number {
    const session = this.getActiveSession();
    if (!session) return 0;
    const remainingMs = session.expiresAt - Date.now();
    return remainingMs > 0 ? remainingMs : 0;
  },

  revokeSession(): void {
    const session = safeReadSession();

    if (!session) return;

    safeWriteSession({ ...session, revoked: true });

    const log = readLog();

    writeLog(
      log.map((entry) =>
        entry.employerId === session.employerId && entry.status === "viewed"
          ? { ...entry, status: "revoked" as const }
          : entry,
      ),
    );

    pushEmployeeNotification(
      "Access revoked",
      `You revoked ${session.employerName}'s access to your documents.`,
      session.domain,
    );
  },

  expireSession(): void {
    const session = safeReadSession();

    if (!session) return;

    safeWriteSession(null);

    const log = readLog();

    writeLog(
      log.map((entry) =>
        entry.employerId === session.employerId && entry.status === "viewed"
          ? { ...entry, status: "expired" as const }
          : entry,
      ),
    );
  },

  getAccessLog(): DocAccessLogEntry[] {
    return readLog();
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();

    window.addEventListener(CHANGED_EVENT, handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener(CHANGED_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },

  CHANGED_EVENT,
} as const;
