import type { AvailabilityBroadcast, RollingDay } from "./availabilityStorage.types";

export type { AvailabilityBroadcast, RollingDay };

type LegacyBroadcast = AvailabilityBroadcast & {
  window?: "today" | "this_week";
};

export const BROADCAST_KEY = "wm_employee_availability_broadcast_v1";
export const ALL_KEY = "wm_all_availability_broadcasts_v1";
export const CHANGED = "wm:availability-broadcasts-changed";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getRolling7Days(from = new Date()): RollingDay[] {
  const days: RollingDay[] = [];

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(from);
    d.setHours(12, 0, 0, 0);
    d.setDate(from.getDate() + i);
    days.push({
      iso: toIsoDate(d),
      weekday: WEEKDAY_SHORT[d.getDay()],
      dayNum: d.getDate(),
    });
  }

  return days;
}

function endOfIsoDate(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

export function isoFromEpoch(ms: number): string {
  return toIsoDate(new Date(ms));
}

function rollingWindowSet(from = new Date()): Set<string> {
  return new Set(getRolling7Days(from).map((day) => day.iso));
}

export function sanitizeSelectedDates(dates: string[], from = new Date()): string[] {
  const allowed = rollingWindowSet(from);
  const todayIso = toIsoDate(from);
  const uniq = new Set<string>();

  for (const iso of dates) {
    if (!allowed.has(iso)) continue;
    if (iso < todayIso) continue;
    uniq.add(iso);
  }

  return [...uniq].sort();
}

export function computeExpiresAt(selectedDates: string[]): number {
  if (selectedDates.length === 0) return Date.now();
  const last = selectedDates[selectedDates.length - 1];
  return endOfIsoDate(last);
}

export function normalizeBroadcast(raw: unknown): AvailabilityBroadcast | null {
  if (typeof raw !== "object" || raw === null) return null;

  const record = raw as LegacyBroadcast & { workerWmId?: string };
  const workerMlId =
    typeof record.workerMlId === "string"
      ? record.workerMlId
      : typeof record.workerWmId === "string"
        ? record.workerWmId
        : "";
  if (!workerMlId || typeof record.workerName !== "string") {
    return null;
  }

  let selectedDates: string[] = [];

  if (Array.isArray(record.selectedDates)) {
    selectedDates = sanitizeSelectedDates(
      record.selectedDates.filter((d): d is string => typeof d === "string"),
    );
  } else if (record.window === "today") {
    selectedDates = sanitizeSelectedDates([toIsoDate(new Date())]);
  } else if (record.window === "this_week") {
    selectedDates = sanitizeSelectedDates(getRolling7Days().map((d) => d.iso));
  }

  if (selectedDates.length === 0) return null;

  const broadcastAt =
    typeof record.broadcastAt === "number" && Number.isFinite(record.broadcastAt)
      ? record.broadcastAt
      : Date.now();

  const expiresAt =
    typeof record.expiresAt === "number" && Number.isFinite(record.expiresAt)
      ? record.expiresAt
      : computeExpiresAt(selectedDates);

  if (Date.now() > expiresAt) return null;

  return {
    workerMlId,
    workerName: record.workerName,
    selectedDates,
    broadcastAt,
    expiresAt,
    city: typeof record.city === "string" ? record.city : undefined,
    category: typeof record.category === "string" ? record.category : undefined,
  };
}

export function isExpired(b: AvailabilityBroadcast): boolean {
  return Date.now() > b.expiresAt;
}

export function writeToPool(b: AvailabilityBroadcast): void {
  const key = b.workerMlId.trim().toUpperCase();
  const existing = readAllActiveFromStorage();
  const filtered = existing.filter((x) => x.workerMlId.trim().toUpperCase() !== key);
  localStorage.setItem(ALL_KEY, JSON.stringify([b, ...filtered].slice(0, 200)));
  invalidateAvailabilityPoolCache();
}

export function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function readAllActiveFromStorage(): AvailabilityBroadcast[] {
  try {
    const raw = localStorage.getItem(ALL_KEY);
    if (!raw) return [];

    const list = JSON.parse(raw) as unknown[];
    if (!Array.isArray(list)) return [];

    return list
      .map(normalizeBroadcast)
      .filter((item): item is AvailabilityBroadcast => item !== null && !isExpired(item));
  } catch {
    return [];
  }
}

let activePoolCacheKey = "";
let activePoolCache: AvailabilityBroadcast[] = [];

export function getAllActiveFromStorage(): AvailabilityBroadcast[] {
  try {
    const raw = localStorage.getItem(ALL_KEY) ?? "";
    if (raw === activePoolCacheKey) return activePoolCache;
    activePoolCacheKey = raw;
    activePoolCache = readAllActiveFromStorage();
    return activePoolCache;
  } catch {
    activePoolCacheKey = "";
    activePoolCache = [];
    return activePoolCache;
  }
}

/** Invalidate pool cache after writes (same-tab). */
export function invalidateAvailabilityPoolCache(): void {
  activePoolCacheKey = "";
  activePoolCache = [];
}
