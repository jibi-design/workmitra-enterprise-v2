// App name: Job Mitra
// File name: CandidateCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\CandidateCard.tsx

import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { fmtTime } from "../helpers/dashboardHelpers";
import type { Tab } from "../helpers/dashboardHelpers";
import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";
import { CandidateActionButtons } from "./CandidateActionButtons";
import { CandidateProfileSummary } from "./CandidateProfileSummary";
import { ShiftContactPlatformLockStrip } from "./ShiftContactPlatformLockStrip";
import { CandidateRequirementSummary } from "./CandidateRequirementSummary";
import { CandidateAnswerPill, CandidateStatusPill } from "./CandidateStatusPills";
import { PriorityBadge } from "./ShiftDashboardComponents";
import { plannerCommitmentStreakService } from "../../../employee/planner/services/plannerCommitmentStreak.service";

type QuickQuestion = {
  id: string;
  text: string;
};

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

type QuickAnswerPillData = {
  id: string;
  label: string;
  answer: "yes" | "no";
};

const CARD_STYLE: CSSProperties = {
  padding: 15,
  borderRadius: 24,
  border: "1px solid rgba(148,163,184,0.22)",
  borderLeft: "5px solid var(--wm-er-accent-shift, #16a34a)",
  background:
    "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.99) 48%, rgba(240,253,244,0.58))",
  boxShadow: "0 18px 42px rgba(15,23,42,0.095)",
};

const REASON_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "9px 10px",
  borderRadius: 14,
  background: "rgba(22,163,74,0.07)",
  border: "1px solid rgba(22,163,74,0.14)",
  fontSize: 11,
  fontWeight: 800,
  color: "var(--wm-er-muted)",
  lineHeight: 1.45,
};

const DOCUMENT_ACCESS_CARD_STYLE: CSSProperties = {
  marginTop: 12,
  padding: "12px 12px",
  borderRadius: 16,
  border: "1px solid rgba(217,119,6,0.28)",
  background: "linear-gradient(180deg, rgba(255,251,235,0.96), rgba(255,255,255,0.98))",
  boxShadow: "0 10px 22px rgba(217,119,6,0.08)",
};

const DOCUMENT_ACCESS_TOP_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
};

const DOCUMENT_ACCESS_BADGE_STYLE: CSSProperties = {
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(217,119,6,0.1)",
  border: "1px solid rgba(217,119,6,0.2)",
  color: "#92400e",
  fontSize: 9,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: 0.35,
  whiteSpace: "nowrap",
};

const DOCUMENT_ACCESS_BUTTON_STYLE: CSSProperties = {
  width: "100%",
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: 14,
  border: "none",
  background: "#d97706",
  color: "#fff",
  fontSize: 12,
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 8px 16px rgba(217,119,6,0.18)",
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
  const workerWmIdForStreak = app.profileSnapshot?.uniqueId ?? "";
  const showCommitmentStreak =
    Boolean(workerWmIdForStreak) &&
    plannerCommitmentStreakService.hasStreak(workerWmIdForStreak, app.planId, app.planApplyBatchId);
  const showPlanBatch = Boolean(app.planApplyBatchId || app.planId);

  return (
    <div className="wm-er-card" style={CARD_STYLE}>
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

function CandidateCardHeader({
  workerId,
  workerName,
  createdAt,
  priorityTag,
  isConfirmed,
  showPlanBatch,
  showCommitmentStreak,
  onOpenDetail,
}: {
  workerId: string;
  workerName: string;
  createdAt: number;
  priorityTag: EmployeeShiftApplication["priorityTag"];
  isConfirmed: boolean;
  showPlanBatch?: boolean;
  showCommitmentStreak?: boolean;
  onOpenDetail: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: 9 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 950,
              color: "var(--wm-er-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.25,
            }}
          >
            {workerName}
          </div>

          <button
            type="button"
            onClick={onOpenDetail}
            style={{
              marginTop: 6,
              fontWeight: 950,
              fontSize: 12,
              color: "var(--wm-er-accent-shift)",
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.16)",
              borderRadius: 999,
              padding: "5px 9px",
              cursor: "pointer",
              fontFamily: "monospace",
              letterSpacing: 0.35,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {workerId}
          </button>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 900 }}>Applied</div>
          <div style={{ marginTop: 3, fontSize: 11, color: "var(--wm-er-muted)", fontWeight: 850 }}>
            {fmtTime(createdAt)}
          </div>
        </div>
      </div>

      {(priorityTag || isConfirmed || showPlanBatch || showCommitmentStreak) && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <PriorityBadge tag={priorityTag} />
          {isConfirmed ? <CandidateStatusPill text="CONFIRMED" /> : null}
          {showPlanBatch ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(8,145,178,0.12)",
                color: "#0e7490",
              }}
            >
              ?? Plan batch
            </span>
          ) : null}
          {showCommitmentStreak ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(180,83,9,0.12)",
                color: "#b45309",
              }}
            >
              ?? Commitment Streak
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function CompareSelector({
  appId,
  selected,
  disabled,
  onToggleCompare,
}: {
  appId: string;
  selected: boolean;
  disabled: boolean;
  onToggleCompare: (appId: string) => void;
}) {
  return (
    <label
      style={{
        marginTop: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 11,
        fontWeight: 900,
        color: selected ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)",
        padding: "9px 10px",
        borderRadius: 14,
        background: selected ? "rgba(22,163,74,0.09)" : "rgba(248,250,252,0.98)",
        border: selected ? "1px solid rgba(22,163,74,0.18)" : "1px solid rgba(226,232,240,0.9)",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={() => onToggleCompare(appId)}
      />
      {selected ? "Selected for comparison" : "Select for comparison"}
    </label>
  );
}

function getAnalysisReason(app: EmployeeShiftApplication): string {
  const mustAnswers = Object.values(app.mustHaveAnswers);
  const goodAnswers = Object.values(app.goodToHaveAnswers);
  const profile = app.profileSnapshot;

  const mustMeets = mustAnswers.filter((answer) => answer === "meets").length;
  const goodMeets = goodAnswers.filter((answer) => answer === "meets").length;
  const hasProfile = Boolean(profile?.fullName || profile?.city || profile?.skills?.length);

  if (app.priorityTag === "priority") {
    return "Strong requirement match. Review details before final confirmation.";
  }

  if (app.priorityTag === "good") {
    return "Good match evidence found. Check requirements before shortlisting.";
  }

  if (!hasProfile) {
    return "Profile details are limited. Manual review is required.";
  }

  if (mustMeets === 0 && goodMeets === 0) {
    return "Requirement answers are missing or weak. Manual review is required.";
  }

  return "Some match evidence exists. Employer review is still required.";
}

function getQuickAnswerPills(
  app: EmployeeShiftApplication,
  quickQuestions: QuickQuestion[],
): QuickAnswerPillData[] {
  return quickQuestions.flatMap((question) => {
    const answer = app.quickAnswers?.[question.id];

    if (!answer) return [];

    return [{ id: question.id, label: question.text, answer }];
  });
}
