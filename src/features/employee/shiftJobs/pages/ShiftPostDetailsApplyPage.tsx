// App name: Job Mitra
// File name: ShiftPostDetailsApplyPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\pages\ShiftPostDetailsApplyPage.tsx

import { useParams } from "react-router-dom";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { ShiftDirectInviteAcceptCard } from "../components/ShiftDirectInviteAcceptCard";
import { ShiftDirectInviteSafetyModals } from "../components/ShiftDirectInviteSafetyModals";
import { ShiftApplyJobCard } from "../components/ShiftApplyJobCard";
import { ShiftApplyQuickQuestions } from "../components/ShiftApplyQuickQuestions";
import { ShiftApplyRequirements } from "../components/ShiftApplyRequirements";
import { ShiftPostApplyStatusCards } from "../components/ShiftPostApplyStatusCards";
import { ShiftPostNotFound } from "../components/ShiftPostNotFound";
import { ShiftPostSubmitSection } from "../components/ShiftPostSubmitSection";
import {
  AlreadyAppliedSection,
  CompanyInfoSection,
  DressCodeSection,
  JobPublicDetailsSection,
  ShiftToast,
  WhatWeProvideSection,
} from "../components/ShiftPostDetailSections";
import { getDirectInviteDateLabelForPost } from "../helpers/shiftDirectInvite.helpers";
import { useEmployeeDirectInvitePendingFlow } from "../hooks/useEmployeeDirectInvitePendingFlow";
import { useShiftPostApplyState } from "../hooks/useShiftPostApplyState";
import { PAGE_STYLE, ShiftPostDetailsApplyHero, getSafeEntityText } from "./shiftPostDetailsApply";
import { getEmployerShiftPosts } from "../../../shared/shift/shiftEmployerPublic";
import { PlannerProjectContextBanner } from "../../planner/components/PlannerProjectContextBanner";

export function ShiftPostDetailsApplyPage() {
  const { postId = "" } = useParams();
  const directInviteFlow = useEmployeeDirectInvitePendingFlow();

  const {
    post,
    requirements,
    mustAns,
    goodAns,
    notes,
    quickAnswers,
    withdrawConfirm,
    toast,
    mustTotal,
    mustMetCount,
    mustGateOk,
    allQuestionsAnswered,
    quickQuestions,
    isApplied,
    isShortlisted,
    isWaiting,
    isConfirmed,
    attendanceConfirmedAt,
    activeWorkspaceId,
    shouldBlockReapply,
    isClosedOrExpired,
    canSubmit,
    submitBlockReason,
    isSubmitting,
    cardStatus,
    isSavedShift,
    setQuickAnswers,
    handleAnswer,
    handleNote,
    submit,
    handleToggleSaved,
    requestWithdraw,
    requestConfirmAttendance,
    handleCancelConfirm,
    handleConfirm,
    openWorkspace,
    openSearch,
  } = useShiftPostApplyState(postId);

  const pendingInvite = directInviteFlow.getPendingInviteForPost(postId);
  const showDirectInviteCard = Boolean(pendingInvite) && !isConfirmed && !isClosedOrExpired;

  if (!post) {
    return <ShiftPostNotFound onFindShifts={openSearch} />;
  }

  const employerName = getSafeEntityText(post.companyName, "Employer not specified");
  const locationName = getSafeEntityText(post.locationName, "Location not specified");
  const shiftDateLabel = pendingInvite?.shiftDateLabel ?? getDirectInviteDateLabelForPost(post);
  const toastMessage = directInviteFlow.toast || toast;
  const plannerPost = getEmployerShiftPosts().find((p) => p.id === postId);
  const plannerPlanId =
    plannerPost?.source === "planner" && plannerPost.planId ? plannerPost.planId : undefined;

  return (
    <div
      className="wm-ee-vShift wm-stackGrid"
      data-testid="shift-post-details-page"
      style={PAGE_STYLE}
    >
      <ShiftPostDetailsApplyHero employerName={employerName} locationName={locationName} />

      {plannerPlanId ? (
        <PlannerProjectContextBanner
          planId={plannerPlanId}
          planSlotDate={plannerPost?.planSlotDate}
          variant="shift"
        />
      ) : null}

      {showDirectInviteCard && pendingInvite ? (
        <ShiftDirectInviteAcceptCard
          companyName={pendingInvite.companyName}
          jobName={pendingInvite.jobName}
          shiftDateLabel={shiftDateLabel}
          onDecline={() => directInviteFlow.openDeclineModal(pendingInvite)}
          onAccept={() => directInviteFlow.openAcceptModal(pendingInvite)}
        />
      ) : null}

      <ShiftApplyJobCard post={post} status={cardStatus} />

      <JobPublicDetailsSection post={post} />

      <CompanyInfoSection companyName={post.companyName} />

      <WhatWeProvideSection items={Array.isArray(post.whatWeProvide) ? post.whatWeProvide : []} />

      <DressCodeSection dressCode={post.dressCode} />

      {quickQuestions.length > 0 && (
        <ShiftApplyQuickQuestions
          questions={quickQuestions}
          answers={quickAnswers}
          onChange={setQuickAnswers}
        />
      )}

      {(isApplied || isShortlisted || isWaiting) && (
        <AlreadyAppliedSection
          status={isShortlisted ? "shortlisted" : isWaiting ? "waiting" : "applied"}
          onWithdraw={requestWithdraw}
        />
      )}

      <ShiftPostApplyStatusCards
        isShortlisted={isShortlisted}
        isWaiting={isWaiting}
        isConfirmed={isConfirmed}
        hasWorkspace={activeWorkspaceId !== null}
        attendanceConfirmedAt={attendanceConfirmedAt}
        onConfirmAttendance={requestConfirmAttendance}
        onOpenWorkspace={openWorkspace}
      />

      <ShiftApplyRequirements
        mustHave={requirements.mustHave}
        goodToHave={requirements.goodToHave}
        mustAns={mustAns}
        goodAns={goodAns}
        notes={notes}
        mustGateOk={mustGateOk}
        mustMetCount={mustMetCount}
        mustTotal={mustTotal}
        onAnswer={handleAnswer}
        onNote={handleNote}
      />

      <ShiftPostSubmitSection
        show={!shouldBlockReapply}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        isClosedOrExpired={isClosedOrExpired}
        allQuestionsAnswered={allQuestionsAnswered}
        quickQuestionCount={quickQuestions.length}
        submitBlockReason={submitBlockReason}
        isSaved={isSavedShift}
        onToggleSaved={handleToggleSaved}
        onSubmit={submit}
      />

      <ShiftToast message={toastMessage} />

      <ShiftDirectInviteSafetyModals
        modal={directInviteFlow.modal}
        isBusy={directInviteFlow.isBusy}
        onCancel={directInviteFlow.closeModal}
        onConfirm={directInviteFlow.confirmModalAction}
      />

      <ConfirmModal
        confirm={withdrawConfirm}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
