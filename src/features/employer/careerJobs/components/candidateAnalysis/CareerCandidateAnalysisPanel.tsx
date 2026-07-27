// App name: Job Mitra
// Facade — CareerCandidateAnalysisPanel.tsx

import { CareerAnalysisBucket } from "./CareerAnalysisBucket";
import { CareerAnalysisNumberControl } from "./CareerAnalysisNumberControl";
import type { CandidateAnalysisResult } from "./careerCandidateAnalysis.types";
import { CAREER_ANALYSIS_BLUE_DEEP, CAREER_ANALYSIS_MUTED } from "./careerAnalysisTheme";
import { AnalysisClosedCard } from "./CareerCandidateAnalysisClosedCard";
import { ANALYSIS_INTERACTIONS, getFinalizeLabel } from "./CareerCandidateAnalysisPanel.helpers";
import {
  AnalysisHeader,
  AnalysisLockedNotice,
  ManualReviewWarning,
} from "./CareerCandidateAnalysisPanel.parts";

type CareerCandidateAnalysisPanelProps = {
  appsCount: number;
  analysisOpen: boolean;
  analysisDone: boolean;
  analysisLocked: boolean;
  shortlistTarget: number;
  backupTarget: number;
  maxBackup: number;
  analysis: CandidateAnalysisResult;
  selectedShortlistIds: Set<string>;
  onOpen: () => void;
  onClose: () => void;
  onResetAnalysis: () => void;
  onShortlistTargetChange: (value: number) => void;
  onBackupTargetChange: (value: number) => void;
  onRunAnalysis: () => void;
  onToggleSelected: (appId: string) => void;
  onReviewApplication: (appId: string) => void;
  onMoveSelected: () => void;
};

export function CareerCandidateAnalysisPanel({
  appsCount,
  analysisOpen,
  analysisDone,
  analysisLocked,
  shortlistTarget,
  backupTarget,
  maxBackup,
  analysis,
  selectedShortlistIds,
  onOpen,
  onClose,
  onResetAnalysis,
  onShortlistTargetChange,
  onBackupTargetChange,
  onRunAnalysis,
  onToggleSelected,
  onReviewApplication,
  onMoveSelected,
}: CareerCandidateAnalysisPanelProps) {
  const canRunAnalysis = !analysisLocked && (shortlistTarget > 0 || backupTarget > 0);
  const backupCount = analysisDone ? analysis.backup.length : 0;
  const canFinalizeAnalysis = !analysisLocked && (selectedShortlistIds.size > 0 || backupCount > 0);

  if (!analysisOpen) {
    return (
      <AnalysisClosedCard
        appsCount={appsCount}
        analysisLocked={analysisLocked}
        onOpen={onOpen}
        onResetAnalysis={onResetAnalysis}
      />
    );
  }

  return (
    <div
      className="wm-analysis-widget"
      style={{
        padding: 24,
        borderRadius: "var(--wm-radius-employer-card)",
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
        boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(24px)",
      }}
    >
      <style>{ANALYSIS_INTERACTIONS}</style>

      <AnalysisHeader onClose={onClose} />
      <ManualReviewWarning />

      {analysisLocked && <AnalysisLockedNotice />}

      <div
        style={{
          marginTop: "var(--wm-space-20)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--wm-space-12)",
        }}
      >
        <CareerAnalysisNumberControl
          label="Shortlist suggestions"
          value={shortlistTarget}
          min={0}
          max={appsCount}
          helper={`Allowed: 0-${appsCount}`}
          onChange={onShortlistTargetChange}
        />

        <CareerAnalysisNumberControl
          label="Backup candidates"
          value={backupTarget}
          min={0}
          max={maxBackup}
          helper={`Allowed: 0-${maxBackup}`}
          onChange={onBackupTargetChange}
        />
      </div>

      {!canRunAnalysis && !analysisLocked && (
        <div
          style={{
            marginTop: "var(--wm-stack-gap)",
            padding: "12px 14px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(248,250,252,0.8)",
            border: "1px solid rgba(0,0,0,0.06)",
            color: CAREER_ANALYSIS_MUTED,
            fontSize: 12,
            fontWeight: 800,
            lineHeight: 1.5,
          }}
        >
          Set a shortlist or backup count to run local analysis.
        </div>
      )}

      <button
        type="button"
        onClick={onRunAnalysis}
        disabled={!canRunAnalysis}
        className="wm-analysis-btn"
        style={{
          marginTop: "var(--wm-stack-gap)",
          width: "100%",
          minHeight: 46,
          borderRadius: "var(--wm-radius-chip)",
          border: canRunAnalysis ? "none" : "1px solid rgba(0,0,0,0.08)",
          background: canRunAnalysis
            ? "linear-gradient(135deg, rgba(239,246,255,0.9), rgba(255,255,255,0.9))"
            : "rgba(241,245,249,0.9)",
          color: canRunAnalysis ? CAREER_ANALYSIS_BLUE_DEEP : CAREER_ANALYSIS_MUTED,
          fontSize: 13,
          fontWeight: 900,
          cursor: canRunAnalysis ? "pointer" : "not-allowed",
          boxShadow: canRunAnalysis ? "0 4px 12px rgba(37,99,235,0.1)" : "none",
        }}
      >
        {analysisLocked ? "Analysis Completed" : "Run Local Analysis"}
      </button>

      {analysisDone && !analysisLocked && (
        <div
          style={{ marginTop: "var(--wm-space-20)", display: "grid", gap: "var(--wm-space-12)" }}
        >
          {analysis.shortlist.length > 0 && (
            <CareerAnalysisBucket
              title={`${analysis.shortlist.length} suggested for shortlist`}
              tone="strong"
              candidates={analysis.shortlist}
              selectedShortlistIds={selectedShortlistIds}
              selectable
              onToggleSelected={onToggleSelected}
              onReviewApplication={onReviewApplication}
            />
          )}

          {analysis.backup.length > 0 && (
            <CareerAnalysisBucket
              title={`${analysis.backup.length} backup candidate${analysis.backup.length === 1 ? "" : "s"}`}
              tone="backup"
              candidates={analysis.backup}
              selectedShortlistIds={selectedShortlistIds}
              onToggleSelected={onToggleSelected}
              onReviewApplication={onReviewApplication}
            />
          )}

          {analysis.remaining.length > 0 && (
            <CareerAnalysisBucket
              title={`${analysis.remaining.length} remaining candidate${analysis.remaining.length === 1 ? "" : "s"}`}
              tone="neutral"
              candidates={analysis.remaining.slice(0, 4)}
              selectedShortlistIds={selectedShortlistIds}
              onToggleSelected={onToggleSelected}
              onReviewApplication={onReviewApplication}
            />
          )}

          <button
            type="button"
            onClick={onMoveSelected}
            disabled={!canFinalizeAnalysis}
            className="wm-analysis-btn"
            style={{
              marginTop: "var(--wm-space-8)",
              minHeight: 48,
              borderRadius: "var(--wm-radius-chip)",
              border: canFinalizeAnalysis ? "none" : "1px solid rgba(0,0,0,0.08)",
              background: canFinalizeAnalysis
                ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                : "rgba(241,245,249,0.9)",
              color: canFinalizeAnalysis ? "#fff" : CAREER_ANALYSIS_MUTED,
              fontSize: 14,
              fontWeight: 900,
              cursor: canFinalizeAnalysis ? "pointer" : "not-allowed",
              boxShadow: canFinalizeAnalysis ? "0 8px 24px rgba(37,99,235,0.25)" : "none",
            }}
          >
            {getFinalizeLabel(selectedShortlistIds.size, backupCount)}
          </button>
        </div>
      )}
    </div>
  );
}
