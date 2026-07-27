import type { CareerAlertCriteria, ShiftAlertCriteria } from "./jobAlertTypes";
import { isRec, numVal, str } from "./jobAlertStorage.utils";

export type MatchablePost = Record<string, unknown>;

export const SHIFT_POSTS_KEY = "wm_employer_shift_posts_v1";
export const CAREER_POSTS_KEY = "wm_employer_career_posts_v1";

export function matchesShift(post: MatchablePost, criteria: ShiftAlertCriteria): boolean {
  if (criteria.query) {
    const query = criteria.query.toLowerCase();
    const text = `${str(post, "jobName")} ${str(post, "companyName")} ${str(post, "locationName")} ${str(post, "category")}`;
    if (!text.includes(query)) return false;
  }

  if (
    criteria.category &&
    criteria.category !== "any" &&
    str(post, "category") !== criteria.category.toLowerCase()
  )
    return false;
  if (
    criteria.experience &&
    criteria.experience !== "any" &&
    str(post, "experience") !== criteria.experience.toLowerCase()
  )
    return false;
  if (criteria.minPay && criteria.minPay > 0 && numVal(post, "payPerDay") < criteria.minPay)
    return false;

  return true;
}

function careerExperienceMatches(post: MatchablePost, experience: string): boolean {
  const min = numVal(post, "experienceMin");
  const max = numVal(post, "experienceMax");

  if (experience === "0-1") return min <= 1 && max >= 0;
  if (experience === "1-3") return min <= 3 && max >= 1;
  if (experience === "3-7") return min <= 7 && max >= 3;
  if (experience === "7+") return max >= 7;

  return true;
}

export function matchesCareer(post: MatchablePost, criteria: CareerAlertCriteria): boolean {
  const status = str(post, "status");
  const closingDate = numVal(post, "closingDate");

  if (status && status !== "active") return false;
  if (closingDate > 0 && closingDate <= Date.now()) return false;

  if (criteria.query) {
    const query = criteria.query.toLowerCase();
    const text = `${str(post, "jobTitle")} ${str(post, "companyName")} ${str(post, "location")} ${str(post, "department")}`;
    if (!text.includes(query)) return false;
  }

  if (
    criteria.jobType &&
    criteria.jobType !== "any" &&
    str(post, "jobType") !== criteria.jobType.toLowerCase()
  )
    return false;
  if (
    criteria.workMode &&
    criteria.workMode !== "any" &&
    str(post, "workMode") !== criteria.workMode.toLowerCase()
  )
    return false;
  if (
    criteria.department &&
    criteria.department !== "any" &&
    str(post, "department") !== criteria.department.toLowerCase()
  )
    return false;
  if (
    criteria.experience &&
    criteria.experience !== "any" &&
    !careerExperienceMatches(post, criteria.experience)
  )
    return false;

  return true;
}

export function getPostsSince(key: string, since: number): MatchablePost[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];

    return arr.filter((x): x is MatchablePost => {
      if (!isRec(x)) return false;

      const created =
        typeof x.createdAt === "number" && Number.isFinite(x.createdAt) ? x.createdAt : 0;
      return created > since;
    });
  } catch {
    return [];
  }
}
