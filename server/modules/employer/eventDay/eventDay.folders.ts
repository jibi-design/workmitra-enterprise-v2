/** Event Day report folders — derived from passes (same rules as device UI). */

export type EventDayPassForFolder = {
  readonly passId: string;
  readonly issuerId: string;
  readonly eventName?: string | null;
  readonly venueName: string;
  readonly validFrom: string;
  readonly status: string;
};

export type EventDayCheckInForFolder = {
  readonly eventId: string;
  readonly passId: string;
  readonly staffName: string;
  readonly action: string;
  readonly verifiedAt: string;
};

export type EventDayFolderCard = {
  readonly folderId: string;
  readonly eventName: string;
  readonly venueName: string;
  readonly dateKey: string;
  readonly dateLabel: string;
  readonly passCount: number;
  readonly checkInCount: number;
};

export type EventDayAttendanceRow = {
  readonly eventId: string;
  readonly staffName: string;
  readonly passId: string;
  readonly entryAt: string;
  readonly status: "PIN Confirmed";
};

export function toLocalDayKey(iso: string): string {
  const parsed = Date.parse(iso);
  const d = Number.isNaN(parsed) ? new Date() : new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function slugPart(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, 32) || "event";
}

export function resolvePassEventName(pass: EventDayPassForFolder): string {
  const named = pass.eventName?.trim();
  return named || pass.venueName.trim() || "Event";
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

export function resolvePassFolderId(pass: EventDayPassForFolder): string {
  return buildEventFolderId(
    pass.issuerId,
    resolvePassEventName(pass),
    pass.venueName,
    toLocalDayKey(pass.validFrom),
  );
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
  passes: readonly EventDayPassForFolder[],
  checkIns: readonly EventDayCheckInForFolder[],
): EventDayFolderCard[] {
  const active = passes.filter((pass) => pass.status !== "revoked");
  const groups = new Map<string, EventDayPassForFolder[]>();
  for (const pass of active) {
    const folderId = resolvePassFolderId(pass);
    const list = groups.get(folderId) ?? [];
    list.push(pass);
    groups.set(folderId, list);
  }

  const entered = checkIns.filter((event) => event.action === "check_in");
  const cards: EventDayFolderCard[] = [];
  for (const [folderId, group] of groups) {
    const first = group[0];
    if (!first) continue;
    const passIds = new Set(group.map((pass) => pass.passId));
    cards.push({
      folderId,
      eventName: resolvePassEventName(first),
      venueName: first.venueName,
      dateKey: toLocalDayKey(first.validFrom),
      dateLabel: formatDateLabel(toLocalDayKey(first.validFrom)),
      passCount: group.length,
      checkInCount: entered.filter((event) => passIds.has(event.passId)).length,
    });
  }

  return cards.sort(
    (a, b) => b.dateKey.localeCompare(a.dateKey) || a.eventName.localeCompare(b.eventName),
  );
}

export function buildFolderAttendanceRows(
  folderId: string,
  passes: readonly EventDayPassForFolder[],
  checkIns: readonly EventDayCheckInForFolder[],
): EventDayAttendanceRow[] {
  const passIds = new Set(
    passes.filter((pass) => resolvePassFolderId(pass) === folderId).map((pass) => pass.passId),
  );
  return checkIns
    .filter((event) => event.action === "check_in" && passIds.has(event.passId))
    .sort((a, b) => Date.parse(b.verifiedAt) - Date.parse(a.verifiedAt))
    .map((event) => ({
      eventId: event.eventId,
      staffName: event.staffName,
      passId: event.passId,
      entryAt: event.verifiedAt,
      status: "PIN Confirmed" as const,
    }));
}
