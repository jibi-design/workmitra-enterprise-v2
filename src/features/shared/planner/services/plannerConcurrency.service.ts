/**
 * Job Mitra | plannerConcurrency.service.ts
 * Hybrid A2 Phase-2 P2.2 — publish locks, batch dedupe, multi-tab notify.
 *
 * Lives under shared/planner so employee apply + employer approve can both use it.
 * Keys on planId / planApplyBatchId (not Shift postId) after dual-write wind-down.
 */

import {
  plannerDispatchChanged,
  plannerReadJson,
  plannerWriteJson,
} from "../../../employer/planner/storage/plannerSafeStorage";

export const PLANNER_PUBLISH_LOCK_KEY = "wm_planner_publish_lock_v1";
export const PLANNER_BATCH_ACTION_LOCK_KEY = "wm_planner_batch_action_lock_v1";
export const PLANNER_BATCH_APPLIED_KEY = "wm_planner_batch_applied_v1";
export const PLANNER_CONCURRENCY_CHANGED = "wm:planner-concurrency-changed";

const PUBLISH_LOCK_TTL_MS = 60_000;
const BATCH_LOCK_TTL_MS = 30_000;
const CHANNEL_NAME = "wm_planner_concurrency_v1";

type PublishLockRecord = {
  planId: string;
  token: string;
  holderTabId: string;
  expiresAt: number;
};

type BatchActionLockRecord = {
  planApplyBatchId: string;
  action: "approve" | "reject" | "apply";
  token: string;
  holderTabId: string;
  expiresAt: number;
};

function now(): number {
  return Date.now();
}

function makeToken(): string {
  return `tok_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

let cachedTabId: string | null = null;

/** Test-only: clear tab id cache between simulated multi-tab cases. */
export function __resetPlannerTabIdCacheForTests(): void {
  cachedTabId = null;
}

export function getPlannerTabId(): string {
  if (cachedTabId) return cachedTabId;
  try {
    const key = "wm_planner_tab_id_v1";
    const existing = sessionStorage.getItem(key);
    if (existing?.trim()) {
      cachedTabId = existing.trim();
      return cachedTabId;
    }
    const id = `tab_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
    sessionStorage.setItem(key, id);
    cachedTabId = id;
    return id;
  } catch {
    cachedTabId = `tab_fallback_${Date.now()}`;
    return cachedTabId;
  }
}

function notifyConcurrency(detail?: Record<string, string>): void {
  plannerDispatchChanged(PLANNER_CONCURRENCY_CHANGED);
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const ch = new BroadcastChannel(CHANNEL_NAME);
      ch.postMessage({ type: "planner_concurrency", at: now(), ...detail });
      ch.close();
    }
  } catch {
    /* ignore */
  }
}

function readPublishLocks(): PublishLockRecord[] {
  const raw = plannerReadJson<unknown>(PLANNER_PUBLISH_LOCK_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is PublishLockRecord => {
    if (typeof item !== "object" || item === null) return false;
    const rec = item as Record<string, unknown>;
    return (
      typeof rec.planId === "string" &&
      typeof rec.token === "string" &&
      typeof rec.holderTabId === "string" &&
      typeof rec.expiresAt === "number"
    );
  });
}

function writePublishLocks(locks: PublishLockRecord[]): void {
  plannerWriteJson(PLANNER_PUBLISH_LOCK_KEY, locks);
  notifyConcurrency({ kind: "publish_lock" });
}

export function acquirePublishLock(
  planId: string,
): { ok: true; token: string } | { ok: false; reason: "locked" | "invalid" } {
  const id = planId.trim();
  if (!id) return { ok: false, reason: "invalid" };
  const tabId = getPlannerTabId();
  const t = now();
  const locks = readPublishLocks().filter((l) => l.expiresAt > t && l.planId);
  const existing = locks.find((l) => l.planId === id);
  if (existing && existing.holderTabId !== tabId) {
    return { ok: false, reason: "locked" };
  }
  const token = existing && existing.holderTabId === tabId ? existing.token : makeToken();
  const next: PublishLockRecord = {
    planId: id,
    token,
    holderTabId: tabId,
    expiresAt: t + PUBLISH_LOCK_TTL_MS,
  };
  writePublishLocks([...locks.filter((l) => l.planId !== id), next]);
  return { ok: true, token };
}

export function releasePublishLock(planId: string, token: string): void {
  const id = planId.trim();
  if (!id || !token.trim()) return;
  const locks = readPublishLocks().filter((l) => !(l.planId === id && l.token === token.trim()));
  writePublishLocks(locks);
}

export function isPublishLockedByOther(planId: string): boolean {
  const id = planId.trim();
  if (!id) return false;
  const tabId = getPlannerTabId();
  const t = now();
  const existing = readPublishLocks().find((l) => l.planId === id && l.expiresAt > t);
  return Boolean(existing && existing.holderTabId !== tabId);
}

function readBatchLocks(): BatchActionLockRecord[] {
  const raw = plannerReadJson<unknown>(PLANNER_BATCH_ACTION_LOCK_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is BatchActionLockRecord => {
    if (typeof item !== "object" || item === null) return false;
    const rec = item as Record<string, unknown>;
    return (
      typeof rec.planApplyBatchId === "string" &&
      (rec.action === "approve" || rec.action === "reject" || rec.action === "apply") &&
      typeof rec.token === "string" &&
      typeof rec.holderTabId === "string" &&
      typeof rec.expiresAt === "number"
    );
  });
}

function writeBatchLocks(locks: BatchActionLockRecord[]): void {
  plannerWriteJson(PLANNER_BATCH_ACTION_LOCK_KEY, locks);
  notifyConcurrency({ kind: "batch_lock" });
}

export function claimBatchActionLock(
  planApplyBatchId: string,
  action: "approve" | "reject" | "apply",
): { ok: true; token: string } | { ok: false; reason: "locked" | "invalid" } {
  const batchId = planApplyBatchId.trim();
  if (!batchId) return { ok: false, reason: "invalid" };
  const tabId = getPlannerTabId();
  const t = now();
  const locks = readBatchLocks().filter((l) => l.expiresAt > t);
  const existing = locks.find((l) => l.planApplyBatchId === batchId && l.action === action);
  if (existing && existing.holderTabId !== tabId) {
    return { ok: false, reason: "locked" };
  }
  const token = existing && existing.holderTabId === tabId ? existing.token : makeToken();
  const next: BatchActionLockRecord = {
    planApplyBatchId: batchId,
    action,
    token,
    holderTabId: tabId,
    expiresAt: t + BATCH_LOCK_TTL_MS,
  };
  writeBatchLocks([
    ...locks.filter((l) => !(l.planApplyBatchId === batchId && l.action === action)),
    next,
  ]);
  return { ok: true, token };
}

export function releaseBatchActionLock(
  planApplyBatchId: string,
  action: "approve" | "reject" | "apply",
  token: string,
): void {
  const batchId = planApplyBatchId.trim();
  if (!batchId || !token.trim()) return;
  writeBatchLocks(
    readBatchLocks().filter(
      (l) => !(l.planApplyBatchId === batchId && l.action === action && l.token === token.trim()),
    ),
  );
}

function readAppliedBatches(): string[] {
  const raw = plannerReadJson<unknown>(PLANNER_BATCH_APPLIED_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === "string" && Boolean(v.trim()));
}

export function hasSeenApplyBatchId(planApplyBatchId: string): boolean {
  const id = planApplyBatchId.trim();
  if (!id) return false;
  return readAppliedBatches().includes(id);
}

export function markApplyBatchIdSeen(planApplyBatchId: string): void {
  const id = planApplyBatchId.trim();
  if (!id) return;
  const next = [id, ...readAppliedBatches().filter((x) => x !== id)].slice(0, 500);
  plannerWriteJson(PLANNER_BATCH_APPLIED_KEY, next);
  notifyConcurrency({ kind: "batch_applied" });
}

/** True when apps storage already contains this planApplyBatchId. */
export function applicationsContainBatchId(planApplyBatchId: string): boolean {
  const id = planApplyBatchId.trim();
  if (!id) return false;
  try {
    const raw = localStorage.getItem("wm_employee_shift_applications_v1");
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return false;
    return parsed.some((item) => {
      if (typeof item !== "object" || item === null) return false;
      return (item as Record<string, unknown>).planApplyBatchId === id;
    });
  } catch {
    return false;
  }
}

export function subscribePlannerConcurrency(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(PLANNER_CONCURRENCY_CHANGED, handler);
  window.addEventListener("storage", handler);
  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = () => cb();
    }
  } catch {
    channel = null;
  }
  return () => {
    window.removeEventListener(PLANNER_CONCURRENCY_CHANGED, handler);
    window.removeEventListener("storage", handler);
    try {
      channel?.close();
    } catch {
      /* ignore */
    }
  };
}
