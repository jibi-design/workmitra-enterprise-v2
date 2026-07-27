/**
 * Job Mitra | plannerConcurrency.channel.ts
 * Wave 2 P1-5/P1-6 — persistent BroadcastChannel + filtered storage subscribe
 */

export const PLANNER_CONCURRENCY_CHANGED = "wm:planner-concurrency-changed";

const CHANNEL_NAME = "wm_planner_concurrency_v1";
const PLANNER_PUBLISH_LOCK_KEY = "wm_planner_publish_lock_v1";
const PLANNER_BATCH_ACTION_LOCK_KEY = "wm_planner_batch_action_lock_v1";
const PLANNER_BATCH_APPLIED_KEY = "wm_planner_batch_applied_v1";

const CONCURRENCY_STORAGE_KEYS = new Set([
  PLANNER_PUBLISH_LOCK_KEY,
  PLANNER_BATCH_ACTION_LOCK_KEY,
  PLANNER_BATCH_APPLIED_KEY,
]);

let sharedChannel: BroadcastChannel | null = null;
const channelListeners = new Set<() => void>();

function ensureSharedChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (sharedChannel) return sharedChannel;
  try {
    sharedChannel = new BroadcastChannel(CHANNEL_NAME);
    sharedChannel.onmessage = () => {
      for (const listener of channelListeners) listener();
    };
    return sharedChannel;
  } catch {
    sharedChannel = null;
    return null;
  }
}

export function postPlannerConcurrencyMessage(detail?: Record<string, string>): void {
  try {
    const ch = ensureSharedChannel();
    ch?.postMessage({ type: "planner_concurrency", at: Date.now(), ...detail });
  } catch {
    /* ignore */
  }
}

export function subscribePlannerConcurrencyChannel(cb: () => void): () => void {
  const onCustom = () => cb();
  const onStorage = (ev: StorageEvent) => {
    if (ev.key && CONCURRENCY_STORAGE_KEYS.has(ev.key)) cb();
  };

  window.addEventListener(PLANNER_CONCURRENCY_CHANGED, onCustom);
  window.addEventListener("storage", onStorage);

  channelListeners.add(cb);
  ensureSharedChannel();

  return () => {
    window.removeEventListener(PLANNER_CONCURRENCY_CHANGED, onCustom);
    window.removeEventListener("storage", onStorage);
    channelListeners.delete(cb);
  };
}
