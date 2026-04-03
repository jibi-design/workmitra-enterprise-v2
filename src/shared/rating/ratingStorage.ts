// src/shared/rating/ratingStorage.ts
//
// localStorage storage for both rating directions.
// Stable-reference cache for useSyncExternalStore.
// Permanent — ratings cannot be deleted.
// Edit: 1 edit within 48 hours of submission (Session 18).

import type {
  EmployerToWorkerRating,
  WorkerToEmployerRating,
  WorkerRatingSummary,
  EmployerRatingSummary,
  EmployerWorkerTag,
  WorkerEmployerTag,
} from "./ratingTypes";

/* ------------------------------------------------ */
/* Storage Keys & Constants                         */
/* ------------------------------------------------ */
const ER_KEY = "wm_ratings_employer_to_worker_v1";
const WR_KEY = "wm_ratings_worker_to_employer_v1";
const CHANGED_EVENT = "wm:ratings-changed";
const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

/* ------------------------------------------------ */
/* Edit result type                                 */
/* ------------------------------------------------ */
export type EditResult =
  | { success: true }
  | { success: false; reason: string };

/* ------------------------------------------------ */
/* ID helper                                        */
/* ------------------------------------------------ */
function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/* ------------------------------------------------ */
/* Safe parse helpers                               */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec { return typeof x === "object" && x !== null; }
function str(r: Rec, k: string): string | undefined { const v = r[k]; return typeof v === "string" ? v : undefined; }
function num(r: Rec, k: string): number | undefined { const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : undefined; }
function bool(r: Rec, k: string): boolean | undefined { const v = r[k]; return typeof v === "boolean" ? v : undefined; }

function strArr(r: Rec, k: string): string[] {
  const v = r[k];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function parseERRatings(raw: string | null): EmployerToWorkerRating[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: EmployerToWorkerRating[] = [];
    for (const x of parsed) {
      if (!isRec(x)) continue;
      const id = str(x, "id");
      const domain = str(x, "domain") as "shift" | "career" | undefined;
      const employerWmId = str(x, "employerWmId");
      const workerWmId = str(x, "workerWmId");
      const jobId = str(x, "jobId");
      const stars = num(x, "stars");
      const createdAt = num(x, "createdAt");
      const hireAgain = bool(x, "hireAgain");
      if (!id || !domain || !employerWmId || !workerWmId || !jobId || !stars || !createdAt || hireAgain === undefined) continue;
      if (stars < 1 || stars > 5) continue;
      out.push({
        id, domain, employerWmId, workerWmId, jobId,
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags: strArr(x, "tags") as EmployerWorkerTag[],
        comment: str(x, "comment"),
        hireAgain, createdAt,
        editedAt: num(x, "editedAt") ?? null,
        editCount: num(x, "editCount") ?? 0,
      });
    }
    return out.sort((a, b) => b.createdAt - a.createdAt);
  } catch { return []; }
}

function parseWRRatings(raw: string | null): WorkerToEmployerRating[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: WorkerToEmployerRating[] = [];
    for (const x of parsed) {
      if (!isRec(x)) continue;
      const id = str(x, "id");
      const domain = str(x, "domain") as "shift" | "career" | undefined;
      const workerWmId = str(x, "workerWmId");
      const employerWmId = str(x, "employerWmId");
      const jobId = str(x, "jobId");
      const stars = num(x, "stars");
      const createdAt = num(x, "createdAt");
      const workAgain = bool(x, "workAgain");
      if (!id || !domain || !workerWmId || !employerWmId || !jobId || !stars || !createdAt || workAgain === undefined) continue;
      if (stars < 1 || stars > 5) continue;
      out.push({
        id, domain, workerWmId, employerWmId, jobId,
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags: strArr(x, "tags") as WorkerEmployerTag[],
        comment: str(x, "comment"),
        workAgain, createdAt,
        editedAt: num(x, "editedAt") ?? null,
        editCount: num(x, "editCount") ?? 0,
      });
    }
    return out.sort((a, b) => b.createdAt - a.createdAt);
  } catch { return []; }
}

/* ------------------------------------------------ */
/* Stable-reference cache                           */
/* ------------------------------------------------ */
let _erRaw: string | null = "__init__";
let _erList: EmployerToWorkerRating[] = [];
let _wrRaw: string | null = "__init__";
let _wrList: WorkerToEmployerRating[] = [];

function readER(): EmployerToWorkerRating[] {
  const raw = localStorage.getItem(ER_KEY);
  if (raw === _erRaw) return _erList;
  _erRaw = raw;
  _erList = parseERRatings(raw);
  return _erList;
}

function readWR(): WorkerToEmployerRating[] {
  const raw = localStorage.getItem(WR_KEY);
  if (raw === _wrRaw) return _wrList;
  _wrRaw = raw;
  _wrList = parseWRRatings(raw);
  return _wrList;
}

function notify() {
  try { window.dispatchEvent(new Event(CHANGED_EVENT)); } catch { /* safe */ }
}

/* ------------------------------------------------ */
/* Write helpers                                    */
/* ------------------------------------------------ */
function writeER(list: EmployerToWorkerRating[]) {
  try { localStorage.setItem(ER_KEY, JSON.stringify(list)); } catch { /* safe */ }
  _erRaw = null;
  notify();
}

function writeWR(list: WorkerToEmployerRating[]) {
  try { localStorage.setItem(WR_KEY, JSON.stringify(list)); } catch { /* safe */ }
  _wrRaw = null;
  notify();
}

/* ------------------------------------------------ */
/* Edit eligibility check (internal)                */
/* ------------------------------------------------ */
function checkEditable(createdAt: number, editCount: number): EditResult {
  if (editCount >= 1) return { success: false, reason: "Already edited once. No further edits allowed." };
  if (Date.now() - createdAt >= EDIT_WINDOW_MS) return { success: false, reason: "Edit window expired (48 hours)." };
  return { success: true };
}

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export const ratingStorage = {
  /* Subscribe */
  subscribe(cb: () => void): () => void {
    const h = () => cb();
    const onStorage = (e: StorageEvent) => {
      if (e.key === ER_KEY || e.key === WR_KEY || e.key === null) cb();
    };
    window.addEventListener(CHANGED_EVENT, h);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGED_EVENT, h);
      window.removeEventListener("storage", onStorage);
    };
  },

  /* Snapshots */
  getAllERRatings(): EmployerToWorkerRating[] { return readER(); },
  getAllWRRatings(): WorkerToEmployerRating[] { return readWR(); },

  /* Check if already rated */
  hasEmployerRatedWorker(employerWmId: string, jobId: string, workerWmId: string): boolean {
    return readER().some(
      (r) => r.employerWmId === employerWmId && r.jobId === jobId && r.workerWmId === workerWmId,
    );
  },

  hasWorkerRatedEmployer(workerWmId: string, jobId: string, employerWmId: string): boolean {
    return readWR().some(
      (r) => r.workerWmId === workerWmId && r.jobId === jobId && r.employerWmId === employerWmId,
    );
  },

  /* Get specific rating for edit pre-populate */
  getEmployerRatingForJob(employerWmId: string, jobId: string, workerWmId: string): EmployerToWorkerRating | null {
    return readER().find(
      (r) => r.employerWmId === employerWmId && r.jobId === jobId && r.workerWmId === workerWmId,
    ) ?? null;
  },

  getWorkerRatingForJob(workerWmId: string, jobId: string, employerWmId: string): WorkerToEmployerRating | null {
    return readWR().find(
      (r) => r.workerWmId === workerWmId && r.jobId === jobId && r.employerWmId === employerWmId,
    ) ?? null;
  },

  /* Edit eligibility — UI uses to show/hide edit button */
  canEditEmployerRating(employerWmId: string, jobId: string, workerWmId: string): boolean {
    const r = readER().find(
      (x) => x.employerWmId === employerWmId && x.jobId === jobId && x.workerWmId === workerWmId,
    );
    if (!r) return false;
    return checkEditable(r.createdAt, r.editCount).success;
  },

  canEditWorkerRating(workerWmId: string, jobId: string, employerWmId: string): boolean {
    const r = readWR().find(
      (x) => x.workerWmId === workerWmId && x.jobId === jobId && x.employerWmId === employerWmId,
    );
    if (!r) return false;
    return checkEditable(r.createdAt, r.editCount).success;
  },

  /* Save ratings — permanent, no delete */
  saveEmployerRating(data: Omit<EmployerToWorkerRating, "id" | "createdAt" | "editedAt" | "editCount">): EmployerToWorkerRating {
    const rating: EmployerToWorkerRating = {
      ...data, id: newId("er"), createdAt: Date.now(), editedAt: null, editCount: 0,
    };
    writeER([rating, ...readER()]);
    return rating;
  },

  saveWorkerRating(data: Omit<WorkerToEmployerRating, "id" | "createdAt" | "editedAt" | "editCount">): WorkerToEmployerRating {
    const rating: WorkerToEmployerRating = {
      ...data, id: newId("wr"), createdAt: Date.now(), editedAt: null, editCount: 0,
    };
    writeWR([rating, ...readWR()]);
    return rating;
  },

  /* Edit rating — defense in depth: internal guard */
  editEmployerRating(
    employerWmId: string, jobId: string, workerWmId: string,
    updates: { stars: 1 | 2 | 3 | 4 | 5; tags: EmployerWorkerTag[]; comment?: string; hireAgain: boolean },
  ): EditResult {
    const list = readER();
    const idx = list.findIndex(
      (r) => r.employerWmId === employerWmId && r.jobId === jobId && r.workerWmId === workerWmId,
    );
    if (idx === -1) return { success: false, reason: "Rating not found." };
    const guard = checkEditable(list[idx].createdAt, list[idx].editCount);
    if (!guard.success) return guard;
    list[idx] = {
      ...list[idx], ...updates, editedAt: Date.now(), editCount: 1,
    };
    writeER(list);
    return { success: true };
  },

  editWorkerRating(
    workerWmId: string, jobId: string, employerWmId: string,
    updates: { stars: 1 | 2 | 3 | 4 | 5; tags: WorkerEmployerTag[]; comment?: string; workAgain: boolean },
  ): EditResult {
    const list = readWR();
    const idx = list.findIndex(
      (r) => r.workerWmId === workerWmId && r.jobId === jobId && r.employerWmId === employerWmId,
    );
    if (idx === -1) return { success: false, reason: "Rating not found." };
    const guard = checkEditable(list[idx].createdAt, list[idx].editCount);
    if (!guard.success) return guard;
    list[idx] = {
      ...list[idx], ...updates, editedAt: Date.now(), editCount: 1,
    };
    writeWR(list);
    return { success: true };
  },

  /* Worker rating summary for Smart Selection */
  getWorkerSummary(workerWmId: string): WorkerRatingSummary {
    const ratings = readER().filter((r) => r.workerWmId === workerWmId);
    const total = ratings.length;
    const avgStars = total > 0
      ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / total) * 10) / 10
      : 0;

    const tagCounts = {} as Record<EmployerWorkerTag, number>;
    let hireAgainCount = 0;
    for (const r of ratings) {
      if (r.hireAgain) hireAgainCount++;
      for (const tag of r.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }

    return {
      workerWmId, totalRatings: total, averageStars: avgStars,
      tagCounts, hireAgainCount, hireAgainTotal: total,
      level: "bronze", points: 0,
    };
  },

  /* Employer rating summary */
  getEmployerSummary(employerWmId: string): EmployerRatingSummary {
    const ratings = readWR().filter((r) => r.employerWmId === employerWmId);
    const total = ratings.length;
    const avgStars = total > 0
      ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / total) * 10) / 10
      : 0;

    const tagCounts = {} as Record<WorkerEmployerTag, number>;
    let workAgainCount = 0;
    for (const r of ratings) {
      if (r.workAgain) workAgainCount++;
      for (const tag of r.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }

    return {
      employerWmId, totalRatings: total, averageStars: avgStars,
      tagCounts, workAgainCount, workAgainTotal: total,
    };
  },

  _erKey: ER_KEY,
  _wrKey: WR_KEY,
  _event: CHANGED_EVENT,
} as const;