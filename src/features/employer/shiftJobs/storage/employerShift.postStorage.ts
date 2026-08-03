// App name: Job Mitra
// File name: employerShift.postStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.postStorage.ts

import {
  EMPLOYEE_SEARCH_POSTS_KEY,
  EMPLOYEE_SHIFT_SEARCH_CHANGED_EVENT,
  getEmpPostsKey,
} from "./employerShift.keys";
import { getShiftEmployerScopeId } from "../../../shared/shift/shiftEmployerScope";
import type {
  ShiftPayBasis,
  ShiftPost,
  ShiftQuickQuestion,
  UnknownRecord,
} from "./employerShift.types";
import {
  clampAnalysisStatus,
  clampCategory,
  clampExperience,
  getNumber,
  getString,
  getStringArray,
  isRecord,
  notifyEmployerShiftPostsChanged,
  safeParse,
  safeDispatch,
  safeWrite,
  uniq,
} from "./employerShift.utils";

export function normalizePost(raw: unknown): ShiftPost | null {
  if (!isRecord(raw)) return null;

  const idVal = getString(raw, "id");
  if (!idVal) return null;

  const vacanciesRaw = getNumber(raw, "vacancies");
  const waitingBufferRaw = getNumber(raw, "waitingBuffer");

  const vacancies = vacanciesRaw !== undefined && vacanciesRaw > 0 ? Math.floor(vacanciesRaw) : 1;

  const waitingBuffer =
    waitingBufferRaw !== undefined && waitingBufferRaw >= 0 ? Math.floor(waitingBufferRaw) : 2;

  return {
    id: idVal,
    companyName: getString(raw, "companyName") ?? "Company",
    jobName: getString(raw, "jobName") ?? "Job",
    category: clampCategory(raw["category"]),
    experience: clampExperience(raw["experience"]),
    payPerDay: getNumber(raw, "payPerDay") ?? 0,
    payBasis: normalizePayBasis(raw["payBasis"]),
    locationName: getString(raw, "locationName") ?? "Location",
    locationAddress: getString(raw, "locationAddress") ?? "",
    distanceKm: getNumber(raw, "distanceKm") ?? 0,
    startAt: getNumber(raw, "startAt") ?? Date.now(),
    endAt: getNumber(raw, "endAt") ?? Date.now(),
    description: getString(raw, "description") ?? "",
    shiftTiming: getString(raw, "shiftTiming") ?? "",
    mapsLink: getString(raw, "mapsLink") ?? "",
    isHiddenFromSearch: raw["isHiddenFromSearch"] === true,
    planId: getString(raw, "planId") || undefined,
    planSlotDate: getString(raw, "planSlotDate") || undefined,
    source:
      raw["source"] === "planner" ? "planner" : raw["source"] === "single" ? "single" : undefined,
    siteId: getString(raw, "siteId") || undefined,
    mustHave: getStringArray(raw, "mustHave"),
    goodToHave: getStringArray(raw, "goodToHave"),
    whatWeProvide: getStringArray(raw, "whatWeProvide"),
    quickQuestions: normalizeQuickQuestions(raw["quickQuestions"]),
    dressCode: getString(raw, "dressCode"),
    jobType: normalizeJobType(raw["jobType"]),
    vacancies,
    waitingBuffer,
    analysisStatus: clampAnalysisStatus(raw["analysisStatus"]),
    analyzedAt: getNumber(raw, "analyzedAt"),
    analysisNote: getString(raw, "analysisNote"),
    shortlistIds: uniq(getStringArray(raw, "shortlistIds")),
    waitingIds: uniq(getStringArray(raw, "waitingIds")),
    confirmedIds: uniq(getStringArray(raw, "confirmedIds")),
    rejectedIds: uniq(getStringArray(raw, "rejectedIds")),
    status: normalizePostStatus(raw["status"]),
    settings: normalizePostSettings(raw["settings"]),
  };
}

export function readEmployerPosts(): ShiftPost[] {
  const raw = localStorage.getItem(getEmpPostsKey());

  return safeParse<unknown>(raw)
    .map(normalizePost)
    .filter((post): post is ShiftPost => post !== null)
    .sort((a, b) => (b.analyzedAt ?? 0) - (a.analyzedAt ?? 0));
}

export function writeEmployerPosts(posts: ShiftPost[]): void {
  safeWrite(getEmpPostsKey(), posts);
  notifyEmployerShiftPostsChanged();
}

export function syncToEmployeeSearch(posts: ShiftPost[]): void {
  const employerMapped = posts.map((post) => ({
    id: post.id,
    companyName: post.companyName,
    jobName: post.jobName,
    category: post.category,
    experience: post.experience,
    payPerDay: post.payPerDay,
    payBasis: post.payBasis,
    locationName: post.locationName,
    locationAddress: post.locationAddress ?? "",
    distanceKm: post.distanceKm,
    startAt: post.startAt,
    endAt: post.endAt,
    description: post.description ?? "",
    shiftTiming: post.shiftTiming ?? "",
    mapsLink: post.mapsLink ?? "",
    vacancies: post.vacancies,
    isHiddenFromSearch: post.isHiddenFromSearch === true,
    planId: post.planId,
    planSlotDate: post.planSlotDate,
    source: post.source,
    siteId: post.siteId,
    mustHave: post.mustHave,
    goodToHave: post.goodToHave,
    whatWeProvide: post.whatWeProvide,
    quickQuestions: post.quickQuestions,
    dressCode: post.dressCode,
    jobType: post.jobType,
    employerScopeId: getShiftEmployerScopeId(),
  }));

  const existing = safeParse<Record<string, unknown>>(
    localStorage.getItem(EMPLOYEE_SEARCH_POSTS_KEY),
  );

  const employerIds = new Set(employerMapped.map((post) => post.id));

  const nonEmployer = existing.filter((post) => {
    if (!isRecord(post)) return false;

    const postId = getString(post as UnknownRecord, "id");
    return postId ? !employerIds.has(postId) : true;
  });

  const next = [...employerMapped, ...nonEmployer];
  const serialized = JSON.stringify(next);
  const existingRaw = localStorage.getItem(EMPLOYEE_SEARCH_POSTS_KEY);
  if (existingRaw === serialized) return;

  safeWrite(EMPLOYEE_SEARCH_POSTS_KEY, next);
  safeDispatch(EMPLOYEE_SHIFT_SEARCH_CHANGED_EVENT);
}

function normalizePayBasis(value: unknown): ShiftPayBasis | undefined {
  if (
    value === "per_hour" ||
    value === "per_day" ||
    value === "fixed_total" ||
    value === "not_listed"
  ) {
    return value;
  }

  return undefined;
}

function normalizeQuickQuestions(value: unknown): ShiftQuickQuestion[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((question) => ({
      id: getString(question, "id") ?? "",
      text: getString(question, "text") ?? "",
    }))
    .filter((question) => question.id.length > 0 && question.text.length > 0);
}

function normalizeJobType(value: unknown): ShiftPost["jobType"] {
  if (value === "weekly" || value === "custom") return value;
  return "one-time";
}

function normalizePostStatus(value: unknown): ShiftPost["status"] {
  if (value === "completed" || value === "cancelled") return value;
  return "active";
}

function normalizePostSettings(value: unknown): ShiftPost["settings"] {
  if (!isRecord(value)) {
    return {
      backupSlots: 2,
      autoPromoteBackup: true,
      notifyBackup: true,
    };
  }

  const backupSlotsRaw = value["backupSlots"];

  return {
    backupSlots:
      typeof backupSlotsRaw === "number" && Number.isFinite(backupSlotsRaw)
        ? Math.max(0, backupSlotsRaw)
        : 2,
    autoPromoteBackup: value["autoPromoteBackup"] !== false,
    notifyBackup: value["notifyBackup"] !== false,
  };
}
