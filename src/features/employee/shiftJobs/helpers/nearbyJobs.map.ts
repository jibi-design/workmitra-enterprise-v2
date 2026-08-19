/** Job Mitra | Map server nearby-post payloads into employee search cards. */

import type { ShiftPostDemo } from "../types/shiftSearch.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMs(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : 0;
  }
  return 0;
}

export function mapNearbyServerPost(raw: unknown): ShiftPostDemo | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const jobName = typeof raw.job_name === "string" ? raw.job_name.trim() : "";
  if (!id || !jobName) return null;

  const details = isRecord(raw.details) ? raw.details : {};
  const startAt = parseMs(raw.start_at);
  const endAt = parseMs(raw.end_at);
  const pin =
    typeof details.locationPincode === "string"
      ? details.locationPincode
      : typeof raw.location_pincode === "string"
        ? raw.location_pincode
        : undefined;

  const experienceRaw = details.experience;
  const experience =
    experienceRaw === "fresher_ok" || experienceRaw === "experienced" || experienceRaw === "helper"
      ? experienceRaw
      : "helper";

  return {
    id,
    companyName: typeof details.companyName === "string" ? details.companyName : "Company",
    jobName,
    category: typeof raw.category === "string" && raw.category.trim() ? raw.category : "General",
    experience,
    payPerDay: typeof details.payPerDay === "number" ? details.payPerDay : 0,
    locationName: typeof details.locationName === "string" ? details.locationName : "Work location",
    locationPincode: pin,
    distanceKm: typeof details.distanceKm === "number" ? details.distanceKm : 0,
    startAt,
    endAt: endAt || startAt,
    description: typeof details.description === "string" ? details.description : undefined,
    shiftTiming: typeof details.shiftTiming === "string" ? details.shiftTiming : undefined,
    vacancies: typeof raw.vacancies === "number" ? raw.vacancies : undefined,
    isHiddenFromSearch: details.isHiddenFromSearch === true,
  };
}
