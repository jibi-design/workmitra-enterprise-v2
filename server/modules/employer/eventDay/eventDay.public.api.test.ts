import { describe, expect, it } from "vitest";
import { hashEventDayPassToken, mintEventDayPassToken } from "./eventDay.crypto.js";
import { resolvePublicPassBadge } from "./eventDay.badge.js";
import { PUBLIC_EVENT_DAY_API_PREFIX } from "./eventDay.public.routes.js";
import { publicPassViewHasSecrets, toPublicPassView } from "./eventDay.public.view.js";
import { isUniqueViolationError } from "./eventDay.errors.js";
import {
  eventDayPublicCheckInBodySchema,
  eventDayPublicTokenParamsSchema,
} from "../../../validation/schemas/eventDay.schemas.js";
import type { EventDayPassRow } from "./eventDay.repository.js";

const samplePass: EventDayPassRow = {
  passId: "11111111-1111-4111-8111-111111111111",
  issuerId: "22222222-2222-4222-8222-222222222222",
  guestName: "Audit Guest",
  candidateRef: "secret-ref",
  eventName: "Audit Open Day",
  venueName: "Audit Hall",
  venueAddress: "hidden",
  purpose: "event",
  validFrom: new Date(Date.now() - 60_000).toISOString(),
  validUntil: new Date(Date.now() + 60_000).toISOString(),
  status: "active",
  entered: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("public Event Day API draft", () => {
  it("keeps the public event-day prefix off Shift, Career, and employer auth", () => {
    expect(PUBLIC_EVENT_DAY_API_PREFIX).toBe("/v1/jobmitra/public/event-day");
    expect(PUBLIC_EVENT_DAY_API_PREFIX).not.toContain("/shift");
    expect(PUBLIC_EVENT_DAY_API_PREFIX).not.toContain("/career");
    expect(PUBLIC_EVENT_DAY_API_PREFIX).not.toContain("/employer");
  });

  it("looks up passes by SHA-256 token hash shape", () => {
    const token = mintEventDayPassToken();
    expect(hashEventDayPassToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(eventDayPublicTokenParamsSchema.safeParse({ token }).success).toBe(true);
    expect(eventDayPublicTokenParamsSchema.safeParse({ token: "short" }).success).toBe(false);
  });

  it("returns door fields without contact, PIN, hashes, or candidate ref", () => {
    const view = toPublicPassView(samplePass);
    expect(view.badge).toBe("VALID");
    expect(view.guestName).toBe("Audit Guest");
    expect(view.venueName).toBe("Audit Hall");
    expect(publicPassViewHasSecrets(view)).toBe(false);
    expect(JSON.stringify(view)).not.toMatch(/pin|tokenHash|candidateRef|issuerId|passId/i);
  });

  it("maps unique PIN entry collisions to 23505 detection", () => {
    expect(isUniqueViolationError({ code: "23505" })).toBe(true);
    expect(isUniqueViolationError({ code: "42P01" })).toBe(false);
    expect(resolvePublicPassBadge({ ...samplePass, status: "revoked" })).toBe("REVOKED");
    expect(resolvePublicPassBadge({ ...samplePass, entered: true })).toBe("USED");
    expect(eventDayPublicCheckInBodySchema.safeParse({ token: "x".repeat(16), pin: "12" }).success).toBe(
      false,
    );
    expect(
      eventDayPublicCheckInBodySchema.safeParse({
        token: mintEventDayPassToken(),
        pin: "1234",
      }).success,
    ).toBe(true);
  });
});
