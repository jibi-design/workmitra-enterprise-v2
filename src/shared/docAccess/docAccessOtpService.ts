/** Document Access OTP — Shift + Career; never persist plaintext codes. */

import { DOC_ACCESS_OTP_CODE_LENGTH, DOC_ACCESS_OTP_VALIDITY_MS } from "./docAccessConstants";
import { hashOtpCode, otpCodesMatch } from "../security/otpCodeHash";

const DOC_OTP_KEY = "wm_doc_access_otp_v1";
const EMP_NOTES_KEY = "wm_employee_notifications_v1";
const CHANGED_EVENT = "wm:doc-access-otp-changed";

export type DocAccessOtp = {
  /** Same-tab only when freshly generated; empty after reload. */
  code: string;
  generatedAt: number;
  expiresAt: number;
  used: boolean;
  employerName: string;
  employerId: string;
  domain: "shift" | "career";
  workerWmId: string;
};

type StoredOtpChallenge = {
  codeHash: string;
  generatedAt: number;
  expiresAt: number;
  used: boolean;
  employerName: string;
  employerId: string;
  domain: "shift" | "career";
  workerWmId: string;
};

let memoryPlain: { code: string; expiresAt: number } | null = null;

function scrubLegacyPlaintext(): void {
  try {
    const raw = localStorage.getItem(DOC_OTP_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { code?: string; codeHash?: string };
    if (typeof parsed?.code === "string" || typeof parsed?.codeHash !== "string") {
      localStorage.removeItem(DOC_OTP_KEY);
    }
  } catch {
    try {
      localStorage.removeItem(DOC_OTP_KEY);
    } catch {
      /* ignore */
    }
  }
}

scrubLegacyPlaintext();

function generateCode(): string {
  const array = new Uint8Array(DOC_ACCESS_OTP_CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => (byte % 10).toString()).join("");
}

function safeRead(): StoredOtpChallenge | null {
  try {
    const raw = localStorage.getItem(DOC_OTP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredOtpChallenge>;
    if (
      typeof parsed.codeHash !== "string" ||
      typeof parsed.generatedAt !== "number" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.employerName !== "string" ||
      typeof parsed.employerId !== "string" ||
      (parsed.domain !== "shift" && parsed.domain !== "career") ||
      typeof parsed.workerWmId !== "string"
    ) {
      return null;
    }
    return {
      codeHash: parsed.codeHash,
      generatedAt: parsed.generatedAt,
      expiresAt: parsed.expiresAt,
      used: Boolean(parsed.used),
      employerName: parsed.employerName,
      employerId: parsed.employerId,
      domain: parsed.domain,
      workerWmId: parsed.workerWmId,
    };
  } catch {
    return null;
  }
}

function safeWrite(challenge: StoredOtpChallenge | null): void {
  try {
    if (challenge === null) {
      localStorage.removeItem(DOC_OTP_KEY);
    } else {
      localStorage.setItem(DOC_OTP_KEY, JSON.stringify(challenge));
    }
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    /* Phase-0 storage guard */
  }
}

function toPublic(challenge: StoredOtpChallenge): DocAccessOtp {
  const code = memoryPlain && memoryPlain.expiresAt === challenge.expiresAt ? memoryPlain.code : "";
  return {
    code,
    generatedAt: challenge.generatedAt,
    expiresAt: challenge.expiresAt,
    used: challenge.used,
    employerName: challenge.employerName,
    employerId: challenge.employerId,
    domain: challenge.domain,
    workerWmId: challenge.workerWmId,
  };
}

function pushEmployeeNotification(employerName: string, domain: "shift" | "career"): void {
  try {
    const existing = JSON.parse(localStorage.getItem(EMP_NOTES_KEY) ?? "[]") as object[];
    const note = {
      id: `n_dotp_${Date.now().toString(16)}`,
      domain,
      title: "Document access requested",
      body: `${employerName} wants to view your documents. Open Work Vault to view your one-time code if you approve. Valid for 5 minutes. The code is not stored in plain text.`,
      createdAt: Date.now(),
      isRead: false,
      route: "/employee/vault",
    };
    localStorage.setItem(EMP_NOTES_KEY, JSON.stringify([note, ...existing].slice(0, 100)));
    window.dispatchEvent(new Event("wm:employee-notifications-changed"));
  } catch {
    /* Phase-0 storage guard */
  }
}

export const docAccessOtpService = {
  async generate(params: {
    employerName: string;
    employerId: string;
    domain: "shift" | "career";
    workerWmId: string;
  }): Promise<DocAccessOtp> {
    const now = Date.now();
    const code = generateCode();
    const expiresAt = now + DOC_ACCESS_OTP_VALIDITY_MS;
    const challenge: StoredOtpChallenge = {
      codeHash: await hashOtpCode(code),
      generatedAt: now,
      expiresAt,
      used: false,
      ...params,
    };

    memoryPlain = { code, expiresAt };
    safeWrite(challenge);
    pushEmployeeNotification(params.employerName, params.domain);

    return toPublic(challenge);
  },

  getCurrent(): DocAccessOtp | null {
    const challenge = safeRead();
    if (!challenge) {
      memoryPlain = null;
      return null;
    }
    if (Date.now() > challenge.expiresAt) {
      memoryPlain = null;
      safeWrite(null);
      return null;
    }
    if (challenge.used) return null;
    return toPublic(challenge);
  },

  async verify(submittedCode: string): Promise<boolean> {
    const challenge = safeRead();
    if (!challenge || challenge.used) return false;
    if (Date.now() > challenge.expiresAt) {
      memoryPlain = null;
      safeWrite(null);
      return false;
    }
    if (!(await otpCodesMatch(submittedCode, challenge.codeHash))) return false;

    memoryPlain = null;
    safeWrite({ ...challenge, used: true });
    return true;
  },

  isActive(): boolean {
    const challenge = safeRead();
    if (!challenge || challenge.used) return false;
    return Date.now() <= challenge.expiresAt;
  },

  getRemainingMs(): number {
    const challenge = safeRead();
    if (!challenge || challenge.used) return 0;
    const remainingMs = challenge.expiresAt - Date.now();
    return remainingMs > 0 ? remainingMs : 0;
  },

  clear(): void {
    memoryPlain = null;
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
