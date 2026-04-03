// src/features/employee/employment/helpers/workDiaryHooks.ts
//
// React hooks for Work Diary (Root Map Section 5.5.A).

import { useState, useEffect } from "react";
import type { WorkDiaryEntry, WorkDiaryMonthlySummary } from "./workDiary.types";
import { workDiaryStorage } from "../storage/workDiary.storage";

export function useWorkDiaryEntries(
  employmentId: string,
  year: number,
  month: number,
): WorkDiaryEntry[] {
  const [entries, setEntries] = useState<WorkDiaryEntry[]>(
    () => workDiaryStorage.getMonthEntries(employmentId, year, month),
  );

  useEffect(() => {
    const refresh = () => setEntries(workDiaryStorage.getMonthEntries(employmentId, year, month));
    refresh();
    return workDiaryStorage.subscribe(refresh);
  }, [employmentId, year, month]);

  return entries;
}

export function useWorkDiarySummary(
  employmentId: string,
  year: number,
  month: number,
): WorkDiaryMonthlySummary {
  const [summary, setSummary] = useState<WorkDiaryMonthlySummary>(
    () => workDiaryStorage.getMonthlySummary(employmentId, year, month),
  );

  useEffect(() => {
    const refresh = () => setSummary(workDiaryStorage.getMonthlySummary(employmentId, year, month));
    refresh();
    return workDiaryStorage.subscribe(refresh);
  }, [employmentId, year, month]);

  return summary;
}

export function useActivePunch(employmentId: string): WorkDiaryEntry | null {
  const [active, setActive] = useState<WorkDiaryEntry | null>(
    () => workDiaryStorage.getActivePunch(employmentId),
  );

  useEffect(() => {
    const refresh = () => setActive(workDiaryStorage.getActivePunch(employmentId));
    refresh();
    return workDiaryStorage.subscribe(refresh);
  }, [employmentId]);

  return active;
}