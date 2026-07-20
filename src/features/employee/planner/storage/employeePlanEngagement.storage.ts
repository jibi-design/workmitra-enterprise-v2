// Job Mitra | employeePlanEngagement.storage.ts | Section 6.9 (P2)

const STORAGE_KEY = "wm_employee_plan_engagement_v1";
const CHANGED_EVENT = "wm:employee-plan-engagement-changed";

export type EmployeePlanEngagement = {
  planId: string;
  savedAt?: number;
  lastViewedAt?: number;
  dismissedAt?: number;
  schemaVersion: 1;
};

function notifyChanged(): void {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function safeRead(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWrite(records: EmployeePlanEngagement[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    notifyChanged();
  } catch {
    // fail-silent
  }
}

function normalizePlanId(value: string): string | null {
  const clean = value.trim();
  if (!clean || clean.length > 120) return null;
  return clean;
}

function parseRecords(raw: string | null): EmployeePlanEngagement[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const byPlanId = new Map<string, EmployeePlanEngagement>();

    for (const item of parsed) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) continue;
      const record = item as Record<string, unknown>;
      const planId = typeof record.planId === "string" ? normalizePlanId(record.planId) : null;
      if (!planId) continue;

      const existing = byPlanId.get(planId);
      const next: EmployeePlanEngagement = {
        planId,
        schemaVersion: 1,
        savedAt:
          typeof record.savedAt === "number" && record.savedAt > 0
            ? record.savedAt
            : existing?.savedAt,
        lastViewedAt:
          typeof record.lastViewedAt === "number" && record.lastViewedAt > 0
            ? record.lastViewedAt
            : existing?.lastViewedAt,
        dismissedAt:
          typeof record.dismissedAt === "number" && record.dismissedAt > 0
            ? record.dismissedAt
            : existing?.dismissedAt,
      };

      if (!existing || (next.lastViewedAt ?? 0) >= (existing.lastViewedAt ?? 0)) {
        byPlanId.set(planId, next);
      }
    }

    return Array.from(byPlanId.values());
  } catch {
    return [];
  }
}

function getAll(): EmployeePlanEngagement[] {
  return parseRecords(safeRead());
}

function getByPlanId(planId: string): EmployeePlanEngagement | null {
  const clean = normalizePlanId(planId);
  if (!clean) return null;
  return getAll().find((r) => r.planId === clean) ?? null;
}

function upsert(
  partial: Pick<EmployeePlanEngagement, "planId"> &
    Partial<Omit<EmployeePlanEngagement, "planId" | "schemaVersion">>,
): void {
  const planId = normalizePlanId(partial.planId);
  if (!planId) return;

  const records = getAll();
  const idx = records.findIndex((r) => r.planId === planId);
  const existing = idx >= 0 ? records[idx] : null;

  const next: EmployeePlanEngagement = {
    planId,
    schemaVersion: 1,
    savedAt: partial.savedAt ?? existing?.savedAt,
    lastViewedAt: partial.lastViewedAt ?? existing?.lastViewedAt,
    dismissedAt: partial.dismissedAt ?? existing?.dismissedAt,
  };

  if (idx >= 0) {
    records[idx] = next;
  } else {
    records.push(next);
  }

  safeWrite(records);
}

function markViewed(planId: string): void {
  upsert({ planId, lastViewedAt: Date.now() });
}

function toggleSaved(planId: string): boolean {
  const existing = getByPlanId(planId);
  const now = Date.now();

  if (existing?.savedAt) {
    upsert({ planId, savedAt: undefined, lastViewedAt: existing.lastViewedAt });
    return false;
  }

  upsert({ planId, savedAt: now, lastViewedAt: existing?.lastViewedAt ?? now });
  return true;
}

function isSaved(planId: string): boolean {
  return Boolean(getByPlanId(planId)?.savedAt);
}

function getSavedPlanIds(): string[] {
  return getAll()
    .filter((r) => r.savedAt && !r.dismissedAt)
    .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))
    .map((r) => r.planId);
}

function getRecentlyViewedPlanIds(limit = 5): string[] {
  return getAll()
    .filter((r) => r.lastViewedAt && !r.dismissedAt)
    .sort((a, b) => (b.lastViewedAt ?? 0) - (a.lastViewedAt ?? 0))
    .slice(0, limit)
    .map((r) => r.planId);
}

function getSnapshotKey(): string {
  return safeRead() ?? "";
}

function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  const events = ["storage", "focus", CHANGED_EVENT] as const;

  for (const eventName of events) {
    window.addEventListener(eventName, handler);
  }
  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const eventName of events) {
      window.removeEventListener(eventName, handler);
    }
    document.removeEventListener("visibilitychange", handler);
  };
}

export const employeePlanEngagementStorage = {
  getAll,
  getByPlanId,
  markViewed,
  toggleSaved,
  isSaved,
  getSavedPlanIds,
  getRecentlyViewedPlanIds,
  getSnapshotKey,
  subscribe,
};
