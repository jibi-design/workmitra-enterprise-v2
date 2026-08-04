/** Job Mitra | featureFlags.ts — global build-time feature gates */

/**
 * Phase 2 domains (Workforce, HR, Manager Console).
 * Launch default: hidden. Opt-in only via VITE_SHOW_PHASE2=1.
 */
export const showPhase2Features = import.meta.env.VITE_SHOW_PHASE2 === "1";

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

/**
 * Companies House CRN lookup (Phase 3).
 * - Default: mock registry for lab / offline
 * - Set VITE_COMPANIES_HOUSE_MOCK=0 to disable client offline mock
 */
export const companiesHouseMockEnabled = import.meta.env.VITE_COMPANIES_HOUSE_MOCK !== "0";
