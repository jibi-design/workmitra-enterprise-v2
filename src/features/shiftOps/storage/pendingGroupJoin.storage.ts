/** Job Mitra | pendingGroupJoin.storage.ts | Durable group-join deep-link intent (GJ-2) */

const STORAGE_KEY = "wm_pending_group_join_v1";
const PENDING_JOIN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type PendingGroupJoin = {
  token: string;
  groupId?: string;
  /** Resolved employer / site / company label for home banner copy */
  companyName?: string;
  useDailyOtpGate: boolean;
  savedAt: number;
};

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function buildPendingGroupJoinPath(pending: PendingGroupJoin): string {
  const params = new URLSearchParams();
  params.set("token", pending.token);
  if (pending.groupId) params.set("group", pending.groupId);
  if (!pending.useDailyOtpGate) params.set("legacy", "1");
  return `/employee/shift-ops/invite?${params.toString()}`;
}

export function isShiftOpsInvitePath(path: string): boolean {
  const normalized = path.trim();
  return (
    normalized.startsWith("/employee/shift-ops/invite") ||
    normalized.startsWith("/employee/shift-ops/verify")
  );
}

/** Parse invite URL path+search into durable pending join (token required). */
export function parseGroupJoinFromPath(pathWithSearch: string): PendingGroupJoin | null {
  try {
    const url = new URL(pathWithSearch, "https://jobmitra.local");
    if (!url.pathname.includes("/employee/shift-ops/invite")) return null;
    const token = (url.searchParams.get("token") ?? url.searchParams.get("invite") ?? "").trim();
    if (!token) return null;
    const groupId = (url.searchParams.get("group") ?? "").trim() || undefined;
    const companyName =
      (url.searchParams.get("company") ?? url.searchParams.get("name") ?? "").trim() || undefined;
    const useDailyOtpGate = url.searchParams.get("legacy") !== "1";
    return { token, groupId, companyName, useDailyOtpGate, savedAt: Date.now() };
  } catch {
    return null;
  }
}

export function peekPendingGroupJoin(): PendingGroupJoin | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingGroupJoin;
    if (!parsed || typeof parsed.token !== "string" || !parsed.token.trim()) return null;
    const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now();
    if (savedAt < Date.now() - PENDING_JOIN_TTL_MS) {
      clearPendingGroupJoin();
      return null;
    }
    return {
      token: parsed.token.trim(),
      groupId: typeof parsed.groupId === "string" && parsed.groupId ? parsed.groupId : undefined,
      companyName:
        typeof parsed.companyName === "string" && parsed.companyName.trim()
          ? parsed.companyName.trim()
          : undefined,
      useDailyOtpGate: parsed.useDailyOtpGate !== false,
      savedAt,
    };
  } catch {
    return null;
  }
}

export function stashPendingGroupJoin(pending: PendingGroupJoin): void {
  if (!canUseStorage()) return;
  if (!pending.token.trim()) return;
  try {
    const existing = peekPendingGroupJoin();
    const sameToken = existing?.token === pending.token.trim();
    const payload: PendingGroupJoin = {
      token: pending.token.trim(),
      groupId: pending.groupId?.trim() || (sameToken ? existing?.groupId : undefined),
      companyName:
        pending.companyName?.trim() || (sameToken ? existing?.companyName : undefined),
      useDailyOtpGate: pending.useDailyOtpGate !== false,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* TIER: ADVISORY */ console.warn("[PendingGroupJoin] localStorage unavailable");
  }
}

export function stashPendingGroupJoinFromPath(pathWithSearch: string): boolean {
  const parsed = parseGroupJoinFromPath(pathWithSearch);
  if (!parsed) return false;
  stashPendingGroupJoin(parsed);
  return true;
}

export function peekPendingGroupJoinPath(): string | null {
  const pending = peekPendingGroupJoin();
  return pending ? buildPendingGroupJoinPath(pending) : null;
}

/** Clear after successful join (or explicit cancel). */
export function clearPendingGroupJoin(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* TIER: ADVISORY */ console.warn("[PendingGroupJoin] clearPendingGroupJoin failed");
  }
}
