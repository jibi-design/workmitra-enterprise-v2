import { describe, expect, it } from "vitest";
import { hashEventDayPassToken, mintEventDayPassToken } from "./eventDay.crypto.js";
import { buildEventFolderId, resolvePassFolderId, toLocalDayKey } from "./eventDay.folders.js";
import { EVENT_DAY_API_PREFIX } from "./eventDay.routes.js";
import {
  createEventDayPassBodySchema,
  eventDayScannerTokenBodySchema,
  eventDayScannerUnlockBodySchema,
  putEventDayGatePinBodySchema,
} from "../../../validation/schemas/eventDay.schemas.js";

describe("employer Event Day API draft", () => {
  it("keeps the employer event-day prefix off Shift and Career", () => {
    expect(EVENT_DAY_API_PREFIX).toBe("/v1/jobmitra/employer/event-day");
    expect(EVENT_DAY_API_PREFIX).not.toContain("/shift");
    expect(EVENT_DAY_API_PREFIX).not.toContain("/career");
  });

  it("hashes pass tokens to 64-char hex and never equals the raw token", () => {
    const token = mintEventDayPassToken();
    const hashed = hashEventDayPassToken(token);
    expect(hashed).toMatch(/^[0-9a-f]{64}$/);
    expect(hashed).not.toBe(token);
    expect(hashEventDayPassToken(token)).toBe(hashed);
  });

  it("derives stable folder ids from issuer, names, and valid-from day", () => {
    const issuerId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const dateKey = toLocalDayKey("2026-08-17T14:45:00.000Z");
    expect(buildEventFolderId(issuerId, "Audit Open Day", "Audit Hall", dateKey)).toContain("audit-open-day");
    expect(
      resolvePassFolderId({
        passId: "p1",
        issuerId,
        eventName: "Audit Open Day",
        venueName: "Audit Hall",
        validFrom: "2026-08-17T14:45:00.000Z",
        status: "active",
      }),
    ).toBe(buildEventFolderId(issuerId, "Audit Open Day", "Audit Hall", dateKey));
  });

  it("rejects a non-4-digit PIN and accepts a future pass window", () => {
    expect(putEventDayGatePinBodySchema.safeParse({ pin: "12" }).success).toBe(false);
    expect(putEventDayGatePinBodySchema.safeParse({ pin: "1234" }).success).toBe(false);
    expect(
      putEventDayGatePinBodySchema.safeParse({ pin: "1234", folderId: "gf-issuer-open-day" }).success,
    ).toBe(true);
    const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const parsed = createEventDayPassBodySchema.safeParse({
      guestName: "Audit Guest",
      venueName: "Audit Hall",
      purpose: "event",
      validFrom: new Date().toISOString(),
      validUntil: until,
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts scanner unlock PIN and opaque consume token", () => {
    expect(eventDayScannerUnlockBodySchema.safeParse({ pin: "1234" }).success).toBe(false);
    expect(
      eventDayScannerUnlockBodySchema.safeParse({ pin: "1234", folderId: "gf-issuer-open-day" }).success,
    ).toBe(true);
    expect(eventDayScannerUnlockBodySchema.safeParse({ pin: "12" }).success).toBe(false);
    expect(eventDayScannerTokenBodySchema.safeParse({ token: "x".repeat(16) }).success).toBe(true);
    expect(eventDayScannerTokenBodySchema.safeParse({ token: "short" }).success).toBe(false);
  });
});
