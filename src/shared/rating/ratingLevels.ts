// src/shared/rating/ratingLevels.ts
//
// Points rules + Level calculation for Worker Trust System.
// Bronze → Silver → Gold → Platinum

import type {
  RatingLevel, PointsEventType, WorkerPoints, PointsHistoryEntry,
} from "./ratingTypes";

/* ------------------------------------------------ */
/* Points Rules                                     */
/* ------------------------------------------------ */
export const POINTS_RULES: Record<PointsEventType, number> = {
  shift_complete:              +10,
  rating_5star:                +15,
  rating_4star:                +10,
  tag_reliable:                +5,
  zero_cancellations_month:    +20,
  hire_again:                  +10,
  career_proper_exit:          +25,
  proper_resignation_rated:    +15,
  cancel_confirmed:            -20,
  no_show:                     -50,
  rating_1or2star:             -10,
  late_arrival:                -5,
  leave_without_resignation:   -30,
};

export const POINTS_EVENT_NOTES: Record<PointsEventType, string> = {
  shift_complete:             "Completed shift on time",
  rating_5star:               "5-star rating received",
  rating_4star:               "4-star rating received",
  tag_reliable:               "Tagged as Reliable by employer",
  zero_cancellations_month:   "Zero cancellations this month",
  hire_again:                 "Employer hired again",
  career_proper_exit:         "Completed career job with proper exit",
  proper_resignation_rated:   "Proper resignation + rated",
  cancel_confirmed:           "Cancelled a confirmed shift",
  no_show:                    "Did not show up for confirmed shift",
  rating_1or2star:            "1 or 2 star rating received",
  late_arrival:               "Arrived late to shift",
  leave_without_resignation:  "Left job without proper resignation",
};

/* ------------------------------------------------ */
/* Level Thresholds                                 */
/* ------------------------------------------------ */
export const LEVEL_THRESHOLDS: Record<RatingLevel, { min: number; max: number; label: string; badge: string }> = {
  bronze:   { min: 0,   max: 99,  label: "Bronze",   badge: "Basic access" },
  silver:   { min: 100, max: 299, label: "Silver",   badge: "Trusted Worker" },
  gold:     { min: 300, max: 599, label: "Gold",     badge: "Priority shift access" },
  platinum: { min: 600, max: Infinity, label: "Platinum", badge: "Top Pick always" },
};

export const LEVEL_COLORS: Record<RatingLevel, string> = {
  bronze:   "#92400e",
  silver:   "#64748b",
  gold:     "#b45309",
  platinum: "#0369a1",
};

export const LEVEL_BG: Record<RatingLevel, string> = {
  bronze:   "rgba(146,64,14,0.08)",
  silver:   "rgba(100,116,139,0.08)",
  gold:     "rgba(180,83,9,0.08)",
  platinum: "rgba(3,105,161,0.08)",
};

/* ------------------------------------------------ */
/* Level calculation                                */
/* ------------------------------------------------ */
export function calculateLevel(points: number): RatingLevel {
  if (points >= 600) return "platinum";
  if (points >= 300) return "gold";
  if (points >= 100) return "silver";
  return "bronze";
}

export function pointsToNextLevel(points: number): { next: RatingLevel | null; needed: number } {
  if (points >= 600) return { next: null, needed: 0 };
  if (points >= 300) return { next: "platinum", needed: 600 - points };
  if (points >= 100) return { next: "gold", needed: 300 - points };
  return { next: "silver", needed: 100 - points };
}

/* ------------------------------------------------ */
/* New ID helper                                    */
/* ------------------------------------------------ */
function newPointsId(): string {
  return `pe_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/* ------------------------------------------------ */
/* Apply points event to a WorkerPoints record      */
/* ------------------------------------------------ */
export function applyPointsEvent(
  current: WorkerPoints,
  eventType: PointsEventType,
  jobId?: string,
): WorkerPoints {
  const delta = POINTS_RULES[eventType];
  const newTotal = Math.max(0, current.total + delta); // never below 0
  const entry: PointsHistoryEntry = {
    id: newPointsId(),
    eventType,
    delta,
    jobId,
    createdAt: Date.now(),
    note: POINTS_EVENT_NOTES[eventType],
  };
  return {
    ...current,
    total: newTotal,
    level: calculateLevel(newTotal),
    history: [entry, ...current.history].slice(0, 200), // keep last 200
    updatedAt: Date.now(),
  };
}

/* ------------------------------------------------ */
/* Create fresh WorkerPoints record                 */
/* ------------------------------------------------ */
export function createWorkerPoints(workerWmId: string): WorkerPoints {
  return {
    workerWmId,
    total: 0,
    level: "bronze",
    history: [],
    updatedAt: Date.now(),
  };
}