// App name: Job Mitra
// File name: shiftPostDetail.utils.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\shiftPostDetail.utils.ts

import { cap } from "../../helpers/shiftApplyHelpers";

export function formatJobType(jobType?: string): string {
  if (jobType === "weekly") return "Weekly recurring";
  if (jobType === "custom") return "Custom recurring";
  return "One-time shift";
}

export function getCleanText(value?: string): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getSafeEntityText(value: string, fallback: string): string {
  const cleaned = value.trim();

  if (!cleaned) return fallback;
  if (isUnsafeDemoText(cleaned)) return fallback;

  return cap(cleaned);
}

function isUnsafeDemoText(value: string): boolean {
  const compact = value.replace(/[^a-z0-9]/gi, "").toLowerCase();

  if (!compact) return true;

  const blockedValues = new Set([
    "bnm",
    "krrrrn",
    "qwe",
    "hjk",
    "hkjyf",
    "hkjyfu",
    "irity",
    "iritty",
    "test",
    "demo",
    "sample",
  ]);

  if (blockedValues.has(compact)) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{3,}$/i.test(compact)) return true;
  if (/([a-z])\1{3,}/i.test(compact)) return true;

  return false;
}
