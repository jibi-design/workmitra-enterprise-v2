// src/shared/rating/workerPointsStorage.ts
//
// Worker points + level storage.
// Stable-reference cache. Points never go below 0.

import type { WorkerPoints, PointsEventType } from "./ratingTypes";
import { applyPointsEvent, createWorkerPoints, calculateLevel } from "./ratingLevels";

/* ------------------------------------------------ */
/* Errors                                           */
/* ------------------------------------------------ */
export class WorkerPointsStorageWriteError extends Error {
  readonly reason = "storage_error" as const;

  constructor() {
    super("Failed to persist worker points.");
    this.name = "WorkerPointsStorageWriteError";
  }
}

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
function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null;
}

function parsePointsMap(raw: string | null): Map<string, WorkerPoints> {
  const map = new Map<string, WorkerPoints>();
  if (!raw) return map;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return map;
    for (const x of parsed) {
      if (!isRec(x)) continue;
      // Dual-read: prefer workerMlId; accept legacy workerWmId from older localStorage JSON.
      const workerMlIdRaw = x["workerMlId"] ?? x["workerWmId"];
      const workerMlId = typeof workerMlIdRaw === "string" ? workerMlIdRaw : undefined;
      const total = x["total"];
      if (typeof workerMlId !== "string" || typeof total !== "number") continue;
      const history = Array.isArray(x["history"]) ? x["history"] : [];
      const record: WorkerPoints = {
        workerMlId,
        total: Math.max(0, total),
        level: calculateLevel(Math.max(0, total)),
        history,
        updatedAt: typeof x["updatedAt"] === "number" ? x["updatedAt"] : Date.now(),
      };
      map.set(workerMlId, record);
    }
  } catch {
    /* safe */
  }
  return map;
}

function readCache(): Map<string, WorkerPoints> {
  const raw = localStorage.getItem(KEY);
  if (raw === _cacheRaw) return _cacheMap;
  _cacheRaw = raw;
  _cacheMap = parsePointsMap(raw);
  return _cacheMap;
}

function safeDispatchChanged(event: string): void {
  try {
    window.dispatchEvent(new Event(event));
  } catch (error) {
    console.warn("[workerPointsStorage] Failed to dispatch storage change event", {
      event,
      error,
    });
  }
}

function write(map: Map<string, WorkerPoints>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(map.values())));
  } catch {
    throw new WorkerPointsStorageWriteError();
  }

  _cacheRaw = null;
  safeDispatchChanged(CHANGED_EVENT);
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const workerPointsStorage = {
  subscribe(cb: () => void): () => void {
    const h = () => cb();
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) cb();
    };
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

  getByMlId(workerMlId: string): WorkerPoints {
    return readCache().get(workerMlId) ?? createWorkerPoints(workerMlId);
  },

  /** Award or deduct points for a points event */
  applyEvent(workerMlId: string, eventType: PointsEventType, jobId?: string): WorkerPoints {
    const map = new Map(readCache());
    const current = map.get(workerMlId) ?? createWorkerPoints(workerMlId);
    const updated = applyPointsEvent(current, eventType, jobId);
    map.set(workerMlId, updated);
    write(map);
    return updated;
  },

  _key: KEY,
  _event: CHANGED_EVENT,
} as const;
