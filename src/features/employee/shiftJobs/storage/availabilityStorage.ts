// src/features/employee/shiftJobs/storage/availabilityStorage.ts
//
// "I'm Available" broadcast storage.
// Employee taps to broadcast availability for today or this week.
// Employers see count of available workers on shift home.
// Auto-expires at midnight (today) or end of week.

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type AvailabilityWindow = "today" | "this_week";

export type AvailabilityBroadcast = {
  workerWmId: string;
  workerName: string;
  window: AvailabilityWindow;
  broadcastAt: number;
  expiresAt: number;
  city?: string;
  category?: string;
};

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const BROADCAST_KEY  = "wm_employee_availability_broadcast_v1";
const ALL_KEY        = "wm_all_availability_broadcasts_v1";
const CHANGED        = "wm:availability-broadcasts-changed";

/* ------------------------------------------------ */
/* Expiry helpers                                   */
/* ------------------------------------------------ */
function endOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function endOfWeek(): number {
  const d = new Date();
  const daysUntilSunday = 7 - d.getDay();
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function isExpired(b: AvailabilityBroadcast): boolean {
  return Date.now() > b.expiresAt;
}

/* ------------------------------------------------ */
/* Storage API                                      */
/* ------------------------------------------------ */
export const availabilityStorage = {
  /** Get current worker's active broadcast (if any) */
  getMyBroadcast(): AvailabilityBroadcast | null {
    try {
      const raw = localStorage.getItem(BROADCAST_KEY);
      if (!raw) return null;
      const b = JSON.parse(raw) as AvailabilityBroadcast;
      if (isExpired(b)) {
        localStorage.removeItem(BROADCAST_KEY);
        return null;
      }
      return b;
    } catch { return null; }
  },

  /** Broadcast availability */
  broadcast(params: {
    workerWmId: string;
    workerName: string;
    window: AvailabilityWindow;
    city?: string;
    category?: string;
  }): void {
    const now  = Date.now();
    const expiresAt = params.window === "today" ? endOfToday() : endOfWeek();
    const b: AvailabilityBroadcast = {
      ...params,
      broadcastAt: now,
      expiresAt,
    };
    try {
      localStorage.setItem(BROADCAST_KEY, JSON.stringify(b));

      /* Also write to shared pool so employer can read count */
      const existing = this.getAllActive();
      const filtered = existing.filter((x) => x.workerWmId !== params.workerWmId);
      localStorage.setItem(ALL_KEY, JSON.stringify([b, ...filtered].slice(0, 200)));
      window.dispatchEvent(new Event(CHANGED));

      /* Push individual notification to employer notifications */
      try {
        const ER_NOTES_KEY = "wm_employer_notifications_v1";
        const existingNotes = JSON.parse(localStorage.getItem(ER_NOTES_KEY) ?? "[]") as object[];
        const cityText = params.city ? ` near ${params.city}` : "";
        const catText  = params.category ? ` — ${params.category}` : "";
        const note = {
          id: `n_avail_${now.toString(16)}`,
          domain: "shift",
          title: "Worker available now",
          body: `${params.workerName}${cityText} is available ${params.window === "today" ? "today" : "this week"}${catText}. Tap to post a shift.`,
          createdAt: now,
          isRead: false,
          route: "/employer/shift/home",
        };
        localStorage.setItem(ER_NOTES_KEY, JSON.stringify([note, ...existingNotes].slice(0, 100)));
        window.dispatchEvent(new Event("wm:employer-notifications-changed"));
      } catch { /* safe */ }
    } catch { /* safe */ }
  },

  /** Clear my broadcast */
  clearMyBroadcast(): void {
    try {
      const b = this.getMyBroadcast();
      if (b) {
        const existing = this.getAllActive();
        localStorage.setItem(ALL_KEY, JSON.stringify(existing.filter((x) => x.workerWmId !== b.workerWmId)));
      }
      localStorage.removeItem(BROADCAST_KEY);
      window.dispatchEvent(new Event(CHANGED));
    } catch { /* safe */ }
  },

  /** Get all active (non-expired) broadcasts — employer reads this */
  getAllActive(): AvailabilityBroadcast[] {
    try {
      const raw = localStorage.getItem(ALL_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw) as AvailabilityBroadcast[];
      return Array.isArray(list) ? list.filter((b) => !isExpired(b)) : [];
    } catch { return []; }
  },

  /** Count of active broadcasts (for employer home) */
  getActiveCount(): number {
    return this.getAllActive().length;
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

  windowLabel(w: AvailabilityWindow): string {
    return w === "today" ? "Today" : "This week";
  },

  CHANGED_EVENT: CHANGED,
} as const;