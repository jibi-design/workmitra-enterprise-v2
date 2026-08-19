/** Job Mitra | deviceStateScope.ts | localStorage keys: base_role_userId */

import { useAuthStore } from "../store/authStore";

export type DeviceStateRole = "employee" | "employer" | "admin" | "guest";

export function resolveDeviceStateRole(user: {
  readonly activeMode?: string | null;
  readonly role?: string | null;
} | null | undefined): DeviceStateRole {
  const mode = user?.activeMode ?? user?.role;
  if (mode === "employer" || mode === "admin" || mode === "employee") return mode;
  return "guest";
}

export function resolveDeviceStateUserId(user: { readonly id?: string | null } | null | undefined): string {
  const id = user?.id?.trim();
  return id && id.length > 0 ? id : "anon";
}

/** Scoped persist key. Never store employer and employee facts under one global name. */
export function deviceStateStorageKey(baseKey: string): string {
  const user = useAuthStore.getState().user;
  const role = resolveDeviceStateRole(user);
  const userId = resolveDeviceStateUserId(user);
  return `${baseKey}_${role}_${userId}`;
}

export function isDeviceStateKeyFamily(storageKey: string, baseKey: string): boolean {
  return storageKey === baseKey || storageKey.startsWith(`${baseKey}_`);
}
