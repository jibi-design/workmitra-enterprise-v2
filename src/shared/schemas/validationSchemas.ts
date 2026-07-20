/** Job Mitra | validationSchemas.ts | src/shared/schemas/validationSchemas.ts */

import { z } from "zod";

/**
 * ARCHITECTURE NOTE:
 * Centralized validation logic. Ensures all forms follow the same
 * security and data-integrity rules across the entire app.
 */

// 1. Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// 2. Profile Schemas
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  city: z.string().min(2, "City is required"),
});

// 3. Shift Job Creation Schema (Employer)
export const createShiftSchema = z.object({
  jobTitle: z.string().min(5, "Title is too short"),
  category: z.string().min(1, "Please select a category"),
  payAmount: z.number().positive("Pay must be greater than 0"),
  startDate: z.string().datetime(),
  description: z.string().max(500, "Description is too long"),
});

// Types exported from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileUpdateSchema>;
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
