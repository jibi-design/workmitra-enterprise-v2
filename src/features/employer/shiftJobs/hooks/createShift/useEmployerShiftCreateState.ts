// App name: Job Mitra
// File name: useEmployerShiftCreateState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\createShift\useEmployerShiftCreateState.ts

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import { getCurrentEmployerJmId } from "../../../company/helpers/employerPublicIdentity";
import { canPublishJobPosts } from "../../../company/helpers/employerVerificationPolicy.helpers";
import { employerSettingsStorage } from "../../../company/storage/employerSettings.storage";
import type { QuickQuestion } from "../../components/ShiftCreateQuickQuestionsSection";
import {
  normalizeEachLine,
  normalizeTextInput,
  toCreatePayBasis,
} from "../../helpers/shiftCreateInput.helpers";
import {
  clampInt,
  findDuplicateShiftWarnings,
  getAutoFillData,
  isDirtyCheck,
  normalizeLines,
  toDateStr,
  tomorrowEpoch,
  validateShiftForm,
  validateWizardStep1,
  validateWizardStep2,
  type ShiftPayBasisDraft,
} from "../../helpers/shiftCreateHelpers";
import { employerShiftStorage, type ExperienceLabel } from "../../storage/employerShift.storage";
import {
  employerShiftDraftStorage,
  type EmployerShiftCreateDraftForm,
  type EmployerShiftPostDraft,
} from "../../storage/employerShiftDraft.storage";
import { enqueueAvailabilityMatchPulsesForShift } from "../../services/shiftAvailabilityMatchPulse.service";
import { shiftTemplatesStorage } from "../../storage/shiftTemplatesStorage";
import type { ShiftCreateWizardStep } from "../../components/ShiftCreateWizardTopBar";

export function useEmployerShiftCreateState() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const formNodeRef = useRef<HTMLDivElement | null>(null);
  const autoFill = useMemo(() => getAutoFillData(), []);
  const employerJmId = useMemo(() => getCurrentEmployerJmId(), []);
  const requestedDraftId = searchParams.get("draftId") ?? "";

  const setFormNode = useCallback((node: HTMLDivElement | null) => {
    formNodeRef.current = node;
  }, []);

  const [initialDraft] = useState<EmployerShiftPostDraft | null>(() =>
    requestedDraftId ? employerShiftDraftStorage.getById(requestedDraftId) : null,
  );
  const [tpl] = useState(() => (initialDraft ? null : shiftTemplatesStorage.consumePending()));

  const initialDraftForm = initialDraft?.form;

  const [draftId, setDraftId] = useState<string | null>(initialDraft?.id ?? null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(initialDraft?.updatedAt ?? null);

  const drafts = useSyncExternalStore(
    employerShiftDraftStorage.subscribe,
    employerShiftDraftStorage.getAll,
    employerShiftDraftStorage.getAll,
  );

  const [companyName, setCompanyName] = useState(
    initialDraftForm?.companyName ?? autoFill.companyName,
  );
  const [jobName, setJobName] = useState(initialDraftForm?.jobName ?? tpl?.jobName ?? "");
  const [category, setCategory] = useState(
    initialDraftForm?.category ?? tpl?.category ?? autoFill.industryType,
  );
  const [description, setDescription] = useState(
    initialDraftForm?.description ?? tpl?.description ?? "",
  );
  const [experience, setExperience] = useState<ExperienceLabel>(
    initialDraftForm?.experience ?? tpl?.experience ?? "helper",
  );
  const [vacanciesStr, setVacanciesStr] = useState(
    initialDraftForm?.vacanciesStr ?? (tpl?.vacancies ? String(tpl.vacancies) : ""),
  );
  const [backupSlotsStr, setBackupSlotsStr] = useState(
    initialDraftForm?.backupSlotsStr ?? (tpl?.waitingBuffer ? String(tpl.waitingBuffer) : "2"),
  );
  const [payPerDayStr, setPayPerDayStr] = useState(
    initialDraftForm?.payPerDayStr ?? (tpl?.payPerDay ? String(tpl.payPerDay) : ""),
  );
  const [payBasis, setPayBasis] = useState<ShiftPayBasisDraft>(
    (initialDraftForm?.payBasis ?? "") as ShiftPayBasisDraft,
  );
  const [shiftTiming, setShiftTiming] = useState(
    initialDraftForm?.shiftTiming ?? tpl?.shiftTiming ?? "",
  );
  const [locationName, setLocationName] = useState(
    initialDraftForm?.locationName ?? tpl?.locationName ?? autoFill.locationCity,
  );
  const [locationAddress, setLocationAddress] = useState(initialDraftForm?.locationAddress ?? "");
  const [mapsLink, setMapsLink] = useState(initialDraftForm?.mapsLink ?? "");
  const [startAt, setStartAt] = useState<number>(initialDraftForm?.startAt ?? tomorrowEpoch);
  const [endAt, setEndAt] = useState<number>(initialDraftForm?.endAt ?? tomorrowEpoch);
  const [mustHave, setMustHave] = useState(
    initialDraftForm?.mustHave ?? (tpl?.mustHave?.length ? tpl.mustHave.join("\n") : ""),
  );
  const [goodToHave, setGoodToHave] = useState(
    initialDraftForm?.goodToHave ?? (tpl?.goodToHave?.length ? tpl.goodToHave.join("\n") : ""),
  );
  const [whatWeProvide, setWhatWeProvide] = useState<string[]>(
    initialDraftForm?.whatWeProvide
      ? [...initialDraftForm.whatWeProvide]
      : (tpl?.whatWeProvide ?? []),
  );
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>(
    initialDraftForm?.quickQuestions
      ? ([...initialDraftForm.quickQuestions] as QuickQuestion[])
      : ((tpl?.quickQuestions ?? []) as QuickQuestion[]),
  );
  const [dressCode, setDressCode] = useState(initialDraftForm?.dressCode ?? tpl?.dressCode ?? "");
  const [jobType, setJobType] = useState<"one-time" | "weekly" | "custom">(
    initialDraftForm?.jobType ?? "one-time",
  );

  const [discardConfirm, setDiscardConfirm] = useState<ConfirmData | null>(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [wizardStep, setWizardStep] = useState<ShiftCreateWizardStep>(1);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const mustList = useMemo(
    () => normalizeLines(mustHave, { maxItems: 25, maxLen: 80 }),
    [mustHave],
  );
  const goodList = useMemo(
    () => normalizeLines(goodToHave, { maxItems: 25, maxLen: 80 }),
    [goodToHave],
  );
  const payPerDay = Number(payPerDayStr) || 0;

  const groupPreview = useMemo(
    () =>
      `${companyName.trim() || "Company"} - ${jobName.trim() || "Job"} - ${
        category.trim() || "Category"
      }`,
    [companyName, jobName, category],
  );

  const errors = useMemo(
    () =>
      validateShiftForm({
        companyName,
        jobName,
        locationName,
        vacanciesStr,
        payPerDay,
        payBasis,
        startAt,
        endAt,
      }),
    [companyName, jobName, locationName, vacanciesStr, payPerDay, payBasis, startAt, endAt],
  );

  const isValid = errors.length === 0;

  const dateRangeText = useMemo(() => {
    const start = toDateStr(startAt);
    const end = toDateStr(endAt);
    return start === end ? start : `${start} to ${end}`;
  }, [startAt, endAt]);

  const duplicateWarnings = useMemo(
    () =>
      findDuplicateShiftWarnings(employerShiftStorage.getPosts(), {
        companyName,
        jobName,
        category,
        locationName,
        startAt,
        endAt: endAt < startAt ? startAt : endAt,
      }),
    [companyName, jobName, category, locationName, startAt, endAt],
  );

  const otherDrafts = useMemo(
    () => drafts.filter((draft) => draft.id !== draftId).slice(0, 4),
    [drafts, draftId],
  );

  const checkDirty = useCallback(
    (): boolean =>
      isDirtyCheck({
        companyName,
        jobName,
        category,
        description,
        vacanciesStr,
        payPerDayStr,
        payBasis,
        locationName,
        mustHave,
        goodToHave,
      }),
    [
      companyName,
      jobName,
      category,
      description,
      vacanciesStr,
      payPerDayStr,
      payBasis,
      locationName,
      mustHave,
      goodToHave,
    ],
  );

  function buildDraftForm(): EmployerShiftCreateDraftForm {
    return {
      companyName,
      jobName,
      category,
      description,
      experience,
      vacanciesStr,
      backupSlotsStr,
      payPerDayStr,
      payBasis: payBasis as EmployerShiftCreateDraftForm["payBasis"],
      shiftTiming,
      locationName,
      locationAddress,
      mapsLink,
      startAt,
      endAt,
      mustHave,
      goodToHave,
      whatWeProvide,
      quickQuestions,
      dressCode,
      jobType,
    };
  }

  function hasDraftContent(form: EmployerShiftCreateDraftForm): boolean {
    const companyChanged = form.companyName.trim() !== autoFill.companyName.trim();
    const locationChanged = form.locationName.trim() !== autoFill.locationCity.trim();

    return (
      companyChanged ||
      locationChanged ||
      form.jobName.trim().length > 0 ||
      form.category.trim() !== autoFill.industryType.trim() ||
      form.description.trim().length > 0 ||
      form.vacanciesStr.trim().length > 0 ||
      form.payPerDayStr.trim().length > 0 ||
      form.shiftTiming.trim().length > 0 ||
      form.locationAddress.trim().length > 0 ||
      form.mapsLink.trim().length > 0 ||
      form.mustHave.trim().length > 0 ||
      form.goodToHave.trim().length > 0 ||
      form.whatWeProvide.length > 0 ||
      form.quickQuestions.length > 0 ||
      form.dressCode.trim().length > 0
    );
  }

  function applyDraft(draft: EmployerShiftPostDraft) {
    setDraftId(draft.id);
    setLastSavedAt(draft.updatedAt);
    setCompanyName(draft.form.companyName);
    setJobName(draft.form.jobName);
    setCategory(draft.form.category);
    setDescription(draft.form.description);
    setExperience(draft.form.experience);
    setVacanciesStr(draft.form.vacanciesStr);
    setBackupSlotsStr(draft.form.backupSlotsStr);
    setPayPerDayStr(draft.form.payPerDayStr);
    setPayBasis(draft.form.payBasis as ShiftPayBasisDraft);
    setShiftTiming(draft.form.shiftTiming);
    setLocationName(draft.form.locationName);
    setLocationAddress(draft.form.locationAddress);
    setMapsLink(draft.form.mapsLink);
    setStartAt(draft.form.startAt);
    setEndAt(draft.form.endAt);
    setMustHave(draft.form.mustHave);
    setGoodToHave(draft.form.goodToHave);
    setWhatWeProvide([...draft.form.whatWeProvide]);
    setQuickQuestions([...draft.form.quickQuestions] as QuickQuestion[]);
    setDressCode(draft.form.dressCode);
    setJobType(draft.form.jobType);
    setSearchParams({ draftId: draft.id }, { replace: true });
    setNotice({
      title: "Draft loaded",
      message: "Your saved draft is ready to continue.",
      tone: "success",
    });
    formNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSaveDraft() {
    const form = buildDraftForm();

    if (!hasDraftContent(form)) {
      setNotice({
        title: "Nothing to save yet",
        message: "Enter at least one shift detail before saving a draft.",
        tone: "warn",
      });
      return;
    }

    const result = employerShiftDraftStorage.saveDraft(form, draftId);

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

  function handlePayBasis(value: ShiftPayBasisDraft): void {
    setPayBasis(value);

    if (value === "not_listed") {
      setPayPerDayStr("");
    }
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
      const errs = validateWizardStep1({ companyName, jobName, vacanciesStr });
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
        locationName,
        payPerDay,
        payBasis,
        startAt,
        endAt,
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
      setNotice({
        title: "Cannot Review Post",
        message: errors.join("\n"),
        tone: "warn",
      });
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

  function doCreate() {
    const postId = employerShiftStorage.createPost({
      companyName: companyName.trim(),
      jobName: jobName.trim(),
      category: category.trim() || "Other",
      experience,
      payPerDay: payBasis === "not_listed" ? 0 : clampInt(payPerDay, 0, 1_000_000),
      payBasis: toCreatePayBasis(payBasis),
      locationName: locationName.trim(),
      locationAddress: locationAddress.trim(),
      distanceKm: 0,
      startAt,
      endAt: endAt < startAt ? startAt : endAt,
      description: description.trim(),
      shiftTiming: shiftTiming.trim(),
      mapsLink: mapsLink.trim(),
      isHiddenFromSearch: false,
      mustHave: mustList,
      goodToHave: goodList,
      whatWeProvide,
      quickQuestions: quickQuestions.length > 0 ? quickQuestions : undefined,
      dressCode: dressCode.trim() || undefined,
      jobType,
      vacancies: clampInt(Number(vacanciesStr) || 1, 1, 1000),
      waitingBuffer: clampInt(Number(backupSlotsStr) || 0, 0, 20),
      settings: {
        backupSlots: clampInt(Number(backupSlotsStr) || 0, 0, 20),
        autoPromoteBackup: true,
        notifyBackup: true,
      },
    });

    enqueueAvailabilityMatchPulsesForShift({
      postId,
      startAt,
      endAt: endAt < startAt ? startAt : endAt,
    });

    if (draftId) {
      employerShiftDraftStorage.deleteDraft(draftId);
    }

    nav(ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId));
  }

  return {
    setFormNode,
    wizardStep,
    stepErrors,
    handleWizardNext,
    handleWizardBack,
    isTemplate: Boolean(tpl),
    groupPreview,
    employerJmId,
    draft: {
      draftId,
      lastSavedAt,
      otherDrafts,
      handleSaveDraft,
      handleDeleteCurrentDraft,
      handleDeleteSavedDraft,
      applyDraft,
    },
    basic: {
      companyName,
      onCompanyName: (value: string) => setCompanyName(normalizeTextInput(companyName, value)),
      companyAutoFilled: autoFill.companyName.length > 0,
      jobName,
      onJobName: (value: string) => setJobName(normalizeTextInput(jobName, value)),
      category,
      onCategory: (value: string) => setCategory(normalizeTextInput(category, value)),
      categoryAutoFilled: autoFill.industryType.length > 0,
      description,
      onDescription: (value: string) => setDescription(normalizeTextInput(description, value)),
    },
    workers: {
      vacanciesStr,
      onVacancies: setVacanciesStr,
      backupSlotsStr,
      onBackupSlots: setBackupSlotsStr,
      experience,
      onExperience: setExperience,
      category,
    },
    schedule: {
      startAt,
      onStartAt: setStartAt,
      endAt,
      onEndAt: setEndAt,
      shiftTiming,
      onShiftTiming: (value: string) => setShiftTiming(normalizeTextInput(shiftTiming, value)),
      payPerDayStr,
      onPayPerDay: setPayPerDayStr,
      payBasis,
      onPayBasis: handlePayBasis,
    },
    location: {
      locationName,
      onLocationName: (value: string) => setLocationName(normalizeTextInput(locationName, value)),
      locationAutoFilled: autoFill.locationCity.length > 0,
      locationAddress,
      onLocationAddress: (value: string) =>
        setLocationAddress(normalizeTextInput(locationAddress, value)),
      mapsLink,
      onMapsLink: setMapsLink,
    },
    provides: {
      selected: whatWeProvide,
      category,
      onChange: setWhatWeProvide,
    },
    quickQuestions: {
      category,
      questions: quickQuestions,
      onChange: setQuickQuestions,
    },
    requirements: {
      mustHave,
      onMustHave: (value: string) => setMustHave(normalizeEachLine(mustHave, value)),
      mustCount: mustList.length,
      goodToHave,
      onGoodToHave: (value: string) => setGoodToHave(normalizeEachLine(goodToHave, value)),
      goodCount: goodList.length,
      dressCode,
      onDressCode: (value: string) => setDressCode(normalizeTextInput(dressCode, value)),
    },
    footer: {
      isValid,
      errors,
      onCancel: handleCancel,
      onCreate: handleCreate,
      discardConfirm,
      onDiscardCancel: () => setDiscardConfirm(null),
      onDiscardConfirm: () => {
        setDiscardConfirm(null);
        nav(ROUTE_PATHS.employerShiftHome);
      },
      notice,
      onNoticeDismiss: () => setNotice(null),
      showCreateConfirm,
      createPreview: {
        jobName: jobName.trim(),
        companyName: companyName.trim(),
        workers: Number(vacanciesStr) || 0,
        payPerDay,
        payBasis,
        locationName: locationName.trim(),
        dateRange: dateRangeText,
        category: category.trim(),
        shiftTiming: shiftTiming.trim(),
        requirementsCount: mustList.length,
        goodToHaveCount: goodList.length,
        providedCount: whatWeProvide.length,
        quickQuestionCount: quickQuestions.length,
        duplicateWarnings,
      },
      onCreateConfirm: () => {
        setShowCreateConfirm(false);
        doCreate();
      },
      onCreateCancel: () => setShowCreateConfirm(false),
    },
  };
}
