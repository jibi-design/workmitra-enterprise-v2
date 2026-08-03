// App name: Job Mitra
// Direct invite records — employer-scoped SoT + worker projection (Step 1).

import {
  getShiftEmployerScopeId,
  shiftEmployerScopedKey,
} from "../../../shared/shift/shiftEmployerScope";
import {
  ensureEmployerInvitesHydrated,
  findScopeIdForPostId,
  LEGACY_GLOBAL_INVITES_KEY,
  mergeEmployerInvitesIntoWorkerProjection,
  migrateLegacyInvitesToWorkerProjection,
  WORKER_INVITES_PROJECTION_KEY,
} from "../../../shared/shift/shiftTenantProjection";

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
  /** Owning employer tenant — stamped on create for worker-side updates. */
  employerScopeId?: string;
  /** Wave-5: server invite token required for AUTH ON direct-accept */
  serverInviteToken?: string;
};

const CHANGED = "wm:shift-direct-invites-changed";

function normalizeInvite(raw: unknown): ShiftDirectInvite | null {
  if (typeof raw !== "object" || raw === null) return null;
  const rec = raw as Record<string, unknown>;
  const workerMlId =
    typeof rec.workerMlId === "string"
      ? rec.workerMlId
      : typeof rec.workerWmId === "string"
        ? rec.workerWmId
        : "";
  if (!workerMlId) return null;
  return { ...(raw as ShiftDirectInvite), workerMlId };
}

function readArray(key: string): ShiftDirectInvite[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeInvite).filter((i): i is ShiftDirectInvite => i !== null);
  } catch {
    return [];
  }
}

function writeEmployerScoped(list: ShiftDirectInvite[], scopeId = getShiftEmployerScopeId()): void {
  const key = shiftEmployerScopedKey("shift_direct_invites_v1", scopeId);
  try {
    const stamped = list.slice(0, 300).map((item) => ({
      ...item,
      employerScopeId: item.employerScopeId ?? scopeId,
    }));
    localStorage.setItem(key, JSON.stringify(stamped));
    mergeEmployerInvitesIntoWorkerProjection(stamped as unknown as Record<string, unknown>[]);
    // Clear legacy global so employer ops no longer use it as SoT.
    try {
      localStorage.removeItem(LEGACY_GLOBAL_INVITES_KEY);
    } catch {
      /* safe */
    }
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* safe */
  }
}

function readEmployerScoped(): ShiftDirectInvite[] {
  const key = ensureEmployerInvitesHydrated();
  return readArray(key);
}

function readWorkerProjection(): ShiftDirectInvite[] {
  migrateLegacyInvitesToWorkerProjection();
  return readArray(WORKER_INVITES_PROJECTION_KEY);
}

function writeWorkerProjection(list: ShiftDirectInvite[]): void {
  try {
    localStorage.setItem(WORKER_INVITES_PROJECTION_KEY, JSON.stringify(list.slice(0, 300)));
    try {
      localStorage.removeItem(LEGACY_GLOBAL_INVITES_KEY);
    } catch {
      /* safe */
    }
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* safe */
  }
}

function updateInviteEverywhere(
  id: string,
  mapFn: (item: ShiftDirectInvite) => ShiftDirectInvite,
): void {
  const fromProjection = readWorkerProjection();
  const current =
    fromProjection.find((item) => item.id === id) ??
    readEmployerScoped().find((item) => item.id === id);
  if (!current) return;

  const next = mapFn(current);
  const scopeId =
    next.employerScopeId?.trim() || findScopeIdForPostId(next.postId) || getShiftEmployerScopeId();

  const scoped = readArray(shiftEmployerScopedKey("shift_direct_invites_v1", scopeId));
  const scopedNext = (scoped.some((i) => i.id === id) ? scoped : [...scoped, current]).map(
    (item) => (item.id === id ? { ...next, employerScopeId: scopeId } : item),
  );
  writeEmployerScoped(scopedNext, scopeId);

  const projNext = readWorkerProjection().map((item) => (item.id === id ? next : item));
  if (!projNext.some((item) => item.id === id)) {
    projNext.unshift(next);
  }
  writeWorkerProjection(projNext);
}

function genId(): string {
  return `sdi_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export const shiftDirectInviteStorage = {
  /** Employer-facing: active tenant invites only. */
  getAll(): ShiftDirectInvite[] {
    return readEmployerScoped().sort((a, b) => b.sentAt - a.sentAt);
  },

  /** Worker-facing: projection across employers. */
  getAllForWorker(): ShiftDirectInvite[] {
    return readWorkerProjection().sort((a, b) => b.sentAt - a.sentAt);
  },

  getPendingForWorker(workerMlId: string): ShiftDirectInvite[] {
    const key = workerMlId.trim().toUpperCase();
    if (!key) return [];

    return readWorkerProjection().filter(
      (item) => item.workerMlId.trim().toUpperCase() === key && item.status === "pending",
    );
  },

  getPendingForWorkerPost(workerMlId: string, postId: string): ShiftDirectInvite | null {
    const key = workerMlId.trim().toUpperCase();
    return (
      readWorkerProjection().find(
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
    const scopeId = input.employerScopeId?.trim() || getShiftEmployerScopeId();

    const withoutStale = readEmployerScoped().map((item) => {
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
      employerScopeId: scopeId,
      id: genId(),
      sentAt: now,
      status: "pending",
    };

    writeEmployerScoped([invite, ...withoutStale], scopeId);
    return invite;
  },

  /** Replace full employer list (AUTH server id remap). */
  replaceAllForActiveEmployer(list: ShiftDirectInvite[]): void {
    writeEmployerScoped(list);
  },

  markAccepted(id: string, appId: string): void {
    const now = Date.now();
    updateInviteEverywhere(id, (item) => ({
      ...item,
      status: "accepted",
      acceptedAt: now,
      appId,
    }));
  },

  markDeclined(id: string): void {
    updateInviteEverywhere(id, (item) => ({ ...item, status: "declined" }));
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
  WORKER_PROJECTION_KEY: WORKER_INVITES_PROJECTION_KEY,
} as const;
