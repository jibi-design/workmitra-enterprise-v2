// src/features/employee/shiftJobs/storage/availabilityStorage.ts
//
// Phase 1: 7-day rolling calendar availability.
// Employee selects ISO dates (today + next 6). Auto-saved to local pool.
// Phase 2 (Talent Radar / home counts) must NOT read counts on employer home in Phase 1.

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type RollingDay = {
  iso: string;
  weekday: string;
  dayNum: number;
};

export type AvailabilityBroadcast = {
  workerWmId: string;
  workerName: string;
  selectedDates: string[];
  broadcastAt: number;
  expiresAt: number;
  city?: string;
  category?: string;
};

type LegacyBroadcast = AvailabilityBroadcast & {
  window?: "today" | "this_week";
};

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const BROADCAST_KEY = "wm_employee_availability_broadcast_v1";
const ALL_KEY = "wm_all_availability_broadcasts_v1";
const CHANGED = "wm:availability-broadcasts-changed";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/* ------------------------------------------------ */
/* Date helpers                                     */
/* ------------------------------------------------ */
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

function isoFromEpoch(ms: number): string {
  return toIsoDate(new Date(ms));
}

function rollingWindowSet(from = new Date()): Set<string> {
  return new Set(getRolling7Days(from).map((day) => day.iso));
}

function sanitizeSelectedDates(dates: string[], from = new Date()): string[] {
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

function computeExpiresAt(selectedDates: string[]): number {
  if (selectedDates.length === 0) return Date.now();
  const last = selectedDates[selectedDates.length - 1];
  return endOfIsoDate(last);
}

function normalizeBroadcast(raw: unknown): AvailabilityBroadcast | null {
  if (typeof raw !== "object" || raw === null) return null;

  const record = raw as LegacyBroadcast;
  if (typeof record.workerWmId !== "string" || typeof record.workerName !== "string") {
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
    workerWmId: record.workerWmId,
    workerName: record.workerName,
    selectedDates,
    broadcastAt,
    expiresAt,
    city: typeof record.city === "string" ? record.city : undefined,
    category: typeof record.category === "string" ? record.category : undefined,
  };
}

function isExpired(b: AvailabilityBroadcast): boolean {
  return Date.now() > b.expiresAt;
}

function writeToPool(b: AvailabilityBroadcast): void {
  const existing = availabilityStorage.getAllActive();
  const filtered = existing.filter((x) => x.workerWmId !== b.workerWmId);
  localStorage.setItem(ALL_KEY, JSON.stringify([b, ...filtered].slice(0, 200)));
}

function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

/* ------------------------------------------------ */
/* Storage API                                      */
/* ------------------------------------------------ */
export const availabilityStorage = {
  getMyBroadcast(): AvailabilityBroadcast | null {
    try {
      const raw = localStorage.getItem(BROADCAST_KEY);
      if (!raw) return null;

      const normalized = normalizeBroadcast(JSON.parse(raw) as unknown);
      if (!normalized) {
        localStorage.removeItem(BROADCAST_KEY);
        return null;
      }

      return normalized;
    } catch {
      return null;
    }
  },

  getMySelectedDates(): string[] {
    return this.getMyBroadcast()?.selectedDates ?? [];
  },

  /** Auto-save rolling calendar selection (Phase 1 — no employer notifications). */
  saveMyAvailability(params: {
    workerWmId: string;
    workerName: string;
    selectedDates: string[];
    city?: string;
    category?: string;
  }): void {
    const selectedDates = sanitizeSelectedDates(params.selectedDates);

    if (selectedDates.length === 0) {
      this.clearMyBroadcast();
      return;
    }

    const now = Date.now();
    const b: AvailabilityBroadcast = {
      workerWmId: params.workerWmId,
      workerName: params.workerName,
      selectedDates,
      broadcastAt: now,
      expiresAt: computeExpiresAt(selectedDates),
      city: params.city,
      category: params.category,
    };

    try {
      localStorage.setItem(BROADCAST_KEY, JSON.stringify(b));
      writeToPool(b);
      window.dispatchEvent(new Event(CHANGED));
    } catch {
      /* safe */
    }
  },

  toggleMyDate(
    iso: string,
    profile: {
      workerWmId: string;
      workerName: string;
      city?: string;
    },
  ): void {
    const current = this.getMySelectedDates();
    const next = current.includes(iso) ? current.filter((d) => d !== iso) : [...current, iso];

    this.saveMyAvailability({
      workerWmId: profile.workerWmId,
      workerName: profile.workerName,
      selectedDates: next,
      city: profile.city,
    });
  },

  clearMyBroadcast(): void {
    try {
      const b = this.getMyBroadcast();
      if (b) {
        const existing = this.getAllActive();
        localStorage.setItem(
          ALL_KEY,
          JSON.stringify(existing.filter((x) => x.workerWmId !== b.workerWmId)),
        );
      }
      localStorage.removeItem(BROADCAST_KEY);
      window.dispatchEvent(new Event(CHANGED));
    } catch {
      /* safe */
    }
  },

  getForWorker(workerWmId: string): AvailabilityBroadcast | null {
    if (!workerWmId.trim()) return null;
    return this.getAllActive().find((b) => b.workerWmId === workerWmId) ?? null;
  },

  isWorkerFreeOnDate(workerWmId: string, shiftStartAt: number): boolean {
    const broadcast = this.getForWorker(workerWmId);
    if (!broadcast) return false;
    const iso = isoFromEpoch(shiftStartAt);
    return broadcast.selectedDates.includes(iso);
  },

  getFreeDayBadgeLabel(workerWmId: string, shiftStartAt: number): string | null {
    if (!this.isWorkerFreeOnDate(workerWmId, shiftStartAt)) return null;
    return `Free on ${formatDayLabel(isoFromEpoch(shiftStartAt))}`;
  },

  formatSelectedDatesLabel(dates: string[]): string {
    if (dates.length === 0) return "";
    return dates.map((iso) => formatDayLabel(iso)).join(", ");
  },

  getAllActive(): AvailabilityBroadcast[] {
    try {
      const raw = localStorage.getItem(ALL_KEY);
      if (!raw) return [];

      const list = JSON.parse(raw) as unknown[];
      if (!Array.isArray(list)) return [];

      return list
        .map(normalizeBroadcast)
        .filter((b): b is AvailabilityBroadcast => b !== null && !isExpired(b));
    } catch {
      return [];
    }
  },

  getActiveCount(): number {
    return this.getAllActive().length;
  },

  /** Rolling 7-day free-worker count — blind metric for employer home radar (no identities). */
  countWorkersFreeInRollingWeek(city?: string): number {
    const rolling = new Set(getRolling7Days().map((day) => day.iso));
    const cityKey = city?.trim().toLowerCase() ?? "";
    const seen = new Set<string>();

    for (const broadcast of this.getAllActive()) {
      if (cityKey && broadcast.city && broadcast.city.trim().toLowerCase() !== cityKey) {
        continue;
      }

      if (!broadcast.selectedDates.some((iso) => rolling.has(iso))) continue;
      seen.add(broadcast.workerWmId);
    }

    return seen.size;
  },

  /** Blind demand metric — count only, no worker identity (Create Shift Phase 1). */
  countWorkersFreeOnIsoDate(iso: string): number {
    return this.getWorkerIdsFreeOnIsoDate(iso).length;
  },

  /** Internal — matched worker WM IDs for pulse queue (never render in employer create UI). */
  getWorkerIdsFreeOnIsoDate(iso: string): string[] {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return [];

    const seen = new Set<string>();
    const output: string[] = [];

    for (const broadcast of this.getAllActive()) {
      if (!broadcast.selectedDates.includes(iso)) continue;
      if (seen.has(broadcast.workerWmId)) continue;
      seen.add(broadcast.workerWmId);
      output.push(broadcast.workerWmId);
    }

    return output;
  },

  /** Favorite worker card — selected free days label (Way 2 trusted path). */
  getAvailabilityDaysLabel(workerWmId: string): string | null {
    const broadcast = this.getForWorker(workerWmId);
    if (!broadcast || broadcast.selectedDates.length === 0) return null;
    return this.formatSelectedDatesLabel(broadcast.selectedDates);
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
