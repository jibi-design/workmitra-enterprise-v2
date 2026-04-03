// src/shared/docAccess/docAccessOtpService.ts
//
// Document Access OTP Service — Shift Jobs + Career Jobs.
// COMPLETELY SEPARATE from HR OTP system (different storage keys).
// HR system (vaultOtpService.ts) is NEVER touched.
//
// OTP: 6 digits, 5 min expiry, one-time use.
// Notification: auto-push to employee when employer requests.

import { OTP_CODE_LENGTH, OTP_VALIDITY_MS } from "../../features/employee/workVault/constants/vaultConstants";

/* ------------------------------------------------ */
/* Storage Keys (separate from HR)                  */
/* ------------------------------------------------ */
const DOC_OTP_KEY     = "wm_doc_access_otp_v1";
const EMP_NOTES_KEY   = "wm_employee_notifications_v1";
const CHANGED_EVENT   = "wm:doc-access-otp-changed";

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
  const array = new Uint8Array(OTP_CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => (byte % 10).toString()).join("");
}

function safeRead(): DocAccessOtp | null {
  try {
    const raw = localStorage.getItem(DOC_OTP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DocAccessOtp;
  } catch { return null; }
}

function safeWrite(otp: DocAccessOtp | null) {
  try {
    if (otp === null) {
      localStorage.removeItem(DOC_OTP_KEY);
    } else {
      localStorage.setItem(DOC_OTP_KEY, JSON.stringify(otp));
    }
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch { /* safe */ }
}

function pushEmployeeNotification(employerName: string, code: string) {
  try {
    const existing = JSON.parse(localStorage.getItem(EMP_NOTES_KEY) ?? "[]") as object[];
    const note = {
      id: `n_dotp_${Date.now().toString(16)}`,
      domain: "shift",
      title: "Document access requested",
      body: `${employerName} wants to view your documents. Your OTP is: ${code}. Share this only if you approve. Valid for 5 minutes.`,
      createdAt: Date.now(),
      isRead: false,
      route: "/employee/vault",
    };
    localStorage.setItem(EMP_NOTES_KEY, JSON.stringify([note, ...existing].slice(0, 100)));
    window.dispatchEvent(new Event("wm:employee-notifications-changed"));
  } catch { /* safe */ }
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const docAccessOtpService = {
  /**
   * Generate OTP — called when employer taps "View Documents".
   * Pushes notification to employee automatically.
   */
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
      expiresAt: now + OTP_VALIDITY_MS,
      used: false,
      ...params,
    };
    safeWrite(otp);
    pushEmployeeNotification(params.employerName, code);
    return otp;
  },

  /** Get current OTP — for employee to see in notifications */
  getCurrent(): DocAccessOtp | null {
    const otp = safeRead();
    if (!otp) return null;
    if (Date.now() > otp.expiresAt) { safeWrite(null); return null; }
    if (otp.used) return null;
    return otp;
  },

  /** Verify OTP submitted by employer */
  verify(submittedCode: string): boolean {
    const otp = safeRead();
    if (!otp) return false;
    if (otp.used) return false;
    if (Date.now() > otp.expiresAt) return false;
    if (otp.code !== submittedCode.trim()) return false;
    safeWrite({ ...otp, used: true });
    return true;
  },

  /** Check if OTP is still active (not expired, not used) */
  isActive(): boolean {
    const otp = safeRead();
    if (!otp) return false;
    if (otp.used) return false;
    return Date.now() <= otp.expiresAt;
  },

  /** Remaining ms for current OTP */
  getRemainingMs(): number {
    const otp = safeRead();
    if (!otp || otp.used) return 0;
    const r = otp.expiresAt - Date.now();
    return r > 0 ? r : 0;
  },

  /** Clear OTP manually */
  clear(): void { safeWrite(null); },

  /** Subscribe to OTP changes */
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
