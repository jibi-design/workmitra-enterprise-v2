// App name: Job Mitra
// File name: shiftPostDetailsApply.utils.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\pages\shiftPostDetailsApply\shiftPostDetailsApply.utils.ts

import { cap } from "../../helpers/shiftApplyHelpers";

export function getSafeEntityText(value: string, fallback: string): string {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cap(cleaned) : fallback;
}
