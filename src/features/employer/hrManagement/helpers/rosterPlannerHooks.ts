// src/features/employer/hrManagement/helpers/rosterPlannerHooks.ts
//
// Subscription hooks for Team Calendar / Roster Planner (Root Map Section 7.4.15).
// Uses useSyncExternalStore for lint-safe reactive updates.

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { rosterPlannerStorage } from "../storage/rosterPlanner.storage";
import type { RosterAssignment } from "../types/rosterPlanner.types";

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useRosterForRange — assignments within a date range
// ─────────────────────────────────────────────────────────────────────────────

export function useRosterForRange(startDate: string, endDate: string): RosterAssignment[] {
  const subscribe = useCallback(
    (cb: () => void) => rosterPlannerStorage.subscribe(cb),
    [],
  );

  const getSnapshot = useCallback(
    () => JSON.stringify(rosterPlannerStorage.getForDateRange(startDate, endDate)),
    [startDate, endDate],
  );

  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => {
    try { return JSON.parse(raw); } catch { return []; }
  }, [raw]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useEmployeeSchedule — upcoming assignments for an employee
// ─────────────────────────────────────────────────────────────────────────────

export function useEmployeeSchedule(hrCandidateId: string | null): RosterAssignment[] {
  const subscribe = useCallback(
    (cb: () => void) => rosterPlannerStorage.subscribe(cb),
    [],
  );

  const getSnapshot = useCallback(
    () => {
      if (!hrCandidateId) return "[]";
      return JSON.stringify(rosterPlannerStorage.getUpcomingForEmployee(hrCandidateId));
    },
    [hrCandidateId],
  );

  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => {
    try { return JSON.parse(raw); } catch { return []; }
  }, [raw]);
}