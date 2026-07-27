import type {
  AnswerState,
  ExperienceLabel,
  ShiftApplicationData,
  ShiftApplicationStatus,
  ShiftPostData,
} from "../../shiftJobs/types/shiftApplicationTypes";

export const POSTS_KEY = "wm_employer_shift_posts_v1";
export const APPS_KEY = "wm_employee_shift_applications_v1";
export const APPS_CHANGED = "wm:employee-shift-applications-changed";

type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null;
}

function str(r: Rec, k: string): string | undefined {
  const value = r[k];
  return typeof value === "string" ? value : undefined;
}

function num(r: Rec, k: string): number | undefined {
  const value = r[k];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeArr(raw: string | null): unknown[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const VALID_EXP: readonly ExperienceLabel[] = ["helper", "fresher_ok", "experienced"];

export function parsePosts(raw: string | null): ShiftPostData[] {
  const out: ShiftPostData[] = [];

  for (const item of safeArr(raw)) {
    if (!isRec(item)) continue;

    const id = str(item, "id");
    const companyName = str(item, "companyName");
    const jobName = str(item, "jobName");
    const experience = VALID_EXP.includes(item.experience as ExperienceLabel)
      ? (item.experience as ExperienceLabel)
      : null;
    const payPerDay = num(item, "payPerDay");
    const locationName = str(item, "locationName");
    const locationAddress = str(item, "locationAddress");
    const mapsLink = str(item, "mapsLink");
    const startAt = num(item, "startAt");
    const endAt = num(item, "endAt");

    if (
      !id ||
      !companyName ||
      !jobName ||
      !experience ||
      payPerDay === undefined ||
      !locationName ||
      startAt === undefined ||
      endAt === undefined
    ) {
      continue;
    }

    const shiftType = str(item, "shiftType") ?? str(item, "jobType") ?? str(item, "category");

    out.push({
      id,
      companyName,
      jobName,
      experience,
      payPerDay,
      locationName,
      locationAddress,
      mapsLink,
      startAt,
      endAt,
      isHiddenFromSearch: Boolean(item.isHiddenFromSearch),
      shiftType,
    });
  }

  return out;
}

const VALID_STATUS: readonly ShiftApplicationStatus[] = [
  "applied",
  "shortlisted",
  "waiting",
  "confirmed",
  "rejected",
  "withdrawn",
  "replaced",
  "exited",
];

const VALID_REASON = ["no_show", "schedule_change", "quality_issue", "other"] as const;

export function parseApps(raw: string | null): ShiftApplicationData[] {
  const out: ShiftApplicationData[] = [];

  for (const item of safeArr(raw)) {
    if (!isRec(item)) continue;

    const id = str(item, "id");
    const postId = str(item, "postId");
    const createdAt = num(item, "createdAt");
    const status = VALID_STATUS.includes(item.status as ShiftApplicationStatus)
      ? (item.status as ShiftApplicationStatus)
      : null;

    if (!id || !postId || createdAt === undefined || !status) {
      continue;
    }

    const mustHaveAnswers = isRec(item.mustHaveAnswers)
      ? (item.mustHaveAnswers as Record<string, AnswerState>)
      : {};
    const goodToHaveAnswers = isRec(item.goodToHaveAnswers)
      ? (item.goodToHaveAnswers as Record<string, AnswerState>)
      : {};
    const notes = isRec(item.notes) ? (item.notes as Record<string, string>) : {};
    const replacedReason = item.replacedReason;

    out.push({
      id,
      postId,
      createdAt,
      status,
      mustHaveAnswers,
      goodToHaveAnswers,
      notes,
      withdrawnAt: num(item, "withdrawnAt"),
      attendanceConfirmedAt: num(item, "attendanceConfirmedAt"),
      replacedAt: num(item, "replacedAt"),
      replacedReason: VALID_REASON.includes(replacedReason as (typeof VALID_REASON)[number])
        ? (replacedReason as ShiftApplicationData["replacedReason"])
        : undefined,
      planId: str(item, "planId"),
      planApplyBatchId: str(item, "planApplyBatchId"),
      selectedDates: Array.isArray(item.selectedDates)
        ? item.selectedDates.filter((d): d is string => typeof d === "string")
        : undefined,
    });
  }

  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

export { safeArr, isRec, str, num };
