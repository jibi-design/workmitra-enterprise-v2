import { describe, expect, it } from "vitest";
import { listGatePinFolders, resolvePassGatePinFolderId } from "./eventDayGatePinFolders.helpers";

describe("eventDayGatePinFolders.helpers", () => {
  it("labels folders with venue, event name, and date like pass folders", () => {
    const issuerId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const openHall = {
      issuerId,
      eventName: "Open Day",
      venue: { name: "Audit Hall" },
      validFrom: "2026-08-17T10:00:00.000Z",
    };
    const gala = {
      issuerId,
      eventName: "Gala",
      venue: { name: "Atrium" },
      validFrom: "2026-08-18T18:00:00.000Z",
    };
    expect(resolvePassGatePinFolderId(openHall)).not.toBe(resolvePassGatePinFolderId(gala));
    const folders = listGatePinFolders(issuerId, [openHall, openHall, gala]);
    expect(folders).toHaveLength(2);
    const hall = folders.find((row) => row.venueName === "Audit Hall");
    expect(hall?.eventName).toBe("Open Day");
    expect(hall?.passCount).toBe(2);
    expect(hall?.dateLabel).toMatch(/2026/);
  });

  it("creates a separate folder when venue name changes", () => {
    const issuerId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const hall = {
      issuerId,
      eventName: "Open Day",
      venue: { name: "Audit Hall" },
      validFrom: "2026-08-17T10:00:00.000Z",
    };
    const garden = {
      issuerId,
      eventName: "Open Day",
      venue: { name: "Garden Gate" },
      validFrom: "2026-08-17T10:00:00.000Z",
    };
    const folders = listGatePinFolders(issuerId, [hall, garden]);
    expect(folders).toHaveLength(2);
    expect(folders.map((row) => row.venueName).sort()).toEqual(["Audit Hall", "Garden Gate"]);
  });
});
