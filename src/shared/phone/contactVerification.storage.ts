/**
 * Job Mitra | contactVerification.storage.ts
 * Profile-level phone/email verification flags (one-time; hide OTP when true).
 * Lives in shared — no feature-layer imports.
 */

import { piiSecureStorage } from "../security/piiSecureStorage";
import { maskPhoneHint } from "./phoneDialCountries";

const KEY = "wm_contact_verification_v1";
const CHANGED = "wm:contact-verification-changed";

export type ContactVerificationState = {
  phoneVerified: boolean;
  emailVerified: boolean;
  phoneMasked?: string;
  emailMasked?: string;
};

const DEFAULT: ContactVerificationState = {
  phoneVerified: false,
  emailVerified: false,
};

function read(): ContactVerificationState {
  const raw = piiSecureStorage.getItem(KEY);
  if (!raw) return { ...DEFAULT };
  try {
    const parsed = JSON.parse(raw) as Partial<ContactVerificationState>;
    return {
      phoneVerified: parsed.phoneVerified === true,
      emailVerified: parsed.emailVerified === true,
      phoneMasked: typeof parsed.phoneMasked === "string" ? parsed.phoneMasked : undefined,
      emailMasked: typeof parsed.emailMasked === "string" ? parsed.emailMasked : undefined,
    };
  } catch {
    return { ...DEFAULT };
  }
}

function write(next: ContactVerificationState): void {
  piiSecureStorage.setJson(KEY, next);
  window.dispatchEvent(new Event(CHANGED));
}

export function getContactVerificationState(): ContactVerificationState {
  return read();
}

export function markPhoneVerified(e164OrHint?: string): void {
  const cur = read();
  write({
    ...cur,
    phoneVerified: true,
    phoneMasked: e164OrHint ? maskPhoneHint(e164OrHint) : cur.phoneMasked,
  });
}

export function markEmailVerified(emailHint?: string): void {
  const cur = read();
  const email = (emailHint ?? "").trim();
  const emailMasked = email.includes("@")
    ? `${email.slice(0, 1)}•••@${email.split("@")[1] ?? "••••"}`
    : cur.emailMasked;
  write({
    ...cur,
    emailVerified: true,
    emailMasked: emailMasked ?? cur.emailMasked,
  });
}

export function subscribeContactVerification(listener: () => void): () => void {
  window.addEventListener(CHANGED, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGED, listener);
    window.removeEventListener("storage", listener);
  };
}
