// src/features/employer/myStaff/helpers/addStaffHelpers.ts

import type { StaffEmploymentType } from "../storage/myStaff.storage";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type IdRegistryEntry = {
  uniqueId: string;
  name: string;
  role: string;
};

/* ------------------------------------------------ */
/* Unique ID lookup (Phase-0: localStorage registry)*/
/* ------------------------------------------------ */
export function lookupUniqueId(uniqueId: string): IdRegistryEntry | null {
  try {
    const raw = localStorage.getItem("wm_id_registry_v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { entries?: Array<{ id: string; name: string; role: string }> };
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    const found = entries.find((e) => e.id.toLowerCase() === uniqueId.trim().toLowerCase());
    if (!found) return null;
    return { uniqueId: found.id, name: found.name, role: found.role };
  } catch {
    return null;
  }
}

/* ------------------------------------------------ */
/* Employment type options                          */
/* ------------------------------------------------ */
export const EMPLOYMENT_TYPES: { value: StaffEmploymentType; label: string }[] = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
];