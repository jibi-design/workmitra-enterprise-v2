// App name: Job Mitra
// File name: useEmployerCareerCreatePage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\hooks\useEmployerCareerCreatePage.ts

import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
import { useUnsavedChangesGuard } from "../../../../shared/hooks/useUnsavedChangesGuard";
import {
  goEmployerCareerCreateBack,
  goEmployerCareerCreateNext,
  handleEmployerCareerCreateCancel,
  handleEmployerCareerCreatePublishIntent,
} from "./employerCareerCreatePage.navigation";
import type { ScreeningQuestion } from "../components/CareerCreateScreeningSection";
import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepInterviewData } from "../components/CareerCreateStepInterview";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";
import {
  clampInt,
  DEFAULT_INTERVIEW_ROUNDS,
  normalizeTagInput,
  tomorrow30d,
} from "../helpers/careerCreateFormHelpers";
import { findDuplicateCareerWarnings } from "../helpers/careerCreateHelpers";
import { getCareerPostsSnapshot } from "../helpers/careerDashboardHelpers";
import {
  formatNoticePeriodForConfirm,
  getEmployerProfileDefaults,
  normalizeStep,
} from "../helpers/employerCareerCreatePage.helpers";
import { publishEmployerCareerPost } from "./employerCareerCreatePage.publish";
import {
  clearEmployerCareerCreateDraft,
  createFreshBasicState,
  createFreshInterviewState,
  createFreshRequirementsState,
  saveEmployerCareerCreateDraft,
} from "./employerCareerCreatePage.draft";
import {
  getStep1Errors,
  getStep2Errors,
  getStep3Errors,
} from "./employerCareerCreatePage.validation";
import { careerCreateDraftStorage } from "../storage/careerCreateDraft.storage";

export function useEmployerCareerCreatePage() {
  const nav = useNavigate();
  const employerDefaults = useMemo(() => getEmployerProfileDefaults(), []);
  const savedDraft = useMemo(() => careerCreateDraftStorage.get(), []);

  const [hasLoadedDraft, setHasLoadedDraft] = useState(() => Boolean(savedDraft));
  const [step, setStep] = useState(() => normalizeStep(savedDraft?.step ?? 1));

  const [basic, setBasic] = useState<StepBasicData>(() => ({
    companyName: savedDraft?.basic.companyName ?? employerDefaults.companyName,
    jobTitle: savedDraft?.basic.jobTitle ?? "",
    department: savedDraft?.basic.department ?? "",
    jobType: savedDraft?.basic.jobType ?? "full-time",
    workMode: savedDraft?.basic.workMode ?? "on-site",
    location: savedDraft?.basic.location ?? employerDefaults.location,
    vacancies: savedDraft?.basic.vacancies ?? "",
    probationPeriod: savedDraft?.basic.probationPeriod ?? "none",
  }));

  const [req, setReq] = useState<StepRequirementsData>(() => ({
    salaryMin: savedDraft?.req.salaryMin ?? "",
    salaryMax: savedDraft?.req.salaryMax ?? "",
    salaryPeriod: savedDraft?.req.salaryPeriod ?? "monthly",
    experienceMin: savedDraft?.req.experienceMin ?? "",
    experienceMax: savedDraft?.req.experienceMax ?? "",
    noticePeriodDays: savedDraft?.req.noticePeriodDays ?? "30",
    noticePeriodCustomDays: savedDraft?.req.noticePeriodCustomDays ?? "",
    qualifications: savedDraft?.req.qualifications ?? "",
    skills: savedDraft?.req.skills ?? "",
    description: savedDraft?.req.description ?? "",
    responsibilities: savedDraft?.req.responsibilities ?? "",
    closingDate: savedDraft?.req.closingDate ?? tomorrow30d(),
  }));

  const [interview, setInterview] = useState<StepInterviewData>(() => ({
    roundConfigs: savedDraft?.interview.roundConfigs ?? [...DEFAULT_INTERVIEW_ROUNDS],
  }));

  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>(
    () => savedDraft?.screeningQuestions ?? [],
  );

  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [publishPreviewOpen, setPublishPreviewOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(
    savedDraft
      ? { title: "Draft Loaded", message: "Your saved Career Job draft has been restored." }
      : null,
  );

  const updateBasic = useCallback((update: Partial<StepBasicData>) => {
    setBasic((previous) => ({ ...previous, ...update }));
  }, []);

  const updateReq = useCallback((update: Partial<StepRequirementsData>) => {
    setReq((previous) => ({ ...previous, ...update }));
  }, []);

  const updateInterview = useCallback((update: Partial<StepInterviewData>) => {
    setInterview((previous) => ({ ...previous, ...update }));
  }, []);

  const step1Errors = useMemo(() => getStep1Errors(basic), [basic]);
  const step2Errors = useMemo(() => getStep2Errors(req), [req]);
  const step3Errors = useMemo(() => getStep3Errors(interview), [interview]);

  const currentErrors = step === 1 ? step1Errors : step === 2 ? step2Errors : step3Errors;
  const isCurrentValid = currentErrors.length === 0;
  const isAllValid =
    step1Errors.length === 0 && step2Errors.length === 0 && step3Errors.length === 0;

  const isDirty = useCallback((): boolean => {
    return (
      basic.companyName.trim().length > 0 ||
      basic.jobTitle.trim().length > 0 ||
      basic.location.trim().length > 0 ||
      req.description.trim().length > 0 ||
      req.salaryMin.trim().length > 0 ||
      req.skills.trim().length > 0 ||
      screeningQuestions.length > 0
    );
  }, [basic, req, screeningQuestions]);

  useUnsavedChangesGuard(isDirty(), "You have unsaved Career Job changes. Leave this page?");

  function resetToFreshPost() {
    clearEmployerCareerCreateDraft();
    setHasLoadedDraft(false);
    setStep(1);
    setBasic(createFreshBasicState(employerDefaults));
    setReq(createFreshRequirementsState());
    setInterview(createFreshInterviewState());
    setScreeningQuestions([]);
    setNotice({ title: "Draft Cleared", message: "You can now create a fresh Career Job." });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveDraft(showNotice = true) {
    saveEmployerCareerCreateDraft({
      step,
      basic,
      req,
      interview,
      screeningQuestions,
      showNotice,
      setHasLoadedDraft,
      setNotice,
    });
  }

  function goNext() {
    goEmployerCareerCreateNext({
      isCurrentValid,
      currentErrors,
      step,
      setStep,
      setNotice,
    });
  }

  function goBack() {
    goEmployerCareerCreateBack({ step, setStep });
  }

  function discardDraftAndResetMemory(): void {
    clearEmployerCareerCreateDraft();
    setHasLoadedDraft(false);
    setStep(1);
    setBasic(createFreshBasicState(employerDefaults));
    setReq(createFreshRequirementsState());
    setInterview(createFreshInterviewState());
    setScreeningQuestions([]);
  }

  function handleCancel() {
    handleEmployerCareerCreateCancel({
      isDirty,
      nav,
      discardDraft: discardDraftAndResetMemory,
      setConfirmData,
      setConfirmAction,
    });
  }

  const publishDuplicateWarnings = useMemo(
    () =>
      findDuplicateCareerWarnings(getCareerPostsSnapshot(), {
        jobTitle: basic.jobTitle,
        companyName: basic.companyName,
        department: basic.department,
        jobType: basic.jobType,
        workMode: basic.workMode,
        location: basic.location,
      }),
    [
      basic.jobTitle,
      basic.companyName,
      basic.department,
      basic.jobType,
      basic.workMode,
      basic.location,
    ],
  );

  const publishPreviewValues = useMemo(() => {
    const salaryMin = clampInt(Number(req.salaryMin) || 0, 0, 999_999_999);
    const salaryMax = clampInt(Number(req.salaryMax) || salaryMin, salaryMin, 999_999_999);

    return {
      salaryMin,
      salaryMax,
      noticePeriodText: formatNoticePeriodForConfirm(req),
      skillsCount: normalizeTagInput(req.skills, 20).length,
      qualificationsCount: normalizeTagInput(req.qualifications, 15).length,
      responsibilitiesCount: normalizeTagInput(req.responsibilities, 15).length,
      screeningQuestionCount: screeningQuestions.length,
    };
  }, [req, screeningQuestions]);

  function handleCreate() {
    handleEmployerCareerCreatePublishIntent({
      isAllValid,
      step1Errors,
      step2Errors,
      step3Errors,
      setNotice,
      setPublishPreviewOpen,
    });
  }

  function doCreate() {
    void publishEmployerCareerPost({
      basic,
      req,
      interview,
      screeningQuestions,
      nav,
      setNotice,
    });
  }

  function clearConfirm() {
    setConfirmData(null);
    setConfirmAction(null);
  }

  function confirmLeave() {
    setConfirmData(null);
    if (confirmAction) confirmAction();
    setConfirmAction(null);
  }

  function closePublishPreview() {
    setPublishPreviewOpen(false);
  }

  function confirmPublish() {
    setPublishPreviewOpen(false);
    doCreate();
  }

  return {
    step,
    setStep,
    basic,
    req,
    interview,
    screeningQuestions,
    setScreeningQuestions,
    hasLoadedDraft,
    confirmData,
    publishPreviewOpen,
    notice,
    setNotice,
    updateBasic,
    updateReq,
    updateInterview,
    currentErrors,
    isCurrentValid,
    isAllValid,
    publishDuplicateWarnings,
    publishPreviewValues,
    resetToFreshPost,
    saveDraft,
    goNext,
    goBack,
    handleCancel,
    handleCreate,
    clearConfirm,
    confirmLeave,
    closePublishPreview,
    confirmPublish,
  };
}
