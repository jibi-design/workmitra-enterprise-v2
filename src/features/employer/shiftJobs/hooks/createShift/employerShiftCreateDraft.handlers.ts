import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import {
  employerShiftDraftStorage,
  type EmployerShiftPostDraft,
} from "../../storage/employerShiftDraft.storage";
import {
  buildDraftForm,
  hasDraftContent,
  snapshotFromDraft,
  type ShiftCreateAutoFill,
  type ShiftCreateFormSnapshot,
} from "./employerShiftCreateDraft.helpers";

export function createDraftHandlers(params: {
  autoFill: ShiftCreateAutoFill;
  draftId: string | null;
  formSnapshot: () => ShiftCreateFormSnapshot;
  applyDraftFields: (draft: EmployerShiftPostDraft) => void;
  setDraftId: (id: string | null) => void;
  setLastSavedAt: (ts: number | null) => void;
  markDraftClean: (snapshot: ShiftCreateFormSnapshot) => void;
  clearDraftCleanBaseline: () => void;
  setSearchParams: (next: Record<string, string>, opts?: { replace?: boolean }) => void;
  setNotice: (notice: NoticeData | null) => void;
  scrollToForm: () => void;
}) {
  const {
    autoFill,
    draftId,
    formSnapshot,
    applyDraftFields,
    setDraftId,
    setLastSavedAt,
    markDraftClean,
    clearDraftCleanBaseline,
    setSearchParams,
    setNotice,
    scrollToForm,
  } = params;

  function applyDraft(draft: EmployerShiftPostDraft) {
    applyDraftFields(draft);
    setSearchParams({ draftId: draft.id }, { replace: true });
    markDraftClean(snapshotFromDraft(draft));
    setNotice({
      title: "Draft loaded",
      message: "Your saved draft is ready to continue.",
      tone: "success",
    });
    scrollToForm();
  }

  function handleSaveDraft() {
    const snapshot = formSnapshot();
    const draftForm = buildDraftForm(snapshot);

    if (!hasDraftContent(draftForm, autoFill)) {
      setNotice({
        title: "Nothing to save yet",
        message: "Enter at least one shift detail before saving a draft.",
        tone: "warn",
      });
      return;
    }

    const result = employerShiftDraftStorage.saveDraft(draftForm, draftId);

    if (!result.ok) {
      setNotice({
        title: "Draft not saved",
        message: "Local storage failed. Please free storage space or try again.",
        tone: "warn",
      });
      return;
    }

    setDraftId(result.draft.id);
    setLastSavedAt(result.draft.updatedAt);
    setSearchParams({ draftId: result.draft.id }, { replace: true });
    markDraftClean(snapshot);
    setNotice({
      title: "Draft saved",
      message: "This shift is saved on this device. It is not visible to workers until published.",
      tone: "success",
    });
  }

  function handleDeleteSavedDraft(targetDraftId: string) {
    const deleted = employerShiftDraftStorage.deleteDraft(targetDraftId);

    if (!deleted) {
      setNotice({
        title: "Draft not deleted",
        message: "Local storage failed. Please try again.",
        tone: "warn",
      });
      return;
    }

    if (targetDraftId === draftId) {
      setDraftId(null);
      setLastSavedAt(null);
      setSearchParams({}, { replace: true });
      clearDraftCleanBaseline();
    }

    setNotice({
      title: "Draft deleted",
      message: "The local draft was removed. Drafts are never visible to workers until published.",
      tone: "success",
    });
  }

  function handleDeleteCurrentDraft() {
    if (!draftId) {
      setNotice({
        title: "No active draft",
        message: "There is no current draft to delete.",
        tone: "warn",
      });
      return;
    }
    handleDeleteSavedDraft(draftId);
  }

  return {
    applyDraft,
    handleSaveDraft,
    handleDeleteSavedDraft,
    handleDeleteCurrentDraft,
  };
}
