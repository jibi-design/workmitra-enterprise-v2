import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";
import { toDateStr } from "./shiftCreateHelpers.dates";

export type ShiftDuplicateWarning = {
  id: string;
  jobName: string;
  companyName: string;
  locationName: string;
  dateRange: string;
  reason: string;
};

type DuplicateCandidate = {
  jobName: string;
  companyName: string;
  category: string;
  locationName: string;
  startAt: number;
  endAt: number;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isPlaceholderCategory(value: string): boolean {
  const normalized = normalizeText(value);
  return normalized === "" || normalized === "category" || normalized === "other";
}

function sameDateRange(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return toDateStr(aStart) === toDateStr(bStart) && toDateStr(aEnd) === toDateStr(bEnd);
}

function dateRangeLabel(startAt: number, endAt: number): string {
  const start = toDateStr(startAt);
  const end = toDateStr(endAt);
  return start === end ? start : `${start} to ${end}`;
}

function isSameLocation(postLocationRaw: string, candidateLocationRaw: string): boolean {
  const postLocation = normalizeText(postLocationRaw);
  const candidateLocation = normalizeText(candidateLocationRaw);

  if (!postLocation || !candidateLocation) return false;

  return postLocation.includes(candidateLocation) || candidateLocation.includes(postLocation);
}

export function findDuplicateShiftWarnings(
  posts: ShiftPost[],
  candidate: DuplicateCandidate,
): ShiftDuplicateWarning[] {
  const jobName = normalizeText(candidate.jobName);
  const companyName = normalizeText(candidate.companyName);
  const candidateCategory = normalizeText(candidate.category);
  const locationName = normalizeText(candidate.locationName);

  if (!jobName || !companyName || !locationName) return [];

  return posts
    .filter((post) => post.status !== "completed" && post.status !== "cancelled")
    .filter((post) => {
      const sameJob = normalizeText(post.jobName) === jobName;
      const sameCompany = normalizeText(post.companyName) === companyName;
      const sameLocation = isSameLocation(post.locationName, locationName);
      const sameDates = sameDateRange(post.startAt, post.endAt, candidate.startAt, candidate.endAt);

      if (!sameJob || !sameCompany || !sameLocation || !sameDates) return false;

      const postCategory = normalizeText(post.category);
      const sameCategory = postCategory === candidateCategory;
      const categoryNotReliable =
        isPlaceholderCategory(postCategory) || isPlaceholderCategory(candidateCategory);

      return sameCategory || categoryNotReliable;
    })
    .slice(0, 3)
    .map((post) => {
      const postCategory = normalizeText(post.category);
      const sameCategory = postCategory === candidateCategory;
      const categoryNotReliable =
        isPlaceholderCategory(postCategory) || isPlaceholderCategory(candidateCategory);

      return {
        id: post.id,
        jobName: post.jobName,
        companyName: post.companyName,
        locationName: post.locationName,
        dateRange: dateRangeLabel(post.startAt, post.endAt),
        reason:
          sameCategory && !categoryNotReliable
            ? "Similar active shift already exists for the same job, company, location, category, and date."
            : "Similar active shift already exists for the same job, company, location, and date. Category was not reliable enough to ignore it.",
      };
    });
}
