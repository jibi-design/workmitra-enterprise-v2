/**
 * Job Mitra | contactVerification.storage.ts
 * Profile-level phone/email verification flags (one-time; hide OTP when true).
 * Lives in shared — no feature-layer imports.
 *
 * getContactVerificationState() MUST return a referentially stable snapshot when
 * content is unchanged — useSyncExternalStore (ProfileContactSection) compares
 * with Object.is and will infinite-loop on a fresh object every read.
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

let cachedSnapshot: ContactVerificationState = { ...DEFAULT };

function sameState(a: ContactVerificationState, b: ContactVerificationState): boolean {
  return (
    a.phoneVerified === b.phoneVerified &&
    a.emailVerified === b.emailVerified &&
    a.phoneMasked === b.phoneMasked &&
    a.emailMasked === b.emailMasked
  );
}

function readFresh(): ContactVerificationState {
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
  if (!sameState(cachedSnapshot, next)) {
    cachedSnapshot = next;
  }
  window.dispatchEvent(new Event(CHANGED));
}

export function getContactVerificationState(): ContactVerificationState {
  const next = readFresh();
  if (!sameState(cachedSnapshot, next)) {
    cachedSnapshot = next;
  }
  return cachedSnapshot;
}

export function markPhoneVerified(e164OrHint?: string): void {
  const cur = getContactVerificationState();
  write({
    ...cur,
    phoneVerified: true,
    phoneMasked: e164OrHint ? maskPhoneHint(e164OrHint) : cur.phoneMasked,
  });
}

export function markEmailVerified(emailHint?: string): void {
  const cur = getContactVerificationState();
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
