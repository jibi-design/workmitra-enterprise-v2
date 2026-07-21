// App name: Job Mitra
// Facade — candidate card UI for employer career pipeline.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  allRoundsPassed,
  getCandidateTitle,
  getCandidateWorkerName,
  getNextSchedulableRound,
  getRecordableRound,
  getScreeningPills,
} from "../helpers/careerCandidateCard.helpers";
import { fmtDateTime } from "../helpers/careerDashboardHelpers";
import type { CareerCandidateCardProps } from "../types/careerCandidateCard.types";
import { CareerCandidateActions } from "./CareerCandidateActions";
import { CareerCandidateEmploymentActions } from "./CareerCandidateEmploymentActions";
import { CareerCandidateInterviewProgress } from "./CareerCandidateInterviewProgress";
import { CareerCandidateProfileSummary } from "./CareerCandidateProfileSummary";
import { CareerScreeningAnswerPanel, CareerStageBadge } from "./CareerCandidateBadges";
import {
  BackupSuggestionBadge,
  CandidateContactPanel,
  CompactTag,
  EmployerInterviewScheduleSummary,
} from "./candidateCard/CareerCandidateCardParts";
import {
  CareerCandidateBackupBanner,
  CareerCandidateCoverNote,
  CareerCandidateStatusNotes,
} from "./candidateCard/CareerCandidateCardExtras";
import {
  CAREER_AMBER,
  CAREER_BLUE,
  CAREER_GREEN,
  CAREER_MUTED,
  CAREER_TEXT,
} from "./candidateCard/careerCandidateCard.constants";
import { StatusBadge } from "../../../../shared/components/enterprise";
import type { EnterpriseTone } from "../../../../shared/components/enterprise/enterprise.types";
import {
  getAnswerResponseText,
  getCandidateFitSignal,
  getEmployerScheduledInterview,
  shouldShowCandidateContact,
  workerInitials,
} from "./candidateCard/careerCandidateCard.helpers";
import { CANDIDATE_VISUALS } from "./candidateCard/careerCandidateCard.styles";

export function CareerCandidateCard({
  app,
  post,
  tab,
  isBusy,
  isBackupSuggestion = false,
  onShortlist,
  onRemoveFromShortlist,
  onReject,
  onScheduleInterview,
  onRecordResult,
  onSendOffer,
  onHire,
  onEditNotes,
}: CareerCandidateCardProps) {
  const nav = useNavigate();
  const [coverOpen, setCoverOpen] = useState(false);

  const title = getCandidateTitle(app);
  const workerName = getCandidateWorkerName(app);
  const nextRound = getNextSchedulableRound(app, post.interviewRounds);
  const recordableRound = getRecordableRound(app);
  const canOffer = allRoundsPassed(app, post.interviewRounds);
  const screeningPills = getScreeningPills(app, post);
  const screeningTotalCount = post.screeningQuestions?.length ?? 0;
  const fitSignal = getCandidateFitSignal(app, post, screeningPills);
  const canShowContact = shouldShowCandidateContact(tab);
  const scheduledInterview = getEmployerScheduledInterview(app);

  return (
    <div
      className="wm-er-card wm-candidate-card wm-career-card wm-career-card--employer"
      style={{
        borderRadius: "var(--wm-radius-employee-card)",
        border: isBackupSuggestion
          ? "1px solid rgba(217,119,6,0.3)"
          : "1px solid rgba(29, 78, 216, 0.14)",
        background: isBackupSuggestion
          ? "linear-gradient(135deg, rgba(255,251,235,0.9), rgba(255,255,255,0.7))"
          : "rgba(255, 255, 255, 0.74)",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
        backdropFilter: "blur(16px)",
      }}
    >
      <style>{CANDIDATE_VISUALS}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div className="wm-candidate-avatar" aria-hidden="true">
              {workerInitials(workerName)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: CAREER_BLUE,
                    background: "rgba(37,99,235,0.08)",
                    padding: "4px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(37,99,235,0.1)",
                  }}
                >
                  {title}
                </span>
                {tab !== "hired" && (
                  <StatusBadge
                    label={fitSignal.label}
                    tone={fitSignalTone(fitSignal.label)}
                    accent="career"
                    testId={`career-fit-badge-${app.id}`}
                  />
                )}
                {isBackupSuggestion && <BackupSuggestionBadge />}
              </div>
              <div
                className="wm-candidate-name"
                style={{ marginTop: 8, color: CAREER_TEXT, letterSpacing: "-0.2px" }}
              >
                {workerName}
              </div>
              <div style={{ marginTop: 2, fontSize: 12, fontWeight: 600, color: CAREER_MUTED }}>
                Applied {fmtDateTime(app.appliedAt)}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {tab === "hired" && <CareerStageBadge label="HIRED" color={CAREER_GREEN} />}
          {tab === "offered" && app.stage === "offer_accepted" && (
            <CareerStageBadge label="OFFER ACCEPTED" color={CAREER_BLUE} />
          )}
          {tab === "offered" && app.stage === "offered" && (
            <CareerStageBadge label="OFFER SENT" color={CAREER_AMBER} />
          )}
          {tab === "rejected" && <CareerStageBadge label="REJECTED" color="#dc2626" />}
        </div>
      </div>

      {isBackupSuggestion && <CareerCandidateBackupBanner />}

      <div style={{ marginTop: 16 }}>
        <CareerCandidateProfileSummary profile={app.profileSnapshot} />
      </div>

      <div
        className="wm-horizontal-scroll"
        style={{ marginTop: 16, display: "flex", flexWrap: "nowrap", gap: 8, paddingBottom: 4 }}
      >
        <CompactTag icon="⏱️" label="Notice" value={app.noticePeriod || "Not specified"} />
        <CompactTag
          icon="💰"
          label="Salary"
          value={app.expectedSalary > 0 ? app.expectedSalary.toLocaleString() : "Not specified"}
        />
        <CompactTag
          icon="📝"
          label="Screening"
          value={getAnswerResponseText(screeningPills.length, screeningTotalCount)}
        />
      </div>

      {canShowContact && (
        <CandidateContactPanel phone={app.employeePhone} email={app.employeeEmail} />
      )}

      {app.coverNote && (
        <CareerCandidateCoverNote
          coverNote={app.coverNote}
          open={coverOpen}
          onToggle={() => setCoverOpen(!coverOpen)}
        />
      )}

      <div style={{ marginTop: 16 }}>
        <CareerScreeningAnswerPanel answers={screeningPills} totalQuestions={screeningTotalCount} />
      </div>

      <div style={{ marginTop: 16 }}>
        <CareerCandidateInterviewProgress app={app} totalRounds={post.interviewRounds} />
      </div>

      {scheduledInterview && <EmployerInterviewScheduleSummary schedule={scheduledInterview} />}

      <CareerCandidateStatusNotes
        tab={tab}
        rejectionReason={app.rejectionReason}
        employerNotes={app.employerNotes}
      />

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
        <CareerCandidateActions
          appId={app.id}
          jobId={app.jobId}
          tab={tab}
          isBusy={isBusy}
          hiredAt={app.hiredAt}
          rejectedAt={app.rejectedAt}
          nextRound={nextRound}
          recordableRound={recordableRound}
          canOffer={canOffer}
          canHire={app.stage === "offer_accepted"}
          onShortlist={onShortlist}
          onRemoveFromShortlist={onRemoveFromShortlist}
          onReject={onReject}
          onScheduleInterview={onScheduleInterview}
          onRecordResult={onRecordResult}
          onSendOffer={onSendOffer}
          onHire={onHire}
          onEditNotes={onEditNotes}
          onOpenDocuments={() =>
            nav(
              ROUTE_PATHS.employerCareerCandidateWorkVaultReview
                .replace(":postId", app.jobId)
                .replace(":appId", app.id),
            )
          }
        />
      </div>

      {tab === "hired" && (
        <div style={{ marginTop: 16 }}>
          <CareerCandidateEmploymentActions
            careerPostId={app.jobId}
            employeeName={workerName}
            onNotice={() => {}}
          />
        </div>
      )}
    </div>
  );
}

function fitSignalTone(label: string): EnterpriseTone {
  if (label === "Review needed") return "warning";
  if (label === "Good fit") return "active";
  return "pending";
}
