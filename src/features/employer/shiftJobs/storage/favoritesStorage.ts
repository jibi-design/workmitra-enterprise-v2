// src/features/employer/shiftJobs/storage/favoritesStorage.ts
//
// Favorites / Hire Again storage.
// Workers saved by Mitra Labs ID. Auto-added when employer selects "Hire Again = Yes".
// Employer can also manually add by Mitra Labs ID or remove.

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type FavoriteWorker = {
  id: string;
  /** Worker Mitra Labs ID — primary identifier */
  workerMlId: string;
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
const KEY = "wm_employer_shift_favorites_v1";
const CHANGED = "wm:employer-shift-favorites-changed";

/* ------------------------------------------------ */
/* Internal helpers                                 */
/* ------------------------------------------------ */
function read(): FavoriteWorker[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): FavoriteWorker | null => {
        if (typeof item !== "object" || item === null) return null;
        const rec = item as Record<string, unknown>;
        // Dual-read: prefer workerMlId; accept legacy workerWmId from older localStorage JSON.
        const workerMlId =
          typeof rec.workerMlId === "string"
            ? rec.workerMlId
            : typeof rec.workerWmId === "string"
              ? rec.workerWmId
              : "";
        if (!workerMlId) return null;
        const id = typeof rec.id === "string" ? rec.id : "";
        const workerName = typeof rec.workerName === "string" ? rec.workerName : "";
        const addedAt = typeof rec.addedAt === "number" ? rec.addedAt : Date.now();
        const shiftsWorked = typeof rec.shiftsWorked === "number" ? rec.shiftsWorked : 0;
        const avgStars = typeof rec.avgStars === "number" ? rec.avgStars : 0;
        const addedVia =
          rec.addedVia === "hire_again_rating" || rec.addedVia === "manual"
            ? rec.addedVia
            : "manual";
        return {
          id: id || `fav_${workerMlId}`,
          workerMlId,
          workerName,
          jobTitle: typeof rec.jobTitle === "string" ? rec.jobTitle : undefined,
          lastRatedAt: typeof rec.lastRatedAt === "number" ? rec.lastRatedAt : undefined,
          shiftsWorked,
          avgStars,
          addedAt,
          addedVia,
          notes: typeof rec.notes === "string" ? rec.notes : undefined,
        };
      })
      .filter((f): f is FavoriteWorker => f !== null);
  } catch {
    return [];
  }
}

function write(list: FavoriteWorker[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* safe */
  }
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

  find(workerMlId: string): FavoriteWorker | null {
    return read().find((f) => f.workerMlId === workerMlId) ?? null;
  },

  isFavorite(workerMlId: string): boolean {
    return !!this.find(workerMlId);
  },

  /** Called automatically when employer rates "Hire Again = Yes" */
  addFromRating(params: {
    workerMlId: string;
    workerName: string;
    jobTitle: string;
    stars: number;
  }): void {
    const list = read();
    const existing = list.find((f) => f.workerMlId === params.workerMlId);
    const now = Date.now();

    if (existing) {
      /* Update stats */
      const idx = list.indexOf(existing);
      list[idx] = {
        ...existing,
        workerName: params.workerName,
        jobTitle: params.jobTitle,
        lastRatedAt: now,
        shiftsWorked: existing.shiftsWorked + 1,
        avgStars:
          existing.avgStars === 0
            ? params.stars
            : Math.round(
                ((existing.avgStars * existing.shiftsWorked + params.stars) /
                  (existing.shiftsWorked + 1)) *
                  10,
              ) / 10,
      };
      write(list);
    } else {
      write([
        {
          id: genId(),
          workerMlId: params.workerMlId,
          workerName: params.workerName,
          jobTitle: params.jobTitle,
          lastRatedAt: now,
          shiftsWorked: 1,
          avgStars: params.stars,
          addedAt: now,
          addedVia: "hire_again_rating",
        },
        ...list,
      ]);
    }
  },

  /** Manual add by Mitra Labs ID */
  addManual(params: { workerMlId: string; workerName: string }): boolean {
    const list = read();
    if (list.some((f) => f.workerMlId === params.workerMlId)) return false;
    write([
      {
        id: genId(),
        workerMlId: params.workerMlId,
        workerName: params.workerName,
        shiftsWorked: 0,
        avgStars: 0,
        addedAt: Date.now(),
        addedVia: "manual",
      },
      ...list,
    ]);
    return true;
  },

  /** Update notes */
  updateNotes(workerMlId: string, notes: string): void {
    const list = read();
    write(
      list.map((f) =>
        f.workerMlId === workerMlId ? { ...f, notes: notes.trim() || undefined } : f,
      ),
    );
  },

  /** Remove from favorites */
  remove(workerMlId: string): void {
    write(read().filter((f) => f.workerMlId !== workerMlId));
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
