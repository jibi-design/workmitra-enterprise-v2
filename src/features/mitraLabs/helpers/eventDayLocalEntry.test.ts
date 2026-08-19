import { describe, expect, it } from "vitest";
import {
  consumeLocalStaffScan,
  isLocalPassEntered,
  lookupLocalStaffScan,
} from "./eventDayLocalEntry";
import { useMitraLabsStore } from "../storage/mitraLabs.storage";

describe("eventDayLocalEntry", () => {
  it("consumes a valid pass once and then reports USED", () => {
    const store = useMitraLabsStore.getState();
    const pass = store.createPass({
      issuerId: "issuer_staff_consume",
      guestName: "Scan Guest",
      venue: { name: "Hall" },
      purpose: "event",
      validFrom: new Date(Date.now() - 60_000).toISOString(),
      validUntil: new Date(Date.now() + 3600_000).toISOString(),
    });
    expect(lookupLocalStaffScan(pass.passToken).badge).toBe("VALID");
    expect(consumeLocalStaffScan(pass, "Gate staff")).toEqual({ ok: true });
    expect(isLocalPassEntered(pass.passId)).toBe(true);
    expect(lookupLocalStaffScan(pass.passToken).badge).toBe("USED");
    expect(consumeLocalStaffScan(pass, "Gate staff")).toEqual({ ok: false, badge: "USED" });
  });
});
