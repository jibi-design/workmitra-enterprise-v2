// App name: Job Mitra
// Queued availability-match pulses for employees (consumed on Shift home visit).

const KEY = "wm_shift_availability_pulse_queue_v1";
const CHANGED = "wm:shift-availability-pulse-queue-changed";

export type ShiftAvailabilityPulseEntry = {
  readonly workerWmId: string;
  readonly postId: string;
  readonly createdAt: number;
};

function read(): ShiftAvailabilityPulseEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is ShiftAvailabilityPulseEntry => {
        if (typeof item !== "object" || item === null) return false;
        const record = item as ShiftAvailabilityPulseEntry;
        return (
          typeof record.workerWmId === "string" &&
          record.workerWmId.trim().length > 0 &&
          typeof record.postId === "string" &&
          record.postId.trim().length > 0 &&
          typeof record.createdAt === "number"
        );
      })
      .slice(0, 500);
  } catch {
    return [];
  }
}

function write(entries: readonly ShiftAvailabilityPulseEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* safe */
  }
}

export const shiftAvailabilityPulseQueueStorage = {
  enqueueForWorkers(workerWmIds: readonly string[], postId: string): void {
    const cleanPostId = postId.trim();
    if (!cleanPostId) return;

    const now = Date.now();
    const existing = read();
    const seen = new Set(existing.map((entry) => entry.workerWmId));

    const additions: ShiftAvailabilityPulseEntry[] = [];

    for (const rawId of workerWmIds) {
      const workerWmId = rawId.trim();
      if (!workerWmId || seen.has(workerWmId)) continue;

      seen.add(workerWmId);
      additions.push({ workerWmId, postId: cleanPostId, createdAt: now });
    }

    if (additions.length === 0) return;

    write([...additions, ...existing]);
  },

  /** Returns postId and removes the pending pulse for this worker. */
  consumeForWorker(workerWmId: string): string | null {
    const id = workerWmId.trim();
    if (!id) return null;

    const existing = read();
    const match = existing.find((entry) => entry.workerWmId === id);
    if (!match) return null;

    write(existing.filter((entry) => entry.workerWmId !== id));
    return match.postId;
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(CHANGED, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGED, handler);
      window.removeEventListener("storage", handler);
    };
  },
} as const;
