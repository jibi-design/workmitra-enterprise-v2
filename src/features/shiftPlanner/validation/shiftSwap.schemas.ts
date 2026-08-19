/**
 * Weekly Shift Planner — Zod Layer 3 swap request validation.
 * Domain: shiftPlanner only (no career / attendance / wages).
 */

import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const CreateSwapRequestSchema = z
  .object({
    weekId: z.string().min(1).max(64),
    shiftInstanceId: z.string().min(1).max(128),
    initiatorId: z.string().min(1).max(128),
    peerId: z.string().min(1).max(128),
    siteId: z.string().min(1).max(128),
    roleTag: z.string().min(1).max(64),
    date: z.string().regex(ISO_DATE, "date must be YYYY-MM-DD"),
    startAt: z.string().min(10).max(40),
  })
  .refine((data) => data.initiatorId !== data.peerId, {
    message: "Peer must be a different employee",
    path: ["peerId"],
  })
  .refine((data) => Number.isFinite(Date.parse(data.startAt)), {
    message: "startAt must be a valid ISO datetime",
    path: ["startAt"],
  })
  .refine(
    (data) => {
      const startMs = Date.parse(data.startAt);
      if (!Number.isFinite(startMs)) return false;
      const minStart = Date.now() + 24 * 60 * 60 * 1000;
      return startMs >= minStart;
    },
    {
      message: "Swap requests require at least 24 hours notice before shift start",
      path: ["startAt"],
    },
  );

export type CreateSwapRequestInput = z.infer<typeof CreateSwapRequestSchema>;

export const SWAP_MIN_NOTICE_MS = 24 * 60 * 60 * 1000;
export const SWAP_MAX_PER_MONTH = 3;
