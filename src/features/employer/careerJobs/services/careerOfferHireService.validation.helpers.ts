// careerOfferHireService.validation.helpers.ts

import type { CareerOfferInput } from "../types/careerTypes";

const MAX_OFFER_SALARY = 999_999_999;
const ALLOWED_OFFER_NOTICE_DAYS = new Set([0, 7, 14, 30]);

export type HireCandidateSagaResult =
  | { ok: true; workspaceId: string }
  | {
      ok: false;
      reason:
        | "not_found"
        | "invalid_stage"
        | "offer_not_accepted"
        | "post_inactive"
        | "invalid_offer"
        | "application_write_error"
        | "activation_error"
        | "post_write_error"
        | "search_sync_error"
        | "api_error";
    };

function getDateOnlyMs(value: string): number | null {
  if (!value.trim()) return null;

  const date = new Date(`${value}T00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return date.getTime();
}

function getTodayStartMs(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);

  return date.getTime();
}

export function isValidCareerOfferDetails(
  offerDetails: CareerOfferInput,
  now = Date.now(),
): boolean {
  const title = offerDetails.jobTitle.trim();
  const startDateMs = getDateOnlyMs(offerDetails.startDate);
  const todayStartMs = getTodayStartMs(now);

  if (title.length < 2 || title.length > 100) return false;
  if (!Number.isFinite(offerDetails.salary)) return false;
  if (!Number.isInteger(offerDetails.salary)) return false;
  if (offerDetails.salary <= 0 || offerDetails.salary > MAX_OFFER_SALARY) return false;
  if (offerDetails.salaryPeriod !== "monthly" && offerDetails.salaryPeriod !== "yearly")
    return false;
  if (startDateMs === null || startDateMs < todayStartMs) return false;
  if (!ALLOWED_OFFER_NOTICE_DAYS.has(offerDetails.noticePeriodDays)) return false;
  if ((offerDetails.message?.trim().length ?? 0) > 300) return false;

  return true;
}
