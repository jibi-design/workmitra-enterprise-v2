// App name: Job Mitra
// File name: employerShiftDraft.storage.ts — facade

export type {
  EmployerShiftDraftPayBasis,
  EmployerShiftDraftJobType,
  EmployerShiftDraftQuickQuestion,
  EmployerShiftCreateDraftForm,
  EmployerShiftPostDraft,
  EmployerShiftDraftWriteResult,
} from "./employerShiftDraft.storage.types";

import type {
  EmployerShiftCreateDraftForm,
  EmployerShiftPostDraft,
  EmployerShiftDraftWriteResult,
} from "./employerShiftDraft.storage.types";
import {
  buildTitlePreview,
  createLocalId,
  DRAFTS_CHANGED_EVENT,
  normalizeDraftForm,
  readDrafts,
  writeDrafts,
} from "./employerShiftDraft.storage.internal";

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
