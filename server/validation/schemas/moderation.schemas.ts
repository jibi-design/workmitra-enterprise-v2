/**
 * Defense Layer 4 — content report / moderation schemas.
 * Shift and Career share envelope fields; domain is required.
 */

import { z } from "zod";
import { sanitizeUserText } from "../sanitizeText.js";

export const CONTENT_REPORT_DOMAINS = ["shift", "career"] as const;
export const CONTENT_REPORT_REASONS = [
  "fake_pay",
  "asks_money",
  "harassment",
  "discriminatory",
  "duplicate_spam",
  "other",
] as const;
export const MODERATION_ACTIONS = ["dismiss", "hide", "restore", "remove"] as const;

export const contentReportDomainSchema = z.enum(CONTENT_REPORT_DOMAINS);
export const contentReportReasonSchema = z.enum(CONTENT_REPORT_REASONS);

export const createContentReportBodySchema = z.object({
  reasonCode: contentReportReasonSchema,
  note: z
    .string()
    .max(1000)
    .optional()
    .transform((value) => {
      if (value == null) return undefined;
      const cleaned = sanitizeUserText(value, 500);
      return cleaned.length > 0 ? cleaned : undefined;
    }),
  employerId: z.uuid().optional(),
  snapshot: z
    .object({
      title: z.string().max(200).optional(),
      companyName: z.string().max(200).optional(),
    })
    .optional(),
});

export const contentPostIdParamsSchema = z.object({
  postId: z.string().trim().min(8).max(128),
});

export const moderationCaseIdParamsSchema = z.object({
  caseId: z.uuid(),
});

export const moderationActionBodySchema = z.object({
  action: z.enum(MODERATION_ACTIONS),
  note: z
    .string()
    .max(1000)
    .optional()
    .transform((value) => {
      if (value == null) return undefined;
      const cleaned = sanitizeUserText(value, 500);
      return cleaned.length > 0 ? cleaned : undefined;
    }),
});
