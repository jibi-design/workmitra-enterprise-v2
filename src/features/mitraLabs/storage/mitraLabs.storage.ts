/**
 * Mitra Labs — Digital Pass Zustand store (local persist only).
 * Does not touch Shift Planner, Career, Payroll, or HR stores.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CreatePassSchema,
  GatePinSchema,
  PassCheckInEventSchema,
  type CreatePassFormInput,
  type CreatePassInput,
  type PassCheckInAction,
  type PassCheckInEvent,
  type PassStatus,
} from "../validation/mitraLabs.schemas";
import {
  defaultPassStyle,
  generateOpaquePassToken,
  generatePassId,
  resolvePassVerifyBadge,
} from "../helpers/mitraLabs.helpers";
import { DEFAULT_GATE_PIN, generateGatePin, isValidGatePinFormat } from "../helpers/mitraLabsGate.helpers";
import { resolveItemPersonFolderId, resolvePassFolderId, resolvePassVenueFolderId } from "../helpers/eventDayFolders.helpers";
import { resolvePassGatePinFolderId } from "../helpers/eventDayGatePinFolders.helpers";

export type DigitalPassRecord = CreatePassInput & {
  readonly createdAt: number;
  readonly updatedAt: number;
};

type MitraLabsState = {
  passes: DigitalPassRecord[];
  activeFilter: string;
  gatePinByIssuer: Record<string, string>;
  gatePinByFolder: Record<string, string>;
  checkInEvents: PassCheckInEvent[];
  setActiveFilter: (filter: string) => void;
  createPass: (form: CreatePassFormInput) => DigitalPassRecord;
  cacheIssuedPass: (record: DigitalPassRecord) => void;
  revokePass: (passId: string) => void;
  getPassByToken: (token: string) => DigitalPassRecord | undefined;
  getPassesByIssuer: (issuerId: string) => DigitalPassRecord[];
  getGatePin: (issuerId: string) => string;
  getFolderGatePin: (folderId: string, issuerId: string) => string;
  setGatePin: (issuerId: string, pin: string) => void;
  setFolderGatePin: (folderId: string, pin: string) => void;
  resetGatePin: (issuerId: string) => string;
  resetFolderGatePin: (folderId: string) => string;
  getCheckInEventsByIssuer: (issuerId: string) => PassCheckInEvent[];
  deleteEventFolder: (folderId: string) => void;
  deleteVenueFolder: (folderId: string) => void;
  deletePersonFolder: (personFolderId: string) => void;
  recordCheckIn: (input: {
    passId: string;
    passToken: string;
    staffName: string;
    issuerId: string;
    action: PassCheckInAction;
  }) => PassCheckInEvent;
  verifyGatePinAndCheckIn: (
    pass: DigitalPassRecord,
    pin: string,
  ) => { ok: true; event: PassCheckInEvent } | { ok: false; error: string };
  recordScanVerify: (pass: DigitalPassRecord) => PassCheckInEvent;
};

function markExpiredIfNeeded(pass: DigitalPassRecord): DigitalPassRecord {
  if (pass.status === "revoked" || pass.status === "expired") return pass;
  const untilMs = Date.parse(pass.validUntil);
  if (Number.isFinite(untilMs) && Date.now() > untilMs) {
    return { ...pass, status: "expired" as PassStatus, updatedAt: Date.now() };
  }
  return pass;
}

function mintCheckInEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `chk_${crypto.randomUUID()}`;
  }
  return `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useMitraLabsStore = create<MitraLabsState>()(
  persist(
    (set, get) => ({
      passes: [],
      activeFilter: "all",
      gatePinByIssuer: {},
      gatePinByFolder: {},
      checkInEvents: [],

      setActiveFilter(filter) {
        set({ activeFilter: filter });
      },

      createPass(form) {
        const now = Date.now();
        const payload: CreatePassInput = {
          ...form,
          passId: generatePassId(),
          passToken: generateOpaquePassToken(),
          status: "active",
          style: form.style ?? defaultPassStyle(),
        };
        const parsed = CreatePassSchema.parse(payload);
        const record: DigitalPassRecord = {
          ...parsed,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ passes: [record, ...s.passes] }));
        return record;
      },

      cacheIssuedPass(record) {
        set((s) => ({
          passes: [record, ...s.passes.filter((p) => p.passId !== record.passId)],
        }));
      },

      revokePass(passId) {
        set((s) => ({
          passes: s.passes.map((p) =>
            p.passId === passId
              ? { ...p, status: "revoked" as const, updatedAt: Date.now() }
              : p,
          ),
        }));
      },

      getPassByToken(token) {
        const found = get().passes.find((p) => p.passToken === token);
        if (!found) return undefined;
        const next = markExpiredIfNeeded(found);
        if (next.status !== found.status) {
          set((s) => ({
            passes: s.passes.map((p) => (p.passId === next.passId ? next : p)),
          }));
        }
        return next;
      },

      getPassesByIssuer(issuerId) {
        return get()
          .passes.filter((p) => p.issuerId === issuerId)
          .map(markExpiredIfNeeded);
      },

      getGatePin(issuerId) {
        return get().gatePinByIssuer[issuerId] ?? DEFAULT_GATE_PIN;
      },

      getFolderGatePin(folderId, issuerId) {
        return get().gatePinByFolder[folderId] ?? get().getGatePin(issuerId);
      },

      setGatePin(issuerId, pin) {
        GatePinSchema.parse(pin);
        set((s) => ({
          gatePinByIssuer: { ...s.gatePinByIssuer, [issuerId]: pin },
        }));
      },

      setFolderGatePin(folderId, pin) {
        GatePinSchema.parse(pin);
        set((s) => ({
          gatePinByFolder: { ...s.gatePinByFolder, [folderId]: pin },
        }));
      },

      resetGatePin(issuerId) {
        const pin = generateGatePin();
        get().setGatePin(issuerId, pin);
        return pin;
      },

      resetFolderGatePin(folderId) {
        const pin = generateGatePin();
        get().setFolderGatePin(folderId, pin);
        return pin;
      },

      getCheckInEventsByIssuer(issuerId) {
        return get().checkInEvents.filter((event) => event.issuerId === issuerId);
      },

      deleteEventFolder(folderId) {
        const passIds = new Set(
          get()
            .passes.filter((pass) => resolvePassFolderId(pass) === folderId)
            .map((pass) => pass.passId),
        );
        if (passIds.size === 0) return;
        set((s) => ({
          passes: s.passes.filter((pass) => !passIds.has(pass.passId)),
          checkInEvents: s.checkInEvents.filter((event) => !passIds.has(event.passId)),
        }));
      },

      deleteVenueFolder(folderId) {
        const passIds = new Set(
          get()
            .passes.filter((pass) => resolvePassVenueFolderId(pass) === folderId)
            .map((pass) => pass.passId),
        );
        if (passIds.size === 0) return;
        set((s) => ({
          passes: s.passes.filter((pass) => !passIds.has(pass.passId)),
          checkInEvents: s.checkInEvents.filter((event) => !passIds.has(event.passId)),
        }));
      },

      deletePersonFolder(personFolderId) {
        const passIds = new Set(
          get()
            .passes.filter((pass) => resolveItemPersonFolderId(pass) === personFolderId)
            .map((pass) => pass.passId),
        );
        if (passIds.size === 0) return;
        set((s) => ({
          passes: s.passes.filter((pass) => !passIds.has(pass.passId)),
          checkInEvents: s.checkInEvents.filter((event) => !passIds.has(event.passId)),
        }));
      },

      recordCheckIn(input) {
        const event = PassCheckInEventSchema.parse({
          eventId: mintCheckInEventId(),
          passId: input.passId,
          passToken: input.passToken,
          staffName: input.staffName,
          issuerId: input.issuerId,
          action: input.action,
          verifiedAt: new Date().toISOString(),
          createdAt: Date.now(),
        });
        set((s) => ({ checkInEvents: [event, ...s.checkInEvents] }));
        return event;
      },

      verifyGatePinAndCheckIn(pass, pin) {
        if (!isValidGatePinFormat(pin)) {
          return { ok: false, error: "Enter a 4-digit gate PIN." };
        }
        if (resolvePassVerifyBadge(pass) !== "VALID") {
          return { ok: false, error: "Pass is not valid for check-in." };
        }
        const expected = get().getFolderGatePin(resolvePassGatePinFolderId(pass), pass.issuerId);
        if (pin !== expected) {
          return { ok: false, error: "Incorrect gate PIN." };
        }
        const event = get().recordCheckIn({
          passId: pass.passId,
          passToken: pass.passToken,
          staffName: pass.guestName,
          issuerId: pass.issuerId,
          action: "check_in",
        });
        return { ok: true, event };
      },

      recordScanVerify(pass) {
        return get().recordCheckIn({
          passId: pass.passId,
          passToken: pass.passToken,
          staffName: pass.guestName,
          issuerId: pass.issuerId,
          action: "scan_verify",
        });
      },
    }),
    {
      name: "wm_mitra_labs_passes_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        passes: s.passes,
        activeFilter: s.activeFilter,
        gatePinByIssuer: s.gatePinByIssuer,
        gatePinByFolder: s.gatePinByFolder,
        checkInEvents: s.checkInEvents,
      }),
    },
  ),
);
