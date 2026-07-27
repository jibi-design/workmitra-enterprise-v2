// src/features/employer/hrManagement/helpers/rosterPlannerHooks.ts
//
// Subscription hooks for Team Calendar / Roster Planner (Root Map Section 7.4.15).
// Uses useSyncExternalStore for lint-safe reactive updates.

import { useCallback, useRef, useSyncExternalStore } from "react";
import { rosterPlannerStorage } from "../storage/rosterPlanner.storage";
import type { RosterAssignment } from "../types/rosterPlanner.types";

/** P1-2 — stable array snapshot keyed by revision + range (no stringify-per-tick). */
export function useRosterForRange(startDate: string, endDate: string): RosterAssignment[] {
  const cacheRef = useRef<{ key: string; list: RosterAssignment[] }>({ key: "", list: [] });

  const subscribe = useCallback((cb: () => void) => rosterPlannerStorage.subscribe(cb), []);

  const getSnapshot = useCallback(() => {
    const key = `${rosterPlannerStorage.getRevision()}|${startDate}|${endDate}`;
    if (cacheRef.current.key === key) return cacheRef.current.list;
    const list = rosterPlannerStorage.getForDateRange(startDate, endDate);
    cacheRef.current = { key, list };
    return cacheRef.current.list;
  }, [startDate, endDate]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useEmployeeSchedule(hrCandidateId: string | null): RosterAssignment[] {
  const cacheRef = useRef<{ key: string; list: RosterAssignment[] }>({ key: "", list: [] });

  const subscribe = useCallback((cb: () => void) => rosterPlannerStorage.subscribe(cb), []);

  const getSnapshot = useCallback(() => {
    if (!hrCandidateId) {
      const emptyKey = `${rosterPlannerStorage.getRevision()}|none`;
      if (cacheRef.current.key === emptyKey) return cacheRef.current.list;
      cacheRef.current = { key: emptyKey, list: [] };
      return cacheRef.current.list;
    }
    const key = `${rosterPlannerStorage.getRevision()}|emp|${hrCandidateId}`;
    if (cacheRef.current.key === key) return cacheRef.current.list;
    const list = rosterPlannerStorage.getUpcomingForEmployee(hrCandidateId);
    cacheRef.current = { key, list };
    return cacheRef.current.list;
  }, [hrCandidateId]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
