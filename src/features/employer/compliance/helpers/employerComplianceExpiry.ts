/**
 * Smart Document Expiry Tracker — 30 / 14 / 7 day windows.
 * Operates only on employer compliance hub documents.
 */

import type {
  ComplianceDocument,
  ComplianceExpiryBucket,
  ComplianceExpiryRow,
} from "../storage/employerCompliance.types";

function toDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(fromKey: string, toKey: string): number {
  const from = Date.parse(`${fromKey}T00:00:00`);
  const to = Date.parse(`${toKey}T00:00:00`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return Number.POSITIVE_INFINITY;
  return Math.round((to - from) / 86_400_000);
}

export function getComplianceExpiryBucket(
  expiresOn: string | undefined,
  todayKey = toDateKey(),
): ComplianceExpiryBucket {
  if (!expiresOn) return "none";
  const daysUntil = daysBetween(todayKey, expiresOn);
  if (daysUntil < 0) return "overdue";
  if (daysUntil <= 7) return "d7";
  if (daysUntil <= 14) return "d14";
  if (daysUntil <= 30) return "d30";
  return "ok";
}

export function listExpiringComplianceDocuments(
  documents: readonly ComplianceDocument[],
  todayKey = toDateKey(),
): ComplianceExpiryRow[] {
  const rows: ComplianceExpiryRow[] = [];

  for (const document of documents) {
    const bucket = getComplianceExpiryBucket(document.expiresOn, todayKey);
    if (bucket === "ok" || bucket === "none") continue;
    const daysUntil =
      typeof document.expiresOn === "string"
        ? daysBetween(todayKey, document.expiresOn)
        : Number.POSITIVE_INFINITY;
    rows.push({ document, bucket, daysUntil });
  }

  return rows.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function expiryBucketLabel(bucket: ComplianceExpiryBucket): string {
  switch (bucket) {
    case "overdue":
      return "Overdue";
    case "d7":
      return "Expires within 7 days";
    case "d14":
      return "Expires within 14 days";
    case "d30":
      return "Expires within 30 days";
    case "ok":
      return "OK";
    default:
      return "No expiry set";
  }
}
