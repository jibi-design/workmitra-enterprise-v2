/**
 * Shared-device logout hygiene — purge user-bound local stores + vault OTP memory.
 * Does not replace server session logout; call after auth clear paths.
 *
 * Wave-2: also clears shift/roster/planner/workforce satellites + retry queues.
 */

import { VAULT_STORAGE_KEYS } from "../../features/employee/workVault/constants/vaultConstants";
import { clearOtp } from "../../features/employee/workVault/services/vaultOtpService";
import { clearGuestCreatePreviewSkip } from "../guest/guestCreatePreview.session";
import { guestStorage } from "../guest/guestStorage";
import { clearIntentPacket } from "../guest/intentPacket";
import { clearPiiDeviceKey } from "../security/piiCrypto";
import { PII_STORAGE_KEYS, piiSecureStorage } from "../security/piiSecureStorage";
import {
  clearShiftRetryDeadLetter,
  clearShiftRetryQueue,
  SHIFT_RETRY_DEAD_LETTER_KEY,
  SHIFT_RETRY_QUEUE_KEY,
} from "../shift/shiftRetryQueue";

/** Exact keys always removed on logout / clear-local. */
const EXACT_PURGE_KEYS: readonly string[] = [
  "wm-auth-storage",
  "wm_auth_token",
  "wm_identity_bridge_v1",
  "wm_pii_device_key_v1",
  "wm_vault_shift_history_v1",
  "wm_vault_planner_history_v1",
  "wm_employer_demand_plans_v1",
  "wm_employer_demand_plan_draft_v1",
  "wm_demand_plans_v2",
  "wm_id_registry_v1",
  "wm_employment_lifecycle_v1",
  "wm_career_employment_v1",
  "wm_primary_current_employment_id_v1",
  "wm_employee_home_demo_v1",
  "wm_employee_notifications_v1",
  "wm_employee_settings_v1",
  /** Wave-1: invite intent must not survive logout on shared devices */
  "wm_pending_group_join_v1",
  /** Wave-1: Shift Ops Supabase Auth persist key (see supabaseClient storageKey) */
  "wm-shift-ops-auth",
  "wm-shift-ops-auth-code-verifier",
  /** Wave-2: retry / attendance / diary / auth epoch / confirm lock */
  SHIFT_RETRY_QUEUE_KEY,
  SHIFT_RETRY_DEAD_LETTER_KEY,
  "wm_planner_daily_checkins_v1",
  "wm_workforce_attendance_v1",
  "wm_work_diary_v1",
  "wm_work_diary_settings_v1",
  "wm_personal_work_diary_v1",
  "wm_shift_availability_daily_v1",
  "wm_employee_rest_ritual_v1",
  "wm_auth_session_epoch_v1",
  "wm_shift_confirm_lock_v1",
  "wm_shift_ops_roster_overlay_v1",
  "wm_shift_ops_site_membership_truth_v1",
  ...Object.values(VAULT_STORAGE_KEYS),
  ...PII_STORAGE_KEYS,
];

export const LOGOUT_MED01_SENSITIVE_KEYS = EXACT_PURGE_KEYS;

const PREFIX_PURGE: readonly string[] = [
  "wm_employee_",
  "wm_vault_",
  "wm_pii_",
  /** Catch Supabase auth key variants under the Shift Ops storageKey */
  "wm-shift-ops-auth",
  /** Wave-2: employer / HR / planner / workforce / shiftOps satellites */
  "wm_hr_employer_",
  "wm_shift_ops_",
  "wm_employer_shift_",
  "wm_employer_",
  "wm_planner_",
  "wm_workforce_",
  "wm_pulse_chain_state_v1",
  "wm_home_status_strip_dismissed_v1",
  "wm_home_ticker_all_clear_dismiss_v1",
  "wm_mitra_labs_",
];

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function collectPrefixMatches(): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (PREFIX_PURGE.some((p) => key.startsWith(p))) out.push(key);
    }
  } catch {
    /* ignore */
  }
  return out;
}

/**
 * Removes vault/PII/profile/feature local data and clears in-memory vault OTP.
 * Safe to call multiple times; idempotent.
 */
export function purgeUserLocalStateOnLogout(): void {
  clearOtp();
  clearPiiDeviceKey();
  piiSecureStorage.clearMemoryMirror();
  clearShiftRetryQueue();
  clearShiftRetryDeadLetter();

  const keys = new Set<string>([...EXACT_PURGE_KEYS, ...collectPrefixMatches()]);
  for (const key of keys) safeRemove(key);

  guestStorage.clearProfileArtifacts();
  clearIntentPacket();
  clearGuestCreatePreviewSkip();

  // Wave-5 P3: exhaustively clear session-scoped CSRF / tab tokens
  try {
    sessionStorage.removeItem("wm_csrf_token");
    sessionStorage.removeItem("wm_shift_confirm_tab_id_v1");
  } catch {
    /* ignore */
  }
}
