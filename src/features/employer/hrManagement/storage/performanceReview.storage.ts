// src/features/employer/hrManagement/storage/performanceReview.storage.ts
//
// CRUD for performance reviews.
// Separate from letters — reviews have ratings, periods, goals.

import type {
  PerformanceReviewRecord,
  ReviewType,
  ReviewRating,
} from "../types/performanceReview.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_hr_performance_reviews_v1";
const CHANGED_EVENT = "wm:hr-performance-reviews-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): PerformanceReviewRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PerformanceReviewRecord[]) : [];
  } catch {
    return [];
  }
}

function write(records: PerformanceReviewRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "prv_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const performanceReviewStorage = {
  // ── Read ──

  /** Get all reviews (newest first) */
  getAll(): PerformanceReviewRecord[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get reviews for a specific HR candidate */
  getByCandidate(hrCandidateId: string): PerformanceReviewRecord[] {
    return read()
      .filter((r) => r.hrCandidateId === hrCandidateId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get by ID */
  getById(id: string): PerformanceReviewRecord | null {
    return read().find((r) => r.id === id) ?? null;
  },

  /** Count reviews for a candidate */
  countByCandidate(hrCandidateId: string): number {
    return read().filter((r) => r.hrCandidateId === hrCandidateId).length;
  },

  /** Get average rating for a candidate */
  getAverageRating(hrCandidateId: string): number | null {
    const reviews = read().filter((r) => r.hrCandidateId === hrCandidateId);
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  },

  // ── Create ──

  /** Create and send a performance review */
  createReview(data: {
    hrCandidateId: string;
    employeeUniqueId: string;
    employeeName: string;
    jobTitle: string;
    reviewType: ReviewType;
    periodFrom: number;
    periodTo: number;
    rating: ReviewRating;
    strengths: string;
    improvements: string;
    goalsNextPeriod: string;
    overallComments: string;
  }): string {
    const now = Date.now();
    const record: PerformanceReviewRecord = {
      id: genId(),
      hrCandidateId: data.hrCandidateId,
      employeeUniqueId: data.employeeUniqueId,
      employeeName: data.employeeName,
      jobTitle: data.jobTitle,
      reviewType: data.reviewType,
      periodFrom: data.periodFrom,
      periodTo: data.periodTo,
      rating: data.rating,
      strengths: data.strengths,
      improvements: data.improvements,
      goalsNextPeriod: data.goalsNextPeriod,
      overallComments: data.overallComments,
      status: "sent",
      createdAt: now,
      sentAt: now,
    };

    const all = read();
    write([record, ...all]);
    return record.id;
  },

  // ── Status Updates ──

  /** Employee acknowledges review */
  acknowledgeReview(id: string): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1 || all[idx].status !== "sent") return false;

    all[idx] = {
      ...all[idx],
      status: "acknowledged",
      acknowledgedAt: Date.now(),
    };
    write(all);
    return true;
  },

  /** Employee disputes review */
  disputeReview(id: string, reason: string): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1 || all[idx].status !== "sent") return false;

    all[idx] = {
      ...all[idx],
      status: "disputed",
      disputedAt: Date.now(),
      disputeReason: reason.trim(),
    };
    write(all);
    return true;
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
} as const;