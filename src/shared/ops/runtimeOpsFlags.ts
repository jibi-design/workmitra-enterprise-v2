/**
 * Sprint 3 — Job Mitra client poll of remote Super Admin runtime flags.
 * Honors maintenance / lockdown / kill switches from GET /v1/jobmitra/ops/flags.
 */

import { APP_CONFIG } from "../utils/appConfig";

export type RuntimeOpsFlags = {
  maintenanceMode: boolean;
  lockdown: boolean;
  killShift: boolean;
  killCareer: boolean;
  killPlanner: boolean;
  updatedAtIso: string | null;
  source: "db" | "memory" | "unknown" | "offline";
  polledAtIso: string | null;
};

const DEFAULT_FLAGS: RuntimeOpsFlags = {
  maintenanceMode: false,
  lockdown: false,
  killShift: false,
  killCareer: false,
  killPlanner: false,
  updatedAtIso: null,
  source: "unknown",
  polledAtIso: null,
};

let current: RuntimeOpsFlags = { ...DEFAULT_FLAGS };
const listeners = new Set<(f: RuntimeOpsFlags) => void>();
let pollTimer: ReturnType<typeof setInterval> | null = null;
let started = false;

function apiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3001";
  return APP_CONFIG.api.baseUrl.replace(/\/$/, "");
}

export function getRuntimeOpsFlags(): RuntimeOpsFlags {
  return current;
}

export function subscribeRuntimeOpsFlags(listener: (f: RuntimeOpsFlags) => void): () => void {
  listeners.add(listener);
  listener(current);
  return () => listeners.delete(listener);
}

function emit(): void {
  for (const l of listeners) l(current);
}

export async function refreshRuntimeOpsFlags(): Promise<RuntimeOpsFlags> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`${apiBase()}/v1/jobmitra/ops/flags`, {
      method: "GET",
      credentials: "include",
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    if (!res.ok) {
      current = { ...current, source: "offline", polledAtIso: new Date().toISOString() };
      emit();
      return current;
    }
    const body = (await res.json()) as {
      flags?: Partial<RuntimeOpsFlags> & { source?: string };
    };
    const f = body.flags || {};
    current = {
      maintenanceMode: Boolean(f.maintenanceMode),
      lockdown: Boolean(f.lockdown),
      killShift: Boolean(f.killShift),
      killCareer: Boolean(f.killCareer),
      killPlanner: Boolean(f.killPlanner),
      updatedAtIso: f.updatedAtIso ? String(f.updatedAtIso) : null,
      source: f.source === "db" || f.source === "memory" ? f.source : "unknown",
      polledAtIso: new Date().toISOString(),
    };
    // Mirror into APP_CONFIG for any legacy readers (mutable slot).
    (APP_CONFIG.features as { maintenanceMode: boolean }).maintenanceMode =
      current.maintenanceMode || current.lockdown;
    emit();
    return current;
  } catch {
    current = { ...current, source: "offline", polledAtIso: new Date().toISOString() };
    emit();
    return current;
  }
}

/** Start 20s poll — safe to call once from main/App. */
export function startRuntimeOpsFlagsPoll(intervalMs = 20_000): void {
  if (started || typeof window === "undefined") return;
  started = true;
  void refreshRuntimeOpsFlags();
  pollTimer = setInterval(() => {
    void refreshRuntimeOpsFlags();
  }, intervalMs);
}

export function stopRuntimeOpsFlagsPoll(): void {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
  started = false;
}
