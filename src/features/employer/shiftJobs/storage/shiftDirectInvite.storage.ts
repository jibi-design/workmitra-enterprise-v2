// App name: Job Mitra
// Direct invite records — Favorite Worker trusted path (silent, no pulse).

export type ShiftDirectInviteStatus = "pending" | "accepted" | "declined" | "expired";

export type ShiftDirectInvite = {
  id: string;
  postId: string;
  workerMlId: string;
  workerName: string;
  companyName: string;
  jobName: string;
  sentAt: number;
  status: ShiftDirectInviteStatus;
  acceptedAt?: number;
  appId?: string;
};

const KEY = "wm_shift_direct_invites_v1";
const CHANGED = "wm:shift-direct-invites-changed";

function normalizeInvite(raw: unknown): ShiftDirectInvite | null {
  if (typeof raw !== "object" || raw === null) return null;
  const rec = raw as Record<string, unknown>;
  // Dual-read: prefer workerMlId; accept legacy workerWmId from older localStorage JSON.
  const workerMlId =
    typeof rec.workerMlId === "string"
      ? rec.workerMlId
      : typeof rec.workerWmId === "string"
        ? rec.workerWmId
        : "";
  if (!workerMlId) return null;
  return { ...(raw as ShiftDirectInvite), workerMlId };
}

function read(): ShiftDirectInvite[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeInvite).filter((i): i is ShiftDirectInvite => i !== null);
  } catch {
    return [];
  }
}

function write(list: ShiftDirectInvite[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 300)));
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* safe */
  }
}

function genId(): string {
  return `sdi_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export const shiftDirectInviteStorage = {
  getAll(): ShiftDirectInvite[] {
    return read().sort((a, b) => b.sentAt - a.sentAt);
  },

  getPendingForWorker(workerMlId: string): ShiftDirectInvite[] {
    const key = workerMlId.trim().toUpperCase();
    if (!key) return [];

    return read().filter(
      (item) => item.workerMlId.trim().toUpperCase() === key && item.status === "pending",
    );
  },

  getPendingForWorkerPost(workerMlId: string, postId: string): ShiftDirectInvite | null {
    const key = workerMlId.trim().toUpperCase();
    return (
      read().find(
        (item) =>
          item.workerMlId.trim().toUpperCase() === key &&
          item.postId === postId &&
          item.status === "pending",
      ) ?? null
    );
  },

  createPending(input: Omit<ShiftDirectInvite, "id" | "sentAt" | "status">): ShiftDirectInvite {
    const now = Date.now();
    const workerKey = input.workerMlId.trim().toUpperCase();

    const withoutStale = read().map((item) => {
      if (
        item.workerMlId.trim().toUpperCase() === workerKey &&
        item.postId === input.postId &&
        item.status === "pending"
      ) {
        return { ...item, status: "expired" as const };
      }
      return item;
    });

    const invite: ShiftDirectInvite = {
      ...input,
      workerMlId: workerKey,
      id: genId(),
      sentAt: now,
      status: "pending",
    };

    write([invite, ...withoutStale]);
    return invite;
  },

  markAccepted(id: string, appId: string): void {
    const now = Date.now();
    write(
      read().map((item) =>
        item.id === id ? { ...item, status: "accepted" as const, acceptedAt: now, appId } : item,
      ),
    );
  },

  markDeclined(id: string): void {
    write(read().map((item) => (item.id === id ? { ...item, status: "declined" as const } : item)));
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

  CHANGED_EVENT: CHANGED,
} as const;
