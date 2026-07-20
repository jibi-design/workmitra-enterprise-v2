// App name: Job Mitra
// File name: CareerCandidateCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCandidateCard.tsx

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

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const CAREER_GREEN = "#16a34a";
const CAREER_AMBER = "#d97706";

const CANDIDATE_VISUALS = `
  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(10px) scale(0.99); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pulseDot {
    0% { transform: scale(0.8); opacity: 0.8; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.8); opacity: 0.8; }
  }
  .wm-candidate-card {
    animation: cardEntrance var(--wm-motion-slow) var(--wm-motion-spring) forwards;
    transition: all var(--wm-motion-base) var(--wm-motion-spring) !important;
    padding: 24px;
  }
  .wm-candidate-card:hover {
    box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
  .wm-candidate-name {
    font-size: 18px; /* Balanced Name Font */
  }
  .wm-candidate-toggle-btn {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring);
  }
  .wm-candidate-toggle-btn:hover {
    background: rgba(29, 78, 216, 0.04) !important;
  }
  .pulse-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    animation: pulseDot 2s infinite ease-in-out;
  }

  .wm-horizontal-scroll {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }
  .wm-horizontal-scroll::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 640px) {
    .wm-candidate-card {
      padding: 16px !important;
      border-radius: 20px !important;
    }
  }
`;

function getEmployerScheduledInterview(app: CareerCandidateCardProps["app"]) {
  return (
    app.roundResults
      .filter((round) => round.status === "scheduled" && round.scheduledDate && round.scheduledTime)
      .sort((a, b) => a.round - b.round)[0] ?? null
  );
}

function formatScheduleMode(mode: string | undefined): string {
  if (mode === "in-person") return "In-person";
  if (mode === "phone") return "Phone";
  if (mode === "video") return "Video call";
  return "Interview";
}

function formatScheduleDate(dateValue: string | undefined): string {
  if (!dateValue) return "Not set";

  const date = new Date(`${dateValue}T00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatScheduleTime(timeValue: string | undefined): string {
  if (!timeValue) return "Not set";

  const date = new Date(`2000-01-01T${timeValue}`);
  if (Number.isNaN(date.getTime())) return timeValue;

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExternalMeetingLink(value: string | undefined): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function EmployerInterviewScheduleSummary({
  schedule,
}: {
  schedule: NonNullable<ReturnType<typeof getEmployerScheduledInterview>>;
}) {
  const hasMeetingLink = isExternalMeetingLink(schedule.meetingLink);

  return (
    <section
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(217,119,6,0.18)",
        background: "linear-gradient(135deg, rgba(255,251,235,0.84), rgba(255,255,255,0.94))",
        boxShadow: "0 10px 24px rgba(217,119,6,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 950,
              color: "#92400e",
              letterSpacing: 0.55,
              textTransform: "uppercase",
            }}
          >
            Interview scheduled
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 14,
              fontWeight: 950,
              color: CAREER_TEXT,
              lineHeight: 1.2,
            }}
          >
            {schedule.label}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 11.5,
              fontWeight: 800,
              color: CAREER_MUTED,
            }}
          >
            Visible to candidate in their Applications page.
          </div>
        </div>

        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#f59e0b",
            boxShadow: "0 0 0 6px rgba(245,158,11,0.13)",
            flexShrink: 0,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 13,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        <ScheduleMeta label="Date" value={formatScheduleDate(schedule.scheduledDate)} />
        <ScheduleMeta label="Time" value={formatScheduleTime(schedule.scheduledTime)} />
        <ScheduleMeta label="Mode" value={formatScheduleMode(schedule.interviewMode)} />
      </div>

      {(schedule.location || hasMeetingLink) && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.74)",
            border: "1px solid rgba(217,119,6,0.11)",
            fontSize: 12,
            fontWeight: 780,
            color: CAREER_MUTED,
            lineHeight: 1.45,
            overflowWrap: "anywhere",
          }}
        >
          {schedule.location && (
            <div>
              <b style={{ color: CAREER_TEXT }}>
                {schedule.interviewMode === "phone" ? "Contact note" : "Location"}:
              </b>{" "}
              {schedule.location}
            </div>
          )}

          {hasMeetingLink && (
            <a
              href={schedule.meetingLink ?? "#"}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                marginTop: schedule.location ? 8 : 0,
                color: "#1d4ed8",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              Open meeting link
            </a>
          )}
        </div>
      )}
    </section>
  );
}

function ScheduleMeta({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "9px 10px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.76)",
        border: "1px solid rgba(217,119,6,0.09)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 950,
          color: CAREER_MUTED,
          textTransform: "uppercase",
          letterSpacing: 0.45,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 3,
          fontSize: 11.5,
          fontWeight: 950,
          color: CAREER_TEXT,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  );
}

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
      className="wm-er-card wm-candidate-card"
      style={{
        borderRadius: 24,
        border: isBackupSuggestion
          ? "1px solid rgba(217,119,6,0.3)"
          : "1px solid rgba(255, 255, 255, 0.9)",
        background: isBackupSuggestion
          ? "linear-gradient(135deg, rgba(255,251,235,0.9), rgba(255,255,255,0.7))"
          : "linear-gradient(135deg, #ffffff, rgba(248,250,252,0.8))",
        boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,1)",
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
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: `${fitSignal.color}10`,
                  color: fitSignal.color,
                  border: `1px solid ${fitSignal.color}25`,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                <span className="pulse-dot" style={{ backgroundColor: fitSignal.color }}></span>
                {fitSignal.label}
              </span>
            )}
            {isBackupSuggestion && <BackupSuggestionBadge />}
          </div>

          <div
            className="wm-candidate-name"
            style={{ marginTop: 10, fontWeight: 900, color: CAREER_TEXT, letterSpacing: "-0.3px" }}
          >
            {workerName}
          </div>
          <div style={{ marginTop: 2, fontSize: 12, fontWeight: 700, color: CAREER_MUTED }}>
            Applied {fmtDateTime(app.appliedAt)}
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

      {isBackupSuggestion && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: 10,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>💡</span> Backup suggestion. Candidate remains in Applied
          and can be manually shortlisted.
        </div>
      )}

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
        <div
          style={{
            marginTop: 16,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => setCoverOpen(!coverOpen)}
            className="wm-candidate-toggle-btn"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: CAREER_MUTED,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>📄</span> Candidate Cover Note
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, color: CAREER_BLUE }}>
              {coverOpen ? "Hide" : "View"}
            </span>
          </button>
          {coverOpen && (
            <div
              style={{
                padding: "0 12px 12px",
                fontSize: 13,
                fontWeight: 600,
                color: CAREER_TEXT,
                lineHeight: 1.5,
              }}
            >
              {app.coverNote.trim()}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <CareerScreeningAnswerPanel answers={screeningPills} totalQuestions={screeningTotalCount} />
      </div>

      <div style={{ marginTop: 16 }}>
        <CareerCandidateInterviewProgress app={app} totalRounds={post.interviewRounds} />
      </div>

      {scheduledInterview && <EmployerInterviewScheduleSummary schedule={scheduledInterview} />}

      {tab === "rejected" && app.rejectionReason && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            fontSize: 12,
            color: "#dc2626",
            fontWeight: 700,
          }}
        >
          Reason: {app.rejectionReason}
        </div>
      )}
      {app.employerNotes && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: "#f8fafc",
            border: "1px dashed #cbd5e1",
            fontSize: 12,
            color: CAREER_MUTED,
            fontStyle: "italic",
            fontWeight: 600,
          }}
        >
          Notes: {app.employerNotes}
        </div>
      )}

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

function CompactTag({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 12px",
        background: "rgba(248,250,252,0.8)",
        border: "1px solid rgba(15,23,42,0.04)",
        borderRadius: 10,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: CAREER_MUTED }}>{label}:</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: CAREER_TEXT }}>{value}</span>
    </div>
  );
}

function shouldShowCandidateContact(tab: CareerCandidateCardProps["tab"]): boolean {
  return tab === "shortlisted" || tab === "interview" || tab === "offered" || tab === "hired";
}

function CandidateContactPanel({ phone, email }: { phone: string; email: string }) {
  const hasPhone = phone.trim().length > 0;
  const hasEmail = email.trim().length > 0;
  if (!hasPhone && !hasEmail) return null;

  return (
    <div
      style={{
        marginTop: 16,
        padding: "12px",
        borderRadius: 10,
        background: "rgba(239,246,255,0.5)",
        border: "1px solid #e0e7ff",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          color: CAREER_BLUE,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 8,
        }}
      >
        Contact Details
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {hasPhone && (
          <div style={{ fontSize: 13, fontWeight: 800, color: CAREER_TEXT }}>📞 {phone}</div>
        )}
        {hasEmail && (
          <div style={{ fontSize: 13, fontWeight: 800, color: CAREER_TEXT }}>✉️ {email}</div>
        )}
      </div>
    </div>
  );
}

function BackupSuggestionBadge() {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        background: "#fffbeb",
        color: "#92400e",
        border: "1px solid #fde68a",
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      Backup
    </span>
  );
}

function getAnswerResponseText(answeredCount: number, totalCount: number): string {
  if (totalCount <= 0) return "None";
  return `${answeredCount}/${totalCount}`;
}

function getCandidateFitSignal(
  app: CareerCandidateCardProps["app"],
  post: CareerCandidateCardProps["post"],
  screeningPills: ReturnType<typeof getScreeningPills>,
): { label: string; color: string; yesCount: number; noCount: number } {
  const requiredSkills = post.skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
  const candidateSkills =
    app.profileSnapshot?.skills?.map((skill) => skill.trim().toLowerCase()).filter(Boolean) ?? [];
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(skill)).length;
  const skillRatio = requiredSkills.length > 0 ? matchedSkills / requiredSkills.length : 1;

  const yesCount = screeningPills.filter((item) => item.answer === "yes").length;
  const noCount = screeningPills.filter((item) => item.answer === "no").length;

  if (noCount > 0) return { label: "Review needed", color: CAREER_AMBER, yesCount, noCount };
  if (skillRatio >= 0.6 && app.coverNote.trim())
    return { label: "Good fit", color: CAREER_GREEN, yesCount, noCount };
  return { label: "Check profile", color: CAREER_BLUE, yesCount, noCount };
}
