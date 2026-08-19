/**
 * Public Event Day gate — token-hash lookup + PIN check-in.
 * No Shift/Career imports. Never returns PIN, contact, or hashes.
 */

import { verifyPassword } from "../../auth/password.js";
import { hashEventDayPassToken } from "./eventDay.crypto.js";
import {
  EVENT_DAY_STORE_NOT_READY,
  isUndefinedColumnError,
  isUndefinedRelationError,
  isUniqueViolationError,
} from "./eventDay.errors.js";
import { resolvePublicPassBadge } from "./eventDay.badge.js";
import { toPublicPassView, type PublicEventDayPassView } from "./eventDay.public.view.js";
import { resolveEventGateFolderId } from "./eventDay.pinFolder.js";
import { eventDayRepository } from "./eventDay.repository.js";
import type { EventDayPublicCheckInBody } from "../../../validation/schemas/eventDay.schemas.js";

export type PublicEventDayFail = {
  readonly ok: false;
  readonly code: string;
  readonly message: string;
  readonly httpStatus: number;
};

const CHECK_IN_DENIED: PublicEventDayFail = {
  ok: false,
  code: "CHECK_IN_DENIED",
  message: "Pass or gate PIN was not accepted.",
  httpStatus: 401,
};

const PUBLIC_GATE_STAFF = "Public gate";

function storeFail(err: unknown): PublicEventDayFail | null {
  return isUndefinedRelationError(err) ? EVENT_DAY_STORE_NOT_READY : null;
}

export type PublicCheckInOk = {
  readonly ok: true;
  readonly entered: true;
  readonly verifiedAt: string;
  readonly guestName: string;
  readonly venueName: string;
};

export const publicEventDayService = {
  async getPassByToken(
    token: string,
  ): Promise<{ ok: true; pass: PublicEventDayPassView } | PublicEventDayFail> {
    try {
      const pass = await eventDayRepository.getPassByTokenHash(hashEventDayPassToken(token));
      return { ok: true, pass: toPublicPassView(pass) };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_PUBLIC_LOOKUP_FAILED",
        message: "Could not look up this pass.",
        httpStatus: 500,
      };
    }
  },

  async checkIn(
    body: EventDayPublicCheckInBody,
  ): Promise<PublicCheckInOk | PublicEventDayFail> {
    try {
      const pass = await eventDayRepository.getPassByTokenHash(hashEventDayPassToken(body.token));
      if (!pass) return CHECK_IN_DENIED;
      if (pass.entered) {
        return {
          ok: false,
          code: "ALREADY_CHECKED_IN",
          message: "This pass already has a PIN entry.",
          httpStatus: 409,
        };
      }
      if (resolvePublicPassBadge(pass) !== "VALID") {
        return {
          ok: false,
          code: "PASS_NOT_VALID",
          message: "This pass cannot enter now.",
          httpStatus: 403,
        };
      }
      const folderId = resolveEventGateFolderId(
        pass.issuerId,
        pass.eventName,
        pass.venueName,
        pass.validFrom,
      );
      let pinHash: string | null = null;
      try {
        pinHash = await eventDayRepository.getEventGatePinHash(pass.issuerId, folderId);
      } catch (err) {
        if (!isUndefinedRelationError(err)) throw err;
      }
      pinHash = pinHash ?? (await eventDayRepository.getGatePinHash(pass.issuerId));
      if (!pinHash) return CHECK_IN_DENIED;
      const pinOk = await verifyPassword(body.pin, pinHash);
      if (!pinOk) return CHECK_IN_DENIED;
      const row = await eventDayRepository.insertPinCheckIn({
        issuerId: pass.issuerId,
        passId: pass.passId,
        staffName: PUBLIC_GATE_STAFF,
      });
      try {
        await eventDayRepository.markPassSpent(pass.passId);
      } catch (spentErr) {
        if (!isUndefinedColumnError(spentErr)) throw spentErr;
      }
      return {
        ok: true,
        entered: true,
        verifiedAt: row.verifiedAt,
        guestName: pass.guestName,
        venueName: pass.venueName,
      };
    } catch (err) {
      if (isUniqueViolationError(err)) {
        return {
          ok: false,
          code: "ALREADY_CHECKED_IN",
          message: "This pass already has a PIN entry.",
          httpStatus: 409,
        };
      }
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_CHECK_IN_FAILED",
        message: "Could not complete gate check-in.",
        httpStatus: 500,
      };
    }
  },
};
