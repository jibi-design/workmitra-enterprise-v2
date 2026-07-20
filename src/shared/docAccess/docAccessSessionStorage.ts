// App: Job Mitra / WorkMitra_Enterprise_v2
// File: docAccessSessionStorage.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\docAccessSessionStorage.ts

//
// Document Access Session Storage — Shift Jobs + Career Jobs.
// 30 minute session after OTP verified.
// Access log for both employer and employee sides.
// SEPARATE from HR session system.

import { DOC_ACCESS_SESSION_DURATION_MS } from "./docAccessConstants";

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
    return JSON.parse(raw) as DocAccessLogEntry[];
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
      expiresAt: now + DOC_ACCESS_SESSION_DURATION_MS,
      revoked: false,
    };

    safeWriteSession(session);

    pushEmployeeNotification(
      "Documents being viewed",
      `${params.employerName} is viewing your documents. Access expires in 30 minutes. Go to Work Vault to revoke.`,
      params.domain,
    );

    pushLog({
      employerId: params.employerId,
      employerName: params.employerName,
      workerWmId: params.workerWmId,
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

    return session;
  },

  isSessionValid(): boolean {
    return this.getActiveSession() !== null;
  },

  getRemainingMs(): number {
    const session = safeReadSession();

    if (!session || session.revoked) return 0;

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
