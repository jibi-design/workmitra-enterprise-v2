// src/features/employer/hrManagement/helpers/performanceReviewSubscription.ts
//
// Reactive hook for performance review data.

import { useSyncExternalStore, useCallback } from "react";
import { performanceReviewStorage } from "../storage/performanceReview.storage";
import type { PerformanceReviewRecord } from "../types/performanceReview.types";

/**
 * Subscribe to all performance reviews for a given HR candidate.
 * Returns a stable, reactive array.
 */
export function usePerformanceReviews(hrCandidateId: string): PerformanceReviewRecord[] {
  const subscribe = useCallback(
    (cb: () => void) => performanceReviewStorage.subscribe(cb),
    [],
  );

  const getSnapshot = useCallback(() => {
    return JSON.stringify(performanceReviewStorage.getByCandidate(hrCandidateId));
  }, [hrCandidateId]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return JSON.parse(raw) as PerformanceReviewRecord[];
}