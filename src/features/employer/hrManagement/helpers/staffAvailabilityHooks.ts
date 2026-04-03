// src/features/employer/hrManagement/helpers/staffAvailabilityHooks.ts
//
// Subscription hook for Staff Availability Request (Root Map Section 7.4.13).
// Uses useSyncExternalStore for lint-safe reactive updates.

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { staffAvailabilityStorage } from "../storage/staffAvailability.storage";
import type { StaffAvailabilityRequest } from "../types/staffAvailability.types";

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useStaffAvailability — all requests
// ─────────────────────────────────────────────────────────────────────────────

export function useStaffAvailability(): StaffAvailabilityRequest[] {
  const subscribe = useCallback(
    (cb: () => void) => staffAvailabilityStorage.subscribe(cb),
    [],
  );

  const getSnapshot = useCallback(
    () => JSON.stringify(staffAvailabilityStorage.getAll()),
    [],
  );

  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => {
    try { return JSON.parse(raw); } catch { return []; }
  }, [raw]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useEmployeeAvailability — requests for a specific employee
// ─────────────────────────────────────────────────────────────────────────────

export function useEmployeeAvailability(hrCandidateId: string | null) {
  const subscribe = useCallback(
    (cb: () => void) => staffAvailabilityStorage.subscribe(cb),
    [],
  );

  const getSnapshot = useCallback(
    () => {
      if (!hrCandidateId) return "[]";
      return JSON.stringify(staffAvailabilityStorage.getForEmployee(hrCandidateId));
    },
    [hrCandidateId],
  );

  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const allRequests: StaffAvailabilityRequest[] = useMemo(() => {
    try { return JSON.parse(raw); } catch { return []; }
  }, [raw]);

 const pendingRequests = useMemo(
    () => {
      if (!hrCandidateId) return [];
      // allRequests.length triggers recalc when storage updates
      void allRequests.length;
      return staffAvailabilityStorage.getPendingForEmployee(hrCandidateId);
    },
    [allRequests, hrCandidateId],
  );

  return { allRequests, pendingRequests };
}