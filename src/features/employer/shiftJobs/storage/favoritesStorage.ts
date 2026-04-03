// src/features/employer/shiftJobs/storage/favoritesStorage.ts
//
// Favorites / Hire Again storage.
// Workers saved by WM ID. Auto-added when employer selects "Hire Again = Yes".
// Employer can also manually add by WM ID or remove.

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type FavoriteWorker = {
  id: string;
  /** Worker WM ID — primary identifier */
  workerWmId: string;
  workerName: string;
  /** Optional snapshot from last rating */
  jobTitle?: string;
  lastRatedAt?: number;
  /** Total shifts completed together */
  shiftsWorked: number;
  /** Average stars from employer ratings */
  avgStars: number;
  addedAt: number;
  /** Source of addition */
  addedVia: "hire_again_rating" | "manual";
  notes?: string;
};

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const KEY     = "wm_employer_shift_favorites_v1";
const CHANGED = "wm:employer-shift-favorites-changed";

/* ------------------------------------------------ */
/* Internal helpers                                 */
/* ------------------------------------------------ */
function read(): FavoriteWorker[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FavoriteWorker[]) : [];
  } catch { return []; }
}

function write(list: FavoriteWorker[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGED));
  } catch { /* safe */ }
}

function genId(): string {
  return `fav_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

/* ------------------------------------------------ */
/* Storage API                                      */
/* ------------------------------------------------ */
export const favoritesStorage = {
  getAll(): FavoriteWorker[] {
    return read().sort((a, b) => b.addedAt - a.addedAt);
  },

  find(workerWmId: string): FavoriteWorker | null {
    return read().find((f) => f.workerWmId === workerWmId) ?? null;
  },

  isFavorite(workerWmId: string): boolean {
    return !!this.find(workerWmId);
  },

  /** Called automatically when employer rates "Hire Again = Yes" */
  addFromRating(params: {
    workerWmId: string;
    workerName: string;
    jobTitle: string;
    stars: number;
  }): void {
    const list = read();
    const existing = list.find((f) => f.workerWmId === params.workerWmId);
    const now = Date.now();

    if (existing) {
      /* Update stats */
      const idx = list.indexOf(existing);
      list[idx] = {
        ...existing,
        workerName:  params.workerName,
        jobTitle:    params.jobTitle,
        lastRatedAt: now,
        shiftsWorked: existing.shiftsWorked + 1,
        avgStars: existing.avgStars === 0
          ? params.stars
          : Math.round(((existing.avgStars * existing.shiftsWorked + params.stars) / (existing.shiftsWorked + 1)) * 10) / 10,
      };
      write(list);
    } else {
      write([{
        id: genId(),
        workerWmId: params.workerWmId,
        workerName: params.workerName,
        jobTitle:   params.jobTitle,
        lastRatedAt: now,
        shiftsWorked: 1,
        avgStars: params.stars,
        addedAt: now,
        addedVia: "hire_again_rating",
      }, ...list]);
    }
  },

  /** Manual add by WM ID */
  addManual(params: { workerWmId: string; workerName: string }): boolean {
    const list = read();
    if (list.some((f) => f.workerWmId === params.workerWmId)) return false;
    write([{
      id: genId(),
      workerWmId: params.workerWmId,
      workerName: params.workerName,
      shiftsWorked: 0,
      avgStars: 0,
      addedAt: Date.now(),
      addedVia: "manual",
    }, ...list]);
    return true;
  },

  /** Update notes */
  updateNotes(workerWmId: string, notes: string): void {
    const list = read();
    write(list.map((f) => f.workerWmId === workerWmId ? { ...f, notes: notes.trim() || undefined } : f));
  },

  /** Remove from favorites */
  remove(workerWmId: string): void {
    write(read().filter((f) => f.workerWmId !== workerWmId));
  },

  subscribe(cb: () => void): () => void {
    const h = () => cb();
    window.addEventListener(CHANGED, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(CHANGED, h);
      window.removeEventListener("storage", h);
    };
  },

  CHANGED_EVENT: CHANGED,
} as const;