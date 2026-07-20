// App name: Job Mitra
// File name: employerShiftDraft.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShiftDraft.storage.ts

import type { ExperienceLabel, ShiftPayBasis } from "./employerShift.types";

const DRAFTS_KEY = "wm_employer_shift_post_drafts_v1";
const DRAFTS_CHANGED_EVENT = "wm:employer-shift-post-drafts-changed";

export type EmployerShiftDraftPayBasis = ShiftPayBasis | "";

export type EmployerShiftDraftJobType = "one-time" | "weekly" | "custom";

export type EmployerShiftDraftQuickQuestion = {
  readonly id: string;
  readonly text: string;
};

export type EmployerShiftCreateDraftForm = {
  readonly companyName: string;
  readonly jobName: string;
  readonly category: string;
  readonly description: string;
  readonly experience: ExperienceLabel;
  readonly vacanciesStr: string;
  readonly backupSlotsStr: string;
  readonly payPerDayStr: string;
  readonly payBasis: EmployerShiftDraftPayBasis;
  readonly shiftTiming: string;
  readonly locationName: string;
  readonly locationAddress: string;
  readonly mapsLink: string;
  readonly startAt: number;
  readonly endAt: number;
  readonly mustHave: string;
  readonly goodToHave: string;
  readonly whatWeProvide: readonly string[];
  readonly quickQuestions: readonly EmployerShiftDraftQuickQuestion[];
  readonly dressCode: string;
  readonly jobType: EmployerShiftDraftJobType;
};

export type EmployerShiftPostDraft = {
  readonly id: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly titlePreview: string;
  readonly form: EmployerShiftCreateDraftForm;
};

export type EmployerShiftDraftWriteResult =
  | { readonly ok: true; readonly draft: EmployerShiftPostDraft }
  | { readonly ok: false; readonly reason: "storage_error" };

type UnknownRecord = Record<string, unknown>;

let draftsCacheRaw: string | null = "__init__";
let draftsCacheList: EmployerShiftPostDraft[] = [];

export const employerShiftDraftStorage = {
  getAll(): EmployerShiftPostDraft[] {
    return readDrafts();
  },

  getById(draftId: string): EmployerShiftPostDraft | null {
    return readDrafts().find((draft) => draft.id === draftId) ?? null;
  },

  getLatest(): EmployerShiftPostDraft | null {
    return readDrafts()[0] ?? null;
  },

  saveDraft(
    form: EmployerShiftCreateDraftForm,
    existingDraftId?: string | null,
  ): EmployerShiftDraftWriteResult {
    const drafts = readDrafts();
    const existingDraft =
      existingDraftId && existingDraftId.trim()
        ? drafts.find((draft) => draft.id === existingDraftId)
        : undefined;

    const now = Date.now();
    const draft: EmployerShiftPostDraft = {
      id: existingDraft?.id ?? createLocalId("shift_draft"),
      createdAt: existingDraft?.createdAt ?? now,
      updatedAt: now,
      titlePreview: buildTitlePreview(form),
      form: normalizeDraftForm(form),
    };

    const next = [draft, ...drafts.filter((item) => item.id !== draft.id)]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 20);

    const result = writeDrafts(next);

    if (!result) {
      return { ok: false, reason: "storage_error" };
    }

    return { ok: true, draft };
  },

  deleteDraft(draftId: string): boolean {
    const next = readDrafts().filter((draft) => draft.id !== draftId);
    return writeDrafts(next);
  },

  subscribe(callback: () => void): () => void {
    const handler = () => callback();

    window.addEventListener("storage", handler);
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", handler);
    window.addEventListener(DRAFTS_CHANGED_EVENT, handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("focus", handler);
      document.removeEventListener("visibilitychange", handler);
      window.removeEventListener(DRAFTS_CHANGED_EVENT, handler);
    };
  },
} as const;

function readDrafts(): EmployerShiftPostDraft[] {
  const raw = localStorage.getItem(DRAFTS_KEY);

  if (raw === draftsCacheRaw) {
    return draftsCacheList;
  }

  draftsCacheRaw = raw;
  draftsCacheList = safeParseArray(raw)
    .map(normalizeDraft)
    .filter((draft): draft is EmployerShiftPostDraft => draft !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return draftsCacheList;
}

function writeDrafts(drafts: readonly EmployerShiftPostDraft[]): boolean {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    draftsCacheRaw = "__dirty__";
    window.dispatchEvent(new Event(DRAFTS_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
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

function normalizeDraftForm(form: EmployerShiftCreateDraftForm): EmployerShiftCreateDraftForm {
  return {
    companyName: form.companyName,
    jobName: form.jobName,
    category: form.category,
    description: form.description,
    experience: clampExperience(form.experience),
    vacanciesStr: form.vacanciesStr,
    backupSlotsStr: form.backupSlotsStr,
    payPerDayStr: form.payPerDayStr,
    payBasis: clampPayBasis(form.payBasis),
    shiftTiming: form.shiftTiming,
    locationName: form.locationName,
    locationAddress: form.locationAddress,
    mapsLink: form.mapsLink,
    startAt: Number.isFinite(form.startAt) ? form.startAt : 0,
    endAt: Number.isFinite(form.endAt) ? form.endAt : 0,
    mustHave: form.mustHave,
    goodToHave: form.goodToHave,
    whatWeProvide: normalizeStringArray(form.whatWeProvide),
    quickQuestions: normalizeQuickQuestions(form.quickQuestions),
    dressCode: form.dressCode,
    jobType: clampJobType(form.jobType),
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

function buildTitlePreview(form: EmployerShiftCreateDraftForm): string {
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

function createLocalId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
