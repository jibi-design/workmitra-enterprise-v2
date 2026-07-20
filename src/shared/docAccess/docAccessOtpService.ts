// App: Job Mitra / WorkMitra_Enterprise_v2
// File: docAccessOtpService.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\docAccessOtpService.ts

//
// Document Access OTP Service — Shift Jobs + Career Jobs.
// COMPLETELY SEPARATE from HR OTP system (different storage keys).
// HR system (vaultOtpService.ts) is NEVER touched.
//
// OTP: 6 digits, 5 min expiry, one-time use.
// Notification: auto-push to employee when employer requests.

import { DOC_ACCESS_OTP_CODE_LENGTH, DOC_ACCESS_OTP_VALIDITY_MS } from "./docAccessConstants";

/* ------------------------------------------------ */
/* Storage Keys (separate from HR)                  */
/* ------------------------------------------------ */
const DOC_OTP_KEY = "wm_doc_access_otp_v1";
const EMP_NOTES_KEY = "wm_employee_notifications_v1";
const CHANGED_EVENT = "wm:doc-access-otp-changed";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type DocAccessOtp = {
  code: string;
  generatedAt: number;
  expiresAt: number;
  used: boolean;
  employerName: string;
  employerId: string;
  domain: "shift" | "career";
  workerWmId: string;
};

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function generateCode(): string {
  const array = new Uint8Array(DOC_ACCESS_OTP_CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => (byte % 10).toString()).join("");
}

function safeRead(): DocAccessOtp | null {
  try {
    const raw = localStorage.getItem(DOC_OTP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DocAccessOtp;
  } catch {
    return null;
  }
}

function safeWrite(otp: DocAccessOtp | null) {
  try {
    if (otp === null) {
      localStorage.removeItem(DOC_OTP_KEY);
    } else {
      localStorage.setItem(DOC_OTP_KEY, JSON.stringify(otp));
    }

    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    // Safe localStorage guard for Phase-0 demo mode.
  }
}

function pushEmployeeNotification(employerName: string, code: string, domain: "shift" | "career") {
  try {
    const existing = JSON.parse(localStorage.getItem(EMP_NOTES_KEY) ?? "[]") as object[];
    const note = {
      id: `n_dotp_${Date.now().toString(16)}`,
      domain,
      title: "Document access requested",
      body: `${employerName} wants to view your documents. Your OTP is: ${code}. Share this only if you approve. Valid for 5 minutes.`,
      createdAt: Date.now(),
      isRead: false,
      route: "/employee/vault",
    };

    localStorage.setItem(EMP_NOTES_KEY, JSON.stringify([note, ...existing].slice(0, 100)));
    window.dispatchEvent(new Event("wm:employee-notifications-changed"));
  } catch {
    // Safe localStorage guard for Phase-0 demo mode.
  }
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const docAccessOtpService = {
  generate(params: {
    employerName: string;
    employerId: string;
    domain: "shift" | "career";
    workerWmId: string;
  }): DocAccessOtp {
    const now = Date.now();
    const code = generateCode();

    const otp: DocAccessOtp = {
      code,
      generatedAt: now,
      expiresAt: now + DOC_ACCESS_OTP_VALIDITY_MS,
      used: false,
      ...params,
    };

    safeWrite(otp);
    pushEmployeeNotification(params.employerName, code, params.domain);

    return otp;
  },

  getCurrent(): DocAccessOtp | null {
    const otp = safeRead();

    if (!otp) return null;

    if (Date.now() > otp.expiresAt) {
      safeWrite(null);
      return null;
    }

    if (otp.used) return null;

    return otp;
  },

  verify(submittedCode: string): boolean {
    const otp = safeRead();

    if (!otp) return false;
    if (otp.used) return false;
    if (Date.now() > otp.expiresAt) return false;
    if (otp.code !== submittedCode.trim()) return false;

    safeWrite({ ...otp, used: true });

    return true;
  },

  isActive(): boolean {
    const otp = safeRead();

    if (!otp) return false;
    if (otp.used) return false;

    return Date.now() <= otp.expiresAt;
  },

  getRemainingMs(): number {
    const otp = safeRead();

    if (!otp || otp.used) return 0;

    const remainingMs = otp.expiresAt - Date.now();

    return remainingMs > 0 ? remainingMs : 0;
  },

  clear(): void {
    safeWrite(null);
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
