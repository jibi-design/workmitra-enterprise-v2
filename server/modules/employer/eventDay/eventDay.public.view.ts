/** Public Event Day DTO — no contact, PIN, hashes, issuer, or candidate ref. */

import type { EventDayPassRow } from "./eventDay.repository.js";
import { resolvePublicPassBadge, type PublicPassBadge } from "./eventDay.badge.js";

export type PublicEventDayPassView = {
  readonly badge: PublicPassBadge;
  readonly guestName: string | null;
  readonly eventName: string | null;
  readonly venueName: string | null;
  readonly purpose: string | null;
  readonly validFrom: string | null;
  readonly validUntil: string | null;
  readonly status: string | null;
};

const SECRET_KEYS = [
  "pin",
  "pinHash",
  "pin_hash",
  "token",
  "passToken",
  "tokenHash",
  "token_hash",
  "candidateRef",
  "issuerId",
  "passId",
  "guestContact",
] as const;

export function toPublicPassView(pass: EventDayPassRow | null): PublicEventDayPassView {
  if (!pass) {
    return {
      badge: "INVALID",
      guestName: null,
      eventName: null,
      venueName: null,
      purpose: null,
      validFrom: null,
      validUntil: null,
      status: null,
    };
  }
  return {
    badge: resolvePublicPassBadge(pass),
    guestName: pass.guestName,
    eventName: pass.eventName,
    venueName: pass.venueName,
    purpose: pass.purpose,
    validFrom: pass.validFrom,
    validUntil: pass.validUntil,
    status: pass.status,
  };
}

export function publicPassViewHasSecrets(view: PublicEventDayPassView): boolean {
  const keys = Object.keys(view);
  return SECRET_KEYS.some((key) => keys.includes(key));
}
