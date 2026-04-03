// src/features/employer/shiftJobs/storage/demandPlannerStorage.ts
//
// Shift Demand Planner storage.
// Employer creates a multi-day plan → system auto-creates shift posts per day.
// Workers see the full plan and can multi-day apply.

import type { ExperienceLabel } from "./employerShift.storage";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type WorkingDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun ... 6=Sat

export type DaySlot = {
  /** Date string YYYY-MM-DD */
  date: string;
  /** Number of workers needed */
  workers: number;
  /** Pay per day for this slot */
  payPerDay: number;
  /** Optional category override */
  category?: string;
  /** Generated shift post ID (after submission) */
  postId?: string;
};

export type DemandPlanStatus = "draft" | "active" | "completed" | "cancelled";

export type DemandPlan = {
  id: string;
  name: string;
  companyName: string;
  locationName: string;
  category: string;
  experience: ExperienceLabel;
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  workingDays: WorkingDay[];
  slots: DaySlot[];
  status: DemandPlanStatus;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  description?: string;
};

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const KEY     = "wm_employer_demand_plans_v1";
const CHANGED = "wm:employer-demand-plans-changed";

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function read(): DemandPlan[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p: unknown = JSON.parse(raw);
    return Array.isArray(p) ? (p as DemandPlan[]) : [];
  } catch { return []; }
}

function write(list: DemandPlan[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGED));
  } catch { /* safe */ }
}

function genId(): string {
  return `dp_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

/** Generate dates between start and end that fall on workingDays */
export function generateDates(startDate: string, endDate: string, workingDays: WorkingDay[]): string[] {
  const dates: string[] = [];
  if (!startDate || !endDate || workingDays.length === 0) return dates;
  const start = new Date(startDate + "T00:00:00");
  const end   = new Date(endDate   + "T00:00:00");
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return dates;
  const cur = new Date(start);
  while (cur <= end && dates.length < 90) {
    if (workingDays.includes(cur.getDay() as WorkingDay)) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function fmtPlanDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric",
    });
  } catch { return dateStr; }
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/* ------------------------------------------------ */
/* Storage API                                      */
/* ------------------------------------------------ */
export const demandPlannerStorage = {
  getAll(): DemandPlan[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },

  getById(id: string): DemandPlan | null {
    return read().find((p) => p.id === id) ?? null;
  },

  create(data: Omit<DemandPlan, "id" | "createdAt" | "updatedAt" | "status">): string {
    const now  = Date.now();
    const id   = genId();
    const plan: DemandPlan = { ...data, id, status: "draft", createdAt: now, updatedAt: now };
    write([plan, ...read()].slice(0, 50));
    return id;
  },

  updateSlots(id: string, slots: DaySlot[]): void {
    write(read().map((p) => p.id === id ? { ...p, slots, updatedAt: Date.now() } : p));
  },

  submit(id: string, postIds: Record<string, string>): void {
    const now = Date.now();
    write(read().map((p) => {
      if (p.id !== id) return p;
      const slots = p.slots.map((s) => ({
        ...s,
        postId: postIds[s.date] ?? s.postId,
      }));
      return { ...p, slots, status: "active" as const, submittedAt: now, updatedAt: now };
    }));
  },

  delete(id: string): void {
    write(read().filter((p) => p.id !== id));
  },

  subscribe(cb: () => void): () => void {
    const h = () => cb();
    window.addEventListener(CHANGED, h);
    return () => window.removeEventListener(CHANGED, h);
  },

  CHANGED_EVENT: CHANGED,
} as const;