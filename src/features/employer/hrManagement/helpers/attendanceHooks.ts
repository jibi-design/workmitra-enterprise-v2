// src/features/employer/hrManagement/helpers/attendanceHooks.ts
//
// React hooks for Employer Attendance Log (Root Map Section 5.3.A).
// Subscribes to attendance storage changes — auto-refreshes UI.
// Follows existing pattern from hrSubscription.ts / leaveSubscription.ts.

import { useState, useEffect } from "react";
import type { AttendanceDayEntry, AttendanceMonthlySummary } from "../types/attendanceLog.types";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";

// ─────────────────────────────────────────────────────────────────────────────
// useAttendanceEntries — get entries for a specific month (auto-refresh)
// ─────────────────────────────────────────────────────────────────────────────

export function useAttendanceEntries(
  hrCandidateId: string,
  year: number,
  month: number,
): AttendanceDayEntry[] {
  const [entries, setEntries] = useState<AttendanceDayEntry[]>(
    () => attendanceLogStorage.getMonthEntries(hrCandidateId, year, month),
  );

  useEffect(() => {
    const refresh = () => setEntries(attendanceLogStorage.getMonthEntries(hrCandidateId, year, month));
    refresh();
    return attendanceLogStorage.subscribe(refresh);
  }, [hrCandidateId, year, month]);

  return entries;
}

// ─────────────────────────────────────────────────────────────────────────────
// useAttendanceSummary — get monthly summary (auto-refresh)
// ─────────────────────────────────────────────────────────────────────────────

export function useAttendanceSummary(
  hrCandidateId: string,
  year: number,
  month: number,
): AttendanceMonthlySummary {
  const [summary, setSummary] = useState<AttendanceMonthlySummary>(
    () => attendanceLogStorage.getMonthlySummary(hrCandidateId, year, month),
  );

  useEffect(() => {
    const refresh = () => setSummary(attendanceLogStorage.getMonthlySummary(hrCandidateId, year, month));
    refresh();
    return attendanceLogStorage.subscribe(refresh);
  }, [hrCandidateId, year, month]);

  return summary;
}
