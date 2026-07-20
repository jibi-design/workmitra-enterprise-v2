// App name: Job Mitra
// File name: careerCreateDraft.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\storage\careerCreateDraft.storage.ts

import type { ScreeningQuestion } from "../components/CareerCreateScreeningSection";
import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepInterviewData } from "../components/CareerCreateStepInterview";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";

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

const DRAFT_KEY = "wm_employer_career_create_draft_v1";
const CHANGED_EVENT = "wm:employer-career-create-draft-changed";

function emitChange(): void {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function normalizeStep(step: number): number {
  if (step < 1) return 1;
  if (step > 4) return 4;
  return step;
}

export const careerCreateDraftStorage = {
  get(): CareerCreateDraft | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as CareerCreateDraft;
      if (!parsed || parsed.id !== "career_create_draft") return null;

      return {
        ...parsed,
        step: normalizeStep(Number(parsed.step) || 1),
        screeningQuestions: Array.isArray(parsed.screeningQuestions)
          ? parsed.screeningQuestions
          : [],
      };
    } catch {
      return null;
    }
  },

  save(data: Omit<CareerCreateDraft, "id" | "savedAt" | "updatedAt">): CareerCreateDraft {
    const existing = this.get();
    const now = Date.now();

    const draft: CareerCreateDraft = {
      id: "career_create_draft",
      step: normalizeStep(data.step),
      basic: data.basic,
      req: data.req,
      interview: data.interview,
      screeningQuestions: data.screeningQuestions,
      savedAt: existing?.savedAt ?? now,
      updatedAt: now,
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    emitChange();

    return draft;
  },

  clear(): void {
    localStorage.removeItem(DRAFT_KEY);
    emitChange();
  },

  hasDraft(): boolean {
    return this.get() !== null;
  },

  subscribe(callback: () => void): () => void {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === DRAFT_KEY) callback();
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
