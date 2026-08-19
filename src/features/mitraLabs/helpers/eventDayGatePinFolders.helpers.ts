/** Security Gate PIN folders — same venue / event / date labels as pass folders. */

import {
  formatFolderDateSpan,
  resolvePassEventName,
  resolvePassFolderId,
} from "./eventDayFolders.helpers";

export type GatePinFolderCard = {
  readonly folderId: string;
  readonly eventName: string;
  readonly venueName: string;
  readonly dateLabel: string;
  readonly passCount: number;
};

type PassForPinFolder = {
  readonly issuerId: string;
  readonly eventName?: string | null;
  readonly venue: { readonly name: string };
  readonly validFrom: string;
};

export function resolvePassGatePinFolderId(pass: PassForPinFolder & { readonly passId?: string }): string {
  return resolvePassFolderId({
    passId: pass.passId ?? "pin",
    issuerId: pass.issuerId,
    eventName: pass.eventName ?? undefined,
    venue: pass.venue,
    validFrom: pass.validFrom,
    status: "active",
  });
}

export function listGatePinFolders(
  issuerId: string,
  passes: readonly PassForPinFolder[],
): GatePinFolderCard[] {
  const groups = new Map<string, PassForPinFolder[]>();
  for (const pass of passes) {
    if (pass.issuerId !== issuerId) continue;
    const folderId = resolvePassGatePinFolderId(pass);
    const list = groups.get(folderId) ?? [];
    list.push(pass);
    groups.set(folderId, list);
  }
  const cards: GatePinFolderCard[] = [];
  for (const [folderId, group] of groups) {
    const first = group[0];
    if (!first) continue;
    cards.push({
      folderId,
      eventName: resolvePassEventName({
        passId: "pin",
        issuerId: first.issuerId,
        eventName: first.eventName ?? undefined,
        venue: first.venue,
        validFrom: first.validFrom,
        status: "active",
      }),
      venueName: first.venue.name.trim() || "Venue",
      dateLabel: formatFolderDateSpan(
        group.map((item) => ({
          passId: "pin",
          issuerId: item.issuerId,
          eventName: item.eventName ?? undefined,
          venue: item.venue,
          validFrom: item.validFrom,
          status: "active",
        })),
      ),
      passCount: group.length,
    });
  }
  return cards.sort((a, b) => {
    const venue = a.venueName.localeCompare(b.venueName);
    if (venue !== 0) return venue;
    return a.eventName.localeCompare(b.eventName);
  });
}
