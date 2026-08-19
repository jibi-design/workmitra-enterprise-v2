import { describe, expect, it } from "vitest";
import {
  buildEventFolderCards,
  buildFolderAttendanceRows,
  bundleItemsByEventFolder,
  bundleItemsByVenueThenPerson,
  resolvePassFolderId,
} from "./eventDayFolders.helpers";

const basePass = {
  passId: "p1",
  issuerId: "er1",
  eventName: "Open Day",
  venue: { name: "Main Hall" },
  validFrom: new Date(2026, 7, 17, 9, 0, 0).toISOString(),
  status: "active",
};

describe("eventDayFolders.helpers", () => {
  it("groups same event name, venue, and date into one folder", () => {
    const second = { ...basePass, passId: "p2" };
    const cards = buildEventFolderCards([basePass, second], []);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.eventName).toBe("Open Day");
    expect(cards[0]?.passCount).toBe(2);
    expect(cards[0]?.folderId).toBe(resolvePassFolderId(basePass));
  });

  it("splits folders when the event date differs", () => {
    const later = {
      ...basePass,
      passId: "p2",
      validFrom: new Date(2026, 7, 18, 9, 0, 0).toISOString(),
    };
    const cards = buildEventFolderCards([basePass, later], []);
    expect(cards).toHaveLength(2);
  });

  it("bundles pass items under the same in-page folder", () => {
    const second = { ...basePass, passId: "p2" };
    const bundles = bundleItemsByEventFolder([basePass, second]);
    expect(bundles).toHaveLength(1);
    expect(bundles[0]?.items).toHaveLength(2);
  });

  it("nests a guest folder under the venue folder", () => {
    const asf = { ...basePass, passId: "p1", guestName: "ASF" };
    const other = { ...basePass, passId: "p2", guestName: "Priya" };
    const nested = bundleItemsByVenueThenPerson([asf, other]);
    expect(nested).toHaveLength(1);
    expect(nested[0]?.folder.venueName).toBe("Main Hall");
    expect(nested[0]?.folder.eventName).toBe("Open Day");
    expect(nested[0]?.folder.dateLabel).toMatch(/17/);
    expect(nested[0]?.people[0]?.eventLabel).toBe("Open Day");
    expect(nested[0]?.people.map((row) => row.personName)).toEqual(["ASF", "Priya"]);
    expect(nested[0]?.people[0]?.items).toHaveLength(1);
  });

  it("keeps one venue folder when event names differ", () => {
    const first = { ...basePass, passId: "p1", guestName: "ASF", eventName: "Open Day" };
    const second = { ...basePass, passId: "p2", guestName: "ASF", eventName: "Night Shift" };
    const nested = bundleItemsByVenueThenPerson([first, second]);
    expect(nested).toHaveLength(1);
    expect(nested[0]?.folder.venueName).toBe("Main Hall");
    expect(nested[0]?.folder.eventName).toBe("2 events");
    expect(nested[0]?.people).toHaveLength(1);
    expect(nested[0]?.people[0]?.items).toHaveLength(2);
  });

  it("counts only PIN check_in rows inside a folder", () => {
    const folderId = resolvePassFolderId(basePass);
    const rows = buildFolderAttendanceRows(
      folderId,
      [basePass],
      [
        {
          eventId: "e1",
          passId: "p1",
          passToken: "token_abcdefghijklmn",
          staffName: "Ada",
          issuerId: "er1",
          action: "check_in",
          verifiedAt: new Date(2026, 7, 17, 10, 0, 0).toISOString(),
          createdAt: 2,
        },
        {
          eventId: "e2",
          passId: "p1",
          passToken: "token_abcdefghijklmn",
          staffName: "Ada",
          issuerId: "er1",
          action: "scan_verify",
          verifiedAt: new Date(2026, 7, 17, 10, 5, 0).toISOString(),
          createdAt: 1,
        },
      ],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("PIN Confirmed");
  });
});
