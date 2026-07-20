// App name: Job Mitra
// File name: EmployeeCareerPostDetailsPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerPostDetailsPage.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { CareerApplicationStatusModals } from "../components/CareerApplicationStatusModals";
import { CareerApplyForm } from "../components/CareerApplyForm";
import { CareerApplyQuickQuestions } from "../components/CareerApplyQuickQuestions";
import {
  AlreadyAppliedBanner,
  CompanyInfoCard,
  DescriptionCard,
  JobDetailsCard,
  RequirementsCard,
  ResponsibilitiesCard,
} from "../components/CareerPostDetailSections";
import { CareerPostDetailHero } from "../components/CareerPostDetailHero";
import {
  getSubmitBlockReason,
  isValidCoverNote,
  isValidOptionalEmail,
  isValidOptionalExpectedSalary,
  isValidOptionalPhone,
} from "../helpers/careerApplicationValidation";
import { getCareerSearchSnapshot, subscribeCareerSearch } from "../helpers/careerSearchHelpers";
import {
  applyToCareerJob,
  getMyApplicationForJob,
  withdrawCareerApplication,
} from "../services/careerApplyService";

const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#64748b";

const PREMIUM_APPLY_STYLES = `
  .wm-apply-widget {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-apply-input {
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
  }
  .wm-apply-input:focus {
    border-color: #2563eb !important;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12) !important;
    background-color: #ffffff !important;
  }
  .wm-apply-btn {
    transition: transform 0.2s var(--wm-motion-spring), box-shadow 0.2s ease, opacity 0.2s ease !important;
  }
  .wm-apply-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 24px -4px rgba(37, 99, 235, 0.2) !important;
  }
  .wm-apply-btn:active:not(:disabled) {
    transform: scale(0.97) !important;
  }
  .wm-notice-btn {
    transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease !important;
  }
  .wm-notice-btn:hover {
    transform: translateY(-1px) !important;
  }
  .wm-notice-btn:active {
    transform: scale(0.96) !important;
  }
`;

export function EmployeeCareerPostDetailsPage() {
  const nav = useNavigate();
  const { postId = "" } = useParams();
  const [now] = useState(() => Date.now());

  const allPosts = useSyncExternalStore(
    subscribeCareerSearch,
    getCareerSearchSnapshot,
    getCareerSearchSnapshot,
  );
  const post = useMemo(
    () => allPosts.find((item) => item.id === postId) ?? null,
    [allPosts, postId],
  );
  const existingApp = useMemo(() => getMyApplicationForJob(postId), [postId]);

  const isApplied = existingApp?.stage !== undefined && existingApp.stage !== "withdrawn";
  const isExpired = Boolean(post && post.closingDate > 0 && post.closingDate < now);

  const [coverNote, setCoverNote] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("Immediate");
  const [employeePhone, setEmployeePhone] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [contactConfirmed, setContactConfirmed] = useState(false);
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, "yes" | "no">>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  const hasContactDetails = employeePhone.trim().length > 0 || employeeEmail.trim().length > 0;
  const screeningQuestions = post?.screeningQuestions ?? [];
  const allScreeningAnswered =
    screeningQuestions.length === 0 ||
    screeningQuestions.every((question) => screeningAnswers[question.id] !== undefined);

  const submitBlockReason = getSubmitBlockReason({
    isApplied,
    isExpired,
    hasCoverNote: coverNote.trim().length > 0,
    coverNoteValid: isValidCoverNote(coverNote),
    allScreeningAnswered,
    screeningQuestionCount: screeningQuestions.length,
    phoneValid: isValidOptionalPhone(employeePhone),
    emailValid: isValidOptionalEmail(employeeEmail),
    expectedSalaryValid: isValidOptionalExpectedSalary(expectedSalary),
    hasContactDetails,
    contactConfirmed,
  });

  const canSubmit = !submitBlockReason;

  function handleApply() {
    if (!post) return;

    if (!canSubmit) {
      setShowError(submitBlockReason || "Please complete the required application steps.");
      return;
    }

    const result = applyToCareerJob({
      jobId: post.id,
      coverNote: coverNote.trim(),
      expectedSalary: Number(expectedSalary) || 0,
      noticePeriod: noticePeriod || "Immediate",
      employeePhone: employeePhone.trim(),
      employeeEmail: employeeEmail.trim(),
      screeningAnswers: screeningQuestions.length > 0 ? screeningAnswers : undefined,
    });

    if (result) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        nav(ROUTE_PATHS.employeeCareerSearch);
      }, 1200);
      return;
    }

    setShowError(
      "This job is no longer accepting applications, or you have already applied to this position.",
    );
  }

  function handleWithdraw() {
    const ok = withdrawCareerApplication(postId);
    setShowWithdrawConfirm(false);

    if (ok) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        nav(ROUTE_PATHS.employeeCareerSearch);
      }, 1200);
      return;
    }

    setShowError("Could not withdraw. Application may already be processed.");
  }

  if (!post) {
    return (
      <div style={{ padding: 16 }}>
        <section
          style={{
            padding: 24,
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.9)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
            boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: CAREER_TEXT }}>Job details</div>
          <div style={{ marginTop: 8, fontSize: 14, color: CAREER_MUTED, fontWeight: 600 }}>
            This career post is no longer available.
          </div>

          <button
            className="wm-outlineBtn wm-apply-btn"
            type="button"
            onClick={() => nav(ROUTE_PATHS.employeeCareerSearch)}
            style={{
              marginTop: 16,
              fontSize: 14,
              fontWeight: 800,
              borderRadius: 14,
              minHeight: 42,
              cursor: "pointer",
            }}
          >
            Back to Search
          </button>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{PREMIUM_APPLY_STYLES}</style>

      <CareerApplicationStatusModals
        successOpen={showSuccess}
        errorMessage={showError}
        withdrawOpen={showWithdrawConfirm}
        jobTitle={post.jobTitle}
        companyName={post.companyName}
        onCloseError={() => setShowError(null)}
        onCloseWithdraw={() => setShowWithdrawConfirm(false)}
        onConfirmWithdraw={handleWithdraw}
      />

      <CareerPostDetailHero
        jobTitle={post.jobTitle}
        companyName={post.companyName}
        department={post.department}
      />

      {isExpired && (
        <div
          style={{
            margin: "0 4px",
            padding: "16px",
            border: "1px solid rgba(220,38,38,0.25)",
            background: "linear-gradient(135deg, rgba(254,242,242,0.95), rgba(255,255,255,0.9))",
            borderRadius: "20px",
            boxShadow: "0 8px 20px rgba(220,38,38,0.03)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900, color: "#dc2626" }}>Applications closed</div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#991b1b",
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            This career post has passed its closing date. New applications are no longer available.
          </div>
        </div>
      )}

      <div style={{ padding: "0 4px", display: "flex", flexDirection: "column", gap: 16 }}>
        <JobDetailsCard post={post} />
        <CompanyInfoCard />
        <DescriptionCard text={post.description} />
        <ResponsibilitiesCard items={post.responsibilities} />
        <RequirementsCard qualifications={post.qualifications} skills={post.skills} />

        {isApplied && <AlreadyAppliedBanner onWithdraw={() => setShowWithdrawConfirm(true)} />}

        {!isApplied && !isExpired && screeningQuestions.length > 0 && (
          <CareerApplyQuickQuestions
            questions={screeningQuestions}
            answers={screeningAnswers}
            onChange={setScreeningAnswers}
          />
        )}

        {!isApplied && !isExpired && (
          <CareerApplyForm
            coverNote={coverNote}
            expectedSalary={expectedSalary}
            noticePeriod={noticePeriod}
            employeePhone={employeePhone}
            employeeEmail={employeeEmail}
            contactConfirmed={contactConfirmed}
            canSubmit={canSubmit}
            submitBlockReason={submitBlockReason}
            onCoverNoteChange={setCoverNote}
            onExpectedSalaryChange={setExpectedSalary}
            onNoticePeriodChange={setNoticePeriod}
            onEmployeePhoneChange={setEmployeePhone}
            onEmployeeEmailChange={setEmployeeEmail}
            onContactConfirmedChange={setContactConfirmed}
          />
        )}
      </div>

      <div
        className="wm-stickySaveBar"
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.8)",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.03)",
        }}
      >
        <div className="wm-stickyInner" style={{ gap: 12, padding: "12px 16px" }}>
          <button
            className="wm-outlineBtn wm-apply-btn"
            type="button"
            onClick={() => nav(ROUTE_PATHS.employeeCareerSearch)}
            style={{ fontWeight: 800, padding: "12px 24px", borderRadius: 16, cursor: "pointer" }}
          >
            Back
          </button>

          {isApplied && (
            <button
              className="wm-outlineBtn wm-apply-btn"
              type="button"
              onClick={() => setShowWithdrawConfirm(true)}
              style={{
                color: "#dc2626",
                borderColor: "rgba(220,38,38,0.3)",
                background: "rgba(254,242,242,0.5)",
                fontWeight: 800,
                padding: "12px 24px",
                borderRadius: 16,
                cursor: "pointer",
              }}
            >
              Withdraw
            </button>
          )}

          {!isApplied && !isExpired && (
            <button
              className="wm-primarybtn wm-apply-btn"
              type="button"
              onClick={handleApply}
              disabled={!canSubmit}
              style={{
                flex: 1,
                padding: "12px 24px",
                borderRadius: 16,
                opacity: canSubmit ? 1 : 0.4,
                fontWeight: 900,
                background: canSubmit ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#cbd5e1",
                color: canSubmit ? "#fff" : "#64748b",
                border: "none",
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit ? "0 8px 20px rgba(37,99,235,0.2)" : "none",
              }}
            >
              Submit Application
            </button>
          )}
        </div>
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}
