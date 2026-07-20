// App name: Job Mitra
// File name: EmployerCareerCreatePage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\pages\EmployerCareerCreatePage.tsx

import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { AntiFraudNotice } from "../../../../shared/employerProfile/AntiFraudNotice";
import { getCurrentEmployerJmId } from "../../company/helpers/employerPublicIdentity";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { canPublishJobPosts } from "../../company/helpers/employerVerificationPolicy.helpers";
import {
  CareerCreateActions,
  CareerCreateProgressBar,
  CareerCreateValidationErrors,
} from "../components/CareerCreatePageControls";
import type { ScreeningQuestion } from "../components/CareerCreateScreeningSection";
import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepInterviewData } from "../components/CareerCreateStepInterview";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";
import { EmployerCareerCreateHeader } from "../components/careerCreate/EmployerCareerCreateHeader";
import { EmployerCareerCreateStepBody } from "../components/careerCreate/EmployerCareerCreateStepBody";
import { CareerCreateConfirmModal } from "../components/CareerCreateConfirmModal";
import {
  clampInt,
  DEFAULT_INTERVIEW_ROUNDS,
  normalizeTagInput,
  tomorrow30d,
} from "../helpers/careerCreateFormHelpers";
import { findDuplicateCareerWarnings } from "../helpers/careerCreateHelpers";
import { getCareerPostsSnapshot } from "../helpers/careerDashboardHelpers";
import { createCareerPost } from "../services/careerPostService";
import { careerCreateDraftStorage } from "../storage/careerCreateDraft.storage";

function getEmployerProfileDefaults(): Pick<StepBasicData, "companyName" | "location"> {
  const profile = employerSettingsStorage.get();

  const companyName = profile.companyName.trim();
  const location = [profile.locationCity.trim(), profile.locationState.trim()]
    .filter(Boolean)
    .join(", ");

  return { companyName, location };
}

function formatNoticePeriodForConfirm(req: StepRequirementsData): string {
  const days =
    req.noticePeriodDays === "custom"
      ? clampInt(Number(req.noticePeriodCustomDays) || 0, 0, 365)
      : clampInt(Number(req.noticePeriodDays) || 0, 0, 365);

  if (days <= 0) return "No notice period";
  return `${days} day${days === 1 ? "" : "s"}`;
}

function normalizeStep(value: number): number {
  if (value < 1) return 1;
  if (value > 4) return 4;
  return value;
}
const CREATE_PAGE_VALIDATION_STARTED_AT = Date.now();

export function EmployerCareerCreatePage() {
  const nav = useNavigate();
  const employerJmId = useMemo(() => getCurrentEmployerJmId(), []);
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
    // ── FIXED: Default vacancies is now empty string so user must type it ──
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

  // --- VALIDATION UPDATED ---
  const step1Errors = useMemo(() => {
    const errors: string[] = [];
    if (basic.companyName.trim().length < 2)
      errors.push("Company name is required (min 2 characters).");
    if (basic.jobTitle.trim().length < 2) errors.push("Job title is required (min 2 characters).");

    const vacancyCount = Number(basic.vacancies);

    if (!basic.vacancies.trim() || !Number.isInteger(vacancyCount) || vacancyCount < 1) {
      errors.push("Please specify at least 1 vacancy.");
    } else if (vacancyCount > 500) {
      errors.push("Vacancies cannot be more than 500 for one Career Job post.");
    }

    if (basic.workMode !== "remote" && basic.location.trim().length < 2) {
      errors.push("Work City is required for on-site/hybrid roles.");
    }
    return errors;
  }, [basic]);

  const step2Errors = useMemo(() => {
    const errors: string[] = [];

    const salaryMinText = req.salaryMin.trim();
    const salaryMaxText = req.salaryMax.trim();
    const salaryMinRaw = Number(salaryMinText);
    const salaryMaxRaw = Number(salaryMaxText);
    const minSalary = salaryMinText ? salaryMinRaw : 0;
    const maxSalary = salaryMaxText ? salaryMaxRaw : 0;

    if (salaryMinText && !Number.isFinite(salaryMinRaw)) {
      errors.push("Minimum salary must be a valid number.");
    }

    if (salaryMaxText && !Number.isFinite(salaryMaxRaw)) {
      errors.push("Maximum salary must be a valid number.");
    }

    if (Number.isFinite(minSalary) && minSalary < 0) {
      errors.push("Minimum salary cannot be negative.");
    }

    if (Number.isFinite(maxSalary) && maxSalary < 0) {
      errors.push("Maximum salary cannot be negative.");
    }

    if (
      Number.isFinite(minSalary) &&
      Number.isFinite(maxSalary) &&
      maxSalary > 0 &&
      maxSalary < minSalary
    ) {
      errors.push("Maximum salary cannot be less than minimum salary.");
    }

    const experienceMinText = req.experienceMin.trim();
    const experienceMaxText = req.experienceMax.trim();
    const experienceMinRaw = Number(experienceMinText);
    const experienceMaxRaw = Number(experienceMaxText);
    const minExperience = experienceMinText ? experienceMinRaw : 0;
    const maxExperience = experienceMaxText ? experienceMaxRaw : 0;

    if (
      experienceMinText &&
      (!Number.isFinite(experienceMinRaw) || experienceMinRaw < 0 || experienceMinRaw > 50)
    ) {
      errors.push("Minimum experience must be between 0 and 50 years.");
    }

    if (
      experienceMaxText &&
      (!Number.isFinite(experienceMaxRaw) || experienceMaxRaw < 0 || experienceMaxRaw > 50)
    ) {
      errors.push("Maximum experience must be between 0 and 50 years.");
    }

    if (
      Number.isFinite(minExperience) &&
      Number.isFinite(maxExperience) &&
      maxExperience > 0 &&
      maxExperience < minExperience
    ) {
      errors.push("Maximum experience cannot be less than minimum experience.");
    }

    if (req.noticePeriodDays === "custom") {
      const customNoticeText = req.noticePeriodCustomDays.trim();
      const customNoticeDays = Number(customNoticeText);

      if (!customNoticeText) {
        errors.push("Custom notice period is required.");
      } else if (
        !Number.isInteger(customNoticeDays) ||
        customNoticeDays < 0 ||
        customNoticeDays > 365
      ) {
        errors.push("Custom notice period must be between 0 and 365 days.");
      }
    }

    if (!Number.isFinite(req.closingDate) || req.closingDate <= CREATE_PAGE_VALIDATION_STARTED_AT) {
      errors.push("Closing date must be a future date.");
    }

    return errors;
  }, [req]);

  const step3Errors = useMemo(() => {
    const errors: string[] = [];
    if (interview.roundConfigs.length === 0) errors.push("At least 1 interview round is required.");
    for (const round of interview.roundConfigs) {
      if (!round.label.trim()) errors.push(`Round ${round.round} needs a name.`);
    }
    return errors;
  }, [interview]);

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

  function resetToFreshPost() {
    careerCreateDraftStorage.clear();
    setHasLoadedDraft(false);
    setStep(1);
    setBasic({
      companyName: employerDefaults.companyName,
      jobTitle: "",
      department: "",
      jobType: "full-time",
      workMode: "on-site",
      location: employerDefaults.location,
      vacancies: "", // FIXED
      probationPeriod: "none",
    });
    setReq({
      salaryMin: "",
      salaryMax: "",
      salaryPeriod: "monthly",
      experienceMin: "",
      experienceMax: "",
      noticePeriodDays: "30",
      noticePeriodCustomDays: "",
      qualifications: "",
      skills: "",
      description: "",
      responsibilities: "",
      closingDate: tomorrow30d(),
    });
    setInterview({ roundConfigs: [...DEFAULT_INTERVIEW_ROUNDS] });
    setScreeningQuestions([]);
    setNotice({ title: "Draft Cleared", message: "You can now create a fresh Career Job." });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveDraft(showNotice = true) {
    careerCreateDraftStorage.save({ step, basic, req, interview, screeningQuestions });
    setHasLoadedDraft(true);
    if (showNotice) setNotice({ title: "Draft Saved", message: "Your Career Job draft is saved." });
  }

  function goNext() {
    if (!isCurrentValid) {
      setNotice({ title: "Please Fix Errors", message: currentErrors.join("\n"), tone: "warn" });
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleCancel() {
    if (isDirty()) {
      setConfirmData({
        title: "Save draft before leaving?",
        message: "Save this as a draft to continue later, or leave without saving.",
        warning: "Leaving without saving will lose the current form changes.",
        tone: "warn",
        confirmLabel: "Save Draft",
        cancelLabel: "Leave",
      });
      setConfirmAction(() => () => {
        saveDraft(false);
        nav(ROUTE_PATHS.employerCareerHome);
      });
      return;
    }
    nav(ROUTE_PATHS.employerCareerHome);
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
    if (!isAllValid) {
      setNotice({
        title: "Cannot Publish Job",
        message: [...step1Errors, ...step2Errors, ...step3Errors].join("\n"),
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

    setPublishPreviewOpen(true);
  }

  function doCreate() {
    const salaryMin = clampInt(Number(req.salaryMin) || 0, 0, 999_999_999);
    const salaryMax = clampInt(Number(req.salaryMax) || salaryMin, salaryMin, 999_999_999);
    const noticePeriodDays =
      req.noticePeriodDays === "custom"
        ? clampInt(Number(req.noticePeriodCustomDays) || 0, 0, 365)
        : clampInt(Number(req.noticePeriodDays) || 0, 0, 365);

    const postId = createCareerPost({
      employerId: "employer_demo",
      companyName: basic.companyName.trim(),
      jobTitle: basic.jobTitle.trim(),
      department: basic.department.trim(),
      jobType: basic.jobType,
      workMode: basic.workMode,
      location: basic.workMode === "remote" ? "Remote / Anywhere" : basic.location.trim(),
      vacancies: Number(basic.vacancies),
      probationPeriod: basic.probationPeriod,
      salaryMin,
      salaryMax,
      salaryPeriod: req.salaryPeriod,
      noticePeriodDays,
      experienceMin: clampInt(Number(req.experienceMin) || 0, 0, 50),
      experienceMax: clampInt(Number(req.experienceMax) || 0, 0, 50),
      qualifications: normalizeTagInput(req.qualifications, 15),
      skills: normalizeTagInput(req.skills, 20),
      description: req.description.trim(),
      responsibilities: normalizeTagInput(req.responsibilities, 15),
      interviewRounds: interview.roundConfigs.length,
      roundConfigs: interview.roundConfigs,
      status: "active",
      closingDate: req.closingDate,
      isTemplate: false,
      screeningQuestions: screeningQuestions.length > 0 ? screeningQuestions : undefined,
    });

    if (!postId) {
      setNotice({
        title: "Cannot Publish Job",
        message:
          "Some job details are invalid or unsafe. Please review the job details and try again.",
        tone: "warn",
      });
      return;
    }

    careerCreateDraftStorage.clear();
    nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId));
  }

  return (
    <div className="wm-er-vCareer" style={{ position: "relative", paddingBottom: 40 }}>
      {/* ULTRA-PREMIUM AMBIENT BACKGROUND GLOW */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "70%",
            height: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.08) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "-20%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.05) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <EmployerCareerCreateHeader />
      <AntiFraudNotice jmId={employerJmId} />
      <CareerCreateProgressBar step={step} onGoToStep={setStep} />

      {hasLoadedDraft && (
        <section
          style={{
            marginTop: 16,
            padding: "14px 16px",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.9)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.7))",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: "#1e3a8a" }}>Saved draft loaded</div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--wm-er-muted, #64748b)",
              lineHeight: 1.45,
            }}
          >
            Continue this saved Career Job draft, or clear it to start a fresh post.
          </div>
          <button
            type="button"
            onClick={resetToFreshPost}
            style={{
              minHeight: 40,
              borderRadius: 12,
              border: "1px solid rgba(220,38,38,0.2)",
              background: "rgba(254,242,242,0.9)",
              color: "var(--wm-error, #dc2626)",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Clear Draft & Start Fresh
          </button>
        </section>
      )}

      <EmployerCareerCreateStepBody
        step={step}
        basic={basic}
        req={req}
        interview={interview}
        screeningQuestions={screeningQuestions}
        onBasicChange={updateBasic}
        onReqChange={updateReq}
        onInterviewChange={updateInterview}
        onScreeningQuestionsChange={setScreeningQuestions}
        onPublish={handleCreate}
        onBack={goBack}
        onSaveDraft={saveDraft}
        onCancel={handleCancel}
      />

      <CareerCreateValidationErrors errors={currentErrors} />
      <CareerCreateActions
        step={step}
        isCurrentValid={isCurrentValid}
        isAllValid={isAllValid}
        onBack={goBack}
        onNext={goNext}
        onCancel={handleCancel}
        onCreate={handleCreate}
        onSaveDraft={saveDraft}
      />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      <ConfirmModal
        confirm={confirmData}
        onCancel={() => {
          setConfirmData(null);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          setConfirmData(null);
          if (confirmAction) confirmAction();
          setConfirmAction(null);
        }}
      />
      <CareerCreateConfirmModal
        open={publishPreviewOpen}
        jobTitle={basic.jobTitle}
        companyName={basic.companyName}
        department={basic.department}
        jobType={basic.jobType}
        workMode={basic.workMode}
        location={basic.location}
        vacancies={Number(basic.vacancies) || 0}
        salaryMin={publishPreviewValues.salaryMin}
        salaryMax={publishPreviewValues.salaryMax}
        salaryPeriod={req.salaryPeriod}
        noticePeriodText={publishPreviewValues.noticePeriodText}
        interviewRounds={interview.roundConfigs.length}
        skillsCount={publishPreviewValues.skillsCount}
        qualificationsCount={publishPreviewValues.qualificationsCount}
        responsibilitiesCount={publishPreviewValues.responsibilitiesCount}
        screeningQuestionCount={publishPreviewValues.screeningQuestionCount}
        duplicateWarnings={publishDuplicateWarnings}
        onCancel={() => setPublishPreviewOpen(false)}
        onConfirm={() => {
          setPublishPreviewOpen(false);
          doCreate();
        }}
      />
    </div>
  );
}
