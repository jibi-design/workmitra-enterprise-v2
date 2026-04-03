// src/shared/rating/workerPointsStorage.ts
//
// Worker points + level storage.
// Stable-reference cache. Points never go below 0.

import type { WorkerPoints, PointsEventType } from "./ratingTypes";
import { applyPointsEvent, createWorkerPoints, calculateLevel } from "./ratingLevels";

/* ------------------------------------------------ */
/* Storage Keys                                     */
/* ------------------------------------------------ */
const KEY = "wm_worker_points_v1";
const CHANGED_EVENT = "wm:worker-points-changed";

/* ------------------------------------------------ */
/* Stable-reference cache                           */
/* ------------------------------------------------ */
let _cacheRaw: string | null = "__init__";
let _cacheMap: Map<string, WorkerPoints> = new Map();

/* ------------------------------------------------ */
/* Parse                                            */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;
function isRec(x: unknown): x is Rec { return typeof x === "object" && x !== null; }

function parsePointsMap(raw: string | null): Map<string, WorkerPoints> {
  const map = new Map<string, WorkerPoints>();
  if (!raw) return map;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return map;
    for (const x of parsed) {
      if (!isRec(x)) continue;
      const workerWmId = x["workerWmId"];
      const total = x["total"];
      if (typeof workerWmId !== "string" || typeof total !== "number") continue;
      const history = Array.isArray(x["history"]) ? x["history"] : [];
      const record: WorkerPoints = {
        workerWmId,
        total: Math.max(0, total),
        level: calculateLevel(Math.max(0, total)),
        history,
        updatedAt: typeof x["updatedAt"] === "number" ? x["updatedAt"] : Date.now(),
      };
      map.set(workerWmId, record);
    }
  } catch { /* safe */ }
  return map;
}

function readCache(): Map<string, WorkerPoints> {
  const raw = localStorage.getItem(KEY);
  if (raw === _cacheRaw) return _cacheMap;
  _cacheRaw = raw;
  _cacheMap = parsePointsMap(raw);
  return _cacheMap;
}

function write(map: Map<string, WorkerPoints>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(map.values())));
  } catch { /* safe */ }
  _cacheRaw = null;
  try { window.dispatchEvent(new Event(CHANGED_EVENT)); } catch { /* safe */ }
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const workerPointsStorage = {
  subscribe(cb: () => void): () => void {
    const h = () => cb();
    const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === null) cb(); };
    window.addEventListener(CHANGED_EVENT, h);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGED_EVENT, h);
      window.removeEventListener("storage", onStorage);
    };
  },

  getAll(): WorkerPoints[] {
    return Array.from(readCache().values());
  },

  getByWmId(workerWmId: string): WorkerPoints {
    return readCache().get(workerWmId) ?? createWorkerPoints(workerWmId);
  },

  /** Award or deduct points for a points event */
  applyEvent(workerWmId: string, eventType: PointsEventType, jobId?: string): WorkerPoints {
    const map = new Map(readCache());
    const current = map.get(workerWmId) ?? createWorkerPoints(workerWmId);
    const updated = applyPointsEvent(current, eventType, jobId);
    map.set(workerWmId, updated);
    write(map);
    return updated;
  },

  _key: KEY,
  _event: CHANGED_EVENT,
} as const;