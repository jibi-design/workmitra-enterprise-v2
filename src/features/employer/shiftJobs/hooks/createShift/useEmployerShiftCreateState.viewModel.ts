import type { NavigateFunction } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";
import { normalizeEachLine, normalizeTextInput } from "../../helpers/shiftCreateInput.helpers";
import type { EmployerShiftPostDraft } from "../../storage/employerShiftDraft.storage";
import type { ShiftCreateWizardStep } from "../../components/ShiftCreateWizardTopBar";
import type { useEmployerShiftCreateFormFields } from "./useEmployerShiftCreateFormFields";
import type { createDraftHandlers } from "./employerShiftCreateDraft.handlers";

type FormFields = ReturnType<typeof useEmployerShiftCreateFormFields>;
type DraftHandlers = ReturnType<typeof createDraftHandlers>;

export function buildEmployerShiftCreateViewModel(input: {
  form: FormFields;
  draftHandlers: DraftHandlers;
  draftId: string | null;
  lastSavedAt: number | null;
  otherDrafts: EmployerShiftPostDraft[];
  wizardStep: ShiftCreateWizardStep;
  stepErrors: string[];
  employerMlId: string;
  tpl: FormFields["tpl"];
  groupPreview: FormFields["groupPreview"];
  discardConfirm: ConfirmData | null;
  showCreateConfirm: boolean;
  notice: NoticeData | null;
  setDiscardConfirm: (value: ConfirmData | null) => void;
  setNotice: (value: NoticeData | null) => void;
  setShowCreateConfirm: (value: boolean) => void;
  handleWizardNext: () => void;
  handleWizardBack: () => void;
  handlePayBasis: (value: FormFields["payBasis"]) => void;
  handleCancel: () => void;
  handleCreate: () => void;
  doCreate: () => Promise<void>;
  nav: NavigateFunction;
}) {
  const {
    form,
    draftHandlers,
    draftId,
    lastSavedAt,
    otherDrafts,
    wizardStep,
    stepErrors,
    employerMlId,
    tpl,
    groupPreview,
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
  } = input;

  const {
    autoFill,
    mustList,
    goodList,
    payPerDay,
    errors,
    isValid,
    dateRangeText,
    duplicateWarnings,
  } = form;

  return {
    wizardStep,
    stepErrors,
    handleWizardNext,
    handleWizardBack,
    isTemplate: Boolean(tpl),
    groupPreview,
    employerMlId,
    draft: {
      draftId,
      lastSavedAt,
      otherDrafts,
      handleSaveDraft: draftHandlers.handleSaveDraft,
      handleDeleteCurrentDraft: draftHandlers.handleDeleteCurrentDraft,
      handleDeleteSavedDraft: draftHandlers.handleDeleteSavedDraft,
      applyDraft: draftHandlers.applyDraft,
    },
    basic: {
      companyName: form.companyName,
      onCompanyName: (value: string) =>
        form.setCompanyName(normalizeTextInput(form.companyName, value)),
      companyAutoFilled: autoFill.companyName.length > 0,
      jobName: form.jobName,
      onJobName: (value: string) => form.setJobName(normalizeTextInput(form.jobName, value)),
      category: form.category,
      onCategory: (value: string) => form.setCategory(normalizeTextInput(form.category, value)),
      categoryAutoFilled: autoFill.industryType.length > 0,
      description: form.description,
      onDescription: (value: string) =>
        form.setDescription(normalizeTextInput(form.description, value)),
    },
    workers: {
      vacanciesStr: form.vacanciesStr,
      onVacancies: form.setVacanciesStr,
      backupSlotsStr: form.backupSlotsStr,
      onBackupSlots: form.setBackupSlotsStr,
      experience: form.experience,
      onExperience: form.setExperience,
      category: form.category,
    },
    schedule: {
      startAt: form.startAt,
      onStartAt: form.setStartAt,
      endAt: form.endAt,
      onEndAt: form.setEndAt,
      shiftTiming: form.shiftTiming,
      onShiftTiming: (value: string) =>
        form.setShiftTiming(normalizeTextInput(form.shiftTiming, value)),
      payPerDayStr: form.payPerDayStr,
      onPayPerDay: form.setPayPerDayStr,
      payBasis: form.payBasis,
      onPayBasis: handlePayBasis,
    },
    location: {
      locationName: form.locationName,
      onLocationName: (value: string) =>
        form.setLocationName(normalizeTextInput(form.locationName, value)),
      locationAutoFilled: autoFill.locationCity.length > 0,
      locationPincode: form.locationPincode,
      onLocationPincode: form.setLocationPincode,
      locationPincodeAutoFilled: autoFill.locationPincode.length > 0,
      locationAddress: form.locationAddress,
      onLocationAddress: (value: string) =>
        form.setLocationAddress(normalizeTextInput(form.locationAddress, value)),
      mapsLink: form.mapsLink,
      onMapsLink: form.setMapsLink,
    },
    provides: {
      selected: form.whatWeProvide,
      category: form.category,
      onChange: form.setWhatWeProvide,
    },
    quickQuestions: {
      category: form.category,
      questions: form.quickQuestions,
      onChange: form.setQuickQuestions,
    },
    requirements: {
      mustHave: form.mustHave,
      onMustHave: (value: string) => form.setMustHave(normalizeEachLine(form.mustHave, value)),
      mustCount: mustList.length,
      goodToHave: form.goodToHave,
      onGoodToHave: (value: string) =>
        form.setGoodToHave(normalizeEachLine(form.goodToHave, value)),
      goodCount: goodList.length,
      dressCode: form.dressCode,
      onDressCode: (value: string) => form.setDressCode(normalizeTextInput(form.dressCode, value)),
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
        jobName: form.jobName.trim(),
        companyName: form.companyName.trim(),
        workers: Number(form.vacanciesStr) || 0,
        payPerDay,
        payBasis: form.payBasis,
        locationName: form.locationName.trim(),
        dateRange: dateRangeText,
        category: form.category.trim(),
        shiftTiming: form.shiftTiming.trim(),
        requirementsCount: mustList.length,
        goodToHaveCount: goodList.length,
        providedCount: form.whatWeProvide.length,
        quickQuestionCount: form.quickQuestions.length,
        duplicateWarnings,
      },
      onCreateConfirm: () => {
        setShowCreateConfirm(false);
        void doCreate();
      },
      onCreateCancel: () => setShowCreateConfirm(false),
    },
  };
}
