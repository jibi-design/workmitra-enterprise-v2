// App name: Job Mitra
// File name: EmployeeCareerPostDetailsPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerPostDetailsPage.tsx

import { CareerApplicationStatusModals } from "../components/CareerApplicationStatusModals";
import { CareerApplyForm } from "../components/CareerApplyForm";
import { CareerApplyQuickQuestions } from "../components/CareerApplyQuickQuestions";
import { CareerPostDetailHero } from "../components/CareerPostDetailHero";
import { CareerPostDetailStickyBar } from "../components/CareerPostDetailStickyBar";
import { CareerPostExpiredBanner } from "../components/CareerPostExpiredBanner";
import {
  AlreadyAppliedBanner,
  CompanyInfoCard,
  DescriptionCard,
  JobDetailsCard,
  RequirementsCard,
  ResponsibilitiesCard,
} from "../components/CareerPostDetailSections";
import { ReportPostingControl } from "../../../moderation/ReportPostingControl";
import { CareerPostUnavailableState } from "../components/CareerPostUnavailableState";
import { PREMIUM_APPLY_STYLES } from "../helpers/careerPostApplyStyles";
import { useEmployeeCareerPostDetailsPage } from "../hooks/useEmployeeCareerPostDetailsPage";

export function EmployeeCareerPostDetailsPage() {
  const page = useEmployeeCareerPostDetailsPage();

  if (!page.post) {
    return <CareerPostUnavailableState onBack={page.goSearch} />;
  }

  return (
    <div className="wm-ee-vCareer wm-stackGrid">
      <style>{PREMIUM_APPLY_STYLES}</style>

      <CareerApplicationStatusModals
        successOpen={page.showSuccess}
        errorMessage={page.showError}
        withdrawOpen={page.showWithdrawConfirm}
        applyOpen={page.showApplyConfirm}
        jobTitle={page.post.jobTitle}
        companyName={page.post.companyName}
        onCloseError={() => page.setShowError(null)}
        onCloseWithdraw={() => page.setShowWithdrawConfirm(false)}
        onConfirmWithdraw={page.handleWithdraw}
        onCloseApply={() => page.setShowApplyConfirm(false)}
        onConfirmApply={page.handleApply}
      />

      <CareerPostDetailHero
        jobTitle={page.post.jobTitle}
        companyName={page.post.companyName}
        department={page.post.department}
      />
      <ReportPostingControl
        domain="career"
        postId={page.post.id}
        title={page.post.jobTitle}
        companyName={page.post.companyName}
        employerId={page.post.employerId}
      />

      {page.isExpired && <CareerPostExpiredBanner />}

      <div style={{ padding: "0 4px", display: "flex", flexDirection: "column", gap: 16 }}>
        <JobDetailsCard post={page.post} />
        <CompanyInfoCard />
        <DescriptionCard text={page.post.description} />
        <ResponsibilitiesCard items={page.post.responsibilities} />
        <RequirementsCard qualifications={page.post.qualifications} skills={page.post.skills} />

        {page.isApplied && (
          <AlreadyAppliedBanner
            canWithdraw={page.canWithdraw}
            withdrawOnlineBlocked={page.withdrawOnlineBlocked}
            onWithdraw={page.requestWithdraw}
          />
        )}

        {!page.isApplied && !page.isExpired && page.screeningQuestions.length > 0 && (
          <CareerApplyQuickQuestions
            questions={page.screeningQuestions}
            answers={page.screeningAnswers}
            onChange={page.setScreeningAnswers}
          />
        )}

        {!page.isApplied && !page.isExpired && (
          <CareerApplyForm
            coverNote={page.coverNote}
            expectedSalary={page.expectedSalary}
            noticePeriod={page.noticePeriod}
            employeePhone={page.employeePhone}
            employeeEmail={page.employeeEmail}
            contactConfirmed={page.contactConfirmed}
            canSubmit={page.canSubmit}
            submitBlockReason={page.submitBlockReason}
            onCoverNoteChange={page.setCoverNote}
            onExpectedSalaryChange={page.setExpectedSalary}
            onNoticePeriodChange={page.setNoticePeriod}
            onEmployeePhoneChange={page.setEmployeePhone}
            onEmployeeEmailChange={page.setEmployeeEmail}
            onContactConfirmedChange={page.setContactConfirmed}
          />
        )}
      </div>

      <CareerPostDetailStickyBar
        isApplied={page.isApplied}
        canWithdraw={page.canWithdraw}
        withdrawOnlineBlocked={page.withdrawOnlineBlocked}
        isExpired={page.isExpired}
        canSubmit={page.canSubmit}
        isSubmitting={page.isSubmitting}
        onBack={page.goSearch}
        onWithdraw={page.requestWithdraw}
        onApply={page.requestApply}
      />

      <div style={{ height: 80 }} />
    </div>
  );
}
