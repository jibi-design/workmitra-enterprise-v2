// src/shared/docAccess/docAccessSessionStorage.ts
//
// Document Access Session Storage — Shift Jobs + Career Jobs.
// 30 minute session after OTP verified.
// Access log for both employer and employee sides.
// SEPARATE from HR session system.

import { SESSION_DURATION_MS } from "../../features/employee/workVault/constants/vaultConstants";

/* ------------------------------------------------ */
/* Storage Keys                                     */
/* ------------------------------------------------ */
const SESSION_KEY    = "wm_doc_access_session_v1";
const ACCESS_LOG_KEY = "wm_doc_access_log_v1";
const CHANGED_EVENT  = "wm:doc-access-session-changed";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type DocAccessSession = {
  id: string;
  employerId: string;
  employerName: string;
  workerWmId: string;
  domain: "shift" | "career";
  startedAt: number;
  expiresAt: number;
  revoked: boolean;
};

export type DocAccessLogEntry = {
  id: string;
  employerId: string;
  employerName: string;
  workerWmId: string;
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

function safeReadSession(): DocAccessSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DocAccessSession;
  } catch { return null; }
}

function safeWriteSession(s: DocAccessSession | null) {
  try {
    if (s === null) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch { /* safe */ }
}

function readLog(): DocAccessLogEntry[] {
  try {
    const raw = localStorage.getItem(ACCESS_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DocAccessLogEntry[];
  } catch { return []; }
}

function writeLog(entries: DocAccessLogEntry[]) {
  try {
    localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(entries.slice(0, 100)));
  } catch { /* safe */ }
}

function pushLog(entry: Omit<DocAccessLogEntry, "id">) {
  const existing = readLog();
  writeLog([{ id: uid(), ...entry }, ...existing]);
}

function pushEmployeeNotification(title: string, body: string) {
  try {
    const KEY = "wm_employee_notifications_v1";
    const existing = JSON.parse(localStorage.getItem(KEY) ?? "[]") as object[];
    const note = {
      id: `n_das_${Date.now().toString(16)}`,
      domain: "shift",
      title,
      body,
      createdAt: Date.now(),
      isRead: false,
      route: "/employee/vault",
    };
    localStorage.setItem(KEY, JSON.stringify([note, ...existing].slice(0, 100)));
    window.dispatchEvent(new Event("wm:employee-notifications-changed"));
  } catch { /* safe */ }
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const docAccessSessionStorage = {
  /** Create session after OTP verified */
  createSession(params: {
    employerId: string;
    employerName: string;
    workerWmId: string;
    domain: "shift" | "career";
  }): DocAccessSession {
    const now = Date.now();
    const session: DocAccessSession = {
      id: uid(),
      ...params,
      startedAt: now,
      expiresAt: now + SESSION_DURATION_MS,
      revoked: false,
    };
    safeWriteSession(session);

    /* Notify employee */
    pushEmployeeNotification(
      "Documents being viewed",
      `${params.employerName} is viewing your documents. Access expires in 30 minutes. Go to Work Vault to revoke.`,
    );

    /* Log access */
    pushLog({
      employerId:   params.employerId,
      employerName: params.employerName,
      workerWmId:   params.workerWmId,
      domain:       params.domain,
      accessedAt:   now,
      status:       "viewed",
    });

    return session;
  },

  /** Get current active session */
  getActiveSession(): DocAccessSession | null {
    const s = safeReadSession();
    if (!s) return null;
    if (s.revoked) return null;
    if (Date.now() > s.expiresAt) {
      /* Auto-expire */
      this.expireSession();
      return null;
    }
    return s;
  },

  /** Check if session is valid */
  isSessionValid(): boolean {
    return this.getActiveSession() !== null;
  },

  /** Remaining ms in session */
  getRemainingMs(): number {
    const s = safeReadSession();
    if (!s || s.revoked) return 0;
    const r = s.expiresAt - Date.now();
    return r > 0 ? r : 0;
  },

  /** Employee revokes access */
  revokeSession(): void {
    const s = safeReadSession();
    if (!s) return;
    safeWriteSession({ ...s, revoked: true });

    /* Update log */
    const log = readLog();
    writeLog(log.map((e) =>
      e.employerId === s.employerId && e.status === "viewed"
        ? { ...e, status: "revoked" as const }
        : e,
    ));

    pushEmployeeNotification(
      "Access revoked",
      `You revoked ${s.employerName}'s access to your documents.`,
    );
  },

  /** Auto-expire session */
  expireSession(): void {
    const s = safeReadSession();
    if (!s) return;
    safeWriteSession(null);

    const log = readLog();
    writeLog(log.map((e) =>
      e.employerId === s.employerId && e.status === "viewed"
        ? { ...e, status: "expired" as const }
        : e,
    ));
  },

  /** Get access log (employee sees this) */
  getAccessLog(): DocAccessLogEntry[] {
    return readLog();
  },

  /** Subscribe to session changes */
  subscribe(cb: () => void): () => void {
    const h = () => cb();
    window.addEventListener(CHANGED_EVENT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(CHANGED_EVENT, h);
      window.removeEventListener("storage", h);
    };
  },

  CHANGED_EVENT,
} as const;
