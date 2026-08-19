/** Event Day — LocalStorage cache / offline queue. SoT remains the public API. Never store PIN. */

import { ApiRequestError } from "../../../shared/services/apiService";
import { resolvePassVerifyBadge, type PassVerifyBadge } from "../helpers/mitraLabs.helpers";
import type { DigitalPassRecord } from "../storage/mitraLabs.storage";
import type { PassStatus } from "../validation/mitraLabs.schemas";

export type PublicVerifyPassFields = {
  readonly guestName: string;
  readonly venue: { readonly name: string; readonly address?: string };
  readonly purpose: string;
  readonly validFrom: string;
  readonly validUntil: string;
  readonly status: PassStatus;
};

export const EVENT_DAY_CHECKIN_QUEUE_KEY = "wm_event_day_checkin_queue_v1";

export type OfflineCheckInQueueItem = {
  readonly token: string;
  readonly queuedAt: string;
};

export function isEventDayCloudUnavailable(error: unknown): boolean {
  if (error instanceof ApiRequestError) {
    return (
      error.code === "EVENT_DAY_STORE_NOT_READY" ||
      error.status === 503 ||
      error.status >= 500
    );
  }
  if (error instanceof TypeError) return true;
  if (error instanceof Error) {
    return /failed to fetch|networkerror|load failed/i.test(error.message);
  }
  return false;
}

export function toPublicFieldsFromLocal(pass: DigitalPassRecord): PublicVerifyPassFields {
  return {
    guestName: pass.guestName,
    venue: { name: pass.venue.name, address: pass.venue.address },
    purpose: pass.purpose,
    validFrom: pass.validFrom,
    validUntil: pass.validUntil,
    status: pass.status,
  };
}

export function localPassLookup(
  token: string,
  getPassByToken: (token: string) => DigitalPassRecord | undefined,
): { badge: PassVerifyBadge; pass: PublicVerifyPassFields } | null {
  const record = getPassByToken(token);
  if (!record) return null;
  return {
    badge: resolvePassVerifyBadge(record),
    pass: toPublicFieldsFromLocal(record),
  };
}

function readQueue(): OfflineCheckInQueueItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENT_DAY_CHECKIN_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is OfflineCheckInQueueItem => {
      return (
        typeof row === "object" &&
        row !== null &&
        typeof (row as OfflineCheckInQueueItem).token === "string" &&
        typeof (row as OfflineCheckInQueueItem).queuedAt === "string"
      );
    });
  } catch {
    return [];
  }
}

function writeQueue(items: readonly OfflineCheckInQueueItem[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(EVENT_DAY_CHECKIN_QUEUE_KEY, JSON.stringify(items));
}

export function enqueueOfflineCheckIn(token: string): void {
  const next = readQueue().filter((row) => row.token !== token);
  next.unshift({ token, queuedAt: new Date().toISOString() });
  writeQueue(next.slice(0, 50));
}

export function dequeueOfflineCheckIn(token: string): void {
  writeQueue(readQueue().filter((row) => row.token !== token));
}

export function hasOfflineCheckInQueued(token: string): boolean {
  return readQueue().some((row) => row.token === token);
}
