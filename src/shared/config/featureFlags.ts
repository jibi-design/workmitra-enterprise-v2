/** Job Mitra | featureFlags.ts — global build-time feature gates */

/**
 * Phase 2 domains (Workforce, HR, Manager Console) are fully active in development
 * and hidden from production navigation, menus, and pulse routing.
 */
export const showPhase2Features = import.meta.env.DEV;

/**
 * Shift Ops (Field Ops) Phase 0–1 greenfield.
 * - Production: off unless VITE_SHIFT_OPS=1
 * - Development: on unless VITE_SHIFT_OPS=0
 * SQL migrations remain separate — this flag only gates UI routes/nav.
 */
export const showShiftOpsFeatures = import.meta.env.PROD
  ? import.meta.env.VITE_SHIFT_OPS === "1"
  : import.meta.env.VITE_SHIFT_OPS !== "0";

/**
 * Work mobile + work email OTP gate for Shift Ops onboarding.
 * Temporary: false so workers land on Pending/Ready without channel OTP.
 * Flip to true when live phone/email verification is enabled.
 */
export const requireShiftOpsChannelOtpVerify = false;
