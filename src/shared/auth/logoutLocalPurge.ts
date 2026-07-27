/**
 * Shared-device logout hygiene — purge user-bound local stores + vault OTP memory.
 * Does not replace server session logout; call after auth clear paths.
 */

import { VAULT_STORAGE_KEYS } from "../../features/employee/workVault/constants/vaultConstants";
import { clearOtp } from "../../features/employee/workVault/services/vaultOtpService";
import { clearPiiDeviceKey } from "../security/piiCrypto";
import { PII_STORAGE_KEYS } from "../security/piiSecureStorage";

/** Exact keys always removed on logout / clear-local (audit P0-1 / P0-2 / P0-6). */
const EXACT_PURGE_KEYS: readonly string[] = [
  "wm-auth-storage",
  "wm_auth_token",
  "wm_identity_bridge_v1",
  "wm_pii_device_key_v1",
  "wm_vault_shift_history_v1",
  "wm_vault_planner_history_v1",
  "wm_employer_demand_plans_v1",
  "wm_demand_plans_v2",
  "wm_id_registry_v1",
  "wm_employment_lifecycle_v1",
  "wm_career_employment_v1",
  "wm_primary_current_employment_id_v1",
  "wm_employee_home_demo_v1",
  "wm_employee_notifications_v1",
  "wm_employee_settings_v1",
  ...Object.values(VAULT_STORAGE_KEYS),
  ...PII_STORAGE_KEYS,
];

const PREFIX_PURGE: readonly string[] = ["wm_employee_", "wm_vault_", "wm_pii_"];

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

  const keys = new Set<string>([...EXACT_PURGE_KEYS, ...collectPrefixMatches()]);
  for (const key of keys) safeRemove(key);
}
