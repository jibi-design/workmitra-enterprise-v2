import { useSyncExternalStore } from "react";
import { roleStorage, type AppRole } from "../storage/roleStorage";

export type EmployerRouteState = {
  backTo?: string;
};

export { useAppRole as useRole } from "../router/guards/useAppRole";
export type { AppRole };

export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** @deprecated Prefer useRole / useAppRole — kept for rare storage-only reads. */
export function useRoleStorageOnly(): AppRole | null {
  return useSyncExternalStore(roleStorage.subscribe, roleStorage.get, roleStorage.get);
}

export function safeCanGoBack(): boolean {
  try {
    return window.history.length > 1;
  } catch {
    return false;
  }
}

export function getEmployerBackTarget(state: unknown): string | null {
  if (!state || typeof state !== "object") return null;

  const maybeBackTo = (state as Partial<EmployerRouteState>).backTo;

  if (typeof maybeBackTo !== "string") return null;
  if (!maybeBackTo.startsWith("/employer")) return null;

  return maybeBackTo;
}
