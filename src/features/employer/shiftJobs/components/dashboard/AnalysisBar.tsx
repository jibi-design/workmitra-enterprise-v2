// App name: Job Mitra
// File name: AnalysisBar.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\dashboard\AnalysisBar.tsx

import { fmtDateTime } from "../../helpers/shiftDashboardHelpers";

type AnalysisBarProps = {
  alreadyAnalyzed: boolean;
  canAnalyze: boolean;
  isBusy: boolean;
  appliedCount: number;
  analyzedAt?: number;
  onAnalyze: () => void;
  onReset: () => void;
};

export function AnalysisBar({
  alreadyAnalyzed,
  canAnalyze,
  isBusy,
  appliedCount,
  analyzedAt,
  onAnalyze,
  onReset,
}: AnalysisBarProps) {
  const statusLabel = alreadyAnalyzed ? "Analysis complete" : "Not analyzed yet";
  const rootClassName = [
    "wm-er-vShift",
    "wm-shiftAnalysisBar",
    alreadyAnalyzed ? "isComplete" : "isPending",
  ].join(" ");

  const statusClassName = [
    "wm-shiftAnalysisStatusBadge",
    alreadyAnalyzed ? "isComplete" : "isPending",
  ].join(" ");

  return (
    <section className={rootClassName}>
      <div className="wm-shiftAnalysisLayout">
        <div className="wm-shiftAnalysisContent">
          <div className="wm-shiftAnalysisTitleRow">
            <div className="wm-shiftAnalysisTitle">Find Best Candidates</div>

            <span className={statusClassName}>{statusLabel}</span>
          </div>

          <div className="wm-shiftAnalysisDescription">
            {alreadyAnalyzed
              ? `Last analyzed: ${analyzedAt ? fmtDateTime(analyzedAt) : "Not recorded"}`
              : appliedCount === 0
                ? "No applications are available for analysis yet."
                : `${appliedCount} application${appliedCount > 1 ? "s" : ""} ready to analyze.`}
          </div>

          <div className="wm-shiftAnalysisNote">
            Analysis helps you review faster. Please manually check before shortlisting or
            confirming.
          </div>
        </div>

        <div className="wm-shiftAnalysisActions">
          {alreadyAnalyzed ? (
            <button
              className="wm-outlineBtn wm-shiftAnalysisResetBtn"
              type="button"
              onClick={onReset}
            >
              Reset &amp; Re-analyze
            </button>
          ) : (
            <button
              className="wm-primarybtn wm-shiftAnalysisPrimaryBtn"
              type="button"
              disabled={!canAnalyze || isBusy}
              onClick={onAnalyze}
            >
              {isBusy ? "Analyzing..." : "Analyze Now"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
