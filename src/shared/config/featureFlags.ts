/** Job Mitra | featureFlags.ts — global build-time feature gates */

/**
 * Phase 2 domains (Workforce, HR, Manager Console).
 * Launch default: hidden. Opt-in only via VITE_SHOW_PHASE2=1.
 */
export const showPhase2Features =
  import.meta.env.PROD
    ? import.meta.env.VITE_SHOW_PHASE2 === "1"
    : import.meta.env.VITE_SHOW_PHASE2 !== "0";

/**
 * Shift Ops (Field Ops) Phase 0–1 greenfield.
 * - Production: off unless VITE_SHIFT_OPS=1
 * - Development: on unless VITE_SHIFT_OPS=0
 * SQL migrations remain separate — this flag only gates UI routes/nav.
 */
export const showShiftOpsFeatures = import.meta.env.VITE_SHIFT_OPS !== "0";

/**
 * Work mobile + work email OTP gate for Shift Ops onboarding.
 * Temporary: false so workers land on Pending/Ready without channel OTP.
 * Flip to true when live phone/email verification is enabled.
 */
export const requireShiftOpsChannelOtpVerify = false;

/**
 * Companies House CRN lookup (Phase 3).
 * - Production: mock OFF unless VITE_COMPANIES_HOUSE_MOCK=1 (lab only)
 * - Development: mock ON unless VITE_COMPANIES_HOUSE_MOCK=0
 */
export const companiesHouseMockEnabled = import.meta.env.PROD
  ? import.meta.env.VITE_COMPANIES_HOUSE_MOCK === "1"
  : import.meta.env.VITE_COMPANIES_HOUSE_MOCK !== "0";

/**
 * Mitra Labs AI Photo Delivery (QR → selfie → recognition → download).
 * Day-1: OFF — product is QR/invite utilities only.
 * Opt-in lab scaffold: VITE_MITRA_LABS_AI_PHOTO=1
 */
export const showMitraLabsAiPhotoDelivery = import.meta.env.VITE_MITRA_LABS_AI_PHOTO === "1";
