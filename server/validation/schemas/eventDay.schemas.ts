/** Defense Layer 4 — Employer Event Day body/params. */

import { z } from "zod";

export const eventDayPurposeSchema = z.enum(["interview", "event", "venue", "generic"]);

export const eventDayPassIdParamsSchema = z.object({
  passId: z.string().uuid(),
});

export const eventDayFolderIdParamsSchema = z.object({
  folderId: z.string().min(8).max(160),
});

export const createEventDayPassBodySchema = z
  .object({
    guestName: z.string().min(1).max(120),
    candidateRef: z.string().max(128).optional(),
    eventName: z.string().max(160).optional(),
    venueName: z.string().min(1).max(160),
    venueAddress: z.string().max(240).optional(),
    purpose: eventDayPurposeSchema,
    validFrom: z.string().min(10).max(40),
    validUntil: z.string().min(10).max(40),
  })
  .strict()
  .superRefine((data, ctx) => {
    const fromMs = Date.parse(data.validFrom);
    const untilMs = Date.parse(data.validUntil);
    if (!Number.isFinite(fromMs) || !Number.isFinite(untilMs)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Validity window must use ISO datetimes",
        path: ["validUntil"],
      });
      return;
    }
    if (untilMs <= fromMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validUntil must be after validFrom",
        path: ["validUntil"],
      });
    }
    if (untilMs <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validUntil must be in the future",
        path: ["validUntil"],
      });
    }
  });

export const putEventDayGatePinBodySchema = z
  .object({
    pin: z.string().regex(/^\d{4}$/, "Gate PIN must be exactly 4 digits"),
    folderId: z.string().min(8).max(160),
  })
  .strict();

export const eventDayScanVerifyBodySchema = z
  .object({
    passId: z.string().uuid(),
    deviceId: z.string().max(128).optional(),
  })
  .strict();

export const eventDayPublicTokenParamsSchema = z.object({
  token: z.string().min(16).max(256),
});

export const eventDayPublicCheckInBodySchema = z
  .object({
    token: z.string().min(16).max(256),
    pin: z.string().regex(/^\d{4}$/, "Gate PIN must be exactly 4 digits"),
  })
  .strict();

export const eventDayScannerUnlockBodySchema = z
  .object({
    pin: z.string().regex(/^\d{4}$/, "Gate PIN must be exactly 4 digits"),
    folderId: z.string().min(8).max(160),
  })
  .strict();

export const eventDayScannerTokenBodySchema = z
  .object({
    token: z.string().min(16).max(256),
    folderId: z.string().min(8).max(160).optional(),
  })
  .strict();

export type CreateEventDayPassBody = z.infer<typeof createEventDayPassBodySchema>;
export type PutEventDayGatePinBody = z.infer<typeof putEventDayGatePinBodySchema>;
export type EventDayScanVerifyBody = z.infer<typeof eventDayScanVerifyBodySchema>;
export type EventDayPublicCheckInBody = z.infer<typeof eventDayPublicCheckInBodySchema>;
