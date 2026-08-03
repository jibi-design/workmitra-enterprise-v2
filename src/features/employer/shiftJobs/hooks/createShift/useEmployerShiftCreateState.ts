// App name: Job Mitra
// Facade — employer shift create wizard state.

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import { useUnsavedChangesGuard } from "../../../../../shared/hooks/useUnsavedChangesGuard";
import { getCurrentEmployerMlId } from "../../../company/helpers/employerPublicIdentity";
import { canPublishJobPosts } from "../../../company/helpers/employerVerificationPolicy.helpers";
import { employerSettingsStorage } from "../../../company/storage/employerSettings.storage";
import {
  isDirtyCheck,
  validateWizardStep1,
  validateWizardStep2,
  type ShiftPayBasisDraft,
} from "../../helpers/shiftCreateHelpers";
import {
  employerShiftDraftStorage,
  type EmployerShiftPostDraft,
} from "../../storage/employerShiftDraft.storage";
import type { ShiftCreateWizardStep } from "../../components/ShiftCreateWizardTopBar";
import type { ShiftCreateFormSnapshot } from "./employerShiftCreateDraft.helpers";
import { publishEmployerShiftPost } from "./employerShiftCreatePublish.helpers";
import { createDraftHandlers } from "./employerShiftCreateDraft.handlers";
import { useEmployerShiftCreateFormFields } from "./useEmployerShiftCreateFormFields";
import { buildEmployerShiftCreateViewModel } from "./useEmployerShiftCreateState.viewModel";

export function useEmployerShiftCreateState() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const formNodeRef = useRef<HTMLDivElement | null>(null);
  const employerMlId = useMemo(() => getCurrentEmployerMlId(), []);
  const requestedDraftId = searchParams.get("draftId") ?? "";

  const form = useEmployerShiftCreateFormFields(requestedDraftId);
  const { tpl, initialDraft, mustList, goodList, payPerDay, errors, isValid } = form;

  const setFormNode = useCallback((node: HTMLDivElement | null) => {
    formNodeRef.current = node;
  }, []);

  const scrollToForm = useCallback(() => {
    formNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const [draftId, setDraftId] = useState<string | null>(initialDraft?.id ?? null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(initialDraft?.updatedAt ?? null);

  const drafts = useSyncExternalStore(
    employerShiftDraftStorage.subscribe,
    employerShiftDraftStorage.getAll,
    employerShiftDraftStorage.getAll,
  );

  const [discardConfirm, setDiscardConfirm] = useState<ConfirmData | null>(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [wizardStep, setWizardStep] = useState<ShiftCreateWizardStep>(1);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const otherDrafts = useMemo(
    () => drafts.filter((draft) => draft.id !== draftId).slice(0, 4),
    [drafts, draftId],
  );

  function formSnapshot(): ShiftCreateFormSnapshot {
    return {
      companyName: form.companyName,
      jobName: form.jobName,
      category: form.category,
      description: form.description,
      experience: form.experience,
      vacanciesStr: form.vacanciesStr,
      backupSlotsStr: form.backupSlotsStr,
      payPerDayStr: form.payPerDayStr,
      payBasis: form.payBasis as ShiftCreateFormSnapshot["payBasis"],
      shiftTiming: form.shiftTiming,
      locationName: form.locationName,
      locationAddress: form.locationAddress,
      mapsLink: form.mapsLink,
      startAt: form.startAt,
      endAt: form.endAt,
      mustHave: form.mustHave,
      goodToHave: form.goodToHave,
      whatWeProvide: form.whatWeProvide,
      quickQuestions: form.quickQuestions,
      dressCode: form.dressCode,
      jobType: form.jobType,
    };
  }

  function applyDraftFields(draft: EmployerShiftPostDraft) {
    setDraftId(draft.id);
    setLastSavedAt(draft.updatedAt);
    form.setCompanyName(draft.form.companyName);
    form.setJobName(draft.form.jobName);
    form.setCategory(draft.form.category);
    form.setDescription(draft.form.description);
    form.setExperience(draft.form.experience);
    form.setVacanciesStr(draft.form.vacanciesStr);
    form.setBackupSlotsStr(draft.form.backupSlotsStr);
    form.setPayPerDayStr(draft.form.payPerDayStr);
    form.setPayBasis(draft.form.payBasis as ShiftPayBasisDraft);
    form.setShiftTiming(draft.form.shiftTiming);
    form.setLocationName(draft.form.locationName);
    form.setLocationAddress(draft.form.locationAddress);
    form.setMapsLink(draft.form.mapsLink);
    form.setStartAt(draft.form.startAt);
    form.setEndAt(draft.form.endAt);
    form.setMustHave(draft.form.mustHave);
    form.setGoodToHave(draft.form.goodToHave);
    form.setWhatWeProvide([...draft.form.whatWeProvide]);
    form.setQuickQuestions([...draft.form.quickQuestions]);
    form.setDressCode(draft.form.dressCode);
    form.setJobType(draft.form.jobType);
  }

  /* eslint-disable react-hooks/refs -- scrollToForm only runs inside draft action handlers */
  const draftHandlers = createDraftHandlers({
    autoFill: form.autoFill,
    draftId,
    formSnapshot,
    applyDraftFields,
    setDraftId,
    setLastSavedAt,
    setSearchParams,
    setNotice,
    scrollToForm,
  });
  /* eslint-enable react-hooks/refs */

  const checkDirty = useCallback(
    (): boolean =>
      isDirtyCheck({
        companyName: form.companyName,
        jobName: form.jobName,
        category: form.category,
        description: form.description,
        vacanciesStr: form.vacanciesStr,
        payPerDayStr: form.payPerDayStr,
        payBasis: form.payBasis,
        locationName: form.locationName,
        mustHave: form.mustHave,
        goodToHave: form.goodToHave,
      }),
    [form],
  );

  useUnsavedChangesGuard(checkDirty(), "You have unsaved Shift Job changes. Leave this page?");

  function handlePayBasis(value: ShiftPayBasisDraft): void {
    form.setPayBasis(value);
    if (value === "not_listed") form.setPayPerDayStr("");
  }

  function handleCancel() {
    if (checkDirty()) {
      setDiscardConfirm({
        title: "Discard changes?",
        message:
          "You have unsaved data. Save as Draft if you want to continue later, or discard and leave.",
        tone: "warn",
        confirmLabel: "Discard & Leave",
        cancelLabel: "Stay",
      });
      return;
    }
    nav(ROUTE_PATHS.employerShiftHome);
  }

  function handleWizardNext(): void {
    if (wizardStep === 1) {
      const errs = validateWizardStep1({
        companyName: form.companyName,
        jobName: form.jobName,
        vacanciesStr: form.vacanciesStr,
      });
      if (errs.length > 0) {
        setStepErrors(errs);
        return;
      }
      setStepErrors([]);
      setWizardStep(2);
      formNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (wizardStep === 2) {
      const errs = validateWizardStep2({
        locationName: form.locationName,
        payPerDay,
        payBasis: form.payBasis,
        startAt: form.startAt,
        endAt: form.endAt,
      });
      if (errs.length > 0) {
        setStepErrors(errs);
        return;
      }
      setStepErrors([]);
      setWizardStep(3);
      formNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleWizardBack(): void {
    setStepErrors([]);
    setWizardStep((current) => (current > 1 ? ((current - 1) as ShiftCreateWizardStep) : current));
    formNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCreate() {
    if (!isValid) {
      setNotice({ title: "Cannot Review Post", message: errors.join("\n"), tone: "warn" });
      return;
    }

    const publishGate = canPublishJobPosts(employerSettingsStorage.get());
    if (!publishGate.allowed) {
      setNotice({
        title: "Verify contact first",
        message: publishGate.reason ?? "Complete verification before publishing.",
        tone: "warn",
      });
      return;
    }

    setShowCreateConfirm(true);
  }

  async function doCreate() {
    const postId = await publishEmployerShiftPost({
      snapshot: formSnapshot(),
      mustList,
      goodList,
      payPerDay,
      draftId,
    });

    if (!postId) return;
    nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId));
  }

  /* eslint-disable react-hooks/refs -- draftHandlers defers ref access to user actions */
  const viewModel = buildEmployerShiftCreateViewModel({
    form,
    draftHandlers,
    draftId,
    lastSavedAt,
    otherDrafts,
    wizardStep,
    stepErrors,
    employerMlId,
    tpl,
    groupPreview: form.groupPreview,
    discardConfirm,
    showCreateConfirm,
    notice,
    setDiscardConfirm,
    setNotice,
    setShowCreateConfirm,
    handleWizardNext,
    handleWizardBack,
    handlePayBasis,
    handleCancel,
    handleCreate,
    doCreate,
    nav,
  });
  /* eslint-enable react-hooks/refs */

  return {
    setFormNode,
    ...viewModel,
  };
}
