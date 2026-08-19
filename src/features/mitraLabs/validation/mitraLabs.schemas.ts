/**
 * Mitra Labs — Zod schemas for Digital Passes & QR style config.
 * Domain-isolated: no Shift / Career / HR coupling.
 */

import { z } from "zod";

export const PASS_PURPOSES = ["interview", "event", "venue", "generic"] as const;
export type PassPurpose = (typeof PASS_PURPOSES)[number];

export const PASS_STATUSES = ["draft", "active", "revoked", "expired"] as const;
export type PassStatus = (typeof PASS_STATUSES)[number];

export const ECC_LEVELS = ["M", "Q", "H"] as const;
export type EccLevel = (typeof ECC_LEVELS)[number];

export const LOGO_MAX_COVER_PCT = 20;

export const PassStyleConfigSchema = z.object({
  eccLevel: z.enum(ECC_LEVELS),
  logoMaxCoverPct: z.number().min(0).max(LOGO_MAX_COVER_PCT),
  paletteId: z.string().min(1).max(64),
});

export type PassStyleConfig = z.infer<typeof PassStyleConfigSchema>;

export const VenueSchema = z.object({
  name: z.string().min(1).max(160),
  siteId: z.string().max(128).optional(),
  address: z.string().max(240).optional(),
});

export type VenueInfo = z.infer<typeof VenueSchema>;

export const CreatePassSchema = z
  .object({
    passId: z.string().min(1).max(128),
    issuerId: z.string().min(1).max(128),
    guestName: z.string().min(1).max(120),
    guestContact: z.string().max(160).optional(),
    candidateRef: z.string().max(128).optional(),
    eventName: z.string().max(160).optional(),
    venue: VenueSchema,
    purpose: z.enum(PASS_PURPOSES),
    validFrom: z.string().min(10).max(40),
    validUntil: z.string().min(10).max(40),
    passToken: z.string().min(16).max(256),
    status: z.enum(PASS_STATUSES),
    style: PassStyleConfigSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const fromMs = Date.parse(data.validFrom);
    const untilMs = Date.parse(data.validUntil);
    if (!Number.isFinite(fromMs)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validFrom must be a valid ISO datetime",
        path: ["validFrom"],
      });
    }
    if (!Number.isFinite(untilMs)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validUntil must be a valid ISO datetime",
        path: ["validUntil"],
      });
      return;
    }
    if (Number.isFinite(fromMs) && untilMs <= fromMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validUntil must be after validFrom",
        path: ["validUntil"],
      });
    }
    if (untilMs <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validUntil must be in the future at creation time",
        path: ["validUntil"],
      });
    }
  });

export type CreatePassInput = z.infer<typeof CreatePassSchema>;

/** Form input before server-side ids/tokens are minted. */
export const CreatePassFormSchema = z
  .object({
    issuerId: z.string().min(1).max(128),
    guestName: z.string().min(1).max(120),
    guestContact: z.string().max(160).optional(),
    candidateRef: z.string().max(128).optional(),
    eventName: z.string().max(160).optional(),
    venue: VenueSchema,
    purpose: z.enum(PASS_PURPOSES),
    validFrom: z.string().min(10).max(40),
    validUntil: z.string().min(10).max(40),
    style: PassStyleConfigSchema.optional(),
  })
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
        message: "validUntil must be in the future at creation time",
        path: ["validUntil"],
      });
    }
  });

export type CreatePassFormInput = z.infer<typeof CreatePassFormSchema>;

export const GATE_PIN_LENGTH = 4;

export const GatePinSchema = z
  .string()
  .regex(/^\d{4}$/, "Gate PIN must be exactly 4 digits");

export type GatePin = z.infer<typeof GatePinSchema>;

export const PASS_CHECK_IN_ACTIONS = ["check_in", "mark_entry", "scan_verify"] as const;
export type PassCheckInAction = (typeof PASS_CHECK_IN_ACTIONS)[number];

export const PassCheckInEventSchema = z.object({
  eventId: z.string().min(1).max(128),
  passId: z.string().min(1).max(128),
  passToken: z.string().min(16).max(256),
  staffName: z.string().min(1).max(120),
  issuerId: z.string().min(1).max(128),
  action: z.enum(PASS_CHECK_IN_ACTIONS),
  verifiedAt: z.string().min(10).max(40),
  createdAt: z.number().int().nonnegative(),
});

export type PassCheckInEvent = z.infer<typeof PassCheckInEventSchema>;
