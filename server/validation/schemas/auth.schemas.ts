/**
 * Defense Layer 4 — Auth body schemas.
 */

import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().min(1).max(320),
  password: z.string().min(1).max(256),
});

export const supabaseBridgeBodySchema = z.object({
  mitraLabId: z.string().min(1).max(128).optional(),
  jobmitra_ml_id: z.string().min(1).max(128).optional(),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
