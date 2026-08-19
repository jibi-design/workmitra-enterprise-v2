// App name: Job Mitra
// File name: careerCreateDraft.storage.ts
// Layer 4 completion: XSS sanitize all user text before LocalStorage drafts.
// P2: soft-fail when employer scope missing or storage is unavailable (incognito / quota).

import type { ScreeningQuestion } from "../components/CareerCreateScreeningSection";
import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepInterviewData } from "../components/CareerCreateStepInterview";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";
import { sanitizeUserText } from "../../../../shared/security/sanitizeUserText";
import { sanitizePincodeInput } from "../../../shared/location/pincode";
import { tryResolveCareerEmployerScopedKey } from "../../../shared/career/careerEmployerScope";

export type CareerCreateDraft = {
  id: "career_create_draft";
  step: number;
  basic: StepBasicData;
  req: StepRequirementsData;
  interview: StepInterviewData;
  screeningQuestions: ScreeningQuestion[];
  savedAt: number;
  updatedAt: number;
};

export type CareerCreateDraftWriteResult =
  { ok: true; draft: CareerCreateDraft } | { ok: false; reason: "no_scope" | "storage_error" };

function draftStorageKey(): string | null {
  return tryResolveCareerEmployerScopedKey("career_create_draft_v1");
}

const CHANGED_EVENT = "wm:employer-career-create-draft-changed";

function emitChange(): void {
  try {
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

function normalizeStep(step: number): number {
  if (step < 1) return 1;
  if (step > 4) return 4;
  return step;
}

function sanitizeBasic(basic: StepBasicData): StepBasicData {
  return {
    ...basic,
    companyName: sanitizeUserText(basic.companyName, 200),
    jobTitle: sanitizeUserText(basic.jobTitle, 200),
    department: sanitizeUserText(basic.department, 120),
    location: sanitizeUserText(basic.location, 200),
    locationPincode: sanitizePincodeInput(basic.locationPincode ?? ""),
    vacancies: sanitizeUserText(basic.vacancies, 16),
    probationPeriod: sanitizeUserText(basic.probationPeriod, 80),
  };
}

function sanitizeReq(req: StepRequirementsData): StepRequirementsData {
  return {
    ...req,
    salaryMin: sanitizeUserText(req.salaryMin, 32),
    salaryMax: sanitizeUserText(req.salaryMax, 32),
    experienceMin: sanitizeUserText(req.experienceMin, 16),
    experienceMax: sanitizeUserText(req.experienceMax, 16),
    noticePeriodCustomDays: sanitizeUserText(req.noticePeriodCustomDays, 16),
    qualifications: sanitizeUserText(req.qualifications, 4000),
    skills: sanitizeUserText(req.skills, 4000),
    description: sanitizeUserText(req.description, 8000),
    responsibilities: sanitizeUserText(req.responsibilities, 4000),
  };
}

function sanitizeInterview(interview: StepInterviewData): StepInterviewData {
  return {
    roundConfigs: Array.isArray(interview.roundConfigs)
      ? interview.roundConfigs.map((cfg) => ({
          ...cfg,
          label: sanitizeUserText(cfg.label, 200),
        }))
      : [],
  };
}

function sanitizeScreening(questions: ScreeningQuestion[]): ScreeningQuestion[] {
  return questions
    .slice(0, 7)
    .map((q) => ({
      ...q,
      id: sanitizeUserText(q.id, 80) || q.id,
      text: sanitizeUserText(q.text, 500),
    }))
    .filter((q) => q.text.length > 0);
}

function sanitizeDraft(draft: CareerCreateDraft): CareerCreateDraft {
  return {
    ...draft,
    step: normalizeStep(Number(draft.step) || 1),
    basic: sanitizeBasic(draft.basic),
    req: sanitizeReq(draft.req),
    interview: sanitizeInterview(draft.interview),
    screeningQuestions: sanitizeScreening(
      Array.isArray(draft.screeningQuestions) ? draft.screeningQuestions : [],
    ),
  };
}

export const careerCreateDraftStorage = {
  get(): CareerCreateDraft | null {
    try {
      const key = draftStorageKey();
      if (!key || typeof localStorage === "undefined") return null;

      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as CareerCreateDraft;
      if (!parsed || parsed.id !== "career_create_draft") return null;

      return sanitizeDraft({
        ...parsed,
        step: normalizeStep(Number(parsed.step) || 1),
        screeningQuestions: Array.isArray(parsed.screeningQuestions)
          ? parsed.screeningQuestions
          : [],
      });
    } catch {
      return null;
    }
  },

  save(
    data: Omit<CareerCreateDraft, "id" | "savedAt" | "updatedAt">,
  ): CareerCreateDraftWriteResult {
    try {
      const key = draftStorageKey();
      if (!key || typeof localStorage === "undefined") {
        return { ok: false, reason: "no_scope" };
      }

      const existing = this.get();
      const now = Date.now();

      const draft = sanitizeDraft({
        id: "career_create_draft",
        step: normalizeStep(data.step),
        basic: data.basic,
        req: data.req,
        interview: data.interview,
        screeningQuestions: data.screeningQuestions,
        savedAt: existing?.savedAt ?? now,
        updatedAt: now,
      });

      localStorage.setItem(key, JSON.stringify(draft));
      emitChange();
      return { ok: true, draft };
    } catch {
      return { ok: false, reason: "storage_error" };
    }
  },

  clear(): void {
    try {
      const key = draftStorageKey();
      if (key && typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch {
      /* incognito / blocked storage */
    }
    emitChange();
  },

  hasDraft(): boolean {
    return this.get() !== null;
  },

  subscribe(callback: () => void): () => void {
    const handleStorage = (event: StorageEvent) => {
      const key = draftStorageKey();
      if (key && event.key === key) callback();
    };

    window.addEventListener(CHANGED_EVENT, callback);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CHANGED_EVENT, callback);
      window.removeEventListener("storage", handleStorage);
    };
  },

  CHANGED_EVENT,
} as const;
