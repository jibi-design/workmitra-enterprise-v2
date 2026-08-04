/** Phase-0 demo contact OTP — hash only in sessionStorage. */

import { hashOtpCode, otpCodesMatch } from "../../../../shared/security/otpCodeHash";
import { employerSettingsStorage } from "../storage/employerSettings.storage";
import { syncEmployerVerificationToServer } from "./employerVerificationSync.service";

const OTP_STORAGE_KEY = "wm:employer-contact-otp";
const OTP_CODE_LENGTH = 6;
const OTP_VALIDITY_MS = 5 * 60 * 1000;

type PendingEmployerContactOtp = {
  readonly codeHash: string;
  readonly target: string;
  readonly expiresAt: number;
  readonly used: boolean;
};

function scrubLegacyPlaintext(): void {
  try {
    const raw = sessionStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { code?: string };
    if (typeof parsed?.code === "string") {
      sessionStorage.removeItem(OTP_STORAGE_KEY);
    }
  } catch {
    try {
      sessionStorage.removeItem(OTP_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

scrubLegacyPlaintext();

function readPending(): PendingEmployerContactOtp | null {
  try {
    const raw = sessionStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingEmployerContactOtp>;
    if (!parsed.codeHash || !parsed.target || typeof parsed.expiresAt !== "number") return null;
    return {
      codeHash: parsed.codeHash,
      target: parsed.target,
      expiresAt: parsed.expiresAt,
      used: Boolean(parsed.used),
    };
  } catch {
    return null;
  }
}

function writePending(otp: PendingEmployerContactOtp): void {
  sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otp));
}

function generateCode(): string {
  const array = new Uint8Array(OTP_CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => (byte % 10).toString()).join("");
}

function normalizeTarget(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveContactVerificationTarget(profile: {
  readonly phone: string;
  readonly email: string;
}): string | null {
  const phone = profile.phone.trim();
  if (phone) return phone;
  const email = profile.email.trim();
  if (email) return email;
  return null;
}

export type RequestContactOtpResult =
  | { readonly success: true; readonly target: string; readonly demoCode: string }
  | { readonly success: false; readonly reason: string };

export async function requestContactOtp(target: string): Promise<RequestContactOtpResult> {
  const normalized = normalizeTarget(target);
  if (!normalized) {
    return { success: false, reason: "Add a phone number or email on your account first." };
  }

  const code = generateCode();
  writePending({
    codeHash: await hashOtpCode(code),
    target: normalized,
    expiresAt: Date.now() + OTP_VALIDITY_MS,
    used: false,
  });

  return { success: true, target: normalized, demoCode: code };
}

export type VerifyContactOtpResult =
  { readonly success: true } | { readonly success: false; readonly reason: string };

export async function verifyContactOtp(
  target: string,
  submittedCode: string,
): Promise<VerifyContactOtpResult> {
  const pending = readPending();
  const normalized = normalizeTarget(target);
  const code = submittedCode.trim();

  if (!pending) {
    return { success: false, reason: "No OTP requested. Tap Send code first." };
  }
  if (pending.used) {
    return { success: false, reason: "This code was already used. Request a new code." };
  }
  if (Date.now() > pending.expiresAt) {
    return { success: false, reason: "Code expired. Request a new code." };
  }
  if (normalizeTarget(pending.target) !== normalized) {
    return { success: false, reason: "Code does not match this contact. Request a new code." };
  }
  if (!(await otpCodesMatch(code, pending.codeHash))) {
    return { success: false, reason: "Incorrect code. Please try again." };
  }

  writePending({ ...pending, used: true });
  employerSettingsStorage.savePartial({ contactVerified: true });
  const saved = employerSettingsStorage.get();
  void syncEmployerVerificationToServer(saved);
  return { success: true };
}

export function clearContactOtp(): void {
  sessionStorage.removeItem(OTP_STORAGE_KEY);
}
