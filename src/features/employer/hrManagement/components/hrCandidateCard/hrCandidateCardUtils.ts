// App: Job Mitra / WorkMitra_Enterprise_v2
// File: hrCandidateCardUtils.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\hrCandidateCard\hrCandidateCardUtils.ts

export function formatShortDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

export function daysFromNow(timestamp: number): number {
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 86400000));
}

export function formatDuration(milliseconds: number): string {
  const days = Math.floor(milliseconds / 86400000);

  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);

  if (months === 1) return "1 month ago";

  return `${months} months ago`;
}
