/**
 * Defense Layer 4 — Shift domain Zod schemas (employer + employee).
 * Unknown keys are stripped (Zod object default) to block mass assignment.
 */

import { z } from "zod";
import { sanitizeUserText } from "../sanitizeText.js";

const uuid = z.uuid();

const sanitizedText = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform((v) => sanitizeUserText(v, max));

/** Optional free-text map for details — values sanitized, unknown nested keys kept as strings only. */
const detailsSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .transform((rec) => {
    if (!rec) return {};
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rec)) {
      if (typeof value === "string") {
        out[key] = sanitizeUserText(value, 4000);
      } else if (typeof value === "number" || typeof value === "boolean" || value === null) {
        out[key] = value;
      }
      // drop nested objects/arrays from details (anti pollution)
    }
    return out;
  });

export const shiftPostIdParamsSchema = z.object({
  postId: uuid,
});

export const shiftConfirmParamsSchema = z.object({
  postId: uuid,
  appId: uuid,
});

export const createShiftPostBodySchema = z.object({
  job_name: sanitizedText(200).optional(),
  jobName: sanitizedText(200).optional(),
  category: sanitizedText(80).optional(),
  vacancies: z.number().int().min(1).max(500),
  start_at: z.union([z.string().min(1).max(64), z.number()]).optional(),
  startAt: z.union([z.string().min(1).max(64), z.number()]).optional(),
  end_at: z.union([z.string().min(1).max(64), z.number()]).optional(),
  endAt: z.union([z.string().min(1).max(64), z.number()]).optional(),
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  details: detailsSchema,
});

export const updateShiftPostBodySchema = z.object({
  job_name: sanitizedText(200).optional(),
  jobName: sanitizedText(200).optional(),
  category: sanitizedText(80).optional(),
  vacancies: z.number().int().min(1).max(500).optional(),
  start_at: z.union([z.string().min(1).max(64), z.number()]).optional(),
  startAt: z.union([z.string().min(1).max(64), z.number()]).optional(),
  end_at: z.union([z.string().min(1).max(64), z.number()]).optional(),
  endAt: z.union([z.string().min(1).max(64), z.number()]).optional(),
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  details: detailsSchema,
});

export const directInviteCreateBodySchema = z.object({
  worker_wm_id: z.string().min(1).max(128).optional(),
  workerWmId: z.string().min(1).max(128).optional(),
});

export const confirmShiftBodySchema = z.object({
  worker_wm_id: z.string().min(1).max(128).optional(),
  workerWmId: z.string().min(1).max(128).optional(),
});

export const applyShiftBodySchema = z.object({
  worker_wm_id: z.string().min(1).max(128).optional(),
  workerWmId: z.string().min(1).max(128).optional(),
  details: detailsSchema,
});

export const directAcceptBodySchema = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
    const o = raw as Record<string, unknown>;
    const snake = typeof o.invite_token === "string" ? o.invite_token.trim() : "";
    const camel = typeof o.inviteToken === "string" ? o.inviteToken.trim() : "";
    return { ...o, invite_token: snake || camel };
  },
  z.object({
    invite_id: z.string().min(1).max(128).optional(),
    inviteId: z.string().min(1).max(128).optional(),
    /** Strictly required after alias normalization from inviteToken. */
    invite_token: z.string().min(1).max(512),
    inviteToken: z.string().min(1).max(512).optional(),
    worker_wm_id: z.string().min(1).max(128).optional(),
    workerWmId: z.string().min(1).max(128).optional(),
    details: detailsSchema,
  }),
);

export type DirectAcceptBody = z.infer<typeof directAcceptBodySchema>;
export type CreateShiftPostBody = z.infer<typeof createShiftPostBodySchema>;
export type UpdateShiftPostBody = z.infer<typeof updateShiftPostBodySchema>;
export type ApplyShiftBody = z.infer<typeof applyShiftBodySchema>;
