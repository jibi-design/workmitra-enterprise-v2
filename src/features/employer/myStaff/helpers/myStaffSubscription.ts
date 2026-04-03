// src/features/employer/myStaff/helpers/myStaffSubscription.ts
//
// Stable snapshot subscription for useSyncExternalStore.
// Prevents infinite re-render by caching array reference.

import { myStaffStorage } from "../storage/myStaff.storage";
import type { StaffRecord } from "../storage/myStaff.storage";

let staffCache: StaffRecord[] = [];
let staffCacheKey = "";

export function getStaffSnapshot(): StaffRecord[] {
  const raw = localStorage.getItem("wm_employer_staff_v1") ?? "";
  if (raw === staffCacheKey) return staffCache;
  staffCacheKey = raw;
  staffCache = myStaffStorage.getActive();
  return staffCache;
}

export function subscribeStaff(cb: () => void): () => void {
  return myStaffStorage.subscribe(cb);
}