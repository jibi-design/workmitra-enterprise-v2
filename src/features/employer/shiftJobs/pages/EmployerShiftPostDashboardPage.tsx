// App name: Job Mitra | EmployerShiftPostDashboardPage.tsx — stackGrid (Wave 3)

import { CompareApplicantsModal } from "../../../../shared/components/CompareApplicantsModal";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { NoticeModal } from "../../../../shared/components/NoticeModal";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { useNavigate } from "react-router-dom";
import { EmployerShiftActivityLog } from "../components/EmployerShiftActivityLog";
import { EmployerShiftAutomationPanel } from "../components/EmployerShiftAutomationPanel";
import { EmployerShiftCandidateList } from "../components/EmployerShiftCandidateList";
import { EmployerShiftDashboardHeader } from "../components/EmployerShiftDashboardHeader";
import { EmployerShiftDashboardHints } from "../components/EmployerShiftDashboardHints";
import { EmployerShiftRatingBlockOverlay } from "../components/EmployerShiftRatingBlockOverlay";
import { ReplaceCandidateReasonModal } from "../components/ReplaceCandidateReasonModal";
import {
  AnalysisBar,
  DashboardTabs,
  VacancyProgress,
} from "../components/ShiftDashboardComponents";
import { ShiftEditModal } from "../components/ShiftEditModal";
import { ShiftRatingSection } from "../components/ShiftRatingSection";
import { useEmployerShiftPostDashboardState } from "../hooks/useEmployerShiftPostDashboardState";

export function EmployerShiftPostDashboardPage() {
  const state = useEmployerShiftPostDashboardState();
  const nav = useNavigate();

  if (!state.post) {
    return (
      <div
        className="wm-er-vShift wm-stackGrid"
        data-testid="employer-shift-dashboard-missing"
        style={{ gap: "var(--wm-stack-gap)" }}
      >
        <DomainHero
          variant="shift"
          audience="employer"
          title="Post Dashboard"
          subtitle="Post not found"
          description="This shift post may have been removed or the link is outdated."
        />
        <EnterpriseEmpty
          domain="shift"
          title="Post not available"
          subtitle="Return to My Posts to continue managing open shifts."
          primaryLabel="My Posts"
          onPrimary={() => nav(ROUTE_PATHS.employerShiftPosts)}
          testId="employer-shift-dashboard-empty"
        />
      </div>
    );
  }

  return (
    <div
      className="wm-er-vShift wm-stackGrid"
      data-testid="employer-shift-dashboard-page"
      style={{ gap: "var(--wm-stack-gap)", paddingBottom: 32 }}
    >
      {state.showRatingBlock ? (
        <EmployerShiftRatingBlockOverlay
          post={state.post}
          confirmedApps={state.selectedApps}
          onDone={state.handleShiftClosed}
        />
      ) : null}

      <NoticeModal notice={state.notice} onClose={() => state.setNotice(null)} />

      <ConfirmModal
        confirm={state.confirmData}
        onConfirm={state.handleConfirmModalConfirm}
        onCancel={state.closeConfirm}
      />

      <ReplaceCandidateReasonModal
        open={state.replaceCandidateId !== null}
        candidateName={state.replaceCandidateName}
        isBusy={state.isBusy}
        onCancel={state.closeReplaceCandidateModal}
        onConfirm={state.handleConfirmReplaceCandidate}
      />

      <EmployerShiftDashboardHeader
        post={state.post}
        hasApplications={state.hasApplications}
        onEdit={() => state.setShowEdit(true)}
        onDelete={state.handleDelete}
        onClosePost={state.handleClosePost}
        onNavigate={state.goToAllPosts}
      />

      <VacancyProgress
        confirmedCount={state.selectedApps.length}
        vacancies={state.post.vacancies}
        appliedCount={state.appliedApps.length}
        shortlistCount={state.shortlistApps.length}
        backupCount={state.backupApps.length}
        backupSlots={state.backupSlots}
      />

      {state.showRatingSection ? (
        <ShiftRatingSection
          post={state.post}
          confirmedApps={state.selectedApps}
          onShiftClosed={state.handleShiftClosed}
        />
      ) : null}

      <AnalysisBar
        alreadyAnalyzed={state.alreadyAnalyzed}
        canAnalyze={state.canAnalyze}
        isBusy={state.isBusy}
        appliedCount={state.appliedApps.length}
        analyzedAt={state.post.analyzedAt}
        onAnalyze={state.handleAnalyze}
        onReset={state.handleReset}
      />

      <DashboardTabs activeTab={state.tab} counts={state.tabCounts} onChange={state.setTab} />

      <EmployerShiftDashboardHints
        tab={state.tab}
        appliedCount={state.appliedApps.length}
        shortlistedCount={state.shortlistApps.length}
        backupCount={state.backupApps.length}
        selectedCount={state.selectedApps.length}
        remainingVacancies={Math.max(0, state.post.vacancies - state.selectedApps.length)}
        alreadyAnalyzed={state.alreadyAnalyzed}
        onGoToApplied={() => state.setTab("applied")}
        onGoToShortlisted={() => state.setTab("shortlisted")}
        onGoToBackup={() => state.setTab("backup")}
        onGoToSelected={() => state.setTab("selected")}
      />

      <EmployerShiftCandidateList
        postId={state.post.id}
        useSmartGroups={state.useSmartGroups}
        appliedApps={state.appliedApps}
        tabApps={state.tabApps}
        tab={state.tab}
        priorityTags={state.priorityTags}
        quickQuestions={state.post.quickQuestions ?? []}
        compareIds={state.compareIds}
        onToggleCompare={state.toggleCompare}
        onOpenCompare={() => state.setCompareOpen(true)}
        onPriorityTag={state.handlePriorityTag}
        cardActions={state.cardActions}
        onRequestTabChange={state.setTab}
        laterPipeline={{
          shortlisted: state.shortlistApps.length,
          backup: state.backupApps.length,
          selected: state.selectedApps.length,
        }}
      />

      <EmployerShiftAutomationPanel
        open={state.showAdvanced}
        settings={state.settings}
        backupCount={state.backupApps.length}
        onToggleOpen={() => state.setShowAdvanced((current) => !current)}
        onToggleSetting={state.handleToggleSetting}
      />

      {state.showEdit ? (
        <ShiftEditModal
          post={state.post}
          onSave={state.handleSaveEdit}
          onClose={() => state.setShowEdit(false)}
        />
      ) : null}

      <CompareApplicantsModal
        isOpen={state.compareOpen}
        applicants={state.compareApplicants}
        onClose={() => state.setCompareOpen(false)}
      />

      <EmployerShiftActivityLog
        open={state.showLog}
        activity={state.activity}
        onToggleOpen={() => state.setShowLog((current) => !current)}
      />
    </div>
  );
}
