// App name: Job Mitra
// File name: CareerApplicationCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\careerApplications\CareerApplicationCard.tsx

import { EmployerTrustBadge } from "../../../../../shared/employerProfile/EmployerTrustBadge";
import {
  badgeColors,
  cardLeftColor,
  explanationForStage,
  fmtDateTime,
  stageLabel,
  toneForStage,
} from "../../helpers/careerApplicationHelpers";
import { fmtJobType, fmtWorkMode, type CareerSearchPost } from "../../helpers/careerSearchHelpers";
import type { AppLite } from "../../types/careerApplicationTypes";
import {
  CareerApplicationStatusTracker,
  CareerApplicationFooter,
  CareerInterviewProgress,
  CareerOfferDetails,
} from "./CareerApplicationCardParts";

const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#64748b";

function formatScheduleMode(mode: string): string {
  if (mode === "in-person") return "In-person";
  if (mode === "phone") return "Phone";
  if (mode === "video") return "Video call";
  return "Interview";
}

function formatScheduleDate(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00`);

  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatScheduleTime(timeValue: string): string {
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

const CARD_INTERACTIONS = `
  .wm-app-card {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-app-card:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
`;

export function AppCard({
  app,
  post,
  isPulseActive = false,
  onOpen,
  onWithdraw,
  onAcceptOffer,
  onDeclineOffer,
  onAcceptInterview,
  onDeclineInterview,
}: {
  app: AppLite;
  post?: CareerSearchPost;
  /** When true the breathing LED system is guiding here — hide the static accent line to prevent overlap */
  isPulseActive?: boolean;
  onOpen: () => void;
  onWithdraw: () => void;
  onAcceptOffer?: () => void;
  onDeclineOffer?: () => void;
  onAcceptInterview?: () => void;
  onDeclineInterview?: () => void;
}) {
  const title = post?.jobTitle ?? "Career Position";
  const company = post?.companyName ?? "Company";
  const sub = post
    ? [fmtJobType(post.jobType), fmtWorkMode(post.workMode), post.location]
        .filter(Boolean)
        .join(" • ")
    : "";
  const totalRounds = post?.interviewRounds ?? 0;
  const tone = toneForStage(app.stage);
  const badgeColor = badgeColors(tone);
  const explanation = explanationForStage(app, totalRounds);
  const canWithdraw = ["applied", "shortlisted", "interview", "offered", "offer_accepted"].includes(
    app.stage,
  );
  const scheduledInterview = app.nextScheduledInterview;
  const hasMeetingLink = isExternalMeetingLink(scheduledInterview?.meetingLink);
  const canRespondToInterview =
    app.stage === "interview" &&
    scheduledInterview &&
    (!scheduledInterview.rsvpStatus || scheduledInterview.rsvpStatus === "pending");
  const interviewRsvpAccepted = scheduledInterview?.rsvpStatus === "accepted";

  return (
    <article
      className="wm-app-card"
      style={{
        padding: 24,
        borderRadius: 24,
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8))",
        boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(24px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{CARD_INTERACTIONS}</style>

      {/* Static accent line — hidden when breathing LED is active to prevent visual overlap */}
      {!isPulseActive && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: `linear-gradient(to bottom, ${cardLeftColor(app.stage)} 0%, ${cardLeftColor(app.stage)}90 100%)`,
          }}
        />
      )}

      <div style={{ paddingLeft: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={onOpen}
            style={{
              minWidth: 0,
              flex: 1,
              fontSize: 20,
              fontWeight: 900,
              color: CAREER_TEXT,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              outline: "none",
            }}
          >
            {title}
          </button>

          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              padding: "6px 12px",
              borderRadius: 12,
              background: badgeColor.bg,
              border: `1px solid ${badgeColor.border}`,
              color: badgeColor.color,
              flexShrink: 0,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            {stageLabel(app)}
          </span>
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            fontWeight: 700,
            color: CAREER_MUTED,
            lineHeight: 1.4,
          }}
        >
          {company}
        </div>

        <div style={{ marginTop: 12 }}>
          <EmployerTrustBadge variant="compact" accentColor="#f59e0b" />
        </div>

        {sub && (
          <div
            style={{
              marginTop: 12,
              display: "inline-flex",
              maxWidth: "100%",
              padding: "6px 12px",
              borderRadius: 12,
              background: "rgba(248,250,252,0.8)",
              border: "1px solid rgba(0,0,0,0.05)",
              color: CAREER_MUTED,
              fontSize: 12,
              fontWeight: 800,
              lineHeight: 1.3,
            }}
          >
            {sub}
          </div>
        )}

        <CareerInterviewProgress app={app} totalRounds={totalRounds} />

        {scheduledInterview && (
          <section
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 20,
              border: "1px solid rgba(29,78,216,0.13)",
              background: "linear-gradient(135deg, rgba(239,246,255,0.86), rgba(255,255,255,0.94))",
              boxShadow: "0 10px 24px rgba(29,78,216,0.055)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 950,
                    color: "#1e40af",
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
                  {scheduledInterview.label}
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
              <ScheduleMeta
                label="Date"
                value={formatScheduleDate(scheduledInterview.scheduledDate)}
              />
              <ScheduleMeta
                label="Time"
                value={formatScheduleTime(scheduledInterview.scheduledTime)}
              />
              <ScheduleMeta label="Mode" value={formatScheduleMode(scheduledInterview.mode)} />
            </div>

            {(scheduledInterview.location || hasMeetingLink) && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.74)",
                  border: "1px solid rgba(29,78,216,0.09)",
                  fontSize: 12,
                  fontWeight: 780,
                  color: CAREER_MUTED,
                  lineHeight: 1.45,
                  overflowWrap: "anywhere",
                }}
              >
                {scheduledInterview.location && (
                  <div>
                    <b style={{ color: CAREER_TEXT }}>
                      {scheduledInterview.mode === "phone" ? "Contact note" : "Location"}:
                    </b>{" "}
                    {scheduledInterview.location}
                  </div>
                )}

                {hasMeetingLink && (
                  <a
                    href={scheduledInterview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      marginTop: scheduledInterview.location ? 8 : 0,
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

            {canRespondToInterview && (
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={onAcceptInterview}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    minHeight: 44,
                    borderRadius: 14,
                    border: "none",
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(37,99,235,0.22)",
                  }}
                >
                  Accept Interview
                </button>
                <button
                  type="button"
                  onClick={onDeclineInterview}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    minHeight: 44,
                    borderRadius: 14,
                    border: "1px solid rgba(220,38,38,0.25)",
                    background: "rgba(254,242,242,0.9)",
                    color: "#b91c1c",
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Decline Interview
                </button>
              </div>
            )}

            {interviewRsvpAccepted && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(240,253,244,0.9)",
                  border: "1px solid rgba(22,163,74,0.2)",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#15803d",
                }}
              >
                You accepted this interview invite.
              </div>
            )}
          </section>
        )}

        {/* ULTRA PREMIUM Visual Stepper */}
        {explanation && (
          <CareerApplicationStatusTracker
            app={app}
            title={explanation.title}
            body={explanation.body}
          />
        )}

        <CareerOfferDetails
          app={app}
          onAcceptOffer={onAcceptOffer}
          onDeclineOffer={onDeclineOffer}
        />

        <CareerApplicationFooter
          appliedAt={app.appliedAt}
          canWithdraw={canWithdraw}
          onWithdraw={onWithdraw}
          formatDateTime={fmtDateTime}
        />
      </div>
    </article>
  );
}

function ScheduleMeta({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "9px 10px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.76)",
        border: "1px solid rgba(29,78,216,0.08)",
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
