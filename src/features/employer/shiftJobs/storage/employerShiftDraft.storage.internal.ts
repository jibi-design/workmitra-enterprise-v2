import type { ExperienceLabel } from "./employerShift.types";
import type {
  EmployerShiftCreateDraftForm,
  EmployerShiftDraftJobType,
  EmployerShiftDraftPayBasis,
  EmployerShiftDraftQuickQuestion,
  EmployerShiftPostDraft,
} from "./employerShiftDraft.storage.types";
import { sanitizeUserText } from "../../../../shared/security/sanitizeUserText";
import { getEmployerDraftsKey, LEGACY_DRAFTS_KEY } from "./employerShift.keys";

/** @deprecated Legacy unscoped — prefer getEmployerDraftsKey(). */
export const DRAFTS_KEY = LEGACY_DRAFTS_KEY;
export const DRAFTS_CHANGED_EVENT = "wm:employer-shift-post-drafts-changed";

type UnknownRecord = Record<string, unknown>;

let draftsCacheRaw: string | null = "__init__";
let draftsCacheKey: string | null = null;
let draftsCacheList: EmployerShiftPostDraft[] = [];

function t(value: string, max: number): string {
  return sanitizeUserText(value, max);
}

function draftsStorageKey(): string {
  return getEmployerDraftsKey();
}

export function readDrafts(): EmployerShiftPostDraft[] {
  const key = draftsStorageKey();
  const raw = localStorage.getItem(key);

  if (raw === draftsCacheRaw && key === draftsCacheKey) {
    return draftsCacheList;
  }

  draftsCacheRaw = raw;
  draftsCacheKey = key;
  draftsCacheList = safeParseArray(raw)
    .map(normalizeDraft)
    .filter((draft): draft is EmployerShiftPostDraft => draft !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return draftsCacheList;
}

export function writeDrafts(drafts: readonly EmployerShiftPostDraft[]): boolean {
  try {
    localStorage.setItem(draftsStorageKey(), JSON.stringify(drafts));
    // Stop using unscoped drafts as employer SoT.
    try {
      localStorage.removeItem(LEGACY_DRAFTS_KEY);
    } catch {
      /* safe */
    }
    draftsCacheRaw = "__dirty__";
    draftsCacheKey = null;
    window.dispatchEvent(new Event(DRAFTS_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function normalizeDraftForm(
  form: EmployerShiftCreateDraftForm,
): EmployerShiftCreateDraftForm {
  return {
    companyName: t(form.companyName, 200),
    jobName: t(form.jobName, 200),
    category: t(form.category, 80),
    description: t(form.description, 4000),
    experience: clampExperience(form.experience),
    vacanciesStr: t(form.vacanciesStr, 16),
    backupSlotsStr: t(form.backupSlotsStr, 16),
    payPerDayStr: t(form.payPerDayStr, 32),
    payBasis: clampPayBasis(form.payBasis),
    shiftTiming: t(form.shiftTiming, 80),
    locationName: t(form.locationName, 200),
    locationPincode: t(form.locationPincode, 6),
    locationAddress: t(form.locationAddress, 500),
    mapsLink: t(form.mapsLink, 500),
    startAt: Number.isFinite(form.startAt) ? form.startAt : 0,
    endAt: Number.isFinite(form.endAt) ? form.endAt : 0,
    mustHave: t(form.mustHave, 2000),
    goodToHave: t(form.goodToHave, 2000),
    whatWeProvide: normalizeStringArray(form.whatWeProvide).map((s) => t(s, 200)),
    quickQuestions: normalizeQuickQuestions(form.quickQuestions).map((q) => ({
      ...q,
      text: t(q.text, 500),
    })),
    dressCode: t(form.dressCode, 200),
    jobType: clampJobType(form.jobType),
  };
}

export function buildTitlePreview(form: EmployerShiftCreateDraftForm): string {
  const job = form.jobName.trim();
  const company = form.companyName.trim();
  const category = form.category.trim();

  if (job && company) {
    return `${job} at ${company}`;
  }

  if (job) {
    return job;
  }

  if (category && company) {
    return `${category} shift at ${company}`;
  }

  if (category) {
    return `${category} shift`;
  }

  if (company) {
    return `Shift at ${company}`;
  }

  return "Untitled shift draft";
}

export function createLocalId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function safeParseArray(raw: string | null): unknown[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeDraft(raw: unknown): EmployerShiftPostDraft | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = getString(raw, "id");
  const createdAt = getNumber(raw, "createdAt");
  const updatedAt = getNumber(raw, "updatedAt");
  const titlePreview = getString(raw, "titlePreview");
  const formRaw = raw["form"];

  if (!id || createdAt === undefined || updatedAt === undefined || !titlePreview) {
    return null;
  }

  if (!isRecord(formRaw)) {
    return null;
  }

  const form = normalizeDraftFormFromRecord(formRaw);

  if (!form) {
    return null;
  }

  return {
    id,
    createdAt,
    updatedAt,
    titlePreview,
    form,
  };
}

function normalizeDraftFormFromRecord(raw: UnknownRecord): EmployerShiftCreateDraftForm | null {
  const startAt = getNumber(raw, "startAt");
  const endAt = getNumber(raw, "endAt");

  if (startAt === undefined || endAt === undefined) {
    return null;
  }

  return {
    companyName: getString(raw, "companyName") ?? "",
    jobName: getString(raw, "jobName") ?? "",
    category: getString(raw, "category") ?? "",
    description: getString(raw, "description") ?? "",
    experience: clampExperience(raw["experience"]),
    vacanciesStr: getString(raw, "vacanciesStr") ?? "",
    backupSlotsStr: getString(raw, "backupSlotsStr") ?? "2",
    payPerDayStr: getString(raw, "payPerDayStr") ?? "",
    payBasis: clampPayBasis(raw["payBasis"]),
    shiftTiming: getString(raw, "shiftTiming") ?? "",
    locationName: getString(raw, "locationName") ?? "",
    locationPincode: getString(raw, "locationPincode") ?? "",
    locationAddress: getString(raw, "locationAddress") ?? "",
    mapsLink: getString(raw, "mapsLink") ?? "",
    startAt,
    endAt,
    mustHave: getString(raw, "mustHave") ?? "",
    goodToHave: getString(raw, "goodToHave") ?? "",
    whatWeProvide: normalizeStringArray(raw["whatWeProvide"]),
    quickQuestions: normalizeQuickQuestions(raw["quickQuestions"]),
    dressCode: getString(raw, "dressCode") ?? "",
    jobType: clampJobType(raw["jobType"]),
  };
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, 50);
}

function normalizeQuickQuestions(value: unknown): EmployerShiftDraftQuickQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const output: EmployerShiftDraftQuickQuestion[] = [];

  value.forEach((item, index) => {
    if (!isRecord(item)) {
      return;
    }

    const text = getString(item, "text")?.trim();
    const id = getString(item, "id")?.trim() || `draft_question_${index + 1}`;

    if (!text) {
      return;
    }

    output.push({
      id,
      text,
    });
  });

  return output.slice(0, 20);
}

function clampExperience(value: unknown): ExperienceLabel {
  if (value === "helper" || value === "fresher_ok" || value === "experienced") {
    return value;
  }

  return "helper";
}

function clampPayBasis(value: unknown): EmployerShiftDraftPayBasis {
  if (
    value === "" ||
    value === "per_hour" ||
    value === "per_day" ||
    value === "fixed_total" ||
    value === "not_listed"
  ) {
    return value;
  }

  return "";
}

function clampJobType(value: unknown): EmployerShiftDraftJobType {
  if (value === "weekly" || value === "custom") {
    return value;
  }

  return "one-time";
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getString(record: UnknownRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function getNumber(record: UnknownRecord, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
