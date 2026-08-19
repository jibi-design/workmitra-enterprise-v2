/**
 * Employer gate scanner — shift PIN unlock, token lookup, single-consume.
 * Isolated from Shift / Career. QR payload is never trusted for name/status.
 */

import type { AuthUser } from "../../auth/types.js";
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
import type { EventDayFail } from "./eventDay.service.js";

const ALREADY: EventDayFail = {
  ok: false,
  code: "ALREADY_CHECKED_IN",
  message: "This pass has already been used.",
  httpStatus: 409,
};

function storeFail(err: unknown): EventDayFail | null {
  return isUndefinedRelationError(err) ? EVENT_DAY_STORE_NOT_READY : null;
}

async function markSpentSoft(passId: string): Promise<void> {
  try {
    await eventDayRepository.markPassSpent(passId);
  } catch (err) {
    if (!isUndefinedColumnError(err)) throw err;
  }
}

async function resolveUnlockHash(issuerId: string, folderId: string): Promise<string | null> {
  try {
    const eventHash = await eventDayRepository.getEventGatePinHash(issuerId, folderId);
    if (eventHash) return eventHash;
  } catch (err) {
    if (!isUndefinedRelationError(err)) throw err;
  }
  return eventDayRepository.getGatePinHash(issuerId);
}

export const eventDayScannerService = {
  async unlock(
    employer: AuthUser,
    pin: string,
    folderId: string,
  ): Promise<{ ok: true; unlocked: true } | EventDayFail> {
    try {
      const pinHash = await resolveUnlockHash(employer.id, folderId);
      if (!pinHash) {
        return {
          ok: false,
          code: "GATE_PIN_NOT_SET",
          message: "Set a shift gate PIN for this event before unlocking the scanner.",
          httpStatus: 403,
        };
      }
      if (!(await verifyPassword(pin, pinHash))) {
        return {
          ok: false,
          code: "SCANNER_UNLOCK_DENIED",
          message: "Shift PIN was not accepted.",
          httpStatus: 401,
        };
      }
      return { ok: true, unlocked: true };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_SCANNER_UNLOCK_FAILED",
        message: "Could not unlock the scanner.",
        httpStatus: 500,
      };
    }
  },

  async lookup(
    employer: AuthUser,
    token: string,
  ): Promise<{ ok: true; pass: PublicEventDayPassView } | EventDayFail> {
    try {
      const pass = await eventDayRepository.getPassByTokenHash(hashEventDayPassToken(token));
      if (!pass || pass.issuerId !== employer.id) {
        return { ok: true, pass: toPublicPassView(null) };
      }
      return { ok: true, pass: toPublicPassView(pass) };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_SCANNER_LOOKUP_FAILED",
        message: "Could not look up this pass from the server.",
        httpStatus: 500,
      };
    }
  },

  async consume(
    employer: AuthUser,
    token: string,
    folderId?: string,
  ): Promise<{ ok: true; pass: PublicEventDayPassView; verifiedAt: string } | EventDayFail> {
    try {
      const pass = await eventDayRepository.getPassByTokenHash(hashEventDayPassToken(token));
      if (!pass || pass.issuerId !== employer.id) {
        return { ok: false, code: "NOT_FOUND", message: "Pass not found.", httpStatus: 404 };
      }
      if (folderId) {
        const passFolder = resolveEventGateFolderId(
          pass.issuerId,
          pass.eventName,
          pass.venueName,
          pass.validFrom,
        );
        if (passFolder !== folderId) {
          return {
            ok: false,
            code: "PASS_NOT_VALID",
            message: "This pass belongs to a different event folder.",
            httpStatus: 403,
          };
        }
      }
      if (pass.entered) return ALREADY;
      if (resolvePublicPassBadge(pass) !== "VALID") {
        return {
          ok: false,
          code: "PASS_NOT_VALID",
          message: "This pass cannot enter now.",
          httpStatus: 403,
        };
      }
      const row = await eventDayRepository.insertPinCheckIn({
        issuerId: employer.id,
        passId: pass.passId,
        staffName: employer.fullName.trim() || "Gate staff",
      });
      await markSpentSoft(pass.passId);
      return {
        ok: true,
        pass: toPublicPassView(pass),
        verifiedAt: row.verifiedAt,
      };
    } catch (err) {
      if (isUniqueViolationError(err)) return ALREADY;
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_CONSUME_FAILED",
        message: "Could not confirm entry.",
        httpStatus: 500,
      };
    }
  },
};
