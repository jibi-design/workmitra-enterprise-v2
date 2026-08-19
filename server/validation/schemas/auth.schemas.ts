/**
 * Defense Layer 4 — Auth body schemas.
 */

import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().min(1).max(320),
  password: z.string().min(1).max(256),
});

export const registerBodySchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(320),
  password: z.string().min(8).max(256),
  role: z.enum(["employee", "employer"]),
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().email().max(320),
});

export const resetPasswordBodySchema = z.object({
  token: z.string().min(16).max(256),
  password: z.string().min(8).max(256),
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(8).max(256),
});

/** Store compliance — in-app account deletion (password re-auth). */
export const deleteAccountBodySchema = z.object({
  password: z.string().min(1).max(256),
  confirmation: z.literal("DELETE"),
});

export const supabaseBridgeBodySchema = z.object({
  mitraLabId: z.string().min(1).max(128).optional(),
  jobmitra_ml_id: z.string().min(1).max(128).optional(),
});

export const switchContextBodySchema = z.object({
  mode: z.enum(["employee", "employer"]),
  orgId: z.string().min(1).max(128).nullable().optional(),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type RegisterBody = z.infer<typeof registerBodySchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
export type DeleteAccountBody = z.infer<typeof deleteAccountBodySchema>;
export type SwitchContextBody = z.infer<typeof switchContextBodySchema>;
