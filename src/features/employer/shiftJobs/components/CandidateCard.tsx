// App name: Job Mitra
// Facade — CandidateCard.tsx

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { Tab } from "../helpers/dashboardHelpers";
import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";
import { CandidateActionButtons } from "./CandidateActionButtons";
import { CandidateProfileSummary } from "./CandidateProfileSummary";
import { ShiftContactPlatformLockStrip } from "./ShiftContactPlatformLockStrip";
import { CandidateRequirementSummary } from "./CandidateRequirementSummary";
import { CandidateAnswerPill } from "./CandidateStatusPills";
import { plannerCommitmentStreakService } from "../../../shared/planner/plannerEmployeeBridge";
import {
  DOCUMENT_ACCESS_BADGE_STYLE,
  DOCUMENT_ACCESS_BUTTON_STYLE,
  DOCUMENT_ACCESS_CARD_STYLE,
  DOCUMENT_ACCESS_TOP_STYLE,
  CARD_STYLE,
  REASON_STYLE,
} from "./CandidateCard.styles";
import { CandidateCardHeader, CompareSelector } from "./CandidateCardHeader";
import {
  getAnalysisReason,
  getQuickAnswerPills,
  type QuickQuestion,
} from "./CandidateCardHeader.helpers";

type CandidateCardProps = {
  app: EmployeeShiftApplication;
  mode: Tab;
  isBusy: boolean;
  quickQuestions?: QuickQuestion[];
  showCompareSelector: boolean;
  isCompareSelected: boolean;
  isCompareDisabled: boolean;
  onToggleCompare: (appId: string) => void;
  onMoveToShortlist: (appId: string) => void;
  onMoveToWaiting: (appId: string) => void;
  onConfirm: (appId: string) => void;
  onOpenGroup: (appId: string) => void;
  onRemove: (appId: string) => void;
  onReplace: (appId: string) => void;
};

export function CandidateCard({
  app,
  mode,
  isBusy,
  quickQuestions = [],
  showCompareSelector,
  isCompareSelected,
  isCompareDisabled,
  onToggleCompare,
  onMoveToShortlist,
  onMoveToWaiting,
  onConfirm,
  onOpenGroup,
  onRemove,
  onReplace,
}: CandidateCardProps) {
  const nav = useNavigate();

  const workerId = app.profileSnapshot?.uniqueId ?? `Candidate ${app.id.slice(-6).toUpperCase()}`;
  const workerName = app.profileSnapshot?.fullName?.trim() || "Worker Profile";

  const detailPath = ROUTE_PATHS.employerCandidateDetail
    .replace(":postId", app.postId)
    .replace(":appId", app.id);

  const documentAccessPath = ROUTE_PATHS.employerCandidateDocumentAccess
    .replace(":postId", app.postId)
    .replace(":appId", app.id);

  const answerPills = getQuickAnswerPills(app, quickQuestions);
  const analysisReason = getAnalysisReason(app);
  const showDocumentAccess = app.status === "shortlisted" || app.status === "confirmed";
  const workerMlIdForStreak = app.profileSnapshot?.uniqueId ?? "";
  const showCommitmentStreak =
    Boolean(workerMlIdForStreak) &&
    plannerCommitmentStreakService.hasStreak(workerMlIdForStreak, app.planId, app.planApplyBatchId);
  const showPlanBatch = Boolean(app.planApplyBatchId || app.planId);

  return (
    <div className="wm-shift-card wm-shift-card--employer" style={CARD_STYLE}>
      <CandidateCardHeader
        workerId={workerId}
        workerName={workerName}
        createdAt={app.createdAt}
        priorityTag={app.priorityTag}
        isConfirmed={app.status === "confirmed"}
        showPlanBatch={showPlanBatch}
        showCommitmentStreak={showCommitmentStreak}
        onOpenDetail={() => nav(detailPath)}
      />

      {app.priorityTag && <div style={REASON_STYLE}>Review note: {analysisReason}</div>}

      {showCompareSelector && (
        <CompareSelector
          appId={app.id}
          selected={isCompareSelected}
          disabled={isCompareDisabled}
          onToggleCompare={onToggleCompare}
        />
      )}

      <CandidateProfileSummary profile={app.profileSnapshot} />

      <ShiftContactPlatformLockStrip applicantStatus={app.status} compact />

      {showDocumentAccess && (
        <section style={DOCUMENT_ACCESS_CARD_STYLE}>
          <div style={DOCUMENT_ACCESS_TOP_STYLE}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 950, color: "#78350f", lineHeight: 1.3 }}>
                Worker profile available
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 11,
                  fontWeight: 750,
                  color: "#92400e",
                  lineHeight: 1.5,
                }}
              >
                Review the worker profile, skills and requirement match before confirming this
                shift.
              </div>
            </div>

            <span style={DOCUMENT_ACCESS_BADGE_STYLE}>Ready to review</span>
          </div>

          <button
            type="button"
            onClick={() => nav(documentAccessPath)}
            style={DOCUMENT_ACCESS_BUTTON_STYLE}
          >
            View worker profile
          </button>

          <div
            style={{
              marginTop: 8,
              fontSize: 10,
              fontWeight: 750,
              color: "var(--wm-er-muted)",
              lineHeight: 1.45,
            }}
          >
            Private documents are not required for normal Shift Job selection.
          </div>
        </section>
      )}

      {answerPills.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {answerPills.map((pill) => (
            <CandidateAnswerPill key={pill.id} label={pill.label} answer={pill.answer} />
          ))}
        </div>
      )}

      <CandidateRequirementSummary app={app} />

      <CandidateActionButtons
        app={app}
        mode={mode}
        isBusy={isBusy}
        onMoveToShortlist={onMoveToShortlist}
        onMoveToWaiting={onMoveToWaiting}
        onConfirm={onConfirm}
        onOpenGroup={onOpenGroup}
        onRemove={onRemove}
        onReplace={onReplace}
      />
    </div>
  );
}
