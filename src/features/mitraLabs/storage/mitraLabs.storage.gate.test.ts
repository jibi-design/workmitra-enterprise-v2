import { describe, expect, it } from "vitest";
import { resolvePassFolderId } from "../helpers/eventDayFolders.helpers";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";

describe("mitraLabs.storage gate check-in", () => {
  it("records check-in when gate PIN matches", () => {
    const store = useMitraLabsStore.getState();
    const pass = store.createPass({
      issuerId: "issuer_gate_test",
      guestName: "Gate Guest",
      venue: { name: "Lobby" },
      purpose: "event",
      validFrom: new Date(Date.now() - 60_000).toISOString(),
      validUntil: new Date(Date.now() + 60_000).toISOString(),
    });

    store.setGatePin(pass.issuerId, "4321");
    const result = store.verifyGatePinAndCheckIn(pass, "4321");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.staffName).toBe("Gate Guest");
      expect(result.event.action).toBe("check_in");
    }
    expect(useMitraLabsStore.getState().checkInEvents[0]?.passId).toBe(pass.passId);
  });

  it("rejects incorrect gate PIN", () => {
    const store = useMitraLabsStore.getState();
    const pass = store.createPass({
      issuerId: "issuer_gate_fail",
      guestName: "Wrong Pin Guest",
      venue: { name: "Lobby" },
      purpose: "event",
      validFrom: new Date(Date.now() - 60_000).toISOString(),
      validUntil: new Date(Date.now() + 3600_000).toISOString(),
    });

    store.setGatePin(pass.issuerId, "1111");
    const result = store.verifyGatePinAndCheckIn(pass, "9999");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Incorrect gate PIN");
    }
  });

  it("resets one event folder PIN without changing another", () => {
    const store = useMitraLabsStore.getState();
    store.setFolderGatePin("gf-a-open", "1111");
    store.setFolderGatePin("gf-a-gala", "2222");
    const next = store.resetFolderGatePin("gf-a-open");
    expect(next).toMatch(/^\d{4}$/);
    expect(store.getFolderGatePin("gf-a-open", "issuer_x")).toBe(next);
    expect(store.getFolderGatePin("gf-a-gala", "issuer_x")).toBe("2222");
  });

  it("filters audit events by issuer", () => {
    const store = useMitraLabsStore.getState();
    const pass = store.createPass({
      issuerId: "issuer_audit_a",
      guestName: "Audit Guest",
      venue: { name: "Hall" },
      purpose: "event",
      validFrom: new Date(Date.now() - 60_000).toISOString(),
      validUntil: new Date(Date.now() + 3600_000).toISOString(),
    });
    store.setGatePin(pass.issuerId, "4321");
    store.verifyGatePinAndCheckIn(pass, "4321");
    const events = store.getCheckInEventsByIssuer("issuer_audit_a");
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]?.staffName).toBe("Audit Guest");
  });

  it("deletes an event folder and purges its attendance logs", () => {
    const store = useMitraLabsStore.getState();
    const pass = store.createPass({
      issuerId: "issuer_folder_del",
      guestName: "Folder Guest",
      eventName: "Gala",
      venue: { name: "Atrium" },
      purpose: "event",
      validFrom: new Date(Date.now() - 60_000).toISOString(),
      validUntil: new Date(Date.now() + 3600_000).toISOString(),
    });
    store.setGatePin(pass.issuerId, "4321");
    store.verifyGatePinAndCheckIn(pass, "4321");
    const folderId = resolvePassFolderId(pass);
    store.deleteEventFolder(folderId);
    const next = useMitraLabsStore.getState();
    expect(next.passes.some((row) => row.passId === pass.passId)).toBe(false);
    expect(next.checkInEvents.some((row) => row.passId === pass.passId)).toBe(false);
  });
});
