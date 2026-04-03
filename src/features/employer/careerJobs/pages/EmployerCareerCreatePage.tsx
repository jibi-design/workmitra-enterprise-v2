// src/features/employer/careerJobs/pages/EmployerCareerCreatePage.tsx
//
// Career Job Create — 3-step wizard. Helpers + controls extracted.

import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { AntiFraudNotice } from "../../../../shared/employerProfile/AntiFraudNotice";


import { createCareerPost } from "../services/careerPostService";
import { clampInt, normalizeTagInput, tomorrow30d, DEFAULT_INTERVIEW_ROUNDS } from "../helpers/careerCreateFormHelpers";
import { CareerCreateProgressBar, CareerCreateValidationErrors, CareerCreateActions } from "../components/CareerCreatePageControls";
import { CareerCreateStepBasic, type StepBasicData } from "../components/CareerCreateStepBasic";
import { CareerCreateScreeningSection, type ScreeningQuestion } from "../components/CareerCreateScreeningSection";
import { CareerCreateStepRequirements, type StepRequirementsData } from "../components/CareerCreateStepRequirements";
import { CareerCreateStepInterview, type StepInterviewData } from "../components/CareerCreateStepInterview";

export function EmployerCareerCreatePage() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);

  /* ── State ── */
  const [basic, setBasic] = useState<StepBasicData>({
    companyName: (() => { try { const p = JSON.parse(localStorage.getItem("wm_employer_settings_v1") ?? "{}"); return typeof p.companyName === "string" ? p.companyName : ""; } catch { return ""; } })(),
    jobTitle: "", department: "", jobType: "full-time", workMode: "on-site", location: "",
  });
  const [req, setReq] = useState<StepRequirementsData>({
    salaryMin: "", salaryMax: "", salaryPeriod: "monthly",
    experienceMin: "", experienceMax: "",
    qualifications: "", skills: "", description: "", responsibilities: "",
    closingDate: tomorrow30d(),
  });
  const [interview, setInterview] = useState<StepInterviewData>({ roundConfigs: [...DEFAULT_INTERVIEW_ROUNDS] });
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([]);
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  /* ── Updaters ── */
  const updateBasic = useCallback((u: Partial<StepBasicData>) => setBasic((p) => ({ ...p, ...u })), []);
  const updateReq = useCallback((u: Partial<StepRequirementsData>) => setReq((p) => ({ ...p, ...u })), []);
  const updateInterview = useCallback((u: Partial<StepInterviewData>) => setInterview((p) => ({ ...p, ...u })), []);

  /* ── Validation ── */
  const step1Errors = useMemo(() => {
    const e: string[] = [];
    if (basic.companyName.trim().length < 2) e.push("Company name is required (min 2 characters).");
    if (basic.jobTitle.trim().length < 2) e.push("Job title is required (min 2 characters).");
    if (basic.location.trim().length < 2) e.push("Location is required.");
    return e;
  }, [basic]);
  const step2Errors = useMemo(() => {
    const e: string[] = [];
    const minS = Number(req.salaryMin) || 0;
    const maxS = Number(req.salaryMax) || 0;
    if (minS <= 0) e.push("Minimum salary must be greater than 0.");
    if (maxS > 0 && maxS < minS) e.push("Maximum salary cannot be less than minimum.");
    return e;
  }, [req]);
  const step3Errors = useMemo(() => {
    const e: string[] = [];
    if (interview.roundConfigs.length === 0) e.push("At least 1 interview round is required.");
    for (const r of interview.roundConfigs) { if (!r.label.trim()) e.push(`Round ${r.round} needs a name.`); }
    return e;
  }, [interview]);
  const currentErrors = step === 1 ? step1Errors : step === 2 ? step2Errors : step3Errors;
  const isCurrentValid = currentErrors.length === 0;
  const isAllValid = step1Errors.length === 0 && step2Errors.length === 0 && step3Errors.length === 0;

  /* ── Handlers ── */
  const isDirty = useCallback((): boolean => {
    return basic.companyName.trim().length > 0 || basic.jobTitle.trim().length > 0 || basic.location.trim().length > 0 || req.description.trim().length > 0 || req.salaryMin.trim().length > 0 || req.skills.trim().length > 0;
  }, [basic, req]);

  function goNext() {
    if (!isCurrentValid) { setNotice({ title: "Please Fix Errors", message: currentErrors.join("\n"), tone: "warn" }); return; }
    if (step < 3) { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }
  function goBack() { if (step > 1) { setStep(step - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }
  function handleCancel() {
    if (isDirty()) {
      setConfirmData({ title: "Discard changes?", message: "You have unsaved data. If you leave now, all entered information will be lost.", tone: "warn", confirmLabel: "Discard & Leave", cancelLabel: "Stay" });
      setConfirmAction(() => () => nav(ROUTE_PATHS.employerCareerHome));
    } else { nav(ROUTE_PATHS.employerCareerHome); }
  }
  function handleCreate() {
    if (!isAllValid) { setNotice({ title: "Cannot Create Post", message: [...step1Errors, ...step2Errors, ...step3Errors].join("\n"), tone: "warn" }); return; }
    const salMin = clampInt(Number(req.salaryMin) || 0, 0, 999_999_999);
    const salMax = clampInt(Number(req.salaryMax) || salMin, salMin, 999_999_999);
    setConfirmData({ title: "Create this career post?", message: `${basic.jobTitle.trim()} at ${basic.companyName.trim()}. Salary: ${salMin} - ${salMax} / ${req.salaryPeriod}. ${interview.roundConfigs.length} interview round(s).`, tone: "neutral", confirmLabel: "Create Post", cancelLabel: "Review Again" });
    setConfirmAction(() => doCreate);
  }
  function doCreate() {
    const salMin = clampInt(Number(req.salaryMin) || 0, 0, 999_999_999);
    const salMax = clampInt(Number(req.salaryMax) || salMin, salMin, 999_999_999);
    const postId = createCareerPost({
      employerId: "employer_demo", companyName: basic.companyName.trim(), jobTitle: basic.jobTitle.trim(),
      department: basic.department.trim(), jobType: basic.jobType, workMode: basic.workMode, location: basic.location.trim(),
      salaryMin: salMin, salaryMax: salMax, salaryPeriod: req.salaryPeriod,
      experienceMin: clampInt(Number(req.experienceMin) || 0, 0, 50),
      experienceMax: clampInt(Number(req.experienceMax) || 0, 0, 50),
      qualifications: normalizeTagInput(req.qualifications, 15), skills: normalizeTagInput(req.skills, 20),
      description: req.description.trim(), responsibilities: normalizeTagInput(req.responsibilities, 15),
      interviewRounds: interview.roundConfigs.length, roundConfigs: interview.roundConfigs,
      status: "active", closingDate: req.closingDate, isTemplate: false,
      screeningQuestions: screeningQuestions.length > 0 ? screeningQuestions : undefined,
    });
    nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId));
  }

  return (
    <div className="wm-er-vCareer">
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Create career post</div>
          <div className="wm-pageSub">Post a permanent position. Applicants will find and apply.</div>
        </div>
      </div>
      <AntiFraudNotice />
      <CareerCreateProgressBar step={step} onGoToStep={setStep} />
      <div style={{ marginTop: 12 }}>
        {step === 1 && <CareerCreateStepBasic data={basic} onChange={updateBasic} />}
        {step === 2 && (
          <>
            <CareerCreateStepRequirements data={req} onChange={updateReq} />
            <CareerCreateScreeningSection jobType={basic.jobType} questions={screeningQuestions} onChange={setScreeningQuestions} />
          </>
        )}
        {step === 3 && <CareerCreateStepInterview data={interview} onChange={updateInterview} basicData={basic} reqData={req} />}
      </div>
      <CareerCreateValidationErrors errors={currentErrors} />
      <CareerCreateActions step={step} isCurrentValid={isCurrentValid} isAllValid={isAllValid} onBack={goBack} onNext={goNext} onCancel={handleCancel} onCreate={handleCreate} />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      <ConfirmModal confirm={confirmData} onCancel={() => { setConfirmData(null); setConfirmAction(null); }} onConfirm={() => { setConfirmData(null); if (confirmAction) confirmAction(); setConfirmAction(null); }} />
    </div>
  );
}