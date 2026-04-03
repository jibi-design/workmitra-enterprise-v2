// src/features/employer/hrManagement/helpers/hrSubscription.ts
//
// Reactive subscription for HR Management data.
// Uses useSyncExternalStore with stable snapshot to prevent infinite loops.

import { useSyncExternalStore } from "react";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";

// ─────────────────────────────────────────────────────────────────────────────
// Stable snapshot cache (prevents infinite re-render)
// ─────────────────────────────────────────────────────────────────────────────

let cachedRaw = "";
let cachedRecords: HRCandidateRecord[] = [];

function getSnapshot(): HRCandidateRecord[] {
  const raw = localStorage.getItem("wm_hr_management_v1") ?? "";
  if (raw === cachedRaw) return cachedRecords;
  cachedRaw = raw;
  cachedRecords = hrManagementStorage.getAll();
  return cachedRecords;
}

function subscribe(cb: () => void): () => void {
  return hrManagementStorage.subscribe(cb);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useHRCandidates(): HRCandidateRecord[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}