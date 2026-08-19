/**
 * Employer Event Day service — auth user is issuer. No Shift/Career imports.
 */

import type { AuthUser } from "../../auth/types.js";
import { hashPassword } from "../../auth/password.js";
import { hashEventDayPassToken, mintEventDayPassToken } from "./eventDay.crypto.js";
import { EVENT_DAY_STORE_NOT_READY, isUndefinedRelationError } from "./eventDay.errors.js";
import {
  buildEventFolderCards,
  buildFolderAttendanceRows,
  resolvePassFolderId,
  type EventDayAttendanceRow,
  type EventDayFolderCard,
} from "./eventDay.folders.js";
import { eventDayRepository, type EventDayCheckInRow, type EventDayPassRow } from "./eventDay.repository.js";
import type { CreateEventDayPassBody } from "../../../validation/schemas/eventDay.schemas.js";

export type EventDayFail = {
  readonly ok: false;
  readonly code: string;
  readonly message: string;
  readonly httpStatus: number;
};

function storeFail(err: unknown): EventDayFail | null {
  return isUndefinedRelationError(err) ? EVENT_DAY_STORE_NOT_READY : null;
}

function asFolderPass(pass: EventDayPassRow) {
  return {
    passId: pass.passId,
    issuerId: pass.issuerId,
    eventName: pass.eventName,
    venueName: pass.venueName,
    validFrom: pass.validFrom,
    status: pass.status,
  };
}

export const employerEventDayService = {
  async listPasses(
    employer: AuthUser,
  ): Promise<{ ok: true; passes: EventDayPassRow[] } | EventDayFail> {
    try {
      return { ok: true, passes: await eventDayRepository.listPasses(employer.id) };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_LIST_FAILED",
        message: "Could not list Event Day passes.",
        httpStatus: 500,
      };
    }
  },

  async createPass(
    employer: AuthUser,
    body: CreateEventDayPassBody,
  ): Promise<{ ok: true; pass: EventDayPassRow; passToken: string } | EventDayFail> {
    const passToken = mintEventDayPassToken();
    try {
      const pass = await eventDayRepository.insertPass({
        issuerId: employer.id,
        tokenHash: hashEventDayPassToken(passToken),
        guestName: body.guestName.trim(),
        candidateRef: body.candidateRef?.trim() || undefined,
        eventName: body.eventName?.trim() || undefined,
        venueName: body.venueName.trim(),
        venueAddress: body.venueAddress?.trim() || undefined,
        purpose: body.purpose,
        validFrom: body.validFrom,
        validUntil: body.validUntil,
      });
      return { ok: true, pass, passToken };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_CREATE_FAILED",
        message: "Could not create Event Day pass.",
        httpStatus: 500,
      };
    }
  },

  async revokePass(
    employer: AuthUser,
    passId: string,
  ): Promise<{ ok: true; pass: EventDayPassRow } | EventDayFail> {
    try {
      const pass = await eventDayRepository.revokePass(employer.id, passId);
      if (!pass) {
        return { ok: false, code: "NOT_FOUND", message: "Pass not found.", httpStatus: 404 };
      }
      return { ok: true, pass };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_REVOKE_FAILED",
        message: "Could not revoke pass.",
        httpStatus: 500,
      };
    }
  },

  async getGatePin(
    employer: AuthUser,
    folderId?: string,
  ): Promise<{ ok: true; pinSet: boolean; updatedAt: string | null } | EventDayFail> {
    try {
      if (folderId) {
        try {
          return { ok: true, ...(await eventDayRepository.getEventGatePinMeta(employer.id, folderId)) };
        } catch (err) {
          if (!isUndefinedRelationError(err)) throw err;
        }
      }
      return { ok: true, ...(await eventDayRepository.getGatePinMeta(employer.id)) };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_PIN_READ_FAILED",
        message: "Could not read gate PIN status.",
        httpStatus: 500,
      };
    }
  },

  async putGatePin(
    employer: AuthUser,
    pin: string,
    folderId: string,
  ): Promise<{ ok: true; pinSet: true; updatedAt: string | null } | EventDayFail> {
    const pinHash = await hashPassword(pin);
    try {
      try {
        const meta = await eventDayRepository.upsertEventGatePinHash(employer.id, folderId, pinHash);
        return { ok: true, pinSet: true, updatedAt: meta.updatedAt };
      } catch (err) {
        if (!isUndefinedRelationError(err)) throw err;
      }
      const meta = await eventDayRepository.upsertGatePinHash(employer.id, pinHash);
      return { ok: true, pinSet: true, updatedAt: meta.updatedAt };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_PIN_WRITE_FAILED",
        message: "Could not save gate PIN.",
        httpStatus: 500,
      };
    }
  },

  async listFolders(
    employer: AuthUser,
  ): Promise<{ ok: true; folders: EventDayFolderCard[] } | EventDayFail> {
    try {
      const [passes, checkIns] = await Promise.all([
        eventDayRepository.listPasses(employer.id),
        eventDayRepository.listCheckIns(employer.id),
      ]);
      return { ok: true, folders: buildEventFolderCards(passes.map(asFolderPass), checkIns) };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_REPORT_FAILED",
        message: "Could not load Event Day folders.",
        httpStatus: 500,
      };
    }
  },

  async getFolder(
    employer: AuthUser,
    folderId: string,
  ): Promise<
    | { ok: true; folder: EventDayFolderCard; rows: EventDayAttendanceRow[] }
    | EventDayFail
  > {
    const listed = await employerEventDayService.listFolders(employer);
    if (!listed.ok) return listed;
    const folder = listed.folders.find((item) => item.folderId === folderId);
    if (!folder) {
      return { ok: false, code: "NOT_FOUND", message: "Folder not found.", httpStatus: 404 };
    }
    try {
      const [passes, checkIns] = await Promise.all([
        eventDayRepository.listPasses(employer.id),
        eventDayRepository.listCheckIns(employer.id),
      ]);
      return {
        ok: true,
        folder,
        rows: buildFolderAttendanceRows(folderId, passes.map(asFolderPass), checkIns),
      };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_REPORT_FAILED",
        message: "Could not load folder attendance.",
        httpStatus: 500,
      };
    }
  },

  async deleteFolder(
    employer: AuthUser,
    folderId: string,
  ): Promise<{ ok: true; deletedPassCount: number } | EventDayFail> {
    try {
      const passes = await eventDayRepository.listPasses(employer.id);
      const ids = passes
        .filter((pass) => resolvePassFolderId(asFolderPass(pass)) === folderId)
        .map((pass) => pass.passId);
      if (ids.length === 0) {
        return { ok: false, code: "NOT_FOUND", message: "Folder not found.", httpStatus: 404 };
      }
      const deletedPassCount = await eventDayRepository.deletePasses(employer.id, ids);
      return { ok: true, deletedPassCount };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_DELETE_FAILED",
        message: "Could not delete event folder.",
        httpStatus: 500,
      };
    }
  },

  async listCheckIns(
    employer: AuthUser,
  ): Promise<{ ok: true; checkIns: EventDayCheckInRow[] } | EventDayFail> {
    try {
      return { ok: true, checkIns: await eventDayRepository.listCheckIns(employer.id) };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_CHECKINS_FAILED",
        message: "Could not list check-ins.",
        httpStatus: 500,
      };
    }
  },

  async scanVerify(
    employer: AuthUser,
    passId: string,
    deviceId?: string,
  ): Promise<{ ok: true; checkIn: EventDayCheckInRow } | EventDayFail> {
    try {
      const pass = await eventDayRepository.getPass(employer.id, passId);
      if (!pass) {
        return { ok: false, code: "NOT_FOUND", message: "Pass not found.", httpStatus: 404 };
      }
      const checkIn = await eventDayRepository.insertScanVerify({
        issuerId: employer.id,
        passId,
        staffName: pass.guestName,
        deviceId,
      });
      return { ok: true, checkIn };
    } catch (err) {
      return storeFail(err) ?? {
        ok: false,
        code: "EVENT_DAY_SCAN_FAILED",
        message: "Could not record scan verify.",
        httpStatus: 500,
      };
    }
  },
};
