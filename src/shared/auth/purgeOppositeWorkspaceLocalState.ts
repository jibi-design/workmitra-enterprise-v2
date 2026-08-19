/**
 * Air-gap purge when switching activeMode — clears opposite-workspace local caches.
 * Does NOT clear auth session / CSRF (unlike full logout purge).
 */

import { VAULT_STORAGE_KEYS } from "../../features/employee/workVault/constants/vaultConstants";
import { clearOtp } from "../../features/employee/workVault/services/vaultOtpService";
import { PII_STORAGE_KEYS } from "../security/piiSecureStorage";
import {
  clearShiftRetryDeadLetter,
  clearShiftRetryQueue,
  SHIFT_RETRY_DEAD_LETTER_KEY,
  SHIFT_RETRY_QUEUE_KEY,
} from "../shift/shiftRetryQueue";

export type ActiveMode = "employee" | "employer";

const EMPLOYEE_EXACT: readonly string[] = [
  "wm_employee_home_demo_v1",
  "wm_employee_notifications_v1",
  "wm_employee_settings_v1",
  "wm_vault_shift_history_v1",
  "wm_vault_planner_history_v1",
  "wm_employment_lifecycle_v1",
  "wm_career_employment_v1",
  "wm_primary_current_employment_id_v1",
  "wm_work_diary_v1",
  "wm_work_diary_settings_v1",
  "wm_personal_work_diary_v1",
  /** Wave 3 dashboard utilities (never diary). */
  "wm_shift_availability_daily_v1",
  "wm_employee_rest_ritual_v1",
  ...Object.values(VAULT_STORAGE_KEYS),
  ...PII_STORAGE_KEYS,
];

const EMPLOYEE_PREFIXES: readonly string[] = ["wm_employee_", "wm_vault_", "wm_pii_"];

const EMPLOYER_EXACT: readonly string[] = [
  "wm_employer_demand_plans_v1",
  "wm_employer_demand_plan_draft_v1",
  "wm_employer_compliance_hub_v1",
  "wm_demand_plans_v2",
  "wm_planner_daily_checkins_v1",
  "wm_workforce_attendance_v1",
  "wm_shift_ops_roster_overlay_v1",
  "wm_shift_ops_site_membership_truth_v1",
  SHIFT_RETRY_QUEUE_KEY,
  SHIFT_RETRY_DEAD_LETTER_KEY,
];

const EMPLOYER_PREFIXES: readonly string[] = [
  "wm_hr_employer_",
  "wm_shift_ops_",
  "wm_employer_shift_",
  "wm_employer_",
  "wm_planner_",
  "wm_workforce_",
];

const SHIFT_AUTH_TENANT_BIND_KEY = "wm_shift_auth_tenant_bind_v1";

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function collectPrefixMatches(prefixes: readonly string[]): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (prefixes.some((p) => key.startsWith(p))) out.push(key);
    }
  } catch {
    /* ignore */
  }
  return out;
}

/**
 * Shared names that both roles write. Always wipe on switch so leftover
 * workspaces, ticker dismiss, and confirm locks cannot bleed across profiles.
 */
const SHARED_CROSS_ROLE: readonly string[] = [
  "wm_employee_shift_workspaces_v1",
  "wm_employee_shift_applications_v1",
  "wm_home_status_strip_dismissed_v1",
  "wm_home_ticker_all_clear_dismiss_v1",
  "wm_shift_confirm_lock_v1",
];

const SHARED_CROSS_ROLE_PREFIXES: readonly string[] = [
  "wm_home_status_strip_dismissed_v1",
  "wm_home_ticker_all_clear_dismiss_v1",
  "wm_pulse_chain_state_v1",
];

/**
 * Purge local state belonging to the workspace we are leaving.
 * Call after successful switch-context, before navigating to the new home.
 */
export function purgeOppositeWorkspaceLocalState(nextMode: ActiveMode): void {
  const leavingEmployee = nextMode === "employer";
  const exact = leavingEmployee ? EMPLOYEE_EXACT : EMPLOYER_EXACT;
  const prefixes = leavingEmployee ? EMPLOYEE_PREFIXES : EMPLOYER_PREFIXES;

  if (leavingEmployee) {
    clearOtp();
  } else {
    clearShiftRetryQueue();
    clearShiftRetryDeadLetter();
  }

  const keys = new Set<string>([
    ...exact,
    ...SHARED_CROSS_ROLE,
    ...collectPrefixMatches(prefixes),
    ...collectPrefixMatches(SHARED_CROSS_ROLE_PREFIXES),
  ]);
  for (const key of keys) {
    // Phase 4 — never purge guest local-first artifacts during role switch.
    if (key.startsWith("wm_guest_")) continue;
    safeRemove(key);
  }

  try {
    sessionStorage.removeItem(SHIFT_AUTH_TENANT_BIND_KEY);
    sessionStorage.removeItem("wm_shift_confirm_tab_id_v1");
    for (const prefix of SHARED_CROSS_ROLE_PREFIXES) {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(prefix)) sessionStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }
}
