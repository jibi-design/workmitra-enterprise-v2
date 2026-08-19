/** Job Mitra | pulseStorage.scope.ts | Role-namespaced pulse persist keys */

import { useAuthStore } from "../../shared/store/authStore";

export type PulsePersistScope = "employee" | "employer" | "admin" | "guest";

export const PULSE_STORAGE_LEGACY_KEY = "wm_pulse_chain_state_v1";
export const PULSE_STORAGE_KEY_PREFIX = "wm_pulse_chain_state_v1";

export function resolvePulsePersistScope(user: {
  readonly activeMode?: string | null;
  readonly role?: string | null;
} | null | undefined): PulsePersistScope {
  const mode = user?.activeMode ?? user?.role;
  if (mode === "employer") return "employer";
  if (mode === "admin") return "admin";
  if (mode === "employee") return "employee";
  return "guest";
}

export function pulseStorageKeyForScope(scope: PulsePersistScope): string {
  return `${PULSE_STORAGE_KEY_PREFIX}_${scope}`;
}

export function readPulsePersistScope(): PulsePersistScope {
  try {
    return resolvePulsePersistScope(useAuthStore.getState().user);
  } catch {
    return "guest";
  }
}

export function readPulseStorageKey(): string {
  return pulseStorageKeyForScope(readPulsePersistScope());
}

export function listPulseStorageKeys(): string[] {
  return [
    PULSE_STORAGE_LEGACY_KEY,
    pulseStorageKeyForScope("employee"),
    pulseStorageKeyForScope("employer"),
    pulseStorageKeyForScope("admin"),
    pulseStorageKeyForScope("guest"),
  ];
}
