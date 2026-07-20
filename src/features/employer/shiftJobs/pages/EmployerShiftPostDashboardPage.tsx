// App name: Job Mitra
// File name: EmployerShiftPostDashboardPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\pages\EmployerShiftPostDashboardPage.tsx

import { CompareApplicantsModal } from "../../../../shared/components/CompareApplicantsModal";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { NoticeModal } from "../../../../shared/components/NoticeModal";
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

  if (!state.post) {
    return (
      <div>
        <div className="wm-pageHead">
          <div className="wm-pageTitle">Post Dashboard</div>
        </div>
        <div className="wm-er-card" style={{ marginTop: 12, padding: 16 }}>
          <div style={{ fontWeight: 700 }}>Post not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {state.showRatingBlock && (
        <EmployerShiftRatingBlockOverlay
          post={state.post}
          confirmedApps={state.selectedApps}
          onDone={state.handleShiftClosed}
        />
      )}

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

      {state.showRatingSection && (
        <ShiftRatingSection
          post={state.post}
          confirmedApps={state.selectedApps}
          onShiftClosed={state.handleShiftClosed}
        />
      )}

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
      />

      <EmployerShiftAutomationPanel
        open={state.showAdvanced}
        settings={state.settings}
        backupCount={state.backupApps.length}
        onToggleOpen={() => state.setShowAdvanced((current) => !current)}
        onToggleSetting={state.handleToggleSetting}
      />

      {state.showEdit && (
        <ShiftEditModal
          post={state.post}
          onSave={state.handleSaveEdit}
          onClose={() => state.setShowEdit(false)}
        />
      )}

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
