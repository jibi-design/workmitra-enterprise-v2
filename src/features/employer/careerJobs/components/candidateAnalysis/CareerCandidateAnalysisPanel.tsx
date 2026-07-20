// App name: Job Mitra
// File name: CareerCandidateAnalysisPanel.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateAnalysis\CareerCandidateAnalysisPanel.tsx

import { CareerAnalysisBucket } from "./CareerAnalysisBucket";
import { CareerAnalysisNumberControl } from "./CareerAnalysisNumberControl";
import type { CandidateAnalysisResult } from "./careerCandidateAnalysis.types";
import {
  CAREER_ANALYSIS_BLUE_DEEP,
  CAREER_ANALYSIS_MUTED,
  CAREER_ANALYSIS_TEXT,
  CAREER_ANALYSIS_WARNING,
} from "./careerAnalysisTheme";

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

const ANALYSIS_INTERACTIONS = `
  .wm-analysis-widget {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-analysis-widget:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
  .wm-analysis-btn {
    transition: transform 0.2s var(--wm-motion-spring), box-shadow 0.2s ease !important;
  }
  .wm-analysis-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
  }
  .wm-analysis-btn:active:not(:disabled) {
    transform: scale(0.97) !important;
  }
  .wm-close-btn {
    transition: background-color 0.2s ease, transform 0.2s ease;
  }
  .wm-close-btn:hover {
    background-color: rgba(15, 23, 42, 0.08);
  }
  .wm-close-btn:active {
    transform: scale(0.9);
  }
`;

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
        borderRadius: 24,
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

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
            marginTop: 16,
            padding: "12px 14px",
            borderRadius: 16,
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
          marginTop: 16,
          width: "100%",
          minHeight: 46,
          borderRadius: 16,
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
        <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
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
              marginTop: 8,
              minHeight: 48,
              borderRadius: 16,
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

function AnalysisClosedCard({
  appsCount,
  analysisLocked,
  onOpen,
  onResetAnalysis,
}: {
  appsCount: number;
  analysisLocked: boolean;
  onOpen: () => void;
  onResetAnalysis: () => void;
}) {
  if (analysisLocked) {
    return (
      <div
        className="wm-analysis-widget"
        style={{
          padding: 24,
          borderRadius: 24,
          border: "1px solid rgba(255, 255, 255, 0.9)",
          background: "linear-gradient(135deg, rgba(254,243,199,0.6), rgba(255,255,255,0.9))",
          boxShadow: "0 12px 32px -4px rgba(217,119,6,0.05), inset 0 1px 0 rgba(255,255,255,1)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 900, color: CAREER_ANALYSIS_WARNING }}>
          Analysis suggestions saved
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: 700,
            color: CAREER_ANALYSIS_MUTED,
            lineHeight: 1.5,
          }}
        >
          Backup suggestions are saved for this post. Clear suggestions only if you want to run
          analysis again for the remaining Applied candidates.
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(217,119,6,0.15)",
            color: CAREER_ANALYSIS_WARNING,
            fontSize: 12,
            fontWeight: 800,
            lineHeight: 1.5,
          }}
        >
          Clear suggestions will remove backup markers. Already shortlisted candidates will stay in
          Shortlist.
        </div>

        <button
          type="button"
          onClick={onResetAnalysis}
          className="wm-analysis-btn"
          style={{
            marginTop: 16,
            width: "100%",
            minHeight: 46,
            borderRadius: 16,
            border: "1px solid rgba(217,119,6,0.2)",
            background: "rgba(255,251,235,0.9)",
            color: CAREER_ANALYSIS_WARNING,
            fontSize: 13,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(217,119,6,0.05)",
          }}
        >
          Clear Suggestions
        </button>
      </div>
    );
  }

  return (
    <div
      className="wm-analysis-widget"
      style={{
        padding: 24,
        borderRadius: 24,
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(239,246,255,0.8), rgba(255,255,255,0.95))",
        boxShadow: "0 12px 32px -4px rgba(37,99,235,0.05), inset 0 1px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 900, color: CAREER_ANALYSIS_TEXT }}>
        Analyze candidates before shortlist
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 700,
          color: CAREER_ANALYSIS_MUTED,
          lineHeight: 1.5,
        }}
      >
        {appsCount} candidate{appsCount === 1 ? "" : "s"} applied. Set shortlist and backup counts,
        then run local analysis before manually confirming who should move to Shortlist.
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="wm-analysis-btn"
        style={{
          marginTop: 16,
          width: "100%",
          minHeight: 46,
          borderRadius: 16,
          border: "none",
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(37,99,235,0.25)",
        }}
      >
        Analyze Candidates
      </button>
    </div>
  );
}

function AnalysisHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 900, color: CAREER_ANALYSIS_TEXT }}>
          Local candidate analysis
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            fontWeight: 700,
            color: CAREER_ANALYSIS_MUTED,
            lineHeight: 1.5,
          }}
        >
          This only suggests candidates based on local profile, screening answers, salary and notice
          period.
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="wm-close-btn"
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 16,
          border: "none",
          background: "rgba(15, 23, 42, 0.04)",
          color: CAREER_ANALYSIS_MUTED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        aria-label="Hide Analysis"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

function AnalysisLockedNotice() {
  return (
    <div
      style={{
        marginTop: 16,
        padding: "12px 14px",
        borderRadius: 16,
        background: "rgba(255,251,235,0.9)",
        border: "1px solid rgba(217,119,6,0.2)",
        color: CAREER_ANALYSIS_WARNING,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.5,
      }}
    >
      Analysis suggestions are saved. Clear suggestions before running analysis again. Backup
      candidates may appear again in a future analysis if they remain Applied.
    </div>
  );
}

function ManualReviewWarning() {
  return (
    <div
      style={{
        marginTop: 16,
        padding: "12px 14px",
        borderRadius: 16,
        background: "rgba(254,242,242,0.8)",
        border: "1px solid rgba(220,38,38,0.2)",
        color: "#dc2626",
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.5,
      }}
    >
      Manual review required. Read each candidate profile, cover note and screening answers before
      confirming the shortlist. This is not an automatic hiring decision.
    </div>
  );
}

function getFinalizeLabel(shortlistCount: number, backupCount: number): string {
  if (shortlistCount > 0 && backupCount > 0) {
    return `Move ${shortlistCount} to Shortlist · Keep ${backupCount} as Backup`;
  }

  if (shortlistCount > 0) {
    return `Move ${shortlistCount} to Shortlist`;
  }

  if (backupCount > 0) {
    return `Keep ${backupCount} as Backup`;
  }

  return "No candidates selected";
}
