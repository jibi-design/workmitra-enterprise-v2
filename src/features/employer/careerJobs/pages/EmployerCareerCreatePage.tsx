// App name: Job Mitra
// File name: EmployerCareerCreatePage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\pages\EmployerCareerCreatePage.tsx

import { useMemo } from "react";

import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { NoticeModal } from "../../../../shared/components/NoticeModal";
import { AntiFraudNotice } from "../../../../shared/employerProfile/AntiFraudNotice";
import { getCurrentEmployerMlId } from "../../company/helpers/employerPublicIdentity";
import {
  CareerCreateActions,
  CareerCreateProgressBar,
  CareerCreateValidationErrors,
} from "../components/CareerCreatePageControls";
import { EmployerCareerCreateHeader } from "../components/careerCreate/EmployerCareerCreateHeader";
import { EmployerCareerCreateStepBody } from "../components/careerCreate/EmployerCareerCreateStepBody";
import { CareerCreateConfirmModal } from "../components/CareerCreateConfirmModal";
import { useEmployerCareerCreatePage } from "../hooks/useEmployerCareerCreatePage";

export function EmployerCareerCreatePage() {
  const employerMlId = useMemo(() => getCurrentEmployerMlId(), []);
  const page = useEmployerCareerCreatePage();

  return (
    <div className="wm-er-vCareer wm-stackGrid" style={{ position: "relative", paddingBottom: 40 }}>
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
      <AntiFraudNotice mlId={employerMlId} />
      <CareerCreateProgressBar step={page.step} onGoToStep={page.setStep} />

      {page.hasLoadedDraft && (
        <section
          style={{
            marginTop: 16,
            padding: "14px 16px",
            borderRadius: "var(--wm-radius-chip)",
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
            onClick={page.resetToFreshPost}
            style={{
              minHeight: 40,
              borderRadius: "var(--wm-radius-button)",
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
        step={page.step}
        basic={page.basic}
        req={page.req}
        interview={page.interview}
        screeningQuestions={page.screeningQuestions}
        onBasicChange={page.updateBasic}
        onReqChange={page.updateReq}
        onInterviewChange={page.updateInterview}
        onScreeningQuestionsChange={page.setScreeningQuestions}
        onPublish={page.handleCreate}
        onBack={page.goBack}
        onSaveDraft={page.saveDraft}
        onCancel={page.handleCancel}
      />

      <CareerCreateValidationErrors errors={page.currentErrors} />
      <CareerCreateActions
        step={page.step}
        isCurrentValid={page.isCurrentValid}
        isAllValid={page.isAllValid}
        onBack={page.goBack}
        onNext={page.goNext}
        onCancel={page.handleCancel}
        onCreate={page.handleCreate}
        onSaveDraft={page.saveDraft}
      />
      <NoticeModal notice={page.notice} onClose={() => page.setNotice(null)} />
      <ConfirmModal
        confirm={page.confirmData}
        onCancel={page.clearConfirm}
        onConfirm={page.confirmLeave}
      />
      <CareerCreateConfirmModal
        open={page.publishPreviewOpen}
        jobTitle={page.basic.jobTitle}
        companyName={page.basic.companyName}
        department={page.basic.department}
        jobType={page.basic.jobType}
        workMode={page.basic.workMode}
        location={page.basic.location}
        vacancies={Number(page.basic.vacancies) || 0}
        salaryMin={page.publishPreviewValues.salaryMin}
        salaryMax={page.publishPreviewValues.salaryMax}
        salaryPeriod={page.req.salaryPeriod}
        noticePeriodText={page.publishPreviewValues.noticePeriodText}
        interviewRounds={page.interview.roundConfigs.length}
        skillsCount={page.publishPreviewValues.skillsCount}
        qualificationsCount={page.publishPreviewValues.qualificationsCount}
        responsibilitiesCount={page.publishPreviewValues.responsibilitiesCount}
        screeningQuestionCount={page.publishPreviewValues.screeningQuestionCount}
        duplicateWarnings={page.publishDuplicateWarnings}
        onCancel={page.closePublishPreview}
        onConfirm={page.confirmPublish}
      />
    </div>
  );
}
