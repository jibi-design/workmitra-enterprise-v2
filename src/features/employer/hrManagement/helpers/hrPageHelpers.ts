// src/features/employer/hrManagement/helpers/hrPageHelpers.ts

import type { HRCandidateStatus, HRCandidateRecord } from "../types/hrManagement.types";
import type { FilterId } from "../components/HRFilterChips";

/* ------------------------------------------------ */
/* Tab types & config                               */
/* ------------------------------------------------ */
export type TabKey = "all" | HRCandidateStatus;

type TabDef = {
  key: TabKey;
  label: string;
};

export const TABS: TabDef[] = [
  { key: "all", label: "All" },
  { key: "offer_pending", label: "Pending" },
  { key: "offered", label: "Offered" },
  { key: "hired", label: "Hired" },
  { key: "onboarding", label: "Onboarding" },
  { key: "active", label: "Active" },
  { key: "exit_processing", label: "Exit" },
];

export const STATUS_TABS: HRCandidateStatus[] = [
  "offer_pending",
  "offered",
  "hired",
  "onboarding",
  "active",
  "exit_processing",
];

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
export const GUIDE_KEY = "wm_hr_guide_dismissed_v1";

/* ------------------------------------------------ */
/* Search & filter logic                            */
/* ------------------------------------------------ */
export function matchesSearch(record: HRCandidateRecord, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  return (
    record.employeeName.toLowerCase().includes(q) ||
    record.employeeUniqueId.toLowerCase().includes(q) ||
    record.jobTitle.toLowerCase().includes(q) ||
    (record.department?.toLowerCase().includes(q) ?? false) ||
    (record.location?.toLowerCase().includes(q) ?? false)
  );
}

export function matchesFilter(record: HRCandidateRecord, filter: FilterId): boolean {
  if (filter === "all") return true;
  if (filter === "probation") {
    return record.employmentPhase === "probation";
  }
  if (filter === "contract_expiring") {
    if (!record.contractEndDate) return false;
    const daysLeft = Math.ceil((record.contractEndDate - Date.now()) / 86400000);
    return daysLeft >= 0 && daysLeft <= 30;
  }
  return true;
}