/** Event Day report folders — derived from issued passes (device-local). */

import type { PassCheckInEvent } from "../validation/mitraLabs.schemas";
import { isPinVerifiedCheckIn, toLocalDayKey } from "./eventDayReport.helpers";

type PassForFolder = {
  readonly passId: string;
  readonly issuerId: string;
  readonly guestName?: string;
  readonly eventName?: string;
  readonly venue: { readonly name: string };
  readonly validFrom: string;
  readonly status: string;
};

export const EVENT_FOLDER_DELETE_WARNING =
  "⚠️ Are you sure you want to delete this event folder? All attendance records and logs for this event will be permanently removed.";

export const VENUE_FOLDER_DELETE_WARNING =
  "⚠️ Delete this venue folder? Every guest and staff QR inside this venue will be removed.";

export const PERSON_FOLDER_DELETE_WARNING =
  "⚠️ Delete this person’s folder? Their QR codes in this venue will be removed.";

export type EventFolderCard = {
  readonly folderId: string;
  readonly eventName: string;
  readonly venueName: string;
  readonly dateKey: string;
  readonly dateLabel: string;
  readonly passCount: number;
  readonly checkInCount: number;
};

export type EventFolderAttendanceRow = {
  readonly eventId: string;
  readonly staffName: string;
  readonly passId: string;
  readonly entryAt: string;
  readonly status: "PIN Confirmed";
};

function slugPart(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, 32) || "event";
}

export function resolvePassEventName(pass: PassForFolder): string {
  const named = pass.eventName?.trim();
  return named || pass.venue.name.trim() || "Event";
}

export function buildEventFolderId(
  issuerId: string,
  eventName: string,
  venueName: string,
  dateKey: string,
): string {
  const issuer = issuerId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "issuer";
  return `ef-${issuer}-${slugPart(eventName)}-${slugPart(venueName)}-${dateKey}`;
}

export function resolvePassFolderId(pass: PassForFolder): string {
  return buildEventFolderId(
    pass.issuerId,
    resolvePassEventName(pass),
    pass.venue.name,
    toLocalDayKey(pass.validFrom),
  );
}

export function resolvePassVenueFolderId(pass: PassForFolder): string {
  const issuer = pass.issuerId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "issuer";
  return `vf-${issuer}-${slugPart(pass.venue.name.trim() || "venue")}`;
}

function formatCompactDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  if (!y || !m || !d) return dateKey;
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatFolderDateSpan(items: readonly PassForFolder[]): string {
  const keys = [...new Set(items.map((item) => toLocalDayKey(item.validFrom)))].sort();
  if (keys.length === 0) return "";
  const start = formatCompactDate(keys[0] ?? "");
  const endKey = keys[keys.length - 1];
  if (!endKey || keys.length === 1) return start;
  return `${start} – ${formatCompactDate(endKey)}`;
}

export function formatFolderEventLabel(items: readonly PassForFolder[]): string {
  const names = [...new Set(items.map((item) => resolvePassEventName(item)))];
  if (names.length <= 1) return names[0] ?? "Event";
  return `${names.length} events`;
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  if (!y || !m || !d) return dateKey;
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildEventFolderCards(
  passes: readonly PassForFolder[],
  checkIns: readonly PassCheckInEvent[],
): EventFolderCard[] {
  const active = passes.filter((pass) => pass.status !== "revoked");
  const groups = new Map<string, PassForFolder[]>();
  for (const pass of active) {
    const folderId = resolvePassFolderId(pass);
    const list = groups.get(folderId) ?? [];
    list.push(pass);
    groups.set(folderId, list);
  }

  const entered = checkIns.filter(isPinVerifiedCheckIn);
  const cards: EventFolderCard[] = [];
  for (const [folderId, group] of groups) {
    const first = group[0];
    if (!first) continue;
    const passIds = new Set(group.map((pass) => pass.passId));
    const checkInCount = entered.filter((event) => passIds.has(event.passId)).length;
    const dateKey = toLocalDayKey(first.validFrom);
    cards.push({
      folderId,
      eventName: resolvePassEventName(first),
      venueName: first.venue.name,
      dateKey,
      dateLabel: formatDateLabel(dateKey),
      passCount: group.length,
      checkInCount,
    });
  }

  return cards.sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.eventName.localeCompare(b.eventName));
}

export type EventFolderBundle<T extends PassForFolder> = {
  readonly folder: EventFolderCard;
  readonly items: readonly T[];
};

export function bundleItemsByEventFolder<T extends PassForFolder>(
  items: readonly T[],
  checkIns: readonly PassCheckInEvent[] = [],
): EventFolderBundle<T>[] {
  const cards = buildEventFolderCards(items, checkIns);
  return cards.map((folder) => ({
    folder,
    items: items.filter(
      (item) => item.status !== "revoked" && resolvePassFolderId(item) === folder.folderId,
    ),
  }));
}

export function resolvePersonName(item: Pick<PassForFolder, "guestName">): string {
  return item.guestName?.trim() || "Guest";
}

export function resolveItemPersonFolderId<T extends PassForFolder>(item: T): string {
  return `${resolvePassVenueFolderId(item)}::p-${slugPart(resolvePersonName(item))}`;
}

export type PersonFolderBundle<T> = {
  readonly personFolderId: string;
  readonly personName: string;
  readonly eventLabel: string;
  readonly dateLabel: string;
  readonly items: readonly T[];
};

export type NestedEventFolderBundle<T> = {
  readonly folder: EventFolderCard;
  readonly people: readonly PersonFolderBundle<T>[];
};

export function bundleItemsByVenueThenPerson<T extends PassForFolder>(
  items: readonly T[],
  checkIns: readonly PassCheckInEvent[] = [],
): NestedEventFolderBundle<T>[] {
  const active = items.filter((item) => item.status !== "revoked");
  const byVenue = new Map<string, T[]>();
  for (const item of active) {
    const folderId = resolvePassVenueFolderId(item);
    const list = byVenue.get(folderId) ?? [];
    list.push(item);
    byVenue.set(folderId, list);
  }

  const entered = checkIns.filter(isPinVerifiedCheckIn);
  const nested: NestedEventFolderBundle<T>[] = [];
  for (const [folderId, group] of byVenue) {
    const first = group[0];
    if (!first) continue;
    const passIds = new Set(group.map((item) => item.passId));
    const dateKeys = [...new Set(group.map((item) => toLocalDayKey(item.validFrom)))].sort();
    const dateKey = dateKeys[0] ?? toLocalDayKey(first.validFrom);
    const peopleGroups = new Map<string, T[]>();
    for (const item of group) {
      const personFolderId = resolveItemPersonFolderId(item);
      const list = peopleGroups.get(personFolderId) ?? [];
      list.push(item);
      peopleGroups.set(personFolderId, list);
    }
    const people: PersonFolderBundle<T>[] = [...peopleGroups.entries()]
      .map(([personFolderId, personItems]) => ({
        personFolderId,
        personName: resolvePersonName(personItems[0] ?? { guestName: "Guest" }),
        eventLabel: formatFolderEventLabel(personItems),
        dateLabel: formatFolderDateSpan(personItems),
        items: personItems,
      }))
      .sort((a, b) => a.personName.localeCompare(b.personName));
    nested.push({
      folder: {
        folderId,
        eventName: formatFolderEventLabel(group),
        venueName: first.venue.name.trim() || "Venue",
        dateKey,
        dateLabel: formatFolderDateSpan(group),
        passCount: group.length,
        checkInCount: entered.filter((event) => passIds.has(event.passId)).length,
      },
      people,
    });
  }

  return nested.sort((a, b) => a.folder.venueName.localeCompare(b.folder.venueName));
}

export function buildFolderAttendanceRows(
  folderId: string,
  passes: readonly PassForFolder[],
  checkIns: readonly PassCheckInEvent[],
): EventFolderAttendanceRow[] {
  const passIds = new Set(
    passes.filter((pass) => resolvePassFolderId(pass) === folderId).map((pass) => pass.passId),
  );
  return checkIns
    .filter((event) => isPinVerifiedCheckIn(event) && passIds.has(event.passId))
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((event) => ({
      eventId: event.eventId,
      staffName: event.staffName,
      passId: event.passId,
      entryAt: event.verifiedAt,
      status: "PIN Confirmed" as const,
    }));
}

export function findEventFolderCard(
  folderId: string,
  cards: readonly EventFolderCard[],
): EventFolderCard | undefined {
  return cards.find((card) => card.folderId === folderId);
}
