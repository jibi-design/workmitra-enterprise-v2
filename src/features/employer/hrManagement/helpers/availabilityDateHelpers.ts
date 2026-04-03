// src/features/employer/hrManagement/helpers/availabilityDateHelpers.ts

export function formatAvailDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function formatAvailDateTime(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}