// src/features/employee/shiftJobs/storage/availabilityStorage.ts
//
// Phase 1: 7-day rolling calendar availability.
// Employee selects ISO dates (today + next 6). Auto-saved to local pool.
// Phase 2 (Talent Radar / home counts) must NOT read counts on employer home in Phase 1.

import {
  ALL_KEY,
  BROADCAST_KEY,
  CHANGED,
  computeExpiresAt,
  formatDayLabel,
  getAllActiveFromStorage,
  getRolling7Days,
  isoFromEpoch,
  normalizeBroadcast,
  sanitizeSelectedDates,
  writeToPool,
} from "./availabilityStorage.helpers";
import type { AvailabilityBroadcast } from "./availabilityStorage.types";

export type { AvailabilityBroadcast, RollingDay } from "./availabilityStorage.types";
export { getRolling7Days, toIsoDate } from "./availabilityStorage.helpers";

const EMPTY_SELECTED_DATES: string[] = [];

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
    return this.getMyBroadcast()?.selectedDates ?? EMPTY_SELECTED_DATES;
  },

  /** Auto-save rolling calendar selection (Phase 1 — no employer notifications). */
  saveMyAvailability(params: {
    workerMlId: string;
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
      workerMlId: params.workerMlId,
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
      workerMlId: string;
      workerName: string;
      city?: string;
    },
  ): void {
    const current = this.getMySelectedDates();
    const next = current.includes(iso) ? current.filter((d) => d !== iso) : [...current, iso];

    this.saveMyAvailability({
      workerMlId: profile.workerMlId,
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
          JSON.stringify(existing.filter((x) => x.workerMlId !== b.workerMlId)),
        );
      }
      localStorage.removeItem(BROADCAST_KEY);
      window.dispatchEvent(new Event(CHANGED));
    } catch {
      /* safe */
    }
  },

  getForWorker(workerMlId: string): AvailabilityBroadcast | null {
    if (!workerMlId.trim()) return null;
    return this.getAllActive().find((b) => b.workerMlId === workerMlId) ?? null;
  },

  isWorkerFreeOnDate(workerMlId: string, shiftStartAt: number): boolean {
    const broadcast = this.getForWorker(workerMlId);
    if (!broadcast) return false;
    const iso = isoFromEpoch(shiftStartAt);
    return broadcast.selectedDates.includes(iso);
  },

  getFreeDayBadgeLabel(workerMlId: string, shiftStartAt: number): string | null {
    if (!this.isWorkerFreeOnDate(workerMlId, shiftStartAt)) return null;
    return `Free on ${formatDayLabel(isoFromEpoch(shiftStartAt))}`;
  },

  formatSelectedDatesLabel(dates: string[]): string {
    if (dates.length === 0) return "";
    return dates.map((iso) => formatDayLabel(iso)).join(", ");
  },

  getAllActive(): AvailabilityBroadcast[] {
    return getAllActiveFromStorage();
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
      seen.add(broadcast.workerMlId);
    }

    return seen.size;
  },

  /** Blind demand metric — count only, no worker identity (Create Shift Phase 1). */
  countWorkersFreeOnIsoDate(iso: string): number {
    return this.getWorkerIdsFreeOnIsoDate(iso).length;
  },

  /** Internal — matched worker Mitra Labs IDs for pulse queue (never render in employer create UI). */
  getWorkerIdsFreeOnIsoDate(iso: string): string[] {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return [];

    const seen = new Set<string>();
    const output: string[] = [];

    for (const broadcast of this.getAllActive()) {
      if (!broadcast.selectedDates.includes(iso)) continue;
      if (seen.has(broadcast.workerMlId)) continue;
      seen.add(broadcast.workerMlId);
      output.push(broadcast.workerMlId);
    }

    return output;
  },

  /** Favorite worker card — selected free days label (Way 2 trusted path). */
  getAvailabilityDaysLabel(workerMlId: string): string | null {
    const broadcast = this.getForWorker(workerMlId);
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
