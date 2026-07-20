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

const PREMIUM_INTERACTIONS = `
  .wm-premium-widget {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-premium-widget:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 24px 40px -12px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
  .wm-premium-widget:active {
    transform: scale(0.98) !important;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05) !important;
    transition: transform var(--wm-motion-fast) var(--wm-motion-spring), box-shadow var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-stat-box {
    transition: all 0.3s var(--wm-motion-spring);
  }
  .wm-stat-box:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.95) !important;
    border-color: rgba(37, 99, 235, 0.3) !important;
    box-shadow: 0 12px 24px -6px rgba(37,99,235,0.15) !important;
  }
`;

function formatPostedNoticePeriod(days?: number): string {
  if (!days || days <= 0) return "No notice period";
  return `${days} day${days === 1 ? "" : "s"}`;
}

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
    handleShortlist: state.handleShortlist,
  });

  if (!state.post) {
    return (
      <div>
        <div className="wm-pageHead">
          <div className="wm-pageTitle">Post Dashboard</div>
        </div>
        <div
          className="wm-er-card"
          style={{
            marginTop: 16,
            padding: 32,
            borderRadius: 32,
            background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8))",
            border: "1px solid rgba(255, 255, 255, 0.9)",
            boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 18 }}>Post not found.</div>
          <button
            type="button"
            onClick={state.goToCareerHome}
            style={{
              marginTop: 20,
              padding: "12px 20px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
              transition: "all 0.2s ease",
            }}
          >
            ← Back to Career Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40 }}>
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

      <section
        className="wm-premium-widget"
        style={{
          padding: 24,
          borderRadius: 28,
          border: "1px solid rgba(255, 255, 255, 0.9)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8))",
          boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
          backdropFilter: "blur(24px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: "linear-gradient(to bottom, #1d4ed8, rgba(29,78,216,0.1))",
          }}
        />

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "#1e40af",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              padding: "6px 12px",
              background: "rgba(37, 99, 235, 0.08)",
              borderRadius: 12,
              border: "1px solid rgba(37, 99, 235, 0.12)",
            }}
          >
            Employment terms
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          <div
            className="wm-stat-box"
            style={{
              padding: "20px",
              borderRadius: 20,
              background: "rgba(248,250,252,0.6)",
              border: "1px solid rgba(0,0,0,0.04)",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Notice period
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 18,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.2,
              }}
            >
              {formatPostedNoticePeriod(state.post.noticePeriodDays)}
            </div>
            <div style={{ marginTop: 4, fontSize: 11, color: "#64748b", fontWeight: 700 }}>
              Required after resignation
            </div>
          </div>

          <div
            className="wm-stat-box"
            style={{
              padding: "20px",
              borderRadius: 20,
              background: "rgba(248,250,252,0.6)",
              border: "1px solid rgba(0,0,0,0.04)",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Responsibilities
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 18,
                fontWeight: 900,
                color: state.post.responsibilities.length > 0 ? "#0f172a" : "#b45309",
                lineHeight: 1.2,
              }}
            >
              {state.post.responsibilities.length > 0
                ? `${state.post.responsibilities.length} added`
                : "Action needed"}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                color: state.post.responsibilities.length > 0 ? "#64748b" : "#b45309",
                fontWeight: 700,
              }}
            >
              {state.post.responsibilities.length > 0
                ? "Visible to candidates"
                : "Recommended to add"}
            </div>
          </div>
        </div>

        {state.post.responsibilities.length === 0 && (
          <div
            style={{
              marginTop: 14,
              padding: "14px 16px",
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(254,243,199,0.8), rgba(255,251,235,0.9))",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#92400e", lineHeight: 1.5 }}>
              Responsibilities are not added. Add them later if you want applicants to understand
              daily work clearly.
            </div>
          </div>
        )}
      </section>

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
