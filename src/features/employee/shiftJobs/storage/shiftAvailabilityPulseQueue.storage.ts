// App name: Job Mitra
// Queued availability-match pulses for employees (consumed on Shift home visit).

const KEY = "wm_shift_availability_pulse_queue_v1";
const CHANGED = "wm:shift-availability-pulse-queue-changed";

export type ShiftAvailabilityPulseEntry = {
  readonly workerMlId: string;
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
      .map((item): ShiftAvailabilityPulseEntry | null => {
        if (typeof item !== "object" || item === null) return null;
        const record = item as Record<string, unknown>;
        // Dual-read: prefer workerMlId; accept legacy workerWmId from older localStorage JSON.
        const workerMlId =
          typeof record.workerMlId === "string"
            ? record.workerMlId
            : typeof record.workerWmId === "string"
              ? record.workerWmId
              : "";
        const postId = typeof record.postId === "string" ? record.postId : "";
        const createdAt = typeof record.createdAt === "number" ? record.createdAt : NaN;
        if (!workerMlId.trim() || !postId.trim() || !Number.isFinite(createdAt)) return null;
        return { workerMlId, postId, createdAt };
      })
      .filter((entry): entry is ShiftAvailabilityPulseEntry => entry !== null)
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
  enqueueForWorkers(workerMlIds: readonly string[], postId: string): void {
    const cleanPostId = postId.trim();
    if (!cleanPostId) return;

    const now = Date.now();
    const existing = read();
    const seen = new Set(existing.map((entry) => entry.workerMlId));

    const additions: ShiftAvailabilityPulseEntry[] = [];

    for (const rawId of workerMlIds) {
      const workerMlId = rawId.trim();
      if (!workerMlId || seen.has(workerMlId)) continue;

      seen.add(workerMlId);
      additions.push({ workerMlId, postId: cleanPostId, createdAt: now });
    }

    if (additions.length === 0) return;

    write([...additions, ...existing]);
  },

  /** Returns postId and removes the pending pulse for this worker. */
  consumeForWorker(workerMlId: string): string | null {
    const id = workerMlId.trim().toUpperCase();
    if (!id) return null;

    const existing = read();
    const match = existing.find((entry) => entry.workerMlId.trim().toUpperCase() === id);
    if (!match) return null;

    write(existing.filter((entry) => entry.workerMlId.trim().toUpperCase() !== id));
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
