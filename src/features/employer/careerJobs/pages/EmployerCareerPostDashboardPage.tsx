// App name: Job Mitra
// File name: EmployerCareerPostDashboardPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\pages\EmployerCareerPostDashboardPage.tsx

import { useMemo } from "react";
import { CareerCandidateAnalysisPanel } from "../components/candidateAnalysis/CareerCandidateAnalysisPanel";
import { CareerPipelineTabs } from "../components/CareerPipelineTabs";
import { CareerPostActivityLog } from "../components/CareerPostActivityLog";
import { CareerPostCandidateList } from "../components/CareerPostCandidateList";
import { CareerPostDashboardHeader } from "../components/CareerPostDashboardHeader";
import { EmployerCareerPostDashboardModals } from "../components/EmployerCareerPostDashboardModals";
import { CareerPostPipelineOverview } from "../components/CareerPostPipelineOverview";
import { useCareerDashboardAnalysisState } from "../hooks/careerPostDashboard/useCareerDashboardAnalysisState";
import { PulseTargetIndicator } from "../../../pulse/PulseTargetIndicator";
import { useEmployerCareerPostDashboardState } from "../hooks/useEmployerCareerPostDashboardState";
import { EmploymentTermsSection, PostNotFoundView } from "./EmployerCareerPostDashboardPage.parts";
import { PREMIUM_INTERACTIONS } from "./EmployerCareerPostDashboardPage.styles";

export function EmployerCareerPostDashboardPage() {
  const state = useEmployerCareerPostDashboardState();
  const appliedApps = useMemo(() => state.tabApps.applied ?? [], [state.tabApps.applied]);

  const analysisState = useCareerDashboardAnalysisState({
    post: state.post,
    appliedApps,
    tab: state.tab,
    tabCounts: state.tabCounts,
    tabApps: state.tabApps,
    setTab: state.setTab,
    handleBulkShortlist: state.handleBulkShortlist,
  });

  if (!state.post) {
    return <PostNotFoundView onBack={state.goToCareerHome} />;
  }

  return (
    <div className="wm-er-vCareer wm-stackGrid" style={{ paddingBottom: 40 }}>
      <style>{PREMIUM_INTERACTIONS}</style>
      <EmployerCareerPostDashboardModals state={state} />

      <CareerPostDashboardHeader
        post={state.post}
        onAllPosts={state.goToCareerHome}
        onPause={state.handlePause}
        onResume={state.handleResume}
        onClose={state.handleClose}
        onRepost={state.handleRepost}
      />

      <EmploymentTermsSection post={state.post} />

      <div style={{ position: "relative" }}>
        <PulseTargetIndicator notificationId="APPLICATION_RECEIVED" postId={state.post.id} />
        <CareerPostPipelineOverview
          post={state.post}
          closingText={state.postClosingText}
          tabCounts={analysisState.visibleCounts}
        />
      </div>

      {analysisState.appliedCount > 0 && (
        <CareerCandidateAnalysisPanel
          appsCount={analysisState.appliedCount}
          analysisOpen={analysisState.analysisOpen}
          analysisDone={analysisState.analysisDone}
          analysisLocked={analysisState.analysisLocked}
          shortlistTarget={analysisState.safeShortlistTarget}
          backupTarget={analysisState.safeBackupTarget}
          maxBackup={analysisState.safeMaxBackup}
          analysis={analysisState.analysis}
          selectedShortlistIds={analysisState.selectedShortlistIds}
          onOpen={analysisState.openAnalysis}
          onClose={analysisState.resetAnalysisPanel}
          onResetAnalysis={analysisState.resetAnalysisAndBackup}
          onShortlistTargetChange={analysisState.updateShortlistTarget}
          onBackupTargetChange={analysisState.updateBackupTarget}
          onRunAnalysis={analysisState.runAnalysis}
          onToggleSelected={analysisState.toggleSelected}
          onReviewApplication={analysisState.reviewApplication}
          onMoveSelected={analysisState.moveSelectedToShortlist}
        />
      )}

      <div>
        <CareerPipelineTabs
          activeTab={state.tab}
          counts={analysisState.visibleCounts}
          onTabChange={state.setTab}
        />
      </div>

      <CareerPostCandidateList
        apps={analysisState.visibleApps}
        post={state.post}
        tab={state.tab}
        isBusy={state.isBusy}
        compareMode={state.compareMode}
        compareIds={state.compareIds}
        backupSuggestionIds={analysisState.backupSuggestionIds}
        onStartCompare={state.startCompareMode}
        onCancelCompare={state.cancelCompareMode}
        onToggleCompare={state.toggleCompare}
        onOpenCompare={state.openCompare}
        onShortlist={state.handleShortlist}
        onRemoveFromShortlist={state.handleRemoveFromShortlist}
        onReject={state.handleRejectOpen}
        onBulkReject={state.handleBulkRejectOpen}
        onScheduleInterview={state.handleScheduleOpen}
        onRecordResult={state.handleResultOpen}
        onSendOffer={state.handleSendOfferOpen}
        onHire={state.handleHire}
        onEditNotes={state.handleNotesOpen}
      />

      <CareerPostActivityLog
        open={state.showLog}
        activity={state.activity}
        onToggleOpen={() => state.setShowLog((current) => !current)}
      />
    </div>
  );
}
