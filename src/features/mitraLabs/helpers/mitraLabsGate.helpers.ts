/** Mitra Labs gate PIN + public verify display helpers. */

import type { PassValidityFields, PassVerifyBadge } from "./mitraLabs.helpers";
import {
  isOutsidePassWindow,
  OUTSIDE_PASS_WINDOW_COPY,
} from "./mitraLabsPassWindow.helpers";
import { GATE_PIN_LENGTH } from "../validation/mitraLabs.schemas";

export const DEFAULT_GATE_PIN = "0000";

export { OUTSIDE_PASS_WINDOW_COPY } from "./mitraLabsPassWindow.helpers";

export function normalizeGatePinInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, GATE_PIN_LENGTH);
}

export function isValidGatePinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function generateGatePin(): string {
  const n = Math.floor(Math.random() * 10_000);
  return String(n).padStart(4, "0");
}

/** Public scanner headline — green VALID PASS or red fail family. */
export function formatPassVerifyHeadline(
  badge: PassVerifyBadge,
  pass?: PassValidityFields,
): string {
  if (badge === "VALID") return "VALID PASS";
  if (badge === "USED") return "ALREADY USED";
  if (pass && badge !== "REVOKED" && isOutsidePassWindow(pass)) {
    return OUTSIDE_PASS_WINDOW_COPY;
  }
  if (badge === "EXPIRED") return "EXPIRED";
  return "INVALID";
}

export function formatStaffScanHeadline(badge: PassVerifyBadge): string {
  if (badge === "VALID") return "AUTHORIZED";
  if (badge === "USED") return "ALREADY USED";
  if (badge === "EXPIRED") return "EXPIRED";
  return "INVALID";
}

export function passVerifyBadgeTone(badge: PassVerifyBadge): "valid" | "fail" {
  return badge === "VALID" ? "valid" : "fail";
}

export function verifyGatePin(candidatePin: string, expectedPin: string): boolean {
  return isValidGatePinFormat(candidatePin) && candidatePin === expectedPin;
}
